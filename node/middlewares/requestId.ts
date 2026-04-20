import { randomBytes } from 'crypto'
import type { Context, MiddlewareNext } from '../typings/context'

export async function requestId(ctx: Context, next: MiddlewareNext) {
  const id = ctx.get('X-Request-Id') || randomBytes(16).toString('hex')

  ctx.state.requestId = id
  ctx.set('X-Request-Id', id)

  await next()
}
