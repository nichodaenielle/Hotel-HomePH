// Seed 5 Test Pending Bookings Script
// Run with: node seed-pending-bookings.js

require('dotenv').config();
const mysql = require('mysql2/promise');

async function seedPendingBookings() {
  // Local dev uses port 3308, production uses 3306
  const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3308;
  
  const pool = mysql.createPool({
    host: process.env.DB_HOST ?? 'localhost',
    port: dbPort,
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'hotel_at_home_dev',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  console.log(`Attempting to connect to MySQL on port ${dbPort}...`);

  try {
    console.log('Connecting to database...');
    const connection = await pool.getConnection();
    
    // First ensure rooms exist
    console.log('Ensuring rooms exist...');
    await connection.execute(`
      INSERT IGNORE INTO rooms (id, name, price, capacity) VALUES
      (1, 'Gold Room', 4800.00, 2),
      (2, 'Blue Room', 4800.00, 4),
      (3, 'Rooftop Lounge', 8000.00, 20)
    `);

    // Check existing pending bookings to avoid duplicates
    const [existing] = await connection.execute(
      "SELECT confirmation_code FROM bookings WHERE confirmation_code LIKE 'TEST%-PENDING'"
    );
    
    if (existing.length > 0) {
      console.log(`Found ${existing.length} existing test pending bookings:`);
      existing.forEach(row => console.log(`  - ${row.confirmation_code}`));
      
      // Delete existing test bookings to re-seed fresh
      console.log('\nDeleting existing test bookings to re-seed...');
      await connection.execute(
        "DELETE FROM bookings WHERE confirmation_code LIKE 'TEST%-PENDING'"
      );
    }

    // Calculate dates (7-14 days from today)
    const today = new Date();
    const date7 = new Date(today);
    date7.setDate(today.getDate() + 7);
    const date8 = new Date(today);
    date8.setDate(today.getDate() + 8);
    const date9 = new Date(today);
    date9.setDate(today.getDate() + 9);
    const date10 = new Date(today);
    date10.setDate(today.getDate() + 10);
    const date12 = new Date(today);
    date12.setDate(today.getDate() + 12);
    const date14 = new Date(today);
    date14.setDate(today.getDate() + 14);
    const date15 = new Date(today);
    date15.setDate(today.getDate() + 15);
    const date6 = new Date(today);
    date6.setDate(today.getDate() + 6);

    const formatDate = (date) => date.toISOString().split('T')[0];

    // Insert 5 test pending bookings
    console.log('\nInserting 5 test pending bookings...\n');
    
    const bookings = [
      {
        code: 'TEST001-PENDING',
        room_id: 1,
        first_name: 'Juan',
        last_name: 'Dela Cruz',
        email: 'juan.delacruz@test.com',
        phone: '09171234567',
        check_in: formatDate(date7),
        check_out: formatDate(date9),
        price: 9600.00
      },
      {
        code: 'TEST002-PENDING',
        room_id: 2,
        first_name: 'Maria',
        last_name: 'Santos',
        email: 'maria.santos@test.com',
        phone: '09182345678',
        check_in: formatDate(date10),
        check_out: formatDate(date12),
        price: 9600.00
      },
      {
        code: 'TEST003-PENDING',
        room_id: 1,
        first_name: 'Pedro',
        last_name: 'Reyes',
        email: 'pedro.reyes@test.com',
        phone: '09193456789',
        check_in: formatDate(date8),
        check_out: formatDate(date10),
        price: 9600.00
      },
      {
        code: 'TEST004-PENDING',
        room_id: 3,
        first_name: 'Ana',
        last_name: 'Garcia',
        email: 'ana.garcia@test.com',
        phone: '09204567890',
        check_in: formatDate(date14),
        check_out: formatDate(date15),
        price: 8000.00
      },
      {
        code: 'TEST005-PENDING',
        room_id: 2,
        first_name: 'Carlos',
        last_name: 'Mendoza',
        email: 'carlos.mendoza@test.com',
        phone: '09215678901',
        check_in: formatDate(date6),
        check_out: formatDate(date8),
        price: 9600.00
      }
    ];

    for (const booking of bookings) {
      await connection.execute(
        `INSERT INTO bookings (confirmation_code, room_id, guest_first_name, guest_last_name, guest_email, guest_phone, check_in, check_out, total_price, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [booking.code, booking.room_id, booking.first_name, booking.last_name, booking.email, booking.phone, booking.check_in, booking.check_out, booking.price]
      );
      console.log(`✓ Created: ${booking.code} - ${booking.first_name} ${booking.last_name} (${booking.check_in} to ${booking.check_out})`);
    }

    // Verify insertions
    console.log('\n--- Verification ---');
    const [rows] = await connection.execute(
      `SELECT 
        b.confirmation_code,
        r.name as room_name,
        CONCAT(b.guest_first_name, ' ', b.guest_last_name) as guest_name,
        b.guest_email,
        b.check_in,
        b.check_out,
        b.total_price,
        b.status
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.status = 'pending'
      ORDER BY b.created_at DESC
      LIMIT 5`
    );
    
    console.log(`\nTotal pending bookings in database: ${rows.length}`);
    console.log('\nTest bookings created successfully!');
    console.log('\nYou can now test bulk actions in the admin dashboard:');
    console.log('  1. Log in to admin dashboard');
    console.log('  2. You should see these 5 pending bookings');
    console.log('  3. Try selecting multiple and using "Confirm Selected" or "Cancel Selected"');

    connection.release();
    await pool.end();
    
  } catch (error) {
    console.error('Error seeding bookings:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\nCould not connect to MySQL. Please check:');
      console.log('  1. MySQL is running on port 3308 (local dev) or 3306 (production)');
      console.log('  2. Database credentials in .env.local are correct');
      console.log('  3. Database "hotel_at_home_dev" exists');
      console.log('\nTo start MySQL on Windows:');
      console.log('  net start MySQL80   (or your MySQL service name)');
      console.log('\nTo check if MySQL is running:');
      console.log('  Get-Process mysql*  (in PowerShell)');
    }
    process.exit(1);
  }
}

seedPendingBookings();
