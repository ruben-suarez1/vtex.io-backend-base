import type { Context } from '../../typings/context'
import type { TrackingResponse } from '../../typings/tracking'
import { ExternalServiceError } from '../../errors/ExternalServiceError'
import { validateOrderId } from '../../validations/tracking'
import { getAppSettings } from '../settings/getAppSettings'
import { normalizeTracking } from './normalizeTracking'
import { logger } from '../../utils/logger'

export async function getTrackingData(orderId: string, ctx: Context): Promise<TrackingResponse> {
  validateOrderId(orderId)

  const settings = await getAppSettings(ctx)

  logger.info('OMS credentials check', {
    hasAppKey: !!settings.omsAppKey,
    hasAppToken: !!settings.omsAppToken,
    appKeyPrefix: settings.omsAppKey?.slice(0, 6) ?? 'EMPTY',
  })

  const order = await ctx.clients.oms.getOrder(orderId, settings.omsAppKey ?? '', settings.omsAppToken ?? '')

  if (!order) {
    return {
      success: false,
      message: 'No se encontró la orden',
      guides: [],
    }
  }

  if (order.status !== 'invoiced') {
    return {
      success: false,
      message: 'La orden aún no ha sido facturada',
      guides: [],
    }
  }

  try {
    const trackingRaw = await ctx.clients.externalCarrier.getTracking(settings.externalApiBaseUrl, orderId, settings.externalApiToken)
    const guides = normalizeTracking(trackingRaw)

    if (!guides.length) {
      return {
        success: true,
        message: 'La orden fue facturada pero aún no ha sido despachada',
        guides: [],
      }
    }

    return {
      success: true,
      message: 'Tracking obtenido correctamente',
      guides,
    }
  } catch (error) {
    throw new ExternalServiceError('Error consultando el carrier externo', error)
  }
}