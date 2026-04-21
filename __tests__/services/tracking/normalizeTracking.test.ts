import { normalizeTracking } from '../../../node/services/tracking/normalizeTracking'

describe('normalizeTracking', () => {
  it('retorna array vacío si rawData es null', () => {
    expect(normalizeTracking(null)).toEqual([])
  })

  it('retorna array vacío si rawData es undefined', () => {
    expect(normalizeTracking(undefined)).toEqual([])
  })

  it('normaliza un objeto único como array de un elemento', () => {
    const result = normalizeTracking({ trackingNumber: 'TRK123', status: 'delivered', date: '2024-01-01' })

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ trackingNumber: 'TRK123', status: 'delivered', date: '2024-01-01' })
  })

  it('normaliza un array de guías', () => {
    const raw = [
      { trackingNumber: 'TRK001', status: 'in_transit' },
      { trackingNumber: 'TRK002', status: 'delivered', date: '2024-01-02' },
    ]
    const result = normalizeTracking(raw)

    expect(result).toHaveLength(2)
    expect(result[0].date).toBeUndefined()
    expect(result[1].date).toBe('2024-01-02')
  })

  it('usa "Unknown" como status por defecto si no viene en el raw', () => {
    const result = normalizeTracking({ trackingNumber: 'TRK999' })

    expect(result[0].status).toBe('Unknown')
  })

  it('convierte trackingNumber a string aunque venga como número', () => {
    const result = normalizeTracking({ trackingNumber: 123456, status: 'pending' })

    expect(result[0].trackingNumber).toBe('123456')
  })
})
