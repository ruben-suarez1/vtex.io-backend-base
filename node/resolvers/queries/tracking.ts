import type { Context } from '../../typings/context'
import type { TrackingArgs } from '../../typings/tracking'
import { getTrackingData } from '../../services/tracking/getTrackingData'

export async function tracking(_: unknown, args: TrackingArgs, ctx: Context) {
  return getTrackingData(args.orderId, ctx)
}