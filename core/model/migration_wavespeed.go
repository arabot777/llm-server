package model

import (
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// MigrateWaveSpeedFields manually adds WaveSpeed integration fields to tokens table
// This is needed because GORM AutoMigrate doesn't always detect new fields in existing tables
func MigrateWaveSpeedFields(db *gorm.DB) error {
	log.Info("Running WaveSpeed fields migration...")

	// First, modify name column length from 32 to 64
	log.Info("Modifying name column length to 64")
	if err := db.Exec("ALTER TABLE `tokens` MODIFY COLUMN `name` VARCHAR(64) NOT NULL").Error; err != nil {
		log.WithError(err).Warn("Failed to modify name column length (may already be correct)")
	} else {
		log.Info("Successfully modified name column length")
	}

	// Check if columns already exist before adding them
	migrations := []struct {
		columnName string
		sql        string
	}{
		{
			columnName: "user_type",
			sql:        "ALTER TABLE `tokens` ADD COLUMN `user_type` VARCHAR(20) DEFAULT 'regular'",
		},
		{
			columnName: "balance_last_sync",
			sql:        "ALTER TABLE `tokens` ADD COLUMN `balance_last_sync` DATETIME(3) NULL",
		},
		{
			columnName: "is_wavespeed_user",
			sql:        "ALTER TABLE `tokens` ADD COLUMN `is_wavespeed_user` TINYINT(1) DEFAULT 0",
		},
	}

	for _, migration := range migrations {
		// Check if column exists
		var count int64
		err := db.Raw(`
			SELECT COUNT(*)
			FROM information_schema.COLUMNS
			WHERE TABLE_SCHEMA = DATABASE()
			AND TABLE_NAME = 'tokens'
			AND COLUMN_NAME = ?
		`, migration.columnName).Scan(&count).Error

		if err != nil {
			log.WithError(err).Errorf("Failed to check if column %s exists", migration.columnName)
			return err
		}

		if count > 0 {
			log.Infof("Column %s already exists, skipping", migration.columnName)
			continue
		}

		// Add column
		log.Infof("Adding column %s to tokens table", migration.columnName)
		if err := db.Exec(migration.sql).Error; err != nil {
			log.WithError(err).Errorf("Failed to add column %s", migration.columnName)
			return err
		}
		log.Infof("Successfully added column %s", migration.columnName)
	}

	// Add index for balance_last_sync if it doesn't exist
	var indexCount int64
	err := db.Raw(`
		SELECT COUNT(*)
		FROM information_schema.STATISTICS
		WHERE TABLE_SCHEMA = DATABASE()
		AND TABLE_NAME = 'tokens'
		AND INDEX_NAME = 'idx_tokens_balance_last_sync'
	`).Scan(&indexCount).Error

	if err != nil {
		log.WithError(err).Error("Failed to check if index exists")
		return err
	}

	if indexCount == 0 {
		log.Info("Adding index for balance_last_sync")
		if err := db.Exec("ALTER TABLE `tokens` ADD INDEX `idx_tokens_balance_last_sync` (`balance_last_sync`)").Error; err != nil {
			log.WithError(err).Error("Failed to add index")
			return err
		}
		log.Info("Successfully added index for balance_last_sync")
	}

	log.Info("WaveSpeed fields migration completed successfully")
	return nil
}
