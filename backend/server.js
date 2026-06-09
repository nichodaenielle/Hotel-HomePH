require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();

// Trust proxy is useful for environments behind reverse proxies (like Hostinger/Railway)
app.set('trust proxy', 1);

// Redirect HTTP to HTTPS in production
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] === 'http' || !req.secure) {
    return res.redirect(301, 'https://' + req.headers.host + req.url);
  }
  next();
});

// Middleware
// Configured CORS to restrict to your production domain and local development
const allowedOrigins = [
  'https://hotelathomeph.com',
  'https://www.hotelathomeph.com',
  'http://localhost:3000',
  'http://localhost:3005', // Local testing via Start_Dashboard.bat
  'http://localhost:8080', // Admin dashboard PHP server
  'http://127.0.0.1:8080', // Admin dashboard PHP server (alternate)
  'https://admin.hotelathomeph.com', // Allow admin dashboard
  'https://www.admin.hotelathomeph.com', // Also allow www subdomain for admin
  'https://goldenrod-coyote-370099.hostingersite.com', // Hostinger preview URL
  null, // Allow requests with no origin (same-origin, mobile apps)
  undefined
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
  // Also add without trailing slash if present
  if (process.env.FRONTEND_URL.endsWith('/')) {
    allowedOrigins.push(process.env.FRONTEND_URL.slice(0, -1));
  }
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (same-origin requests, mobile apps, postman)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
})); 
app.use(express.json({ limit: '50mb' })); // Parses incoming JSON requests, increased limit for image uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Email Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to Hostinger's SMTP if preferred
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hotel at Home Backend is running!' });
});

// --- API ROUTES ---

