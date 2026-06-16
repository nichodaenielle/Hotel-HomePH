-- Migration: Add amount_paid and payment_option columns to bookings table
-- This fixes the CSV export where amount paid column was always empty
-- Compatible with older MySQL versions that don't support IF NOT EXISTS in ALTER TABLE

-- Add amount_paid column with default 0 (ignore error if already exists)
SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND column_name = 'amount_paid'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN amount_paid DECIMAL(10, 2) DEFAULT 0 AFTER total_price',
  'SELECT ''Column amount_paid already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add payment_option column (ignore error if already exists)
SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND column_name = 'payment_option'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN payment_option VARCHAR(50) AFTER amount_paid',
  'SELECT ''Column payment_option already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing confirmed bookings to have amount_paid = total_price
-- This assumes confirmed bookings were fully paid
UPDATE bookings
SET amount_paid = total_price
WHERE status = 'confirmed'
AND (amount_paid IS NULL OR amount_paid = 0);

-- Verify the columns were added
DESCRIBE bookings;
