-- Migration: Add upstream timing fields to logs table
-- This migration adds fields to track upstream API request and response timing
-- to help distinguish system internal processing time from third-party API latency
--
-- NOTE: This SQL is for reference only. The actual migration will be performed
-- automatically by GORM's AutoMigrate when the application starts.
--
-- Fields added:
-- - upstream_request_at: Timestamp when the upstream API request was initiated
-- - upstream_response_at: Timestamp when first byte was received from upstream API
-- - internal_process_time_ms: Calculated field (upstream_request_at - request_at) in milliseconds
-- - upstream_response_time_ms: Calculated field (upstream_response_at - upstream_request_at) in milliseconds
--
-- Timing breakdown:
-- Total TTFB = ttfb_milliseconds (unchanged)
-- Internal Processing = internal_process_time_ms (system overhead)
-- Upstream API Time = upstream_response_time_ms (third-party latency)

-- For MySQL
ALTER TABLE logs
ADD COLUMN upstream_request_at DATETIME(3) NULL COMMENT 'Time when upstream API request was initiated',
ADD COLUMN upstream_response_at DATETIME(3) NULL COMMENT 'Time when first byte received from upstream',
ADD COLUMN internal_process_time_ms BIGINT NULL COMMENT 'Internal processing time in milliseconds',
ADD COLUMN upstream_response_time_ms BIGINT NULL COMMENT 'Upstream API response time in milliseconds';

-- Add indexes for performance
CREATE INDEX idx_logs_upstream_request_at ON logs(upstream_request_at DESC);

-- For PostgreSQL, use the same schema but with TIMESTAMP type:
-- ALTER TABLE logs
-- ADD COLUMN upstream_request_at TIMESTAMP NULL,
-- ADD COLUMN upstream_response_at TIMESTAMP NULL,
-- ADD COLUMN internal_process_time_ms BIGINT NULL,
-- ADD COLUMN upstream_response_time_ms BIGINT NULL;
--
-- CREATE INDEX IF NOT EXISTS idx_logs_upstream_request_at ON logs(upstream_request_at DESC);

-- For SQLite, use DATETIME type:
-- ALTER TABLE logs ADD COLUMN upstream_request_at DATETIME NULL;
-- ALTER TABLE logs ADD COLUMN upstream_response_at DATETIME NULL;
-- ALTER TABLE logs ADD COLUMN internal_process_time_ms INTEGER NULL;
-- ALTER TABLE logs ADD COLUMN upstream_response_time_ms INTEGER NULL;
--
-- CREATE INDEX IF NOT EXISTS idx_logs_upstream_request_at ON logs(upstream_request_at DESC);

-- Verification query to test the new fields:
-- SELECT
--   id,
--   request_at,
--   upstream_request_at,
--   upstream_response_at,
--   first_byte_at,
--   ttfb_milliseconds,
--   internal_process_time_ms,
--   upstream_response_time_ms
-- FROM logs
-- WHERE upstream_request_at IS NOT NULL
-- ORDER BY request_at DESC
-- LIMIT 10;
