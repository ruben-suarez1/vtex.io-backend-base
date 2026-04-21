import { normalizeInventory } from '../../../node/services/inventory/normalizeInventory'

const rawBalance = {
  balance: [
    { warehouseId: 'wh1', warehouseName: 'Principal', salesChannel: 'sc1', totalQuantity: 100, reservedQuantity: 10 },
    { warehouseId: 'wh2', warehouseName: 'Secundario', salesChannel: 'sc2', totalQuantity: 50, reservedQuantity: 50 },
    { warehouseId: 'wh3', warehouseName: 'Otro', salesChannel: 'sc1', totalQuantity: 30, reservedQuantity: 5 },
  ],
}

describe('normalizeInventory', () => {
  it('retorna array vacío si rawData no tiene balance', () => {
    expect(normalizeInventory({})).toEqual([])
  })

  it('retorna array vacío si balance es null', () => {
    expect(normalizeInventory({ balance: null })).toEqual([])
  })

  it('retorna array vacío si balance no es un array', () => {
    expect(normalizeInventory({ balance: 'invalid' })).toEqual([])
  })

  it('normaliza todos los warehouses cuando no se filtra por channel', () => {
    const result = normalizeInventory(rawBalance)

    expect(result).toHaveLength(3)
  })

  it('filtra por channel cuando se pasa el parámetro opcional', () => {
    const result = normalizeInventory(rawBalance, 'sc1')

    expect(result).toHaveLength(2)
    expect(result.every((w) => w.warehouseId === 'wh1' || w.warehouseId === 'wh3')).toBe(true)
  })

  it('calcula availableQuantity como total menos reservado', () => {
    const result = normalizeInventory(rawBalance)
    const wh1 = result.find((w) => w.warehouseId === 'wh1')

    expect(wh1?.availableQuantity).toBe(90)
  })

  it('nunca retorna availableQuantity negativo', () => {
    const result = normalizeInventory(rawBalance)
    const wh2 = result.find((w) => w.warehouseId === 'wh2')

    expect(wh2?.availableQuantity).toBe(0)
  })

  it('convierte totalQuantity y reservedQuantity a número aunque vengan como string', () => {
    const raw = { balance: [{ warehouseId: 'wh1', warehouseName: 'P', totalQuantity: '80', reservedQuantity: '20' }] }
    const result = normalizeInventory(raw)

    expect(result[0].availableQuantity).toBe(60)
  })

  it('mapea correctamente warehouseId y warehouseName', () => {
    const result = normalizeInventory(rawBalance)
    const wh1 = result.find((w) => w.warehouseId === 'wh1')

    expect(wh1?.warehouseName).toBe('Principal')
  })
})
