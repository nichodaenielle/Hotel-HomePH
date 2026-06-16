USE hotel_at_home_dev;

CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2),
  capacity INT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  confirmation_code VARCHAR(20) UNIQUE NOT NULL,
  room_id INT NOT NULL,
  guest_first_name VARCHAR(50) NOT NULL,
  guest_last_name VARCHAR(50) NOT NULL,
  guest_email VARCHAR(100) NOT NULL,
  guest_phone VARCHAR(20) NOT NULL,
  check_in DATETIME NOT NULL,
  check_out DATETIME NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  payment_option VARCHAR(50),
  payment_verified TINYINT(1) NOT NULL DEFAULT 0,
  payment_verified_at DATETIME DEFAULT NULL,
  payment_verified_by VARCHAR(100) DEFAULT NULL,
  payment_submitted_at DATETIME DEFAULT NULL,
  payment_proof_url VARCHAR(255) DEFAULT NULL,
  payment_proof_data LONGTEXT DEFAULT NULL,
  id_document_url VARCHAR(255) DEFAULT NULL,
  booking_purpose TEXT DEFAULT NULL,
  admin_notes TEXT DEFAULT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Booking history table for audit trail
CREATE TABLE IF NOT EXISTS booking_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_status VARCHAR(20) DEFAULT NULL,
  new_status VARCHAR(20) DEFAULT NULL,
  performed_by VARCHAR(100) DEFAULT 'system',
  notes TEXT DEFAULT NULL,
  field_changed VARCHAR(64) DEFAULT NULL,
  old_value TEXT DEFAULT NULL,
  new_value TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking_id (booking_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