// 1. Get all rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// 2. Create a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const {
      roomId, guestFirstName, guestLastName, guestEmail, guestPhone,
      checkIn, checkOut, totalPrice, purpose, guests,
      proofBase64, idFrontBase64, idBackBase64
    } = req.body;

    // --- OVERLAP VALIDATION ---
    // Check if the chosen dates have been booked by someone else
    // If Gold or Blue room is selected, also check if the Rooftop Lounge (ID 3) is already booked
    let overlapQuery = "SELECT id FROM bookings WHERE (room_id = ? OR room_id = 3) AND status != 'cancelled' AND check_in < ? AND check_out > ?";
    let overlapParams = [roomId, checkOut, checkIn];

    // If Rooftop Lounge (ID 3), check if ANY room is booked during these dates
    if (parseInt(roomId) === 3) {
      overlapQuery = "SELECT id FROM bookings WHERE status != 'cancelled' AND check_in < ? AND check_out > ?";
      overlapParams = [checkOut, checkIn];
    }

    const [overlaps] = await pool.query(overlapQuery, overlapParams);
    if (overlaps.length > 0) {
      return res.status(400).json({ error: 'These dates have just been booked. Please select different dates.' });
    }

    // Generate a random confirmation code (e.g., HH-A1B2C3)
    const confirmationCode = 'HH-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Safe fallback in case a room like Rooftop Lounge has a null/TBA price
    const finalPrice = totalPrice || 0;

    const [result] = await pool.query(
      `INSERT INTO bookings 
      (confirmation_code, room_id, guest_first_name, guest_last_name, guest_email, guest_phone, check_in, check_out, total_price, booking_purpose) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [confirmationCode, roomId, guestFirstName, guestLastName, guestEmail, guestPhone, checkIn, checkOut, finalPrice, purpose || null]
    );

    // Send Email Notifications (Async, so it doesn't block the response if it fails)
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const isRooftop = parseInt(roomId) === 3;

        let roomName = 'Unknown Room';
        if (parseInt(roomId) === 1) roomName = 'Gold Room';
        else if (parseInt(roomId) === 2) roomName = 'Blue Room';
        else if (parseInt(roomId) === 3) roomName = 'Rooftop Lounge';
        
        const attachments = [];
        if (proofBase64) attachments.push({ filename: 'payment_proof.jpg', path: proofBase64 });
        if (idFrontBase64) attachments.push({ filename: 'id_front.jpg', path: idFrontBase64 });
        if (idBackBase64) attachments.push({ filename: 'id_back.jpg', path: idBackBase64 });

        const mailOptionsAdmin = {
          from: `"Hotel@Home" <${process.env.EMAIL_USER}>`,
          to: 'hotelathome.ph@gmail.com', // Admin Email
          subject: `New Booking Received: ${confirmationCode}`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaebf0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #011478; padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0; font-size: 22px;">New Booking Received</h2>
              </div>
              <div style="padding: 20px;">
                <p>A new booking has been made. Here are the details:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
                  <tr><td style="padding: 10px; border-bottom: 1px solid #ddd; width: 35%; color: #666;">Confirmation Code</td><td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; color: #011478;">${confirmationCode}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;">Room</td><td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">${roomName}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;">Guest Name</td><td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">${guestFirstName} ${guestLastName}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;">Email</td><td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">${guestEmail}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;">Phone</td><td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">${guestPhone}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;">Check-in</td><td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">${checkIn}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;">Check-out</td><td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">${checkOut}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;">Guests</td><td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">${guests || 1}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;">Total Price</td><td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">₱${totalPrice}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;">Purpose/Notes</td><td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; white-space: pre-wrap;">${purpose || 'N/A'}</td></tr>
                </table>
                <p style="margin-top: 20px; font-size: 12px; color: #777;">* Any uploaded files (Valid IDs, Payment Proof) are attached to this email.</p>
              </div>
            </div>
          `,
          attachments
        };
        
        const mailOptionsGuest = {
          from: `"Hotel@Home" <${process.env.EMAIL_USER}>`,
          to: guestEmail,
          subject: `Booking Received - Pending Confirmation`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaebf0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #011478; padding: 25px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 26px; font-weight: normal; letter-spacing: 1px;">Hotel at Home</h1>
                <p style="margin: 8px 0 0 0; color: #facc15; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Booking Received</p>
              </div>
              <div style="padding: 30px;">
                <p style="margin-top: 0; font-size: 16px;">Dear <strong>${guestFirstName}</strong>,</p>
                <p style="line-height: 1.5;">Thank you for your booking request with Hotel at Home! We have received your booking, and it is currently <strong>pending confirmation</strong>. Please find your booking details below:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 15px;">
                  <tr><td style="padding: 12px 10px; border-bottom: 1px solid #eee; width: 40%; color: #666;">Confirmation Code</td><td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #011478;">${confirmationCode}</td></tr>
                  <tr><td style="padding: 12px 10px; border-bottom: 1px solid #eee; color: #666;">Room Type</td><td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-weight: bold;">${roomName}</td></tr>
                  <tr><td style="padding: 12px 10px; border-bottom: 1px solid #eee; color: #666;">Check-in</td><td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-weight: bold;">${checkIn}${parseInt(roomId) !== 3 ? ' at 2:00 PM' : ''}</td></tr>
                  <tr><td style="padding: 12px 10px; border-bottom: 1px solid #eee; color: #666;">Check-out</td><td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-weight: bold;">${checkOut}${parseInt(roomId) !== 3 ? ' at 12:00 PM' : ''}</td></tr>
                  <tr><td style="padding: 12px 10px; border-bottom: 1px solid #eee; color: #666;">Number of Guests</td><td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-weight: bold;">${guests || 1}</td></tr>
                  <tr><td style="padding: 12px 10px; border-bottom: 1px solid #eee; color: #666;">Total Price</td><td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-weight: bold;">₱${totalPrice}</td></tr>
                  <tr><td style="padding: 12px 10px; border-bottom: 1px solid #eee; color: #666;">Purpose/Notes</td><td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-weight: bold; white-space: pre-wrap;">${purpose || 'N/A'}</td></tr>
                </table>

                <p style="line-height: 1.5; color: #b45309; background-color: #fffbeb; padding: 12px; border-radius: 8px;"><strong>Note:</strong> We are currently verifying your submitted proof of payment. You will receive a final confirmation email once the verification is complete.</p>

                <p style="line-height: 1.5;">For a smooth stay, kindly review our <a href="https://hotelathomeph.com/info/" style="color: #011478; font-weight: bold; text-decoration: none;">House Rules</a>.</p>
                <p style="line-height: 1.5;">If you have any questions, please feel free to contact us via email or Viber. We'll be happy to assist.</p>
                
                <p style="margin-top: 35px; margin-bottom: 0; font-size: 16px;">We look forward to hosting you!</p>
                <p style="margin-top: 8px; line-height: 1.5;"><strong>Hotel at Home Team</strong><br>
                <span style="font-size: 13px; color: #666;">📞 +63 927 858 4938 &nbsp;|&nbsp; +63 917 887 6444<br>
                💬 <a href="viber://chat?number=639278584938" style="color: #011478; text-decoration: none;">Chat on Viber</a> &nbsp;|&nbsp; 📧 <a href="mailto:hotelathome.ph@gmail.com" style="color: #011478; text-decoration: none;">Email Us</a></span></p>
              </div>
            </div>
          `
        };
        
        await transporter.sendMail(mailOptionsAdmin);
        await transporter.sendMail(mailOptionsGuest);
      }
    } catch (emailError) {
      console.error('Failed to send confirmation emails:', emailError);
    }

    res.status(201).json({ success: true, confirmationCode, bookingId: result.insertId });
  } catch (error) {
    console.error('Error creating booking:', error);
    // Expose the exact database error so we know exactly what is failing
    res.status(500).json({ error: error.message || 'Database error occurred' });
  }
});

// 4. Get blocked dates for a specific room
app.get('/api/bookings/dates/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // If Gold or Blue room is selected, fetch dates where this room OR the Rooftop Lounge is booked
    let query = "SELECT check_in, check_out FROM bookings WHERE (room_id = ? OR room_id = 3) AND status != 'cancelled'";
    let queryParams = [roomId];

    // If Rooftop Lounge (ID 3) is selected, block dates if Gold (1), Blue (2), or Rooftop (3) is booked
    if (parseInt(roomId) === 3) {
      query = "SELECT check_in, check_out FROM bookings WHERE status != 'cancelled'";
      queryParams = [];
    }

    const [rows] = await pool.query(query, queryParams);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    res.status(500).json({ error: 'Failed to fetch dates' });
  }
});

// 5. Admin Dashboard: Get all bookings (Secured by ADMIN_SECRET)
app.get('/api/admin/bookings', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  // Use environment variable if set, otherwise fallback to default password
  const validPassword = process.env.ADMIN_SECRET || 'hotelathomeadmin';

  if (!apiKey || apiKey !== validPassword) {
    return res.status(401).json({ error: 'Unauthorized. Invalid admin password.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM bookings ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Admin Dashboard: Block dates manually
app.post('/api/admin/block-dates', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  const validPassword = process.env.ADMIN_SECRET || 'hotelathomeadmin';

  if (!apiKey || apiKey !== validPassword) {
    return res.status(401).json({ error: 'Unauthorized. Invalid admin password.' });
  }

  const { roomId, checkIn, checkOut, reason } = req.body;

  try {
    const roomsToBlock = roomId === 'all' ? [1, 2, 3] : [parseInt(roomId)];

    // First pass: Check for overlaps to prevent partial blocks
    for (let rId of roomsToBlock) {
      let overlapQuery = "SELECT id FROM bookings WHERE (room_id = ? OR room_id = 3) AND status != 'cancelled' AND check_in < ? AND check_out > ?";
      let overlapParams = [rId, checkOut, checkIn];

      if (rId === 3) {
        overlapQuery = "SELECT id FROM bookings WHERE status != 'cancelled' AND check_in < ? AND check_out > ?";
        overlapParams = [checkOut, checkIn];
      }

      const [overlaps] = await pool.query(overlapQuery, overlapParams);
      if (overlaps.length > 0) {
        return res.status(400).json({ error: `These dates overlap with an existing booking or block.` });
      }
    }

    // Second pass: Insert blocks safely
    for (let rId of roomsToBlock) {
      const confirmationCode = 'BLK-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      await pool.query(
        `INSERT INTO bookings 
        (confirmation_code, room_id, guest_first_name, guest_last_name, guest_email, guest_phone, check_in, check_out, total_price, booking_purpose, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [confirmationCode, rId, 'System', 'Block', 'admin@hotelathomeph.com', 'N/A', checkIn, checkOut, 0, reason || 'Manual Block', 'confirmed']
      );
    }

    res.status(201).json({ success: true, message: 'Dates blocked successfully.' });
  } catch (error) {
    console.error('Error blocking dates:', error);
    res.status(500).json({ error: 'Failed to block dates.' });
  }
});

