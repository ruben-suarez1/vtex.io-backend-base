import type { Context } from '../../typings/context'
import type { AvailabilityBySellerResponse } from '../../typings/availability'
import { validateSkuId } from '../../validations/availability'
import { getAppSettings } from '../settings/getAppSettings'
import { normalizeAvailability } from './normalizeAvailability'
import { logger } from '../../utils/logger'

export async function getAvailabilityBySeller(
  skuId: string,
  ctx: Context,
  sellerId?: string
): Promise<AvailabilityBySellerResponse> {
  validateSkuId(skuId)

  const settings = await getAppSettings(ctx)
  const appKey = settings.omsAppKey ?? ''
  const appToken = settings.omsAppToken ?? ''

  const [inventoryRaw, sellersRaw, skuRaw] = await Promise.all([
    ctx.clients.inventory.getBySkuId(skuId, appKey, appToken),
    ctx.clients.seller.getAll(appKey, appToken),
    ctx.clients.catalog.getSkuById(skuId, appKey, appToken).catch((err: any) => {
      logger.warn('Catalog SKU not found', { skuId, error: err?.message })
      return null
    }),
  ])

  const sellers = normalizeAvailability(inventoryRaw, sellersRaw, sellerId)

  return {
    skuId,
    skuName: String(skuRaw?.NameComplete ?? skuRaw?.Name ?? ''),
    sellers,
  }
}
