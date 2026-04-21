export interface AvailabilityArgs {
  skuId: string
  sellerId?: string
}

export interface SellerAvailability {
  sellerId: string
  sellerName: string
  isAvailable: boolean
  totalAvailable: number
}

export interface AvailabilityBySellerResponse {
  skuId: string
  skuName: string
  sellers: SellerAvailability[]
}
