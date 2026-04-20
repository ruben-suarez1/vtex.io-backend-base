import { ValidationError } from '../errors/ValidationError'

export function validateSkuId(skuId?: string) {
  if (!skuId) {
    throw new ValidationError('skuId es requerido')
  }

  if (skuId.trim().length === 0) {
    throw new ValidationError('skuId no tiene un formato válido')
  }
}
