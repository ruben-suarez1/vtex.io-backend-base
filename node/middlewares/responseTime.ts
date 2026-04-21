import type { Context, MiddlewareNext } from '../typings/context'

export async function responseTime(ctx: Context, next: MiddlewareNext) {
  const start = Date.now()

  await next()

  ctx.set('X-Response-Time', `${Date.now() - start}ms`)
}
