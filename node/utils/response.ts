import type { Context } from '../typings/context'

export function buildSuccessResponse<T>(data: T) {
  return {
    success: true,
    ...data,
  }
}

export function buildErrorResponse(message: string, code?: string, details?: unknown) {
  return {
    success: false,
    message,
    code,
    details,
  }
}

export function setCache(ctx: Context, ttlSeconds: number) {
  if (ttlSeconds === 0) {
    ctx.set('Cache-Control', 'no-store')
    return
  }

  ctx.set(
    'Cache-Control',
    `public, max-age=0, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 2}`
  )
}