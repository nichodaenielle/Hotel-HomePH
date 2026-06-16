require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const nodemailer = require('nodemailer');
const path = require('path');
const { logAudit } = require('./lib/audit');
const availability = require('./lib/availability');

// Application display timezone (timestamps are STORED in UTC; this is only used
// by clients for display). Defaults to Philippine Standard Time.
const APP_TIMEZONE = process.env.APP_TIMEZONE || 'Asia/Manila';
const APP_TIMEZONE_LABEL = process.env.APP_TIMEZONE_LABEL || 'PHT';

// Resolve which admin performed an action. Auth is a shared secret, so identity
// is best-effort via an optional header the dashboard can send.
function getAdminUser(req) {
  return (req.headers['x-admin-user'] || req.body?.performedBy || 'admin').toString().slice(0, 100);
}

// Returns true if the request carries a valid admin key; otherwise sends 401.
function requireAdmin(req, res) {
  const validPassword = process.env.ADMIN_SECRET || 'hotelathomeadmin';
  if (!req.headers['x-api-key'] || req.headers['x-api-key'] !== validPassword) {
    res.status(401).json({ error: 'Unauthorized. Invalid admin password.' });
    return false;
  }
  return true;
}

const app = express();

// Trust proxy is useful for environments behind reverse proxies (like Hostinger/Railway)
app.set('trust proxy', 1);

