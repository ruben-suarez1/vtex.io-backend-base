import type { Context } from '../typings/context'

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  code: string
  message: string
  details: unknown
}

export function buildSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
  }
}

export function buildErrorResponse(
  message: string,
  code: string,
  details: unknown = null
): ApiErrorResponse {
  return {
    success: false,
    code,
    message,
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