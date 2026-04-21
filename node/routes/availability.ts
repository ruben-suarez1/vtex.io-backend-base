import type { Context } from '../typings/context'
import { getAvailabilityBySeller } from '../services/availability/getAvailabilityBySeller'
import { setCache } from '../utils/response'

export async function availabilityRoute(ctx: Context) {
  const skuId = String(ctx.vtex.route.params.skuId ?? '')
  const sellerId = ctx.query.sellerId ? String(ctx.query.sellerId) : undefined

  const result = await getAvailabilityBySeller(skuId, ctx, sellerId)

  setCache(ctx, 30)
  ctx.status = 200
  ctx.body = result
}
