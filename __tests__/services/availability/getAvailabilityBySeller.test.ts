import { getAvailabilityBySeller } from '../../../node/services/availability/getAvailabilityBySeller'
import { ValidationError } from '../../../node/errors/ValidationError'

jest.mock('../../../node/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}))

const mockSettings = {
  omsAppKey: 'key-123',
  omsAppToken: 'token-456',
}

const mockInventory = {
  balance: [
    { sellerId: 'seller1', totalQuantity: 100, reservedQuantity: 10 },
    { sellerId: 'seller2', totalQuantity: 30, reservedQuantity: 5 },
  ],
}

const mockSellers = {
  items: [
    { id: 'seller1', name: 'Seller Uno', isActive: true },
    { id: 'seller2', name: 'Seller Dos', isActive: true },
  ],
}

const mockSku = { NameComplete: 'Remera Lisa Blanca', Name: 'Remera' }

function createCtx(overrides: Record<string, any> = {}) {
  return {
    clients: {
      apps: {
        getAppSettings: jest.fn().mockResolvedValue(mockSettings),
      },
      inventory: {
        getBySkuId: jest.fn().mockResolvedValue(mockInventory),
      },
      seller: {
        getAll: jest.fn().mockResolvedValue(mockSellers),
      },
      catalog: {
        getSkuById: jest.fn().mockResolvedValue(mockSku),
      },
      ...overrides,
    },
  } as any
}

describe('getAvailabilityBySeller', () => {
  it('lanza ValidationError si skuId es inválido', async () => {
    const ctx = createCtx()

    await expect(getAvailabilityBySeller('', ctx)).rejects.toThrow(ValidationError)
  })

  it('retorna skuId, skuName y sellers en el response', async () => {
    const ctx = createCtx()
    const result = await getAvailabilityBySeller('5103261', ctx)

    expect(result.skuId).toBe('5103261')
    expect(result.skuName).toBe('Remera Lisa Blanca')
    expect(Array.isArray(result.sellers)).toBe(true)
  })

  it('llama a inventory, seller y catalog en paralelo con las credenciales correctas', async () => {
    const ctx = createCtx()
    await getAvailabilityBySeller('5103261', ctx)

    expect(ctx.clients.inventory.getBySkuId).toHaveBeenCalledWith('5103261', 'key-123', 'token-456')
    expect(ctx.clients.seller.getAll).toHaveBeenCalledWith('key-123', 'token-456')
    expect(ctx.clients.catalog.getSkuById).toHaveBeenCalledWith('5103261', 'key-123', 'token-456')
  })

  it('retorna sellers normalizados con availability correcta', async () => {
    const ctx = createCtx()
    const result = await getAvailabilityBySeller('5103261', ctx)

    const seller1 = result.sellers.find((s) => s.sellerId === 'seller1')
    expect(seller1?.totalAvailable).toBe(90)
    expect(seller1?.isAvailable).toBe(true)
  })

  it('filtra por sellerId cuando se pasa el parámetro opcional', async () => {
    const ctx = createCtx()
    const result = await getAvailabilityBySeller('5103261', ctx, 'seller1')

    expect(result.sellers).toHaveLength(1)
    expect(result.sellers[0].sellerId).toBe('seller1')
  })

  it('continúa si catalog falla — skuName queda vacío', async () => {
    const ctx = createCtx({
      catalog: {
        getSkuById: jest.fn().mockRejectedValue(new Error('Not found')),
      },
    })

    const result = await getAvailabilityBySeller('5103261', ctx)

    expect(result.skuName).toBe('')
    expect(result.sellers.length).toBeGreaterThan(0)
  })
})
