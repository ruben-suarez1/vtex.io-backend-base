import type { Context, MiddlewareNext } from '../typings/context'
import { logger } from '../utils/logger'

export async function requestLogger(ctx: Context, next: MiddlewareNext) {
  const start = Date.now()

  logger.info('Incoming request', {
    method: ctx.method,
    path: ctx.path,
    query: ctx.query,
    params: ctx.vtex.route?.params,
  })

  await next()

  logger.info('Request finished', {
    method: ctx.method,
    path: ctx.path,
    status: ctx.status,
    durationMs: Date.now() - start,
  })
}