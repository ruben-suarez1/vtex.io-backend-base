import type { Context } from '../typings/context'
import { setCache } from '../utils/response'

export async function healthcheck(ctx: Context) {
  setCache(ctx, 0)
  ctx.status = 200
  ctx.body = {
    ok: true,
    service: 'vtex-io-backend-base',
  }
}