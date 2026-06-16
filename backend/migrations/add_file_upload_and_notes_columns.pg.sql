-- Migration: Add file upload and notes columns to bookings table
-- Date: June 7, 2026
-- Purpose: Support Priority 1 - Booking Details View with file viewing
-- PostgreSQL version

-- Add new columns for file uploads and booking details
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_proof_url VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS id_document_url VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS booking_purpose TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add index for faster lookups on file URLs
CREATE INDEX IF NOT EXISTS idx_payment_proof ON bookings(payment_proof_url);
CREATE INDEX IF NOT EXISTS idx_id_document ON bookings(id_document_url);

-- Create booking_history table for audit trail
CREATE TABLE IF NOT EXISTS booking_history (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_status VARCHAR(20) DEFAULT NULL,
  new_status VARCHAR(20) DEFAULT NULL,
  performed_by VARCHAR(100) DEFAULT 'system',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_history_booking_id FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_booking_history_booking_id ON booking_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_history_created_at ON booking_history(created_at);

-- Create trigger for auto-updating updated_at on bookings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add sample history entries for existing bookings (optional, for testing)
-- INSERT INTO booking_history (booking_id, action, old_status, new_status, performed_by, notes)
-- SELECT id, 'created', NULL, status, 'system', 'Booking created'
-- FROM bookings;
