-- Migration: Convert check_in / check_out from DATE to DATETIME (local wall-clock)
-- and add performance indexes for the availability engine.
--
-- Rationale: time-aware conflict detection requires check-in/check-out TIMES,
-- not just dates. Existing date-only rows are backfilled with the standard
-- hotel times (check-in 14:00, check-out 12:00).
--
-- NOTE: check_in/check_out hold LOCAL wall-clock datetimes (e.g. 2:00 PM at the
-- property), NOT UTC instants. Event timestamps (created_at/updated_at) remain
-- UTC TIMESTAMP columns.
-- Compatible with older MySQL versions

-- 1. Widen the columns to DATETIME. MySQL converts existing 'YYYY-MM-DD' values
--    to 'YYYY-MM-DD 00:00:00' automatically.
ALTER TABLE bookings
  MODIFY COLUMN check_in DATETIME NOT NULL,
  MODIFY COLUMN check_out DATETIME NOT NULL;

-- 2. Backfill midnight values produced by the conversion with standard times.
UPDATE bookings
   SET check_in = DATE_ADD(DATE(check_in), INTERVAL 14 HOUR)
 WHERE TIME(check_in) = '00:00:00';

UPDATE bookings
   SET check_out = DATE_ADD(DATE(check_out), INTERVAL 12 HOUR)
 WHERE TIME(check_out) = '00:00:00';

-- 3. Indexes to keep availability / calendar / booking queries fast.
SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND index_name = 'idx_bookings_room_id'
);
SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_bookings_room_id ON bookings (room_id)',
  'SELECT ''Index idx_bookings_room_id already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND index_name = 'idx_bookings_status'
);
SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_bookings_status ON bookings (status)',
  'SELECT ''Index idx_bookings_status already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND index_name = 'idx_bookings_check_in'
);
SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_bookings_check_in ON bookings (check_in)',
  'SELECT ''Index idx_bookings_check_in already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND index_name = 'idx_bookings_check_out'
);
SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_bookings_check_out ON bookings (check_out)',
  'SELECT ''Index idx_bookings_check_out already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Composite index optimised for the conflict-detection predicate.
SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
  AND table_name = 'bookings'
  AND index_name = 'idx_bookings_avail'
);
SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_bookings_avail ON bookings (room_id, status, check_in, check_out)',
  'SELECT ''Index idx_bookings_avail already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
