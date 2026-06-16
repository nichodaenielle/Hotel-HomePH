-- Migration: Add weekend and duration pricing columns to rooms table
-- Purpose: Support consistent pricing across the system with weekend rates and Rooftop duration pricing
-- Compatible with older MySQL versions

-- Add weekend pricing column
SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'rooms'
  AND column_name = 'weekend_price'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE rooms ADD COLUMN weekend_price DECIMAL(10, 2) DEFAULT NULL AFTER price',
  'SELECT ''Column weekend_price already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add Rooftop 6-hour pricing column
SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'rooms'
  AND column_name = 'price_6hr'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE rooms ADD COLUMN price_6hr DECIMAL(10, 2) DEFAULT NULL AFTER weekend_price',
  'SELECT ''Column price_6hr already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add Rooftop weekend 6-hour pricing column
SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'rooms'
  AND column_name = 'weekend_price_6hr'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE rooms ADD COLUMN weekend_price_6hr DECIMAL(10, 2) DEFAULT NULL AFTER price_6hr',
  'SELECT ''Column weekend_price_6hr already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing rooms with current pricing data
UPDATE rooms SET 
  weekend_price = 5300,
  price_6hr = NULL,
  weekend_price_6hr = NULL
WHERE id IN (1, 2);

UPDATE rooms SET 
  weekend_price = 10000,
  price_6hr = 4000,
  weekend_price_6hr = 5000
WHERE id = 3;

-- Verify the columns were added
DESCRIBE rooms;
