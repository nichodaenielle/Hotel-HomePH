-- Migration: Add ID front and ID back image storage
-- Purpose: Store ID card images (front and back) for each booking
-- Compatible with older MySQL versions

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND column_name = 'id_front_data'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN id_front_data TEXT DEFAULT NULL AFTER payment_proof_data',
  'SELECT ''Column id_front_data already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND column_name = 'id_back_data'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN id_back_data TEXT DEFAULT NULL AFTER id_front_data',
  'SELECT ''Column id_back_data already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
