-- Migration: Store payment proof so admins can VIEW and PURGE it.
--
-- Previously, proof images were only attached to notification emails and never
-- stored, so the admin dashboard could never display them. We store the proof
-- as a data URL in a TEXT column. "Purging" simply nulls this column after
-- successful verification, which is fully compatible with Hostinger shared
-- hosting (no dependency on a persistent writable uploads directory).
-- PostgreSQL version

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS payment_proof_data TEXT DEFAULT NULL;
