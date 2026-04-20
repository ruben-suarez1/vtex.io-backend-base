import type { Context, MiddlewareNext } from '../typings/context'
import { AppError } from '../errors/AppError'
import { buildErrorResponse } from '../utils/response'
import { logger } from '../utils/logger'

export async function errorHandler(ctx: Context, next: MiddlewareNext) {
  try {
    await next()
  } catch (error) {
    if (error instanceof AppError) {
      ctx.status = error.statusCode
      ctx.body = buildErrorResponse(error.message, error.code, error.details)

      logger.warn('Controlled error', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      })

      return
    }

    ctx.status = 500
    ctx.body = buildErrorResponse('Internal server error', 'INTERNAL_SERVER_ERROR')

    logger.error('Unhandled error', {
      error: error instanceof Error ? error.message : error,
    })
  }
}