// 6. Admin Dashboard: Update booking status
app.patch('/api/admin/bookings/:id/status', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  const validPassword = process.env.ADMIN_SECRET || 'hotelathomeadmin';

  if (!apiKey || apiKey !== validPassword) {
    return res.status(401).json({ error: 'Unauthorized. Invalid admin password.' });
  }

  const { id } = req.params;
  const { status } = req.body;

  try {
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

    // Send a follow-up email to the guest based on the status change
    try {
      const [bookingRows] = await pool.query('SELECT guest_email, guest_first_name, confirmation_code FROM bookings WHERE id = ?', [id]);
      
      if (bookingRows.length > 0 && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const { guest_email, guest_first_name, confirmation_code } = bookingRows[0];
        
        if (status === 'confirmed' || status === 'cancelled') {
          let subject = '';
          let htmlBody = '';
          
          if (status === 'confirmed') {
            subject = 'Booking Confirmed! – Hotel At Home';
            htmlBody = `
              <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaebf0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #011478; padding: 25px; text-align: center; color: white;">
                  <h1 style="margin: 0; font-size: 26px; font-weight: normal; letter-spacing: 1px;">Hotel at Home</h1>
                  <p style="margin: 8px 0 0 0; color: #4ade80; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Booking Approved</p>
                </div>
                <div style="padding: 30px;">
                  <p style="margin-top: 0; font-size: 16px;">Dear <strong>${guest_first_name}</strong>,</p>
                  <p style="line-height: 1.5;">Great news! Your booking with reference code <strong>${confirmation_code}</strong> has been officially confirmed.</p>
                  <p style="line-height: 1.5;">We have successfully verified your payment and locked in your dates. A separate message with your check-in instructions will be sent prior to your arrival.</p>
                  <p style="margin-top: 35px; margin-bottom: 0; font-size: 16px;">We look forward to hosting you!</p>
                  <p style="margin-top: 8px; line-height: 1.5;"><strong>Hotel at Home Team</strong><br>
                  <span style="font-size: 13px; color: #666;">📞 +63 927 858 4938 &nbsp;|&nbsp; +63 917 887 6444<br>
                  💬 <a href="viber://chat?number=639278584938" style="color: #011478; text-decoration: none;">Chat on Viber</a> &nbsp;|&nbsp; 📧 <a href="mailto:hotelathome.ph@gmail.com" style="color: #011478; text-decoration: none;">Email Us</a></span></p>
                </div>
              </div>
            `;
          } else if (status === 'cancelled') {
            subject = 'Booking Cancelled – Hotel At Home';
            htmlBody = `
              <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaebf0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #011478; padding: 25px; text-align: center; color: white;">
                  <h1 style="margin: 0; font-size: 26px; font-weight: normal; letter-spacing: 1px;">Hotel at Home</h1>
                  <p style="margin: 8px 0 0 0; color: #f87171; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Booking Cancelled</p>
                </div>
                <div style="padding: 30px;">
                  <p style="margin-top: 0; font-size: 16px;">Dear <strong>${guest_first_name}</strong>,</p>
                  <p style="line-height: 1.5;">We regret to inform you that your booking with reference code <strong>${confirmation_code}</strong> has been cancelled.</p>
                  <p style="line-height: 1.5;">This could be due to issues with payment verification, unavailability of dates, or at your request. If you believe this is a mistake or would like to rebook, please contact us immediately.</p>
                  <p style="margin-top: 35px; margin-bottom: 0; font-size: 16px;">Thank you for considering us.</p>
                  <p style="margin-top: 8px; line-height: 1.5;"><strong>Hotel at Home Team</strong><br>
                  <span style="font-size: 13px; color: #666;">📞 +63 927 858 4938 &nbsp;|&nbsp; +63 917 887 6444<br>
                  💬 <a href="viber://chat?number=639278584938" style="color: #011478; text-decoration: none;">Chat on Viber</a> &nbsp;|&nbsp; 📧 <a href="mailto:hotelathome.ph@gmail.com" style="color: #011478; text-decoration: none;">Email Us</a></span></p>
                </div>
              </div>
            `;
          }
          
          await transporter.sendMail({ from: process.env.EMAIL_USER, to: guest_email, subject: subject, html: htmlBody });
        }
      }
    } catch (emailErr) {
      console.error('Failed to send status update email:', emailErr);
    }
    
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// 8. Public: Get booking status by confirmation code
app.get('/api/bookings/status/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // We only select non-sensitive data (excluding phone numbers, emails, etc.)
    const [rows] = await pool.query(
      'SELECT confirmation_code, guest_first_name, guest_last_name, room_id, check_in, check_out, total_price, status, booking_purpose FROM bookings WHERE confirmation_code = ? LIMIT 1',
      [code]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found. Please check your confirmation code.' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching booking status:', error);
    res.status(500).json({ error: 'Failed to fetch booking details.' });
  }
});

