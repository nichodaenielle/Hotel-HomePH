-- Migration: Add holidays and calendar overrides tables (PostgreSQL)
-- Purpose: Support legal holiday categorization and admin unblock of auto-blocked rooftop dates

-- Table for legal holidays
CREATE TABLE IF NOT EXISTS holidays (
  id SERIAL PRIMARY KEY,
  holiday_date DATE NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for manual calendar overrides (block/unblock) per room/date
CREATE TABLE IF NOT EXISTS calendar_overrides (
  id SERIAL PRIMARY KEY,
  override_date DATE NOT NULL,
  room_id INTEGER NOT NULL,
  override_type VARCHAR(10) NOT NULL DEFAULT 'block',
  reason VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (override_date, room_id, override_type)
);
