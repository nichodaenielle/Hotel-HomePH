-- Migration: Audit logging value-level columns + payment verification tracking
-- Purpose:
--   1. Extend booking_history so it can record field-level edits
--      (previous value -> new value), as required by the audit logging spec.
--   2. Add payment verification metadata to bookings so the admin payment
--      workflow (verify + purge proof) can be tracked.
--
-- Safe to run multiple times (uses IF NOT EXISTS).
-- PostgreSQL version

-- 1. Value-level audit columns on booking_history -----------------------------
ALTER TABLE booking_history
  ADD COLUMN IF NOT EXISTS field_changed VARCHAR(64) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS old_value TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS new_value TEXT DEFAULT NULL;

-- 2. Payment verification metadata on bookings --------------------------------
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_verified_by VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_submitted_at TIMESTAMP DEFAULT NULL;
