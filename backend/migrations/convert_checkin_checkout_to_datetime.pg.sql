-- Migration: Convert check_in / check_out from DATE to TIMESTAMP (local wall-clock)
-- and add performance indexes for the availability engine.
--
-- Rationale: time-aware conflict detection requires check-in/check-out TIMES,
-- not just dates. Existing date-only rows are backfilled with the standard
-- hotel times (check-in 14:00, check-out 12:00).
--
-- NOTE: check_in/check_out hold LOCAL wall-clock timestamps (e.g. 2:00 PM at the
-- property), NOT UTC instants. Event timestamps (created_at/updated_at) remain
-- UTC TIMESTAMP columns.
-- PostgreSQL version

-- 1. Widen the columns to TIMESTAMP. PostgreSQL converts existing 'YYYY-MM-DD' values
--    to 'YYYY-MM-DD 00:00:00' automatically.
ALTER TABLE bookings
  ALTER COLUMN check_in TYPE TIMESTAMP USING check_in::timestamp,
  ALTER COLUMN check_out TYPE TIMESTAMP USING check_out::timestamp;

-- 2. Backfill midnight values produced by the conversion with standard times.
UPDATE bookings
   SET check_in = DATE(check_in) + INTERVAL '14 hours'
 WHERE EXTRACT(HOUR FROM check_in) = 0;

UPDATE bookings
   SET check_out = DATE(check_out) + INTERVAL '12 hours'
 WHERE EXTRACT(HOUR FROM check_out) = 0;

-- 3. Indexes to keep availability / calendar / booking queries fast.
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings (room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON bookings (check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out ON bookings (check_out);
-- Composite index optimised for the conflict-detection predicate.
CREATE INDEX IF NOT EXISTS idx_bookings_avail ON bookings (room_id, status, check_in, check_out);
