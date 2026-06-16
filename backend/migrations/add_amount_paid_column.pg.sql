-- Migration: Add amount_paid and payment_option columns to bookings table
-- This fixes the CSV export where amount paid column was always empty
-- PostgreSQL version

-- Add amount_paid column with default 0
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2) DEFAULT 0;

-- Add payment_option column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_option VARCHAR(50);

-- Update existing confirmed bookings to have amount_paid = total_price
-- This assumes confirmed bookings were fully paid
UPDATE bookings
SET amount_paid = total_price
WHERE status = 'confirmed'
AND (amount_paid IS NULL OR amount_paid = 0);

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
AND column_name IN ('amount_paid', 'payment_option');