// Redirect HTTP to HTTPS in production (skip for local development)
app.use((req, res, next) => {
  const host = req.headers.host || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  
  // Only redirect in production (not localhost)
  if (!isLocalhost && (req.headers['x-forwarded-proto'] === 'http' || !req.secure)) {
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
  'http://localhost:8000', // Admin dashboard local testing
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

// Public config: exposes the display timezone so frontend & admin render
// identical local times from UTC-stored timestamps.
app.get('/api/config', (req, res) => {
  res.json({ timezone: APP_TIMEZONE, timezoneLabel: APP_TIMEZONE_LABEL });
});

// Real-time availability check (AJAX). Single source of truth = availability engine.
app.post('/api/availability', async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, checkInTime, checkOutTime, excludeId } = req.body;
    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'roomId, checkIn and checkOut are required.' });
    }
    const result = await availability.checkAvailability(pool, {
      roomId, checkIn, checkOut, checkInTime, checkOutTime, excludeId
    });
    res.json(result);
  } catch (error) {
    console.error('Availability check failed:', error);
    res.status(500).json({ error: error.message || 'Failed to check availability' });
  }
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
      proofBase64, idFrontBase64, idBackBase64,
      paymentMethod, amountPaid,
      checkInTime, checkOutTime
    } = req.body;

    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'Missing required booking fields.' });
    }

    // Build the full datetime window (single source of truth for times).
    const window = availability.buildWindow({ roomId, checkIn, checkOut, checkInTime, checkOutTime });

    // Generate a random confirmation code (e.g., HH-A1B2C3)
    const confirmationCode = 'HH-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Safe fallback in case a room like Rooftop Lounge has a null/TBA price
    const finalPrice = totalPrice || 0;

    // Record the payment submission time (UTC) when payment info is provided.
    const paymentSubmittedAt = (paymentMethod || proofBase64) ? new Date() : null;

    // --- ATOMIC, CONCURRENCY-SAFE BOOKING CREATION ---
    // Re-check conflicts with row/gap locks inside a transaction so two
    // simultaneous requests cannot both pass validation and double-book.
    const conn = await pool.getConnection();
    let result;
    try {
      await conn.beginTransaction();

      const conflicts = await availability.findConflicts(conn, {
        roomId,
        start: window.start,
        end: window.end,
        forUpdate: true
      });

      if (conflicts.length > 0) {
        await conn.rollback();
        return res.status(409).json({
          error: 'These dates have just been booked. Please select different dates.',
          conflicts: conflicts.map(c => c.confirmation_code)
        });
      }

      [result] = await conn.query(
        `INSERT INTO bookings
        (confirmation_code, room_id, guest_first_name, guest_last_name, guest_email, guest_phone, check_in, check_out, total_price, booking_purpose, payment_option, amount_paid, payment_submitted_at, payment_proof_data, id_front_data, id_back_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [confirmationCode, roomId, guestFirstName, guestLastName, guestEmail, guestPhone, window.start, window.end, finalPrice, purpose || null, paymentMethod || null, amountPaid || 0, paymentSubmittedAt, proofBase64 || null, idFrontBase64 || null, idBackBase64 || null]
      );

      // Audit: booking created (inside the same transaction)
      await logAudit(conn, {
        bookingId: result.insertId,
        action: 'created',
        newStatus: 'pending',
        performedBy: 'guest',
        notes: `Booking ${confirmationCode} created (${window.start} → ${window.end})`
      });

      await conn.commit();
    } catch (txErr) {
      try { await conn.rollback(); } catch (_) {}
      throw txErr;
    } finally {
      conn.release();
    }

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
          subject: `🎉 New Booking: ${confirmationCode} — ${guestFirstName} ${guestLastName}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f3f6fb; font-family: 'Georgia', 'Times New Roman', serif;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(1, 20, 120, 0.08);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #011478 0%, #001a72 100%); padding: 32px 40px; text-align: center;">
                          <img src="https://hotelathomeph.com/img/logo/hhlogo.png" alt="Hotel at Home" style="width: 80px; height: 80px; margin-bottom: 16px;" />
                          <h1 style="margin: 0; color: #facc15; font-size: 28px; font-weight: normal; letter-spacing: 2px; font-style: italic;">Hotel at Home</h1>
                          <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; font-family: Arial, sans-serif; opacity: 0.9;">New Reservation</p>
                        </td>
                      </tr>
                      
                      <!-- Alert Banner -->
                      <tr>
                        <td style="background: #fef9c3; padding: 16px 40px; text-align: center; border-bottom: 1px solid #fde047;">
                          <p style="margin: 0; color: #854d0e; font-size: 14px; font-family: Arial, sans-serif;">📧 Action Required: Review booking details and confirm</p>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <p style="margin: 0 0 24px 0; color: #011478; font-size: 18px; font-style: italic;">A new booking awaits your confirmation.</p>
                          
                          <!-- Confirmation Code Highlight -->
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px;">
                            <tr>
                              <td style="background: #011478; padding: 20px; text-align: center; border-radius: 12px;">
                                <p style="margin: 0 0 4px 0; color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-family: Arial, sans-serif;">Confirmation Code</p>
                                <p style="margin: 0; color: #facc15; font-size: 32px; font-weight: bold; letter-spacing: 4px; font-family: 'Courier New', monospace;">${confirmationCode}</p>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Details Grid -->
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                            <tr>
                              <td width="50%" valign="top" style="padding-right: 12px;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                  <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><p style="margin: 0 0 4px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif;">Room</p><p style="margin: 0; color: #011478; font-size: 16px; font-weight: bold;">${roomName}</p></td></tr>
                                  <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><p style="margin: 0 0 4px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif;">Guest</p><p style="margin: 0; color: #011478; font-size: 16px; font-weight: bold;">${guestFirstName} ${guestLastName}</p></td></tr>
                                  <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><p style="margin: 0 0 4px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif;">Contact</p><p style="margin: 0; color: #011478; font-size: 14px;">${guestEmail}<br>${guestPhone}</p></td></tr>
                                </table>
                              </td>
                              <td width="50%" valign="top" style="padding-left: 12px;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                  <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><p style="margin: 0 0 4px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif;">Check-in</p><p style="margin: 0; color: #011478; font-size: 16px; font-weight: bold;">${checkIn}</p></td></tr>
                                  <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><p style="margin: 0 0 4px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif;">Check-out</p><p style="margin: 0; color: #011478; font-size: 16px; font-weight: bold;">${checkOut}</p></td></tr>
                                  <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><p style="margin: 0 0 4px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif;">Guests</p><p style="margin: 0; color: #011478; font-size: 16px; font-weight: bold;">${guests || 1}</p></td></tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Total Price -->
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                            <tr>
                              <td style="background: #f3f6fb; padding: 20px; border-radius: 12px; border-left: 4px solid #facc15;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td><p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif;">Total Amount</p></td>
                                    <td align="right"><p style="margin: 0; color: #011478; font-size: 28px; font-weight: bold;">₱${totalPrice}</p></td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Purpose/Notes -->
                          ${purpose ? `
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                            <tr>
                              <td style="padding: 16px; background: #fafafa; border-radius: 8px; border: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif;">Purpose & Notes</p>
                                <p style="margin: 0; color: #011478; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${purpose}</p>
                              </td>
                            </tr>
                          </table>
                          ` : ''}
                          
                          <!-- Attachments Note -->
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding: 16px; background: #eff6ff; border-radius: 8px; border-left: 3px solid #011478;">
                                <p style="margin: 0; color: #011478; font-size: 13px; font-family: Arial, sans-serif;">📎 <strong>Attachments:</strong> Valid IDs and Payment Proof are attached to this email.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background: #f3f6fb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0; color: #6b7280; font-size: 12px; font-family: Arial, sans-serif;">Admin Dashboard: <a href="https://hotelathomeph.com/admin-dashboard/" style="color: #011478; text-decoration: none; font-weight: bold;">hotelathomeph.com/admin-dashboard</a></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
          attachments
        };
        
        const mailOptionsGuest = {
          from: `"Hotel@Home" <${process.env.EMAIL_USER}>`,
          to: guestEmail,
          subject: `🏨 Booking Received — ${confirmationCode}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f3f6fb; font-family: 'Georgia', 'Times New Roman', serif;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(1, 20, 120, 0.08);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #011478 0%, #001a72 100%); padding: 40px; text-align: center;">
                          <img src="https://hotelathomeph.com/img/logo/hhlogo.png" alt="Hotel at Home" style="width: 80px; height: 80px; margin-bottom: 16px;" />
                          <h1 style="margin: 0; color: #facc15; font-size: 32px; font-weight: normal; letter-spacing: 2px; font-style: italic;">Hotel at Home</h1>
                          <p style="margin: 12px 0 0 0; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; font-family: Arial, sans-serif; opacity: 0.9;">Your Mediterranean Escape</p>
                        </td>
                      </tr>
                      
                      <!-- Status Banner -->
                      <tr>
                        <td style="background: #fef9c3; padding: 20px 40px; text-align: center; border-bottom: 1px solid #fde047;">
                          <p style="margin: 0; color: #854d0e; font-size: 14px; font-family: Arial, sans-serif; font-weight: 500;">⏳ Booking Status: <strong>Pending Confirmation</strong></p>
                          <p style="margin: 4px 0 0 0; color: #a16207; font-size: 12px; font-family: Arial, sans-serif;">We are verifying your payment details</p>
                        </td>
                      </tr>
                      
                      <!-- Welcome Message -->
                      <tr>
                        <td style="padding: 40px 40px 24px 40px;">
                          <p style="margin: 0; color: #011478; font-size: 22px; font-style: italic;">Dear ${guestFirstName},</p>
                          <p style="margin: 16px 0 0 0; color: #374151; font-size: 16px; line-height: 1.7;">Thank you for choosing <strong>Hotel at Home</strong>! Your booking request has been received and is currently being processed. We will send you a confirmation email once your payment has been verified.</p>
                        </td>
                      </tr>
                      
                      <!-- Confirmation Code -->
                      <tr>
                        <td style="padding: 0 40px 32px 40px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="background: #011478; padding: 24px; text-align: center; border-radius: 12px;">
                                <p style="margin: 0 0 4px 0; color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-family: Arial, sans-serif;">Your Confirmation Code</p>
                                <p style="margin: 0; color: #facc15; font-size: 36px; font-weight: bold; letter-spacing: 6px; font-family: 'Courier New', monospace;">${confirmationCode}</p>
                                <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.6); font-size: 12px; font-family: Arial, sans-serif;">Please save this for your records</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Booking Details -->
                      <tr>
                        <td style="padding: 0 40px 32px 40px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding-bottom: 16px;">
                                <p style="margin: 0; color: #011478; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif; border-bottom: 2px solid #facc15; padding-bottom: 8px; display: inline-block;">Booking Details</p>
                              </td>
                            </tr>
                          </table>
                          
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="50%" valign="top" style="padding-right: 12px;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                  <tr><td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;"><p style="margin: 0 0 4px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif;">Room</p><p style="margin: 0; color: #011478; font-size: 17px; font-weight: bold;">${roomName}</p></td></tr>
                                  <tr><td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;"><p style="margin: 0 0 4px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif;">Check-in</p><p style="margin: 0; color: #011478; font-size: 16px; font-weight: bold;">${checkIn}${parseInt(roomId) !== 3 ? ' <span style="font-size: 13px; color: #6b7280; font-weight: normal;">at 2:00 PM</span>' : ''}</p></td></tr>
                                  <tr><td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;"><p style="margin: 0 0 4px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif;">Guests</p><p style="margin: 0; color: #011478; font-size: 16px; font-weight: bold;">${guests || 1}</p></td></tr>
                                </table>
                              </td>
                              <td width="50%" valign="top" style="padding-left: 12px;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                  <tr><td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;"><p style="margin: 0 0 4px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif;">Check-out</p><p style="margin: 0; color: #011478; font-size: 16px; font-weight: bold;">${checkOut}${parseInt(roomId) !== 3 ? ' <span style="font-size: 13px; color: #6b7280; font-weight: normal;">at 12:00 PM</span>' : ''}</p></td></tr>
                                  <tr><td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;"><p style="margin: 0 0 4px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif;">Total Amount</p><p style="margin: 0; color: #011478; font-size: 22px; font-weight: bold;">₱${totalPrice}</p></td></tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Notes -->
                      ${purpose ? `
                      <tr>
                        <td style="padding: 0 40px 24px 40px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding: 16px; background: #fafafa; border-radius: 8px; border: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif;">Purpose & Notes</p>
                                <p style="margin: 0; color: #011478; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${purpose}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ` : ''}
                      
                      <!-- Important Notice -->
                      <tr>
                        <td style="padding: 0 40px 24px 40px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding: 20px; background: #fffbeb; border-radius: 12px; border-left: 4px solid #f59e0b;">
                                <p style="margin: 0 0 8px 0; color: #92400e; font-size: 13px; font-weight: bold; font-family: Arial, sans-serif;">📋 What happens next?</p>
                                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6; font-family: Arial, sans-serif;">Our team is reviewing your payment proof. Once verified, you will receive a <strong>confirmation email</strong> with your official booking details and check-in instructions.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- House Rules -->
                      <tr>
                        <td style="padding: 0 40px 24px 40px;">
                          <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.7;">For a pleasant stay, please review our <a href="https://hotelathomeph.com/info/" style="color: #011478; font-weight: bold; text-decoration: underline;">House Rules & Information</a>.</p>
                        </td>
                      </tr>
                      
                      <!-- Contact -->
                      <tr>
                        <td style="padding: 0 40px 40px 40px;">
                          <p style="margin: 0 0 16px 0; color: #011478; font-size: 16px; font-style: italic;">Need assistance? We're here to help!</p>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="33%" style="padding: 12px; background: #f3f6fb; border-radius: 8px; text-align: center;">
                                <p style="margin: 0; font-size: 20px;">📞</p>
                                <p style="margin: 4px 0 0 0; font-size: 12px; font-family: Arial, sans-serif;"><a href="tel:+639278584938" style="color: #011478; text-decoration: none; font-weight: 500;">+63 927 858 4938</a></p>
                              </td>
                              <td width="34%" style="padding: 12px; background: #f3f6fb; border-radius: 8px; text-align: center;">
                                <p style="margin: 0; font-size: 20px;">�</p>
                                <p style="margin: 4px 0 0 0; font-size: 12px; font-family: Arial, sans-serif;"><a href="viber://chat?number=639278584938" style="color: #011478; text-decoration: none; font-weight: 500;">Viber Chat</a></p>
                              </td>
                              <td width="33%" style="padding: 12px; background: #f3f6fb; border-radius: 8px; text-align: center;">
                                <p style="margin: 0; font-size: 20px;">📧</p>
                                <p style="margin: 4px 0 0 0; font-size: 12px; font-family: Arial, sans-serif;"><a href="mailto:hotelathome.ph@gmail.com" style="color: #011478; text-decoration: none; font-weight: 500;">Email Us</a></p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background: #011478; padding: 32px 40px; text-align: center;">
                          <p style="margin: 0 0 8px 0; color: #facc15; font-size: 20px; font-style: italic;">Hotel at Home</p>
                          <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 13px; line-height: 1.6; font-family: Arial, sans-serif;">Amadeo, Cavite — Your Mediterranean Escape</p>
                          <p style="margin: 16px 0 0 0; color: rgba(255,255,255,0.5); font-size: 12px; font-family: Arial, sans-serif;">www.hotelathomeph.com</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
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

// 4. Get blocked dates for a specific room (with detailed booking info)
app.get('/api/bookings/dates/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { startDate, endDate } = req.query;

    // Fetch all non-cancelled bookings for the room (or all rooms if Rooftop)
    let query = "SELECT id, room_id, confirmation_code, check_in, check_out, status FROM bookings WHERE status != 'cancelled'";
    let queryParams = [];

    if (parseInt(roomId) !== 3) {
      // For Gold/Blue rooms, include bookings for this room OR Rooftop
      query += " AND (room_id = ? OR room_id = 3)";
      queryParams = [roomId];
    }
    // For Rooftop, fetch all bookings (blocks all rooms)

    // Optionally filter by date range for performance
    if (startDate && endDate) {
      query += " AND check_in <= ? AND check_out >= ?";
      queryParams.push(endDate, startDate);
    }

    const [rows] = await pool.query(query, queryParams);

    // Group bookings by date with detailed time information
    const bookingsByDate = {};
    const buffer = availability.bufferForRoom(Number(roomId));

    rows.forEach(booking => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);

      // Apply buffer: block from checkIn - buffer to checkOut + buffer
      const bufferStart = new Date(checkIn.getTime() - buffer * 60000);
      const bufferEnd = new Date(checkOut.getTime() + buffer * 60000);

      // Mark all dates in the buffered range as blocked with booking details
      let current = new Date(bufferStart);
      current.setHours(0, 0, 0, 0);
      const end = new Date(bufferEnd);
      end.setHours(0, 0, 0, 0);

      while (current <= end) {
        const dateKey = current.toISOString().split('T')[0];
        if (!bookingsByDate[dateKey]) {
          bookingsByDate[dateKey] = [];
        }
        // Add booking details for this date
        bookingsByDate[dateKey].push({
          id: booking.id,
          roomId: booking.room_id,
          confirmationCode: booking.confirmation_code,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          status: booking.status,
          isRooftopBlock: booking.room_id === 3 && parseInt(roomId) !== 3
        });
        current.setDate(current.getDate() + 1);
      }
    });

    res.json(bookingsByDate);
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
    // Exclude the large payment_proof_data blob from the list; expose a flag
    // instead. The proof itself is fetched on demand via the proof endpoint.
    const [rows] = await pool.query(
      `SELECT id, confirmation_code, room_id, guest_first_name, guest_last_name,
              guest_email, guest_phone, check_in, check_out, total_price, amount_paid,
              payment_option, payment_verified, payment_verified_at, payment_verified_by,
              payment_submitted_at, payment_proof_url, id_document_url,
              booking_purpose, admin_notes, status, created_at, updated_at,
              (payment_proof_data IS NOT NULL) AS has_payment_proof
         FROM bookings
        ORDER BY id DESC`
    );
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

    // First pass: Check for overlaps to prevent partial blocks (engine-driven)
    for (let rId of roomsToBlock) {
      const w = availability.buildWindow({ roomId: rId, checkIn, checkOut });
      const overlaps = await availability.findConflicts(pool, {
        roomId: rId, start: w.start, end: w.end
      });
      if (overlaps.length > 0) {
        return res.status(400).json({ error: `These dates overlap with an existing booking or block.` });
      }
    }

    // Second pass: Insert blocks safely
    for (let rId of roomsToBlock) {
      const confirmationCode = 'BLK-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const w = availability.buildWindow({ roomId: rId, checkIn, checkOut });

      const [blockResult] = await pool.query(
        `INSERT INTO bookings 
        (confirmation_code, room_id, guest_first_name, guest_last_name, guest_email, guest_phone, check_in, check_out, total_price, booking_purpose, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [confirmationCode, rId, 'System', 'Block', 'admin@hotelathomeph.com', 'N/A', w.start, w.end, 0, reason || 'Manual Block', 'confirmed']
      );

      // Audit: manual date block / availability override
      await logAudit(pool, {
        bookingId: blockResult.insertId,
        action: 'blocked',
        newStatus: 'confirmed',
        performedBy: getAdminUser(req),
        notes: `Manual block on room ${rId} (${checkIn} → ${checkOut})${reason ? ': ' + reason : ''}`
      });
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
  const { status, amount_paid, payment_option } = req.body;

  try {
    // Capture previous status for the audit trail before updating.
    const [prevRows] = await pool.query('SELECT status FROM bookings WHERE id = ?', [id]);
    const oldStatus = prevRows.length ? prevRows[0].status : null;

    // The confirm modal can also submit payment details; persist them too.
    const setClauses = ['status = ?'];
    const setParams = [status];
    if (amount_paid !== undefined && amount_paid !== null && amount_paid !== '') {
      setClauses.push('amount_paid = ?');
      setParams.push(Number(amount_paid));
    }
    if (payment_option !== undefined && payment_option !== null && payment_option !== '') {
      setClauses.push('payment_option = ?');
      setParams.push(payment_option);
    }
    setParams.push(id);
    await pool.query(`UPDATE bookings SET ${setClauses.join(', ')} WHERE id = ?`, setParams);

    // Audit: status change (action mirrors target status so the dashboard
    // timeline colour-codes confirm/cancel correctly).
    await logAudit(pool, {
      bookingId: Number(id),
      action: (status === 'confirmed' || status === 'cancelled') ? status : 'updated',
      oldStatus,
      newStatus: status,
      performedBy: getAdminUser(req),
      notes: `Status changed from ${oldStatus || 'unknown'} to ${status}`
    });

    // Send a follow-up email to the guest based on the status change
    try {
      const [bookingRows] = await pool.query('SELECT guest_email, guest_first_name, confirmation_code FROM bookings WHERE id = ?', [id]);
      
      if (bookingRows.length > 0 && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const { guest_email, guest_first_name, confirmation_code } = bookingRows[0];
        
        if (status === 'confirmed' || status === 'cancelled') {
          let subject = '';
          let htmlBody = '';
          
          if (status === 'confirmed') {
            subject = '✅ Booking Confirmed — See You Soon!';
            htmlBody = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 0; background-color: #f3f6fb; font-family: 'Georgia', 'Times New Roman', serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center" style="padding: 40px 20px;">
                      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(1, 20, 120, 0.08);">
                        <!-- Header -->
                        <tr>
                          <td style="background: linear-gradient(135deg, #011478 0%, #001a72 100%); padding: 40px; text-align: center;">
                            <img src="https://hotelathomeph.com/img/logo/hhlogo.png" alt="Hotel at Home" style="width: 80px; height: 80px; margin-bottom: 16px;" />
                            <h1 style="margin: 0; color: #facc15; font-size: 32px; font-weight: normal; letter-spacing: 2px; font-style: italic;">Hotel at Home</h1>
                            <p style="margin: 12px 0 0 0; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; font-family: Arial, sans-serif; opacity: 0.9;">Your Mediterranean Escape</p>
                          </td>
                        </tr>
                        
                        <!-- Success Banner -->
                        <tr>
                          <td style="background: #dcfce7; padding: 24px 40px; text-align: center; border-bottom: 1px solid #86efac;">
                            <p style="margin: 0; color: #166534; font-size: 18px; font-family: Arial, sans-serif; font-weight: 500;">🎉 Booking Confirmed!</p>
                            <p style="margin: 4px 0 0 0; color: #15803d; font-size: 14px; font-family: Arial, sans-serif;">Your reservation is officially approved</p>
                          </td>
                        </tr>
                        
                        <!-- Confirmation Code -->
                        <tr>
                          <td style="padding: 40px 40px 24px 40px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td style="background: linear-gradient(135deg, #011478 0%, #001a72 100%); padding: 28px; text-align: center; border-radius: 12px;">
                                  <p style="margin: 0 0 4px 0; color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-family: Arial, sans-serif;">Confirmation Code</p>
                                  <p style="margin: 0; color: #facc15; font-size: 40px; font-weight: bold; letter-spacing: 6px; font-family: 'Courier New', monospace;">${confirmation_code}</p>
                                  <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.8); font-size: 13px; font-family: Arial, sans-serif;">Present this at check-in</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        
                        <!-- Welcome -->
                        <tr>
                          <td style="padding: 0 40px 24px 40px;">
                            <p style="margin: 0; color: #011478; font-size: 22px; font-style: italic;">Dear ${guest_first_name},</p>
                            <p style="margin: 16px 0 0 0; color: #374151; font-size: 16px; line-height: 1.7;">Wonderful news! Your booking has been <strong style="color: #166534;">officially confirmed</strong>. We have verified your payment and your dates are now locked in.</p>
                          </td>
                        </tr>
                        
                        <!-- What's Next -->
                        <tr>
                          <td style="padding: 0 40px 24px 40px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td style="padding: 24px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0;">
                                  <p style="margin: 0 0 16px 0; color: #166534; font-size: 14px; font-weight: bold; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 1px;">What's Next?</p>
                                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td style="padding: 8px 0;">
                                        <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;"><span style="color: #166534; font-weight: bold;">1.</span> Save your confirmation code — you'll need it at check-in</p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 8px 0;">
                                        <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;"><span style="color: #166534; font-weight: bold;">2.</span> Review our <a href="https://hotelathomeph.com/info/" style="color: #011478; font-weight: bold; text-decoration: underline;">House Rules & Information</a></p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 8px 0;">
                                        <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;"><span style="color: #166534; font-weight: bold;">3.</span> Check-in instructions will be sent 24 hours before arrival</p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        
                        <!-- Check-in Info -->
                        <tr>
                          <td style="padding: 0 40px 32px 40px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td style="padding: 20px; background: #eff6ff; border-radius: 12px; border-left: 4px solid #011478;">
                                  <p style="margin: 0 0 8px 0; color: #011478; font-size: 13px; font-weight: bold; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 1px;">📍 Check-in Details</p>
                                  <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;"><strong>Time:</strong> 2:00 PM onwards (Gold & Blue Rooms)<br><strong>Location:</strong> Hotel at Home, Amadeo, Cavite<br><strong>Contact:</strong> +63 927 858 4938</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        
                        <!-- Closing -->
                        <tr>
                          <td style="padding: 0 40px 40px 40px;">
                            <p style="margin: 0; color: #011478; font-size: 18px; font-style: italic; line-height: 1.6;">We look forward to welcoming you to your Mediterranean escape!</p>
                            <p style="margin: 16px 0 0 0; color: #374151; font-size: 15px;">With warm regards,</p>
                            <p style="margin: 4px 0 0 0; color: #011478; font-size: 16px; font-weight: bold;">Hotel at Home Team</p>
                          </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                          <td style="background: #011478; padding: 32px 40px; text-align: center;">
                            <p style="margin: 0 0 8px 0; color: #facc15; font-size: 20px; font-style: italic;">Hotel at Home</p>
                            <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 13px; line-height: 1.6; font-family: Arial, sans-serif;">Amadeo, Cavite — Your Mediterranean Escape</p>
                            <p style="margin: 16px 0 0 0; color: rgba(255,255,255,0.5); font-size: 12px; font-family: Arial, sans-serif;">📞 +63 927 858 4938 | 💬 Viber | 📧 hotelathome.ph@gmail.com</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `;
          } else if (status === 'cancelled') {
            subject = '❌ Booking Cancelled — Hotel at Home';
            htmlBody = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 0; background-color: #f3f6fb; font-family: 'Georgia', 'Times New Roman', serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center" style="padding: 40px 20px;">
                      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(1, 20, 120, 0.08);">
                        <!-- Header -->
                        <tr>
                          <td style="background: linear-gradient(135deg, #011478 0%, #001a72 100%); padding: 40px; text-align: center;">
                            <img src="https://hotelathomeph.com/img/logo/hhlogo.png" alt="Hotel at Home" style="width: 80px; height: 80px; margin-bottom: 16px;" />
                            <h1 style="margin: 0; color: #facc15; font-size: 32px; font-weight: normal; letter-spacing: 2px; font-style: italic;">Hotel at Home</h1>
                            <p style="margin: 12px 0 0 0; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; font-family: Arial, sans-serif; opacity: 0.9;">Your Mediterranean Escape</p>
                          </td>
                        </tr>
                        
                        <!-- Cancellation Banner -->
                        <tr>
                          <td style="background: #fee2e2; padding: 24px 40px; text-align: center; border-bottom: 1px solid #fecaca;">
                            <p style="margin: 0; color: #991b1b; font-size: 18px; font-family: Arial, sans-serif; font-weight: 500;">❌ Booking Cancelled</p>
                            <p style="margin: 4px 0 0 0; color: #b91c1c; font-size: 14px; font-family: Arial, sans-serif;">Reference: ${confirmation_code}</p>
                          </td>
                        </tr>
                        
                        <!-- Message -->
                        <tr>
                          <td style="padding: 40px;">
                            <p style="margin: 0; color: #011478; font-size: 22px; font-style: italic;">Dear ${guest_first_name},</p>
                            
                            <p style="margin: 20px 0 0 0; color: #374151; font-size: 16px; line-height: 1.7;">We regret to inform you that your booking has been <strong style="color: #991b1b;">cancelled</strong>.</p>
                            
                            <!-- Reason Box -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
                              <tr>
                                <td style="padding: 20px; background: #fef2f2; border-radius: 12px; border-left: 4px solid #ef4444;">
                                  <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 13px; font-weight: bold; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 1px;">Possible Reasons</p>
                                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                    <tr><td style="padding: 4px 0;"><p style="margin: 0; color: #7f1d1d; font-size: 14px;">• Payment verification issues</p></td></tr>
                                    <tr><td style="padding: 4px 0;"><p style="margin: 0; color: #7f1d1d; font-size: 14px;">• Date unavailability due to double-booking</p></td></tr>
                                    <tr><td style="padding: 4px 0;"><p style="margin: 0; color: #7f1d1d; font-size: 14px;">• At your request</p></td></tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                            
                            <!-- Action Needed -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                              <tr>
                                <td style="padding: 20px; background: #eff6ff; border-radius: 12px; border-left: 4px solid #011478;">
                                  <p style="margin: 0 0 8px 0; color: #011478; font-size: 13px; font-weight: bold; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 1px;">📞 Need Help?</p>
                                  <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">If you believe this is a mistake or would like to rebook different dates, please contact us immediately.</p>
                                </td>
                              </tr>
                            </table>
                            
                            <!-- Contact Options -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td width="33%" style="padding: 12px; background: #f3f6fb; border-radius: 8px; text-align: center;">
                                  <p style="margin: 0; font-size: 20px;">📞</p>
                                  <p style="margin: 4px 0 0 0; font-size: 12px; font-family: Arial, sans-serif;"><a href="tel:+639278584938" style="color: #011478; text-decoration: none; font-weight: 500;">+63 927 858 4938</a></p>
                                </td>
                                <td width="34%" style="padding: 12px; background: #f3f6fb; border-radius: 8px; text-align: center;">
                                  <p style="margin: 0; font-size: 20px;">💬</p>
                                  <p style="margin: 4px 0 0 0; font-size: 12px; font-family: Arial, sans-serif;"><a href="viber://chat?number=639278584938" style="color: #011478; text-decoration: none; font-weight: 500;">Viber Chat</a></p>
                                </td>
                                <td width="33%" style="padding: 12px; background: #f3f6fb; border-radius: 8px; text-align: center;">
                                  <p style="margin: 0; font-size: 20px;">📧</p>
                                  <p style="margin: 4px 0 0 0; font-size: 12px; font-family: Arial, sans-serif;"><a href="mailto:hotelathome.ph@gmail.com" style="color: #011478; text-decoration: none; font-weight: 500;">Email Us</a></p>
                                </td>
                              </tr>
                            </table>
                            
                            <p style="margin: 32px 0 0 0; color: #374151; font-size: 15px; line-height: 1.6;">Thank you for considering Hotel at Home. We hope to welcome you in the future.</p>
                            
                            <p style="margin: 16px 0 0 0; color: #011478; font-size: 16px; font-weight: bold;">Hotel at Home Team</p>
                          </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                          <td style="background: #011478; padding: 32px 40px; text-align: center;">
                            <p style="margin: 0 0 8px 0; color: #facc15; font-size: 20px; font-style: italic;">Hotel at Home</p>
                            <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 13px; line-height: 1.6; font-family: Arial, sans-serif;">Amadeo, Cavite — Your Mediterranean Escape</p>
                            <p style="margin: 16px 0 0 0; color: rgba(255,255,255,0.5); font-size: 12px; font-family: Arial, sans-serif;">www.hotelathomeph.com</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
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

// Admin Dashboard: Get audit history for a booking
app.get('/api/admin/bookings/:id/history', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  const validPassword = process.env.ADMIN_SECRET || 'hotelathomeadmin';

  if (!apiKey || apiKey !== validPassword) {
    return res.status(401).json({ error: 'Unauthorized. Invalid admin password.' });
  }

  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT action, old_status, new_status, performed_by, notes,
              field_changed, old_value, new_value, created_at
         FROM booking_history
        WHERE booking_id = ?
        ORDER BY created_at DESC, id DESC`,
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching booking history:', error);
    res.status(500).json({ error: 'Failed to fetch booking history' });
  }
});

// Admin Dashboard: Fetch the stored payment proof (data URL) on demand.
app.get('/api/admin/bookings/:id/proof', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT payment_proof_data, payment_proof_url, id_front_data, id_back_data, payment_option,
              payment_verified, payment_verified_at, payment_verified_by, payment_submitted_at
         FROM bookings WHERE id = ? LIMIT 1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    const b = rows[0];
    res.json({
      proof: b.payment_proof_data || b.payment_proof_url || null,
      idFront: b.id_front_data || null,
      idBack: b.id_back_data || null,
      paymentOption: b.payment_option,
      verified: !!b.payment_verified,
      verifiedAt: b.payment_verified_at,
      verifiedBy: b.payment_verified_by,
      submittedAt: b.payment_submitted_at
    });
  } catch (error) {
    console.error('Error fetching payment proof:', error);
    res.status(500).json({ error: 'Failed to fetch payment proof' });
  }
});

// Admin Dashboard: Verify payment and (optionally) purge the proof image.
app.post('/api/admin/bookings/:id/verify-payment', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { id } = req.params;
  const admin = getAdminUser(req);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT payment_verified FROM bookings WHERE id = ? FOR UPDATE',
      [id]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Mark payment verified.
    await conn.query(
      'UPDATE bookings SET payment_verified = 1, payment_verified_at = ?, payment_verified_by = ? WHERE id = ?',
      [new Date(), admin, id]
    );
    await logAudit(conn, {
      bookingId: Number(id),
      action: 'payment_verified',
      performedBy: admin,
      notes: 'Payment marked as verified'
    });

    await conn.commit();
    res.json({ success: true, verified: true });
  } catch (error) {
    try { await conn.rollback(); } catch (_) {}
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  } finally {
    conn.release();
  }
});

// Admin Dashboard: Edit payment fields (amount_paid / payment_option) with audit.
app.patch('/api/admin/bookings/:id/payment', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { id } = req.params;
  const { amountPaid, paymentOption } = req.body || {};
  const admin = getAdminUser(req);

  try {
    const [rows] = await pool.query(
      'SELECT amount_paid, payment_option FROM bookings WHERE id = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    const current = rows[0];

    const updates = [];
    const params = [];

    if (amountPaid !== undefined && Number(amountPaid) !== Number(current.amount_paid)) {
      updates.push('amount_paid = ?');
      params.push(Number(amountPaid));
      await logAudit(pool, {
        bookingId: Number(id), action: 'payment_edited', performedBy: admin,
        field: 'amount_paid', oldValue: current.amount_paid, newValue: amountPaid,
        notes: `Amount paid changed from ${current.amount_paid} to ${amountPaid}`
      });
    }
    if (paymentOption !== undefined && paymentOption !== current.payment_option) {
      updates.push('payment_option = ?');
      params.push(paymentOption);
      await logAudit(pool, {
        bookingId: Number(id), action: 'payment_edited', performedBy: admin,
        field: 'payment_option', oldValue: current.payment_option, newValue: paymentOption,
        notes: `Payment method changed from ${current.payment_option || 'none'} to ${paymentOption}`
      });
    }

    if (updates.length === 0) return res.json({ success: true, changed: false });

    params.push(id);
    await pool.query(`UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ success: true, changed: true });
  } catch (error) {
    console.error('Error editing payment:', error);
    res.status(500).json({ error: 'Failed to edit payment' });
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