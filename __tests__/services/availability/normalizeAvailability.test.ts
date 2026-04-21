import { normalizeAvailability } from '../../../node/services/availability/normalizeAvailability'

const rawSellers = {
  items: [
    { id: 'seller1', name: 'Seller Uno', isActive: true },
    { id: 'seller2', name: 'Seller Dos', isActive: true },
    { id: 'seller3', name: 'Seller Inactivo', isActive: false },
  ],
}

const rawInventory = {
  balance: [
    { sellerId: 'seller1', totalQuantity: 100, reservedQuantity: 10 },
    { sellerId: 'seller1', totalQuantity: 50, reservedQuantity: 5 },
    { sellerId: 'seller2', totalQuantity: 20, reservedQuantity: 20 },
    { sellerId: 'seller3', totalQuantity: 200, reservedQuantity: 0 },
  ],
}

describe('normalizeAvailability', () => {
  it('retorna array vacío si inventory no tiene balance', () => {
    const result = normalizeAvailability({}, rawSellers)

    expect(result).toEqual([])
  })

  it('retorna array vacío si balance no es un array', () => {
    const result = normalizeAvailability({ balance: null }, rawSellers)

    expect(result).toEqual([])
  })

  it('agrupa balances del mismo seller y suma cantidades disponibles', () => {
    const result = normalizeAvailability(rawInventory, rawSellers)
    const seller1 = result.find((s) => s.sellerId === 'seller1')

    expect(seller1?.totalAvailable).toBe(135) // (100-10) + (50-5)
  })

  it('marca como no disponible si totalAvailable es 0', () => {
    const result = normalizeAvailability(rawInventory, rawSellers)
    const seller2 = result.find((s) => s.sellerId === 'seller2')

    expect(seller2?.isAvailable).toBe(false)
    expect(seller2?.totalAvailable).toBe(0)
  })

  it('enriquece con el nombre del seller cuando está en el registro', () => {
    const result = normalizeAvailability(rawInventory, rawSellers)
    const seller1 = result.find((s) => s.sellerId === 'seller1')

    expect(seller1?.sellerName).toBe('Seller Uno')
  })

  it('usa sellerId como sellerName si el seller no está en el registro', () => {
    const result = normalizeAvailability(rawInventory, { items: [] })
    const seller1 = result.find((s) => s.sellerId === 'seller1')

    expect(seller1?.sellerName).toBe('seller1')
  })

  it('ordena los sellers por totalAvailable de mayor a menor', () => {
    const result = normalizeAvailability(rawInventory, rawSellers)
    const totals = result.map((s) => s.totalAvailable)

    expect(totals).toEqual([...totals].sort((a, b) => b - a))
  })

  it('filtra por sellerId cuando se pasa el parámetro opcional', () => {
    const result = normalizeAvailability(rawInventory, rawSellers, 'seller1')

    expect(result).toHaveLength(1)
    expect(result[0].sellerId).toBe('seller1')
  })

  it('ignora balances sin sellerId', () => {
    const inventory = {
      balance: [
        { sellerId: '', totalQuantity: 100, reservedQuantity: 0 },
        { sellerId: 'seller1', totalQuantity: 50, reservedQuantity: 0 },
      ],
    }
    const result = normalizeAvailability(inventory, rawSellers)
    const ids = result.map((s) => s.sellerId)

    expect(ids).not.toContain('')
  })

  it('nunca retorna totalAvailable negativo', () => {
    const inventory = {
      balance: [{ sellerId: 'seller1', totalQuantity: 5, reservedQuantity: 100 }],
    }
    const result = normalizeAvailability(inventory, rawSellers)

    expect(result[0].totalAvailable).toBe(0)
  })
})