// 7. Debug route to verify Hostinger paths
app.get('/api/debug', (req, res) => {
  const fs = require('fs');
  const rootDir = __dirname.endsWith('backend') ? path.resolve(__dirname, '..') : process.cwd();
  const frontendPath = path.join(rootDir, 'frontend', 'out');
  res.json({
    status: 'running',
    rootDir: rootDir,
    dirname: __dirname,
    frontendExists: fs.existsSync(frontendPath),
    files: fs.existsSync(frontendPath) ? fs.readdirSync(frontendPath) : 'Missing'
  });
});

// --- SERVE FRONTEND WEBSITE ---
// Use absolute path to bypass Hostinger pathing issues
const rootDir = __dirname.endsWith('backend') ? path.resolve(__dirname, '..') : process.cwd();
const frontendOutPath = path.join(rootDir, 'frontend', 'out');

app.use(express.static(frontendOutPath, { extensions: ['html'] }));

// Catch-all handler for 404 Not Found (Next.js is a Multi-Page Application)
app.get('*', (req, res) => {
  const fs = require('fs');
  
  // Catch trailing slashes and direct matches to ensure Next.js pages load reliably
  let requestedPath = req.path;
  // If path is like /view-booking/, try to find /view-booking/index.html
  if (requestedPath.endsWith('/') && requestedPath.length > 1) {
    requestedPath = requestedPath.slice(0, -1);
  }

  const targetHtmlFile = path.join(frontendOutPath, requestedPath, 'index.html'); // e.g., /view-booking/index.html
  const targetRootFile = path.join(frontendOutPath, `${requestedPath}.html`); // e.g., /view-booking.html (fallback)
  
  if (fs.existsSync(targetHtmlFile)) {
    return res.sendFile(targetHtmlFile);
  } else if (fs.existsSync(targetRootFile)) { // For root files like 404.html if directly requested
    return res.sendFile(targetRootFile);
  }
  
  const notFoundPath = path.join(frontendOutPath, '404.html');
  res.status(404).sendFile(notFoundPath, (err) => {
    if (err) {
      console.error('404 file missing:', err);
      res.status(404).send('<div style="font-family: sans-serif; text-align: center; margin-top: 50px;"><h2>Page Not Found</h2><p>This page does not exist or the deployment is still updating.</p><a href="/" style="color: #011478; text-decoration: underline;">Return Home</a></div>');
    }
  });
});

const PORT = process.env.PORT || 4000;

// Test database connection on startup but don't crash if it fails
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    console.log('Server will continue running but database features may not work');
  });

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle server errors gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

// Handle uncaught errors to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit - let the server continue running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - let the server continue running
});