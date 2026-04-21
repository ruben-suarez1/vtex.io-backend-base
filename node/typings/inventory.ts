export interface InventoryArgs {
  skuId: string
  channel?: string
}

export interface WarehouseBalance {
  warehouseId: string
  warehouseName: string
  totalQuantity: number
  reservedQuantity: number
  availableQuantity: number
}

export interface InventoryResponse {
  skuId: string
  skuName: string
  channel?: string
  totalAvailable: number
  warehouses: WarehouseBalance[]
}
