import type { Context } from '../../typings/context'
import type { InventoryResponse } from '../../typings/inventory'
import { validateSkuId } from '../../validations/inventory'
import { getAppSettings } from '../settings/getAppSettings'
import { normalizeInventory } from './normalizeInventory'
import { logger } from '../../utils/logger'

export async function getInventoryByChannel(skuId: string, ctx: Context, channel?: string): Promise<InventoryResponse> {
  validateSkuId(skuId)

  const settings = await getAppSettings(ctx)
  const appKey = settings.omsAppKey ?? ''
  const appToken = settings.omsAppToken ?? ''

  const [raw, sku] = await Promise.all([
    ctx.clients.inventory.getBySkuId(skuId, appKey, appToken),
    ctx.clients.catalog.getSkuById(skuId, appKey, appToken).catch((err: any) => {
      logger.warn('Catalog SKU not found', { skuId, error: err?.message })
      return null
    }),
  ])

  logger.info('Catalog SKU raw response', { sku })

  const warehouses = normalizeInventory(raw, channel)
  const totalAvailable = warehouses.reduce((sum, w) => sum + w.availableQuantity, 0)

  return {
    skuId,
    skuName: String(sku?.NameComplete ?? sku?.Name ?? ''),
    channel,
    totalAvailable,
    warehouses,
  }
}
