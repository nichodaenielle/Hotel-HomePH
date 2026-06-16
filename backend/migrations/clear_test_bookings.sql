-- Clear all test booking data
-- WARNING: This will delete ALL bookings from the database
-- Use only for clearing test data in development

DELETE FROM booking_history;
DELETE FROM bookings;

-- Reset auto-increment counter (optional)
ALTER TABLE bookings AUTO_INCREMENT = 1;
ALTER TABLE booking_history AUTO_INCREMENT = 1;

-- Verify deletion
SELECT COUNT(*) AS bookings_remaining FROM bookings;
SELECT COUNT(*) AS history_remaining FROM booking_history;
