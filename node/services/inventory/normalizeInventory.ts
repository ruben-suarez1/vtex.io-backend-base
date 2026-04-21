import type { WarehouseBalance } from '../../typings/inventory'

export function normalizeInventory(rawData: any, channel?: string): WarehouseBalance[] {
  if (!rawData?.balance || !Array.isArray(rawData.balance)) {
    return []
  }

  return rawData.balance
    .filter((item: any) => !channel || item.salesChannel === channel)
    .map((item: any) => {
      const total = Number(item.totalQuantity ?? 0)
      const reserved = Number(item.reservedQuantity ?? 0)

      return {
        warehouseId: String(item.warehouseId ?? ''),
        warehouseName: String(item.warehouseName ?? ''),
        totalQuantity: total,
        reservedQuantity: reserved,
        availableQuantity: Math.max(0, total - reserved),
      }
    })
}
