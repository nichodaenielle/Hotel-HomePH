-- Migration: Store payment proof so admins can VIEW and PURGE it.
--
-- Previously, proof images were only attached to notification emails and never
-- stored, so the admin dashboard could never display them. We store the proof
-- as a data URL in a LONGTEXT column. "Purging" simply nulls this column after
-- successful verification, which is fully compatible with Hostinger shared
-- hosting (no dependency on a persistent writable uploads directory).
-- Compatible with older MySQL versions

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND column_name = 'payment_proof_data'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN payment_proof_data LONGTEXT DEFAULT NULL AFTER payment_proof_url',
  'SELECT ''Column payment_proof_data already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
