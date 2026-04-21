import type { Context } from '../typings/context'
import { getInventoryByChannel } from '../services/inventory/getInventoryByChannel'
import { setCache } from '../utils/response'

export async function inventoryRoute(ctx: Context) {
  const skuId = String(ctx.vtex.route.params.skuId ?? '')
  const channel = ctx.query.channel ? String(ctx.query.channel) : undefined

  const result = await getInventoryByChannel(skuId, ctx, channel)

  setCache(ctx, 60)
  ctx.status = 200
  ctx.body = result
}
