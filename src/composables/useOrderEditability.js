// src/composables/useOrderEditability.js
//
// Mirrors the backend EDITABLE_BY_STATUS whitelist. The backend is the
// source of truth — this composable only drives which inputs are
// enabled vs. disabled in the customer UI so we never let someone
// press Save on a field the API will reject.
//
// Keep the two tables in sync. If you add a field to the backend,
// add it here too.

// ✅ Simplified — matches the backend matrix in OrderController.js.
// Only Pending orders are editable, and only the delivery address
// (address + postal code) may be changed by the customer.
const EDITABLE_BY_STATUS = {
  Pending:             ['address', 'postalCode'],
  Confirmed:           [],
  Scheduled:           [],
  'In Production':     [],
  'Out for Delivery':  [],
  Completed:           [],
  Cancelled:           [],
}

export function canEditField(order, field) {
  if (!order) return false
  const allowed = EDITABLE_BY_STATUS[order.status] || []
  if (!allowed.includes(field)) return false

  // Address fields only make sense for Delivery orders. A pick-up
  // order has no address to change.
  if (
    (field === 'address' || field === 'postalCode') &&
    order.receivingMode !== 'Delivery'
  ) {
    return false
  }

  return true
}

export function canEditOrder(order) {
  if (!order) return false
  return (EDITABLE_BY_STATUS[order.status] || []).length > 0
}

export function getEditableFields(order) {
  if (!order) return []
  return EDITABLE_BY_STATUS[order.status] || []
}

// Human-friendly label for the "still editable" banner.
export function describeEditableFields(order) {
  const fields = getEditableFields(order).filter((f) => {
    // Apply the same address-only-for-delivery guard
    if (
      (f === 'address' || f === 'postalCode') &&
      order.receivingMode !== 'Delivery'
    ) {
      return false
    }
    return true
  })
  const labels = {
    address: 'delivery address',
    postalCode: 'postal code',
  }
  return fields.map((f) => labels[f] || f)
}