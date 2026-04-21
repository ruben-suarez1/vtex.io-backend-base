import { getInventoryByChannel } from '../../../node/services/inventory/getInventoryByChannel'
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
    { warehouseId: 'wh1', warehouseName: 'Principal', totalQuantity: 100, reservedQuantity: 10 },
    { warehouseId: 'wh2', warehouseName: 'Secundario', totalQuantity: 40, reservedQuantity: 40 },
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
      catalog: {
        getSkuById: jest.fn().mockResolvedValue(mockSku),
      },
      ...overrides,
    },
  } as any
}

describe('getInventoryByChannel', () => {
  it('lanza ValidationError si skuId es inválido', async () => {
    const ctx = createCtx()

    await expect(getInventoryByChannel('', ctx)).rejects.toThrow(ValidationError)
  })

  it('retorna skuId, skuName, totalAvailable y warehouses', async () => {
    const ctx = createCtx()
    const result = await getInventoryByChannel('5103261', ctx)

    expect(result.skuId).toBe('5103261')
    expect(result.skuName).toBe('Remera Lisa Blanca')
    expect(Array.isArray(result.warehouses)).toBe(true)
    expect(typeof result.totalAvailable).toBe('number')
  })

  it('suma correctamente el totalAvailable de los warehouses', async () => {
    const ctx = createCtx()
    const result = await getInventoryByChannel('5103261', ctx)

    // (100-10) + max(0, 40-40) = 90 + 0 = 90
    expect(result.totalAvailable).toBe(90)
  })

  it('llama a inventory y catalog con las credenciales correctas', async () => {
    const ctx = createCtx()
    await getInventoryByChannel('5103261', ctx)

    expect(ctx.clients.inventory.getBySkuId).toHaveBeenCalledWith('5103261', 'key-123', 'token-456')
    expect(ctx.clients.catalog.getSkuById).toHaveBeenCalledWith('5103261', 'key-123', 'token-456')
  })

  it('continúa si catalog falla — skuName queda vacío', async () => {
    const ctx = createCtx({
      catalog: {
        getSkuById: jest.fn().mockRejectedValue(new Error('Not found')),
      },
    })

    const result = await getInventoryByChannel('5103261', ctx)

    expect(result.skuName).toBe('')
    expect(result.totalAvailable).toBe(90)
  })

  it('pasa el channel al normalizer para filtrar warehouses', async () => {
    const inventoryWithChannel = {
      balance: [
        { warehouseId: 'wh1', warehouseName: 'A', salesChannel: 'sc1', totalQuantity: 50, reservedQuantity: 0 },
        { warehouseId: 'wh2', warehouseName: 'B', salesChannel: 'sc2', totalQuantity: 30, reservedQuantity: 0 },
      ],
    }
    const ctx = createCtx({ inventory: { getBySkuId: jest.fn().mockResolvedValue(inventoryWithChannel) } })

    const result = await getInventoryByChannel('5103261', ctx, 'sc1')

    expect(result.warehouses).toHaveLength(1)
    expect(result.totalAvailable).toBe(50)
  })
})
