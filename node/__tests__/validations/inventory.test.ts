import { validateSkuId } from '../../validations/inventory'
import { ValidationError } from '../../errors/ValidationError'

describe('validateSkuId', () => {
  it('lanza ValidationError si skuId es undefined', () => {
    expect(() => validateSkuId(undefined)).toThrow(ValidationError)
  })

  it('lanza ValidationError si skuId es string vacío', () => {
    expect(() => validateSkuId('')).toThrow(ValidationError)
  })

  it('lanza ValidationError si skuId es solo espacios', () => {
    expect(() => validateSkuId('   ')).toThrow(ValidationError)
  })

  it('no lanza si skuId es válido', () => {
    expect(() => validateSkuId('5103261')).not.toThrow()
  })
})
