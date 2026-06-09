-- Seed 5 Test Pending Bookings for Hotel at Home
-- Run this against the development database

USE hotel_at_home_dev;

-- First ensure rooms exist (if not already seeded)
INSERT IGNORE INTO rooms (id, name, price, capacity) VALUES
(1, 'Gold Room', 4800.00, 2),
(2, 'Blue Room', 4800.00, 4),
(3, 'Rooftop Lounge', 8000.00, 20);

-- Insert 5 test pending bookings
-- Dates are set for 7-14 days from now to be realistic
INSERT INTO bookings (confirmation_code, room_id, guest_first_name, guest_last_name, guest_email, guest_phone, check_in, check_out, total_price, status) VALUES
('TEST001-PENDING', 1, 'Juan', 'Dela Cruz', 'juan.delacruz@test.com', '09171234567', DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 9 DAY), 9600.00, 'pending'),
('TEST002-PENDING', 2, 'Maria', 'Santos', 'maria.santos@test.com', '09182345678', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 9600.00, 'pending'),
('TEST003-PENDING', 1, 'Pedro', 'Reyes', 'pedro.reyes@test.com', '09193456789', DATE_ADD(CURDATE(), INTERVAL 8 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 9600.00, 'pending'),
('TEST004-PENDING', 3, 'Ana', 'Garcia', 'ana.garcia@test.com', '09204567890', DATE_ADD(CURDATE(), INTERVAL 14 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 8000.00, 'pending'),
('TEST005-PENDING', 2, 'Carlos', 'Mendoza', 'carlos.mendoza@test.com', '09215678901', DATE_ADD(CURDATE(), INTERVAL 6 DAY), DATE_ADD(CURDATE(), INTERVAL 8 DAY), 9600.00, 'pending');

-- Verify insertions
SELECT 
    b.confirmation_code,
    r.name as room_name,
    CONCAT(b.guest_first_name, ' ', b.guest_last_name) as guest_name,
    b.guest_email,
    b.check_in,
    b.check_out,
    b.total_price,
    b.status,
    b.created_at
FROM bookings b
JOIN rooms r ON b.room_id = r.id
WHERE b.status = 'pending'
ORDER BY b.created_at DESC
LIMIT 5;
