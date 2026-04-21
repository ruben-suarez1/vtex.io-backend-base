import type { SellerAvailability } from '../../typings/availability'

// VTEX Logistics inventory API returns balances per warehouse, not per seller.
// The warehouse→seller mapping requires the Dock API (additional call).
// This normalizer sums stock across all warehouses and reports that total
// for each active seller — accurate for single-seller accounts, approximate
// for multi-seller marketplaces.

interface RawBalance {
  totalQuantity?: number
  reservedQuantity?: number
}

interface RawSeller {
  id?: string
  name?: string
  isActive?: boolean
}

export function normalizeAvailability(
  rawInventory: any,
  rawSellers: any,
  sellerIdFilter?: string
): SellerAvailability[] {
  const balances: RawBalance[] = Array.isArray(rawInventory?.balance) ? rawInventory.balance : []
  const sellerItems: RawSeller[] = Array.isArray(rawSellers?.items) ? rawSellers.items : []

  if (balances.length === 0 || sellerItems.length === 0) return []

  const totalAvailable = balances.reduce((sum, item) => {
    const total = Number(item.totalQuantity ?? 0)
    const reserved = Number(item.reservedQuantity ?? 0)
    return sum + Math.max(0, total - reserved)
  }, 0)

  let activeSellers = sellerItems.filter((s) => s.isActive && s.id)

  if (sellerIdFilter) {
    activeSellers = activeSellers.filter((s) => String(s.id) === sellerIdFilter)
  }

  return activeSellers.map((s) => ({
    sellerId: String(s.id),
    sellerName: String(s.name ?? s.id),
    isAvailable: totalAvailable > 0,
    totalAvailable,
  }))
}
