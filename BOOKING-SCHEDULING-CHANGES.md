# Booking Scheduling Enhancements

**Date**: July 13, 2026  
**Project**: Hotel at Home PH  
**Status**: Implemented & Deployed  
**Priority**: High — required reference for pricing and scheduling logic

---

## Overview

Implemented changes to the booking scheduling system and pricing:

1. Remove the previous "3-days prior" booking limitation and allow same-day bookings.
2. Categorize weekend nights as **Friday check-in → Saturday check-out** and **Saturday check-in → Sunday check-out**.
3. Categorize legal holidays as **2 holiday nights**:
   - `holiday_date - 1` check-in → `holiday_date` check-out
   - `holiday_date` check-in → `holiday_date + 1` check-out
4. Block the Rooftop Lounge by default on weekends and legal holidays.
5. Allow Admin override to unblock specific Rooftop dates.
6. **Flexible pricing** — dynamic per-night pricing with weekend/holiday add-ons and peak season surcharges (computed in frontend code, not stored as separate DB columns).
7. Updated contact numbers site-wide to `0968-190-7363` and `0917-880-0387`.

---

## Table of Contents

1. [Business Rules](#business-rules)
2. [Flexible Pricing Rules](#flexible-pricing-rules)
3. [Database Changes](#database-changes)
4. [Backend Changes](#backend-changes)
5. [Frontend Changes](#frontend-changes)
6. [Admin Dashboard Changes](#admin-dashboard-changes)
7. [Files Modified](#files-modified)
8. [New Files](#new-files)
9. [Testing Checklist](#testing-checklist)
10. [Future Pricing Notes](#future-pricing-notes)

---

## Business Rules

### Weekends

A night is a **weekend night** when the check-in date is:

- **Friday** (Fri → Sat)
- **Saturday** (Sat → Sun)

This applies to pricing and Rooftop blocking.

### Legal Holidays

A legal holiday is stored as a single `holiday_date` in the `holidays` table. Each holiday produces **two holiday nights**:

| Night | Check-in | Check-out |
|-------|----------|-----------|
| Night 1 | `holiday_date - 1` | `holiday_date` |
| Night 2 | `holiday_date` | `holiday_date + 1` |

**Example**: November 30 is a legal holiday.

- Nov 29 check-in → Nov 30 check-out is a holiday night.
- Nov 30 check-in → Dec 1 check-out is a holiday night.

### Rooftop Lounge Blocking

- The Rooftop Lounge (`room_id = 3`) is **auto-blocked** on:
  - All weekend nights (Friday/Saturday check-ins)
  - All legal holiday nights
- Gold Room (`room_id = 1`) and Blue Room (`room_id = 2`) are **NOT** auto-blocked on weekends/holidays.
- Room rentals retain priority over Rooftop bookings.
- An Admin can **unblock** a specific Rooftop date via the admin dashboard calendar or `POST /api/admin/calendar-overrides`.

---

## Flexible Pricing Rules

All add-ons are computed in **frontend code** (`book-now/page.tsx`). The DB stores only the base price.

### Base Prices

| Room | Base Price |
|------|-----------|
| Gold Room (id=1) | ₱4,800 / night |
| Blue Room (id=2) | ₱5,300 / night |
| Rooftop 12hr (id=3) | ₱8,000 / slot |
| Rooftop 6hr (id=3) | ₱4,000 / slot |

### Weekend / Holiday Add-ons

Applied when check-in night is a **Friday, Saturday, or legal holiday night**:

| Room | Add-on |
|------|--------|
| Gold Room | +₱500 / night |
| Blue Room | +₱500 / night |
| Rooftop 12hr | +₱2,000 / slot |
| Rooftop 6hr | +₱1,000 / slot |

### Peak Season Add-ons

Applied on top of base + weekend/holiday add-on:

| Period | Gold/Blue Rooms | Rooftop 12hr | Rooftop 6hr |
|--------|----------------|--------------|-------------|
| October / November | +₱200 / night | +₱500 / slot | +₱250 / slot |
| December / January / February | +₱500 / night | +₱1,000 / slot | +₱500 / slot |

### Formula

```
Final Price = Base Price + Weekend/Holiday Add-on + Peak Season Add-on
```

**Example — Gold Room, Saturday, November:**
`₱4,800 + ₱500 (weekend) + ₱200 (Oct/Nov) = ₱5,500`

### Implementation

- Helper functions in `frontend/src/app/book-now/page.tsx`:
  - `getPeakSeasonAddon(month, roomId, duration)` — returns peak season add-on
  - `isHolidayNight(dateStr, holidayDates)` — checks if a date is a holiday night
- `holidayDates` state fetched from `GET /api/admin/holidays` on page load
- Gold/Blue: iterates each night in the stay and sums per-night prices
- Rooftop: single slot, applies add-ons to check-in date

### DB State

`weekend_price` is set equal to `price` for all rooms — add-ons are **not** stored in the DB. Migration: `backend/migrations/update_base_prices.sql`.

---

## Database Changes

### New Tables

#### `holidays`

| Column | Type | Notes |
|--------|------|-------|
| `id` | INT PK | Auto-increment |
| `holiday_date` | DATE | Unique |
| `name` | VARCHAR(100) | Display name, e.g. "Bonifacio Day" |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

#### `calendar_overrides`

| Column | Type | Notes |
|--------|------|-------|
| `id` | INT PK | Auto-increment |
| `override_date` | DATE | Date being overridden |
| `room_id` | INT | Currently only `3` (Rooftop) used |
| `override_type` | ENUM | `'block'` or `'unblock'` |
| `reason` | VARCHAR(255) | Optional note |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

Unique constraint: `(override_date, room_id, override_type)`

### Schema & Migration Files

- `backend/schema.sql`
- `backend/schema-dev.sql`
- `backend/migrations/add_holidays_and_overrides.sql` (MySQL)
- `backend/migrations/add_holidays_and_overrides.pg.sql` (PostgreSQL)

Run the appropriate migration against your database before testing.

---

## Backend Changes

### `backend/lib/availability.js`

New helpers added:

- `isWeekendNight(dateStr)` — true for Friday/Saturday.
- `getHolidayNights(executor, startDate, endDate)` — returns a Map of holiday nights and names.
- `getCalendarOverrides(executor, roomId, startDate, endDate)` — returns block/unblock overrides.
- `findAutoBlockedDates(executor, roomId, startDate, endDate)` — returns Rooftop dates auto-blocked by weekend/holiday rules, excluding Admin unblocks.
- Exported `datePart` and `addDays` for use in `server.js`.

`checkAvailability` now:

1. Runs the standard conflict check.
2. For Rooftop only, checks if any requested night falls on an auto-blocked date.
3. Returns `available: false` with `isAutoBlock: true` conflicts when blocked.

### `backend/server.js`

#### Booking Creation (`POST /api/bookings`)

- Preserved `findConflicts(..., forUpdate: true)` row locking.
- Added Rooftop weekend/holiday auto-block check before inserting.
- Returns a clear error message when a Rooftop weekend/holiday booking is attempted.

#### Blocked Dates (`GET /api/bookings/dates/:roomId`)

- For Rooftop (`roomId = 3`), now includes synthetic auto-block entries for weekend/holiday nights.
- Auto-block entries include:
  - `confirmationCode`: reason string (e.g. "Weekend (Rooftop priority)")
  - `isAutoBlock: true`
  - `roomId: 3`
  - `status: 'confirmed'`

#### New Admin Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/holidays` | List all holidays |
| POST | `/api/admin/holidays` | Add a holiday |
| DELETE | `/api/admin/holidays/:id` | Delete a holiday |
| GET | `/api/admin/calendar-overrides` | List overrides |
| POST | `/api/admin/calendar-overrides` | Create block/unblock override |
| DELETE | `/api/admin/calendar-overrides/:id` | Delete an override |

All admin endpoints use `x-api-key` authentication.

---

## Frontend Changes

### `frontend/src/app/book-now/page.tsx`

- Removed 3-day buffer; `minDate` is now `today`.
- Same-day bookings enabled.
- Updated calendar tooltip to show auto-block reason for Rooftop weekend/holiday blocks.
- Updated copy: "Same-day bookings are allowed."

### `frontend/src/app/page.tsx`

- Removed 3-day buffer on the homepage date picker.
- `minCheckInDate` now set to `today`.

---

## Admin Dashboard Changes

### `admin-dashboard/index.php`

#### Calendar (`#calendar-modal`)

- Weekend highlighting changed from Sat/Sun to **Fri/Sat**.
- Holiday nights highlighted with a pink background and 🌸 indicator.
- Unblocked Rooftop dates shown with a dashed green border.
- Legend updated with Holiday and Unblocked entries.
- Clicking a weekend/holiday day opens the day modal with unblock/remove-unblock actions.

#### Pricing Section (`#pricing-section`)

- Added **Legal Holidays** management card.
- Admin can add/delete holidays.
- Holidays are loaded when the Pricing tab is opened.

#### New JavaScript Functions

- `loadHolidaysAndOverrides()`
- `isWeekendNightAdmin(dateStr)`
- `getHolidayNameForNight(dateStr)`
- `isRooftopUnblocked(dateStr)`
- `isRooftopManuallyBlocked(dateStr)`
- `renderHolidays()`
- `addHoliday()`
- `deleteHoliday(id)`
- `unblockRooftopDate(dateStr)`
- `removeRooftopUnblock(dateStr)`

---

## Files Modified

- `frontend/src/app/book-now/page.tsx` — flexible pricing logic, holiday fetch
- `frontend/src/app/rooms/page.tsx` — "Starts at" price display with add-on notes
- `frontend/src/app/page.tsx` — removed 3-day buffer
- `frontend/src/components/Footer.tsx` — updated contact numbers
- `frontend/src/app/faqs/page.tsx` — updated contact numbers
- `backend/lib/availability.js` — weekend/holiday helpers
- `backend/server.js` — new admin endpoints, auto-block logic, updated contact numbers in email templates
- `backend/schema.sql` — added holidays and calendar_overrides tables
- `backend/schema-dev.sql` — same
- `admin-dashboard/index.php` — pricing section overhaul, legal holidays UI, auto add-on info panel

## New Files

- `backend/migrations/add_holidays_and_overrides.sql` — creates holidays and calendar_overrides tables
- `backend/migrations/add_holidays_and_overrides.pg.sql` — PostgreSQL variant
- `backend/migrations/update_base_prices.sql` — sets base prices; weekend_price = price (add-ons in code)
- `.gitignore` — excludes `admin-dashboard/index.html` (local dev only)
- `BOOKING-SCHEDULING-CHANGES.md` (this file)

---

## Testing Checklist

### Same-Day / No Buffer

- [ ] Homepage date picker allows today as check-in.
- [ ] Booking page calendar allows today as check-in.
- [ ] Past dates remain disabled.

### Weekend Categorization

- [ ] Friday check-in → Saturday check-out uses weekend price.
- [ ] Saturday check-in → Sunday check-out uses weekend price.
- [ ] Sunday–Thursday check-ins use weekday price.

### Legal Holidays

- [ ] Admin can add a holiday (e.g. Nov 30).
- [ ] Admin calendar highlights Nov 29 and Nov 30 as holiday nights.
- [ ] Backend `findAutoBlockedDates` returns Nov 29 and Nov 30 for Rooftop.

### Rooftop Blocking

- [ ] Rooftop booking on Friday is rejected.
- [ ] Rooftop booking on Saturday is rejected.
- [ ] Rooftop booking on a holiday night is rejected.
- [ ] Admin can unblock a specific Friday/Saturday/holiday for Rooftop.
- [ ] After unblocking, Rooftop booking on that date succeeds.
- [ ] Removing unblock re-blocks the date.

### Gold/Blue Rooms

- [ ] Gold/Blue bookings on weekends/holidays are allowed.
- [ ] Gold/Blue bookings on weekends/holidays are not affected by Rooftop auto-block.

### API

- [ ] `POST /api/availability` returns `available: false` for Rooftop weekend/holiday.
- [ ] `POST /api/bookings` rejects Rooftop weekend/holiday bookings.
- [ ] `GET /api/bookings/dates/3` includes auto-block entries.

### Flexible Pricing

- [ ] Gold Room weekday (non-peak) shows ₱4,800/night.
- [ ] Gold Room Friday night shows ₱5,300 (4800 + 500).
- [ ] Gold Room Saturday November shows ₱5,500 (4800 + 500 + 200).
- [ ] Gold Room Saturday December shows ₱5,800 (4800 + 500 + 500).
- [ ] Blue Room weekday shows ₱5,300/night base.
- [ ] Blue Room Friday night shows ₱5,800 (5300 + 500).
- [ ] Rooftop 12hr weekday shows ₱8,000.
- [ ] Rooftop 12hr weekend shows ₱10,000 (8000 + 2000).
- [ ] Rooftop 12hr weekend November shows ₱10,500 (8000 + 2000 + 500).
- [ ] Rooftop 6hr weekday shows ₱4,000.
- [ ] Rooftop 6hr weekend shows ₱5,000 (4000 + 1000).
- [ ] Holiday night applies same add-on as weekend.
- [ ] Rooms page shows "Starts at ₱4,800" for Gold, "Starts at ₱5,300" for Blue.
- [ ] Admin dashboard pricing section shows auto add-on info panel.

---

## Future Pricing Notes

> Holiday pricing has been implemented. Weekend and holiday nights now use the same add-on (+₱500 rooms, +₱2,000 rooftop 12hr, +₱1,000 rooftop 6hr). See [Flexible Pricing Rules](#flexible-pricing-rules).

### Current Pricing Logic (as of July 13, 2026)

- **Weekday nights**: `rooms.price` (base)
- **Weekend nights (Fri/Sat check-ins)**: `rooms.price` + add-on in code
- **Holiday nights**: `rooms.price` + same add-on as weekends (in code)
- **Peak season**: additional add-on in code on top of the above

### Single Sources of Truth

- **Weekend nights**: check-in day is Friday (5) or Saturday (6) — `currentDate.getDay() === 5 || 6`
- **Holiday nights**: `isHolidayNight(dateStr, holidayDates)` in `book-now/page.tsx`; holiday list from `GET /api/admin/holidays`
- **Admin override**: `calendar_overrides` table with `room_id = 3` and `override_type = 'unblock'`
- **Peak season**: `getPeakSeasonAddon(month, roomId, duration)` in `book-now/page.tsx`

### If Pricing Rules Change

1. Update `getPeakSeasonAddon()` in `frontend/src/app/book-now/page.tsx`
2. Update the weekend/holiday add-on constants in the `roomTotal` calculation block (same file)
3. Update the auto add-on info panel in `admin-dashboard/index.php` (`#pricing-section` header)
4. Run `backend/migrations/update_base_prices.sql` if base prices change

Keep frontend pricing and admin dashboard info panel in sync whenever pricing is updated.

---

## Content & UI Updates — July 13, 2026 (Session 2)

### Overview

This session covers all non-pricing content updates: house rules, policies, room features, FAQ revisions, payment channel changes, and UI tweaks.

---

### 1. Room Features Updated

#### Gold Room & Blue Room (all three display locations)
Added to feature lists:
- Board Games
- Free Breakfast for Two (2)

**Files:** `frontend/src/app/rooms/page.tsx`, `frontend/src/app/book-now/page.tsx` (roomStaticData), `frontend/src/app/faqs/page.tsx`

#### Rooftop Lounge (all three display locations)
Added / updated:
- Microwave
- Hot and Cold Water Dispenser *(previously "Water Dispenser")*
- Microphone for Karaoke – available upon request *(moved to end of list)*

**Files:** `frontend/src/app/rooms/page.tsx`, `frontend/src/app/book-now/page.tsx` (roomStaticData), `frontend/src/app/faqs/page.tsx`

---

### 2. House Rules & Policies Updated

Updated in both `frontend/src/app/info/page.tsx` and `frontend/src/app/book-now/page.tsx` (Rules & Regulations step).

#### Check-in & Check-out
Added:
- Refundable security deposit of ₱3,000 upon check-in.

#### General Rules
| Old | New |
|-----|-----|
| No smoking inside the rooms. | No smoking or vaping inside the unit, shared common areas, and hallways. Smoking and vaping area is at the rooftop balcony. |
| No pets allowed. | No pets allowed in the hallways, room, and common areas. A nearby pet hotel is available for a separate fee. |
| *(not present)* | No cooking allowed. |
| Respect quiet hours (10 PM – 7 AM). | Quiet hours: 10 PM – 7 AM. |

#### Cancellation & No-Show Policy
| Old | New |
|-----|-----|
| Full refund if canceled up to 4 days before check-in. | **Full Refund:** Cancellations made more than 30 days before arrival. |
| 50% refund if canceled 3 days or less before check-in. | **Partial Refund:** Cancellations made 14–30 days before arrival. |
| *(not present)* | **No Refund:** Cancellations made within 14 days of arrival. |
| *(not present)* | No-shows may result in forfeiture of reservation payments. |

#### Damages & Liability
| Old | New |
|-----|-----|
| Security deposit of ₱3,000 per room is required upon check-in. | Damages or violations incurred may be charged to the security deposit. |

---

### 3. Print Rental Agreement Button (Info Page)

- **Label changed:** "Print Rules" → "Print Rental Agreement"
- **Link:** `/rules/rental-agreement.pdf` (PDF relocated from root to `frontend/public/rules/`)
- **Download filename:** `Hotel_at_Home_Rental_Agreement.pdf`

**File:** `frontend/src/app/info/page.tsx`

---

### 4. Rental Agreement Button (Book Now — Rules Step)

- Added a yellow "Rental Agreement" button above the checkbox that opens `/rules/rental-agreement.pdf` in a new tab.
- **Checkbox label changed:** "I have read and agree to the house rules, cancellation policy, and terms of stay." → "I have read and agree to the terms of stay and cancellation policy as indicated on the rental agreement."

**File:** `frontend/src/app/book-now/page.tsx`

---

### 5. FAQ Updates

#### Answers Updated

| Question | Old Answer (summary) | New Answer (summary) |
|----------|---------------------|---------------------|
| Are walk-in guests allowed? | No. Prior booking required. | Yes. Subject to availability. Contact via designated numbers/social media during operating hours. |
| How far from Tagaytay? | ~5–15 minutes depending on traffic. | A minute away to Tagaytay boundary; ~5–15 minutes to Tagaytay ridge. |
| What amenities are included? (Rooftop) | Water Dispenser, Microwave, Microphone for Karaoke – by request | Microwave, Hot and Cold Water Dispenser, Microphone for Karaoke – available upon request |
| Can we cook or bring food? | Cooking inside room/lounge not allowed. | Expanded: portable gas stoves/induction cookers/personal cooking appliances strictly prohibited; microwave provided for reheating only. |
| Is breakfast included? | Complimentary; menu provided; pre-order encouraged. | "Yes. Breakfast is offered as a complimentary amenity. Should you decide not to avail of it, the accommodation rate will remain the same." |
| Are pets allowed? | Not allowed inside building; nearby pet hotel available. | Not permitted in guest rooms, hallways, or common areas; nearby pet hotel for convenience at additional cost; contact for recommendations. |
| Is smoking allowed? | Not allowed inside rooms and enclosed rooftop areas; open areas provided. | Not allowed in all rooms, hallways, room balconies, and indoor areas; permitted only at designated rooftop balcony smoking areas. |
| Is housekeeping provided? | Available upon request; additional charges for extended stays. | Available for an additional fee; subject to property's operating schedule. |

#### New Questions Added (after "What amenities are included?")

| Question | Answer |
|----------|--------|
| What are the payment terms? | 50% reservation fee required, deducted from total. Payment via Cash, GCash, bank transfer, or other approved methods. Reservation not confirmed until payment received and acknowledged. Unpaid balance and security deposit settled upon check-in. |
| Are visitors allowed? | Registered guests may receive up to four (4) visitors at a time. Visitors may stay for a maximum of 2–3 hours and up to 10PM only. |

**File:** `frontend/src/app/faqs/page.tsx`

---

### 6. Contact Numbers Updated (Site-wide)

| Location | Old Numbers | New Numbers |
|----------|------------|------------|
| All frontend pages, footer, FAQs | (previous numbers) | 0968-190-7363, 0917-880-0387 |

**Files:** `frontend/src/components/Footer.tsx`, `frontend/src/app/faqs/page.tsx`, `backend/server.js` (email templates)

---

### 7. "Hotel-Inspired Vacation Rental" Language

Replaced boutique hotel references with vacation rental language across descriptive copy (brand name "Hotel at Home" unchanged).

**Files:** `frontend/src/app/rooms/page.tsx`, `frontend/src/app/info/page.tsx`, `frontend/src/app/layout.tsx`

---

### 8. Booking Page — Room Selection UI

- **Price label changed:** "FROM ₱X,XXX.XX / NIGHT" → "STARTS AT ₱X,XXX.XX / NIGHT"
- **Text shadow added:** subtle drop shadow on accent price label (`0 1px 2px rgba(0,0,0,0.08)`)

**File:** `frontend/src/app/book-now/page.tsx`

---

### 9. Payment Channel Updated

#### GCash
| Field | Old | New |
|-------|-----|-----|
| Name | Hermilino Jr. Calubiran | DE***R CH**S S. |
| Number | +63 917 887 6444 | 0917 880 **** |
| User ID | *(not shown)* | **********ZLEGCK |
| QR Image | `gcash.jpg` | `gcash.png` (new image) |

#### Bank Transfer
| Field | Old | New |
|-------|-----|-----|
| Bank | BDO Unibank, Inc. | Bank of the Philippine Islands (BPI) |
| Account Type | *(not shown)* | Hotel |
| Account Name | Hermilino Calubiran, Jr. | DE···R CH··S PA···A SO·····N |
| Account Number | 010100143296 | ···········409 |
| QR Image | *(none)* | `bpi.png` (new image, tappable thumbnail + fullscreen) |

The Bank Transfer section now has the same tappable QR thumbnail + fullscreen modal as GCash.

**Files:** `frontend/src/app/book-now/page.tsx`, `frontend/public/img/payment/bpi.png`, `frontend/public/img/payment/gcash.png`

---

### Files Modified (Session 2)

| File | Changes |
|------|---------|
| `frontend/src/app/info/page.tsx` | Vacation rental language, rules/policies update, rental agreement button |
| `frontend/src/app/book-now/page.tsx` | Rules update, rental agreement button, room features, pricing label, payment channels |
| `frontend/src/app/rooms/page.tsx` | Room features, vacation rental language, "Starts at" price display |
| `frontend/src/app/faqs/page.tsx` | FAQ answers updated, 2 new FAQs added, amenities updated |
| `frontend/src/app/layout.tsx` | Meta description updated to vacation rental language |
| `frontend/src/components/Footer.tsx` | Contact numbers updated |
| `backend/server.js` | Contact numbers updated in email templates |

### New Files (Session 2)

| File | Purpose |
|------|---------|
| `frontend/public/rules/rental-agreement.pdf` | Rental agreement PDF (relocated from root) |
| `frontend/public/img/payment/bpi.png` | BPI InstaPay QR code image |
| `frontend/public/img/payment/gcash.png` | GCash QR code image (replaces gcash.jpg) |
