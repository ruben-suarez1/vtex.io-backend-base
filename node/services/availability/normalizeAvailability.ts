import type { SellerAvailability } from '../../typings/availability'

interface RawBalance {
  sellerId?: string
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

  const sellerMap = new Map<string, string>(
    sellerItems
      .filter((s) => s.isActive && s.id)
      .map((s) => [String(s.id), String(s.name ?? s.id)])
  )

  const quantityBySeller = new Map<string, number>()

  for (const balance of balances) {
    const sellerId = String(balance.sellerId ?? '')
    if (!sellerId) continue

    const total = Number(balance.totalQuantity ?? 0)
    const reserved = Number(balance.reservedQuantity ?? 0)
    const available = Math.max(0, total - reserved)

    quantityBySeller.set(sellerId, (quantityBySeller.get(sellerId) ?? 0) + available)
  }

  const sellerIds = sellerIdFilter
    ? [sellerIdFilter]
    : Array.from(new Set([...sellerMap.keys(), ...quantityBySeller.keys()]))

  return sellerIds
    .filter((id) => !sellerIdFilter || id === sellerIdFilter)
    .map((sellerId) => {
      const totalAvailable = quantityBySeller.get(sellerId) ?? 0

      return {
        sellerId,
        sellerName: sellerMap.get(sellerId) ?? sellerId,
        isAvailable: totalAvailable > 0,
        totalAvailable,
      }
    })
    .sort((a, b) => b.totalAvailable - a.totalAvailable)
}
