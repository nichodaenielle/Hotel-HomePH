-- Migration: Add file upload and notes columns to bookings table
-- Date: June 7, 2026
-- Purpose: Support Priority 1 - Booking Details View with file viewing
-- Compatible with older MySQL versions

-- Add new columns for file uploads and booking details
SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND column_name = 'payment_proof_url'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN payment_proof_url VARCHAR(255) DEFAULT NULL',
  'SELECT ''Column payment_proof_url already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND column_name = 'id_document_url'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN id_document_url VARCHAR(255) DEFAULT NULL',
  'SELECT ''Column id_document_url already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND column_name = 'booking_purpose'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN booking_purpose TEXT DEFAULT NULL',
  'SELECT ''Column booking_purpose already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND column_name = 'admin_notes'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN admin_notes TEXT DEFAULT NULL',
  'SELECT ''Column admin_notes already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND column_name = 'updated_at'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  'SELECT ''Column updated_at already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for faster lookups on file URLs
SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND index_name = 'idx_payment_proof'
);
SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_payment_proof ON bookings(payment_proof_url)',
  'SELECT ''Index idx_payment_proof already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND index_name = 'idx_id_document'
);
SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_id_document ON bookings(id_document_url)',
  'SELECT ''Index idx_id_document already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create booking_history table for audit trail
CREATE TABLE IF NOT EXISTS booking_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_status VARCHAR(20) DEFAULT NULL,
  new_status VARCHAR(20) DEFAULT NULL,
  performed_by VARCHAR(100) DEFAULT 'system',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking_id (booking_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
