import type { Context } from '../../typings/context'
import type { InventoryArgs } from '../../typings/inventory'
import { getInventoryByChannel } from '../../services/inventory/getInventoryByChannel'

export async function inventory(_: unknown, args: InventoryArgs, ctx: Context) {
  return getInventoryByChannel(args.skuId, ctx, args.channel)
}
