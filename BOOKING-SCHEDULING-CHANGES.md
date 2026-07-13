# Booking Scheduling Enhancements

**Date**: July 13, 2026  
**Project**: Hotel at Home PH  
**Status**: Implemented (pending testing)  
**Priority**: High — required reference for future pricing calculations

---

## Overview

Implemented changes to the booking scheduling system to:

1. Remove the previous "3-days prior" booking limitation and allow same-day bookings.
2. Categorize weekend nights as **Friday check-in → Saturday check-out** and **Saturday check-in → Sunday check-out**.
3. Categorize legal holidays as **2 holiday nights**:
   - `holiday_date - 1` check-in → `holiday_date` check-out
   - `holiday_date` check-in → `holiday_date + 1` check-out
4. Block the Rooftop Lounge by default on weekends and legal holidays.
5. Allow Admin override to unblock specific Rooftop dates.

> **Important for future pricing work**: This change establishes the rules for identifying weekend and holiday nights. The current implementation uses `weekend_price` for Friday/Saturday nights. When holiday pricing is added later, use the holiday-categorization logic documented below and the `holidays` table as the single source of truth.

---

## Table of Contents

1. [Business Rules](#business-rules)
2. [Database Changes](#database-changes)
3. [Backend Changes](#backend-changes)
4. [Frontend Changes](#frontend-changes)
5. [Admin Dashboard Changes](#admin-dashboard-changes)
6. [Files Modified](#files-modified)
7. [New Files](#new-files)
8. [Testing Checklist](#testing-checklist)
9. [Future Pricing Notes](#future-pricing-notes)

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

- `frontend/src/app/book-now/page.tsx`
- `frontend/src/app/page.tsx`
- `backend/lib/availability.js`
- `backend/server.js`
- `backend/schema.sql`
- `backend/schema-dev.sql`
- `admin-dashboard/index.php`

## New Files

- `backend/migrations/add_holidays_and_overrides.sql`
- `backend/migrations/add_holidays_and_overrides.pg.sql`
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

---

## Future Pricing Notes

> This section is the primary reason this document exists. Use it when implementing holiday pricing.

### Current Pricing Logic

- **Weekday nights**: use `rooms.price`
- **Weekend nights (Friday/Saturday check-ins)**: use `rooms.weekend_price`

### Recommended Next Steps for Holiday Pricing

1. **Add holiday price columns** to the `rooms` table:
   - `holiday_price` (for Gold/Blue nightly holiday rate)
   - `holiday_price_6hr` / `holiday_price_12hr` (for Rooftop slot holiday rate if needed)
2. **Update the frontend pricing calculation** in `frontend/src/app/book-now/page.tsx`:
   - When iterating each night, check if the night is a holiday night using the same rule as `isWeekendNight`/holiday logic.
   - If holiday, prefer `holidayPrice`; otherwise use `weekendPrice`; otherwise use `price`.
3. **Update backend pricing validation** if the backend computes totals independently.
4. **Admin dashboard**: add holiday price inputs next to weekend price inputs in the Pricing section.

### Single Sources of Truth

- **Weekend nights**: `availability.isWeekendNight(dateStr)` (Friday or Saturday).
- **Holiday nights**: `availability.getHolidayNights(executor, startDate, endDate)`.
- **Admin override**: `calendar_overrides` table with `room_id = 3` and `override_type = 'unblock'`.

Keep these in sync between frontend and backend whenever pricing is updated.
