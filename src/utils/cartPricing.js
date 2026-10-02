// src/utils/cartPricing.js
//
// Single source of truth for cart / order line pricing.
// Used by both CreateOrderPage.vue and OrderSummaryCard.vue so the
// breakdown shown in the sidebar always matches the total the customer
// sees on the review step.

export const FEES = {
  DESIGN_AND_PRINTING_SERVICE_FEE: 500,
  LUZON_FEE: 500,
  VISAYAS_FEE: 1000,
  MINDANAO_FEE: 1500,
}

/**
 * Compute the line total for a single cart / order item.
 *
 * Priority (highest first):
 *   1. Recompute from live `sizes[]` + `size` + `quantity` — handles
 *      bulk tier changes AND respects any size / quantity edits the
 *      customer made after the item was added to the cart.
 *   2. `unitPrice * quantity` — for items without a sizes array
 *      (e.g. lids added via Flow 3).
 *   3. `estimatedTotal` — last-resort snapshot from the cart.
 */
export function computeLineTotal(item) {
  if (!item) return 0

  const qty = Number(item.quantity) || 0
  if (qty <= 0) return 0

  // ── 1. Live size lookup ─────────────────────────────────────────
  if (Array.isArray(item.sizes) && item.sizes.length > 0 && item.size) {
    const size = item.sizes.find((s) => s.name === item.size)
    if (size) {
      let unitPrice = Number(size.price) || 0
      const bulk = size.bulkPrices

      if (qty >= 5000 && bulk?.[5000]) unitPrice = bulk[5000] / 5000
      else if (qty >= 2000 && bulk?.[2000]) unitPrice = bulk[2000] / 2000
      else if (qty >= 1000 && bulk?.[1000]) unitPrice = bulk[1000] / 1000
      else if (qty >= 500 && bulk?.[500]) unitPrice = bulk[500] / 500

      return unitPrice * qty
    }
  }

  // ── 2. Unit-price fallback (lids, custom items) ────────────────
  if (item.unitPrice) return Number(item.unitPrice) * qty

  // ── 3. Snapshot fallback ───────────────────────────────────────
  return Number(item.estimatedTotal) || 0
}

/**
 * Compute the shipping fee from the fulfillment object.
 * Mirrors the same region → fee table the backend uses.
 */
export function computeShippingFee(fulfillment) {
  if (!fulfillment || fulfillment.method !== 'delivery') return 0
  switch (fulfillment.deliveryRegion) {
    case 'Luzon':    return FEES.LUZON_FEE
    case 'Visayas':  return FEES.VISAYAS_FEE
    case 'Mindanao': return FEES.MINDANAO_FEE
    default:         return 0
  }
}

/**
 * Full breakdown: product subtotal + design fee + shipping.
 *
 * @returns {{ productSubtotal, designFee, shippingFee, totalAmount }}
 */
export function computeCartTotal({ items, isOwnCups, hasDesign, fulfillment }) {
  const productSubtotal = (items || []).reduce((sum, item) => {
    if (isOwnCups) return sum        // own-cups have no product price
    return sum + computeLineTotal(item)
  }, 0)

  const designFee =
    isOwnCups || hasDesign ? FEES.DESIGN_AND_PRINTING_SERVICE_FEE : 0

  const shippingFee = computeShippingFee(fulfillment)

  return {
    productSubtotal,
    designFee,
    shippingFee,
    totalAmount: productSubtotal + designFee + shippingFee,
  }
}