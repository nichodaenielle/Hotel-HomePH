-- Migration: Update room base prices to match new pricing structure
-- Gold Room: ₱4,800/night (weekday base)
-- Blue Room: ₱5,300/night (weekday base, ₱500 higher due to higher variable costs)
-- Rooftop:   ₱8,000/12hr, ₱4,000/6hr (weekday base)
--
-- NOTE: Weekend/holiday add-ons and peak season surcharges are computed in
-- application code (frontend + backend), NOT stored as separate DB columns.
--
-- Auto add-ons applied in code on top of base price:
--   Rooms:        +₱500/night on weekends & holidays
--                 Oct/Nov +₱200 | Dec/Jan/Feb +₱500
--   Rooftop 12hr: +₱2,000 on weekends & holidays
--                 Oct/Nov +₱500 | Dec/Jan/Feb +₱1,000
--   Rooftop 6hr:  +₱1,000 on weekends & holidays
--                 Oct/Nov +₱250 | Dec/Jan/Feb +₱500

UPDATE rooms SET
  price = 4800,
  weekend_price = 4800
WHERE id = 1;  -- Gold Room

UPDATE rooms SET
  price = 5300,
  weekend_price = 5300
WHERE id = 2;  -- Blue Room (base is 500 higher than Gold due to variable costs)

UPDATE rooms SET
  price = 8000,
  weekend_price = 8000,
  price_6hr = 4000,
  weekend_price_6hr = 4000
WHERE id = 3;  -- Rooftop Lounge (add-ons applied in code)

-- Verify
SELECT id, name, price, weekend_price, price_6hr, weekend_price_6hr FROM rooms;
