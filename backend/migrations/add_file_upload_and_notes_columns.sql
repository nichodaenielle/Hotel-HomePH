-- Migration: Add file upload and notes columns to bookings table
-- Date: June 7, 2026
-- Purpose: Support Priority 1 - Booking Details View with file viewing

-- Add new columns for file uploads and booking details
ALTER TABLE bookings
ADD COLUMN payment_proof_url VARCHAR(255) DEFAULT NULL,
ADD COLUMN id_document_url VARCHAR(255) DEFAULT NULL,
ADD COLUMN booking_purpose TEXT DEFAULT NULL,
ADD COLUMN admin_notes TEXT DEFAULT NULL,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add index for faster lookups on file URLs
CREATE INDEX idx_payment_proof ON bookings(payment_proof_url);
CREATE INDEX idx_id_document ON bookings(id_document_url);

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

-- Add sample history entries for existing bookings (optional, for testing)
-- INSERT INTO booking_history (booking_id, action, old_status, new_status, performed_by, notes)
-- SELECT id, 'created', NULL, status, 'system', 'Booking created'
-- FROM bookings;
