import { getTrackingData } from '../../../node/services/tracking/getTrackingData'
import { ValidationError } from '../../../node/errors/ValidationError'
import { ExternalServiceError } from '../../../node/errors/ExternalServiceError'

jest.mock('../../../node/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}))

const mockSettings = {
  externalApiBaseUrl: 'https://api.carrier.com',
  externalApiToken: 'token-123',
  omsAppKey: 'key-123',
  omsAppToken: 'token-456',
}

function createCtx(overrides: Record<string, any> = {}) {
  return {
    clients: {
      apps: {
        getAppSettings: jest.fn().mockResolvedValue(mockSettings),
      },
      oms: {
        getOrder: jest.fn(),
      },
      externalCarrier: {
        getTracking: jest.fn(),
      },
      ...overrides,
    },
  } as any
}

describe('getTrackingData', () => {
  it('lanza ValidationError si orderId es inválido', async () => {
    const ctx = createCtx()

    await expect(getTrackingData('', ctx)).rejects.toThrow(ValidationError)
  })

  it('retorna success false si la orden no existe', async () => {
    const ctx = createCtx()
    ctx.clients.oms.getOrder.mockResolvedValue(null)

    const result = await getTrackingData('1626210500001-01', ctx)

    expect(result.success).toBe(false)
    expect(result.message).toBe('No se encontró la orden')
    expect(result.guides).toEqual([])
  })

  it('retorna success false si la orden no está facturada', async () => {
    const ctx = createCtx()
    ctx.clients.oms.getOrder.mockResolvedValue({ status: 'payment-approved' })

    const result = await getTrackingData('1626210500001-01', ctx)

    expect(result.success).toBe(false)
    expect(result.message).toBe('La orden aún no ha sido facturada')
  })

  it('retorna success true con guides cuando la orden está facturada', async () => {
    const ctx = createCtx()
    ctx.clients.oms.getOrder.mockResolvedValue({ status: 'invoiced' })
    ctx.clients.externalCarrier.getTracking.mockResolvedValue([
      { trackingNumber: 'TRK001', status: 'in_transit', date: '2024-01-01' },
    ])

    const result = await getTrackingData('1626210500001-01', ctx)

    expect(result.success).toBe(true)
    expect(result.guides).toHaveLength(1)
    expect(result.guides[0].trackingNumber).toBe('TRK001')
  })

  it('retorna success true con guides vacías si la orden no fue despachada', async () => {
    const ctx = createCtx()
    ctx.clients.oms.getOrder.mockResolvedValue({ status: 'invoiced' })
    ctx.clients.externalCarrier.getTracking.mockResolvedValue([])

    const result = await getTrackingData('1626210500001-01', ctx)

    expect(result.success).toBe(true)
    expect(result.message).toBe('La orden fue facturada pero aún no ha sido despachada')
    expect(result.guides).toEqual([])
  })

  it('lanza ExternalServiceError si el carrier falla', async () => {
    const ctx = createCtx()
    ctx.clients.oms.getOrder.mockResolvedValue({ status: 'invoiced' })
    ctx.clients.externalCarrier.getTracking.mockRejectedValue(new Error('Network error'))

    await expect(getTrackingData('1626210500001-01', ctx)).rejects.toThrow(ExternalServiceError)
  })

  it('llama al OMS con las credenciales correctas', async () => {
    const ctx = createCtx()
    ctx.clients.oms.getOrder.mockResolvedValue(null)

    await getTrackingData('1626210500001-01', ctx)

    expect(ctx.clients.oms.getOrder).toHaveBeenCalledWith(
      '1626210500001-01',
      mockSettings.omsAppKey,
      mockSettings.omsAppToken
    )
  })
})
