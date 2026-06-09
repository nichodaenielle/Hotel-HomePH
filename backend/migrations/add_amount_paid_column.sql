-- Migration: Add amount_paid and payment_option columns to bookings table
-- This fixes the CSV export where amount paid column was always empty

-- Add amount_paid column with default 0
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2) DEFAULT 0 
AFTER total_price;

-- Add payment_option column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_option VARCHAR(50) 
AFTER amount_paid;

-- Update existing confirmed bookings to have amount_paid = total_price
-- This assumes confirmed bookings were fully paid
UPDATE bookings 
SET amount_paid = total_price 
WHERE status = 'confirmed' 
AND (amount_paid IS NULL OR amount_paid = 0);

-- Verify the columns were added
DESCRIBE bookings;
