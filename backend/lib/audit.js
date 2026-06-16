// Centralized audit logging for all booking & payment related actions.
//
// Every write path (booking creation, status changes, payment verification,
// proof purge, payment edits, manual blocks, availability overrides, inventory
// changes) should call logAudit so there is a single, consistent source of
// truth for activity tracking.
//
// `executor` may be either the shared pool or an active transaction connection;
// both expose a compatible `.query()` method. Logging failures are swallowed so
// that an audit problem can never roll back or break the primary operation.

/**
 * @param {{query: Function}} executor pool or transaction connection
 * @param {Object} entry
 * @param {number} entry.bookingId            required booking id
 * @param {string} entry.action               e.g. 'created', 'status_changed', 'payment_verified'
 * @param {string} [entry.oldStatus]
 * @param {string} [entry.newStatus]
 * @param {string} [entry.performedBy]         admin identifier (defaults to 'system')
 * @param {string} [entry.notes]               human readable summary
 * @param {string} [entry.field]               field name for value-level edits
 * @param {string} [entry.oldValue]
 * @param {string} [entry.newValue]
 */
async function logAudit(executor, entry) {
  try {
    if (!executor || !entry || !entry.bookingId || !entry.action) return;

    const {
      bookingId,
      action,
      oldStatus = null,
      newStatus = null,
      performedBy = 'system',
      notes = null,
      field = null,
      oldValue = null,
      newValue = null
    } = entry;

    await executor.query(
      `INSERT INTO booking_history
        (booking_id, action, old_status, new_status, performed_by, notes, field_changed, old_value, new_value)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        action,
        oldStatus,
        newStatus,
        performedBy,
        notes,
        field,
        oldValue === null || oldValue === undefined ? null : String(oldValue),
        newValue === null || newValue === undefined ? null : String(newValue)
      ]
    );
  } catch (err) {
    // Never let an audit logging failure break the primary request.
    console.error('Audit log failed:', err.message);
  }
}

module.exports = { logAudit };
