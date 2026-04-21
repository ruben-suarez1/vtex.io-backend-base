import { normalizeAvailability } from '../../../node/services/availability/normalizeAvailability'

const rawSellers = {
  items: [
    { id: '1', name: 'Seller Uno', isActive: true },
    { id: '2', name: 'Seller Dos', isActive: true },
    { id: '3', name: 'Seller Inactivo', isActive: false },
  ],
}

const rawInventory = {
  balance: [
    { totalQuantity: 100, reservedQuantity: 10 },
    { totalQuantity: 50, reservedQuantity: 5 },
  ],
}

describe('normalizeAvailability', () => {
  it('retorna array vacío si no hay balances de inventory', () => {
    const result = normalizeAvailability({}, rawSellers)

    expect(result).toEqual([])
  })

  it('retorna array vacío si balance es null', () => {
    const result = normalizeAvailability({ balance: null }, rawSellers)

    expect(result).toEqual([])
  })

  it('retorna array vacío si no hay sellers', () => {
    const result = normalizeAvailability(rawInventory, { items: [] })

    expect(result).toEqual([])
  })

  it('suma el stock disponible de todos los warehouses', () => {
    const result = normalizeAvailability(rawInventory, rawSellers)

    // (100-10) + (50-5) = 135
    expect(result[0].totalAvailable).toBe(135)
  })

  it('aplica el mismo totalAvailable a todos los sellers activos', () => {
    const result = normalizeAvailability(rawInventory, rawSellers)
    const totals = result.map((s) => s.totalAvailable)

    expect(totals.every((t) => t === 135)).toBe(true)
  })

  it('incluye solo sellers activos', () => {
    const result = normalizeAvailability(rawInventory, rawSellers)
    const ids = result.map((s) => s.sellerId)

    expect(ids).toContain('1')
    expect(ids).toContain('2')
    expect(ids).not.toContain('3')
  })

  it('marca isAvailable true cuando hay stock', () => {
    const result = normalizeAvailability(rawInventory, rawSellers)

    expect(result.every((s) => s.isAvailable)).toBe(true)
  })

  it('marca isAvailable false cuando no hay stock', () => {
    const noStock = { balance: [{ totalQuantity: 10, reservedQuantity: 10 }] }
    const result = normalizeAvailability(noStock, rawSellers)

    expect(result.every((s) => s.isAvailable)).toBe(false)
    expect(result.every((s) => s.totalAvailable === 0)).toBe(true)
  })

  it('nunca retorna totalAvailable negativo', () => {
    const overReserved = { balance: [{ totalQuantity: 5, reservedQuantity: 100 }] }
    const result = normalizeAvailability(overReserved, rawSellers)

    expect(result.every((s) => s.totalAvailable === 0)).toBe(true)
  })

  it('filtra por sellerId cuando se pasa el parámetro opcional', () => {
    const result = normalizeAvailability(rawInventory, rawSellers, '1')

    expect(result).toHaveLength(1)
    expect(result[0].sellerId).toBe('1')
  })

  it('usa el name del seller del registro', () => {
    const result = normalizeAvailability(rawInventory, rawSellers)
    const seller = result.find((s) => s.sellerId === '1')

    expect(seller?.sellerName).toBe('Seller Uno')
  })
})
