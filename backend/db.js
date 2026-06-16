const mysql = require('mysql2/promise');
require('dotenv').config();

// Local dev uses port 3308, production uses 3306
const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3308;

// Create a connection pool to MySQL Database.
// IMPORTANT (timezone consistency): all timestamps are stored and returned in UTC.
// - `timezone: 'Z'` makes mysql2 interpret/format JS Dates as UTC.
// - `dateStrings: true` returns DATE/DATETIME/TIMESTAMP as raw strings (no implicit
//   local-time conversion). Clients MUST treat these strings as UTC.
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: dbPort,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hotel_at_home_dev',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  timezone: 'Z'
});

// Force every pooled connection's SQL session to UTC so CURRENT_TIMESTAMP and
// TIMESTAMP retrieval are deterministic regardless of the host server's timezone.
pool.on('connection', (connection) => {
  connection.query("SET time_zone = '+00:00'");
});

module.exports = pool;