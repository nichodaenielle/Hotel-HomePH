-- Migration: Audit logging value-level columns + payment verification tracking
-- Purpose:
--   1. Extend booking_history so it can record field-level edits
--      (previous value -> new value), as required by the audit logging spec.
--   2. Add payment verification metadata to bookings so the admin payment
--      workflow (verify + purge proof) can be tracked.
-- Compatible with older MySQL versions

-- 1. Value-level audit columns on booking_history -----------------------------
SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'booking_history'
  AND column_name = 'field_changed'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE booking_history ADD COLUMN field_changed VARCHAR(64) DEFAULT NULL AFTER notes',
  'SELECT ''Column field_changed already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'booking_history'
  AND column_name = 'old_value'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE booking_history ADD COLUMN old_value TEXT DEFAULT NULL AFTER field_changed',
  'SELECT ''Column old_value already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'booking_history'
  AND column_name = 'new_value'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE booking_history ADD COLUMN new_value TEXT DEFAULT NULL AFTER old_value',
  'SELECT ''Column new_value already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Payment verification metadata on bookings --------------------------------
SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND column_name = 'payment_verified'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN payment_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER payment_option',
  'SELECT ''Column payment_verified already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND column_name = 'payment_verified_at'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN payment_verified_at DATETIME DEFAULT NULL AFTER payment_verified',
  'SELECT ''Column payment_verified_at already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND column_name = 'payment_verified_by'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN payment_verified_by VARCHAR(100) DEFAULT NULL AFTER payment_verified_at',
  'SELECT ''Column payment_verified_by already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND column_name = 'payment_submitted_at'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN payment_submitted_at DATETIME DEFAULT NULL AFTER payment_verified_by',
  'SELECT ''Column payment_submitted_at already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
