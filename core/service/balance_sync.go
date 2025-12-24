package service

import (
	"context"
	"sync"
	"time"

	"github.com/wavespeed/llm-server/core/common/wavespeed"
	"github.com/wavespeed/llm-server/core/model"
	log "github.com/sirupsen/logrus"
)

const (
	minSyncInterval = 5 * time.Minute // Minimum interval between syncs for each token
)

// SyncWaveSpeedBalances periodically syncs balance for all WaveSpeed users
func SyncWaveSpeedBalances(ctx context.Context, wg *sync.WaitGroup, interval time.Duration) {
	defer wg.Done()

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	log.WithField("interval", interval).Info("WaveSpeed balance sync service started")

	// Run once immediately
	syncAllBalances(ctx)

	for {
		select {
		case <-ctx.Done():
			log.Info("WaveSpeed balance sync service stopped")
			return
		case <-ticker.C:
			syncAllBalances(ctx)
		}
	}
}

func syncAllBalances(ctx context.Context) {
	// Get all WaveSpeed users
	tokens, err := model.GetAllWaveSpeedTokens()
	if err != nil {
		log.WithError(err).Error("Failed to get WaveSpeed tokens")
		return
	}

	if len(tokens) == 0 {
		log.Debug("No WaveSpeed users to sync")
		return
	}

	log.WithField("count", len(tokens)).Info("Starting balance sync for WaveSpeed users")

	client := wavespeed.NewClient()
	syncCount := 0
	errorCount := 0

	for _, token := range tokens {
		// Skip if recently synced
		if time.Since(token.BalanceLastSync) < minSyncInterval {
			log.WithFields(log.Fields{
				"token_id":  token.ID,
				"last_sync": token.BalanceLastSync,
			}).Debug("Skipping recently synced token")
			continue
		}

		// Get balance from WaveSpeed API
		balance, err := client.GetBalance(ctx, token.Key)
		if err != nil {
			log.WithFields(log.Fields{
				"token_id":   token.ID,
				"token_name": token.Name,
				"error":      err.Error(),
			}).Error("Failed to sync balance from WaveSpeed")
			errorCount++
			continue
		}

		// Update token balance
		if err := model.UpdateTokenBalanceAndSync(token.ID, balance); err != nil {
			log.WithFields(log.Fields{
				"token_id":   token.ID,
				"token_name": token.Name,
				"error":      err.Error(),
			}).Error("Failed to update token balance")
			errorCount++
			continue
		}

		syncCount++
		log.WithFields(log.Fields{
			"token_id":   token.ID,
			"token_name": token.Name,
			"balance":    balance,
		}).Debug("Balance synced successfully")
	}

	log.WithFields(log.Fields{
		"total":   len(tokens),
		"synced":  syncCount,
		"skipped": len(tokens) - syncCount - errorCount,
		"errors":  errorCount,
	}).Info("Balance sync completed")
}
