import type { Context } from '../typings/context'
import { getTrackingData } from '../services/tracking/getTrackingData'

export async function trackingRoute(ctx: Context) {
  const orderId = String(ctx.vtex.route.params.orderId ?? '')

  const result = await getTrackingData(orderId, ctx)

  ctx.status = 200
  ctx.body = result
}