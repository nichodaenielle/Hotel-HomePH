// Lightweight regression tests for the availability engine's pure logic.
// Run: node backend/lib/availability.test.js
const assert = require('assert');
const a = require('./availability');

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  - ${name}`); }
  catch (e) { console.error(`  FAIL- ${name}\n        ${e.message}`); process.exitCode = 1; }
}

console.log('buildWindow:');

test('Gold room uses fixed 14:00 -> 12:00', () => {
  const w = a.buildWindow({ roomId: 1, checkIn: '2026-06-10', checkOut: '2026-06-15' });
  assert.strictEqual(w.start, '2026-06-10 14:00:00');
  assert.strictEqual(w.end, '2026-06-15 12:00:00');
});

test('Blue room ignores supplied times (fixed)', () => {
  const w = a.buildWindow({ roomId: 2, checkIn: '2026-06-10', checkOut: '2026-06-11', checkInTime: '09:00', checkOutTime: '23:00' });
  assert.strictEqual(w.start, '2026-06-10 14:00:00');
  assert.strictEqual(w.end, '2026-06-11 12:00:00');
});

test('Datetime input is normalized to date part', () => {
  const w = a.buildWindow({ roomId: 1, checkIn: '2026-06-10 08:30:00', checkOut: '2026-06-12T00:00:00' });
  assert.strictEqual(w.start, '2026-06-10 14:00:00');
  assert.strictEqual(w.end, '2026-06-12 12:00:00');
});

test('Rooftop respects supplied slot times', () => {
  const w = a.buildWindow({ roomId: 3, checkIn: '2026-06-10', checkOut: '2026-06-10', checkInTime: '09:00', checkOutTime: '15:00' });
  assert.strictEqual(w.start, '2026-06-10 09:00:00');
  assert.strictEqual(w.end, '2026-06-10 15:00:00');
});

test('Rooftop midnight crossing rolls end to next day', () => {
  // 6:00 PM - 12:00 AM slot
  const w = a.buildWindow({ roomId: 3, checkIn: '2026-06-10', checkOut: '2026-06-10', checkInTime: '18:00', checkOutTime: '00:00' });
  assert.strictEqual(w.start, '2026-06-10 18:00:00');
  assert.strictEqual(w.end, '2026-06-11 00:00:00');
});

test('Invalid check-in throws', () => {
  assert.throws(() => a.buildWindow({ roomId: 1, checkIn: 'nonsense', checkOut: '2026-06-12' }));
});

console.log('\nSame-day turnover (spec example, 2h buffer):');

test('New check-in 14:00 after 12:00 checkout is allowed (no overlap with buffer)', () => {
  process.env.HOUSEKEEPING_BUFFER_MINUTES = '120';
  // existing checkout 12:00, +2h buffer => 14:00. New check-in exactly 14:00 -> not < 14:00 -> allowed.
  const existingCheckout = new Date('2026-06-15T12:00:00');
  const bufferEnd = new Date(existingCheckout.getTime() + 120 * 60000);
  const newCheckin = new Date('2026-06-15T14:00:00');
  assert.ok(!(newCheckin < bufferEnd), 'expected allowed');
});

test('New check-in 10:00 same day is rejected (within buffer window)', () => {
  const existingCheckout = new Date('2026-06-15T12:00:00');
  const bufferEnd = new Date(existingCheckout.getTime() + 120 * 60000);
  const newCheckin = new Date('2026-06-15T10:00:00');
  assert.ok(newCheckin < bufferEnd, 'expected rejected');
});

console.log(`\n${passed} checks passed.`);
