import type { Context } from '../typings/context'
import { getTrackingData } from '../services/tracking/getTrackingData'
import { setCache } from '../utils/response'

export async function trackingRoute(ctx: Context) {
  const orderId = String(ctx.vtex.route.params.orderId ?? '')

  const result = await getTrackingData(orderId, ctx)

  setCache(ctx, 30)
  ctx.status = 200
  ctx.body = result
}