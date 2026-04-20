import { validateOrderId } from '../../validations/tracking'
import { ValidationError } from '../../errors/ValidationError'

describe('validateOrderId', () => {
  it('lanza ValidationError si orderId es undefined', () => {
    expect(() => validateOrderId(undefined)).toThrow(ValidationError)
  })

  it('lanza ValidationError si orderId es string vacío', () => {
    expect(() => validateOrderId('')).toThrow(ValidationError)
  })

  it('lanza ValidationError si orderId tiene menos de 3 caracteres', () => {
    expect(() => validateOrderId('ab')).toThrow(ValidationError)
  })

  it('no lanza si orderId es válido', () => {
    expect(() => validateOrderId('1626210500001-01')).not.toThrow()
  })

  it('no lanza si orderId tiene exactamente 3 caracteres', () => {
    expect(() => validateOrderId('abc')).not.toThrow()
  })
})
