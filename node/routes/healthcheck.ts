import type { Context } from '../typings/context'

export async function healthcheck(ctx: Context) {
  ctx.status = 200
  ctx.body = {
    ok: true,
    service: 'vtex-io-backend-base',
  }
}