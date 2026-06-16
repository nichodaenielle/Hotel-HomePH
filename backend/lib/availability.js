// Centralized availability engine — the SINGLE source of truth for room
// availability and double-booking prevention. Used by:
//   - Booking creation (POST /api/bookings)
//   - Availability check endpoint (POST /api/availability)
//   - Blocked-dates endpoint (GET /api/bookings/dates/:roomId)
//   - Manual block endpoint (admin)
//
// Domain rules for this property:
//   - Each room (Gold=1, Blue=2) is a single physical unit -> any datetime
//     overlap is a conflict.
//   - Rooftop Lounge (3) occupies the whole property: a Rooftop booking
//     conflicts with ANY room, and any room booking conflicts with the Rooftop.
//   - check_in / check_out are stored as LOCAL wall-clock DATETIME strings
//     ('YYYY-MM-DD HH:MM:SS'). Comparisons are consistent local wall-clock.
//
// Conflict definition (time-aware, with housekeeping buffer):
//   Two bookings conflict when their [check_in, check_out + buffer) intervals
//   overlap, i.e.
//       new_check_in  < existing_check_out + buffer
//   AND new_check_out + buffer > existing_check_in
//   This permits same-day turnover when times (plus buffer) do not overlap.

const ROOFTOP_ID = 3;
const DEFAULT_CHECKIN_TIME = '14:00:00';  // 2:00 PM
const DEFAULT_CHECKOUT_TIME = '12:00:00';  // 12:00 PM

// Optional per-room-type housekeeping buffer overrides (minutes).
const ROOM_BUFFER_OVERRIDES = {
  // [ROOFTOP_ID]: 180,
};

function globalBufferMinutes() {
  const v = parseInt(process.env.HOUSEKEEPING_BUFFER_MINUTES, 10);
  return Number.isFinite(v) && v >= 0 ? v : 120;
}

function bufferForRoom(roomId) {
  const override = ROOM_BUFFER_OVERRIDES[Number(roomId)];
  return Number.isFinite(override) ? override : globalBufferMinutes();
}

// Normalize 'HH:MM' or 'HH:MM:SS' -> 'HH:MM:SS'; returns null if invalid.
function normalizeTime(t) {
  if (!t) return null;
  const m = String(t).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const hh = Math.min(23, parseInt(m[1], 10));
  const mm = Math.min(59, parseInt(m[2], 10));
  const ss = m[3] ? Math.min(59, parseInt(m[3], 10)) : 0;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

// Normalize an incoming date/datetime value to a 'YYYY-MM-DD' date part.
function datePart(value) {
  if (!value) return null;
  const m = String(value).trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Resolve the standard check-in/check-out times for a room.
 * Gold/Blue always use fixed times. Rooftop may supply slot times.
 */
function getRoomTimes(roomId, opts = {}) {
  if (Number(roomId) === ROOFTOP_ID) {
    return {
      checkInTime: normalizeTime(opts.checkInTime) || DEFAULT_CHECKIN_TIME,
      checkOutTime: normalizeTime(opts.checkOutTime) || DEFAULT_CHECKOUT_TIME
    };
  }
  return { checkInTime: DEFAULT_CHECKIN_TIME, checkOutTime: DEFAULT_CHECKOUT_TIME };
}

/**
 * Build the full datetime window for a booking.
 * @returns {{ start: string, end: string }} 'YYYY-MM-DD HH:MM:SS' local strings
 */
function buildWindow({ roomId, checkIn, checkOut, checkInTime, checkOutTime }) {
  const inDate = datePart(checkIn);
  if (!inDate) throw new Error('Invalid check-in date');

  const times = getRoomTimes(roomId, { checkInTime, checkOutTime });
  let outDate = datePart(checkOut) || inDate;

  // Single-day bookings (e.g. Rooftop slots) where the end time is on/before the
  // start time imply a crossover to the next calendar day (e.g. 6PM–12AM).
  if (outDate === inDate && times.checkOutTime <= times.checkInTime) {
    outDate = addDays(inDate, 1);
  }

  return {
    start: `${inDate} ${times.checkInTime}`,
    end: `${outDate} ${times.checkOutTime}`
  };
}

/**
 * Room-matching SQL clause implementing the Rooftop-blocks-all rule.
 * @returns {{ clause: string, params: any[] }}
 */
function roomMatchClause(roomId) {
  if (Number(roomId) === ROOFTOP_ID) {
    // Rooftop conflicts with every room.
    return { clause: '1=1', params: [] };
  }
  // Other rooms conflict with themselves OR the Rooftop.
  return { clause: '(room_id = ? OR room_id = ?)', params: [Number(roomId), ROOFTOP_ID] };
}

/**
 * Find bookings that conflict with the supplied datetime window.
 * @param {{query: Function}} executor pool or transaction connection
 * @param {Object} args
 * @param {number} args.roomId
 * @param {string} args.start  'YYYY-MM-DD HH:MM:SS'
 * @param {string} args.end    'YYYY-MM-DD HH:MM:SS'
 * @param {number} [args.excludeId]  booking id to ignore (for edits)
 * @param {boolean} [args.forUpdate] take row/gap locks (use inside a transaction)
 * @returns {Promise<Array>} conflicting rows
 */
async function findConflicts(executor, { roomId, start, end, excludeId, forUpdate }) {
  const buffer = bufferForRoom(roomId);
  const room = roomMatchClause(roomId);

  const params = [
    ...room.params,
    end, buffer,   // existing.check_in < new_end + buffer
    buffer, start  // existing.check_out + buffer > new_start
  ];

  let sql =
    `SELECT id, confirmation_code, room_id, check_in, check_out, status
       FROM bookings
      WHERE status != 'cancelled'
        AND ${room.clause}
        AND check_in < DATE_ADD(?, INTERVAL ? MINUTE)
        AND DATE_ADD(check_out, INTERVAL ? MINUTE) > ?`;

  if (excludeId) {
    sql += ' AND id != ?';
    params.push(Number(excludeId));
  }
  if (forUpdate) sql += ' FOR UPDATE';

  const [rows] = await executor.query(sql, params);
  return rows;
}

/**
 * Convenience: check availability for a date range and return a structured
 * result for the AJAX availability endpoint.
 */
async function checkAvailability(executor, { roomId, checkIn, checkOut, checkInTime, checkOutTime, excludeId }) {
  const window = buildWindow({ roomId, checkIn, checkOut, checkInTime, checkOutTime });
  const conflicts = await findConflicts(executor, {
    roomId, start: window.start, end: window.end, excludeId
  });
  return {
    available: conflicts.length === 0,
    window,
    bufferMinutes: bufferForRoom(roomId),
    conflicts: conflicts.map(c => ({
      confirmationCode: c.confirmation_code,
      roomId: c.room_id,
      checkIn: c.check_in,
      checkOut: c.check_out,
      status: c.status
    }))
  };
}

module.exports = {
  ROOFTOP_ID,
  DEFAULT_CHECKIN_TIME,
  DEFAULT_CHECKOUT_TIME,
  getRoomTimes,
  buildWindow,
  findConflicts,
  checkAvailability,
  bufferForRoom
};
