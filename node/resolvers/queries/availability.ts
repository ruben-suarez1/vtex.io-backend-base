import type { Context } from '../../typings/context'
import type { AvailabilityArgs } from '../../typings/availability'
import { getAvailabilityBySeller } from '../../services/availability/getAvailabilityBySeller'

export async function availability(_: unknown, args: AvailabilityArgs, ctx: Context) {
  return getAvailabilityBySeller(args.skuId, ctx, args.sellerId)
}
