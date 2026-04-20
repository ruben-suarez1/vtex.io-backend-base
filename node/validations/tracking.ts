import { ValidationError } from '../errors/ValidationError'

export function validateOrderId(orderId?: string) {
  if (!orderId) {
    throw new ValidationError('orderId es requerido')
  }

  if (typeof orderId !== 'string') {
    throw new ValidationError('orderId debe ser string')
  }

  if (orderId.trim().length < 3) {
    throw new ValidationError('orderId no tiene un formato válido')
  }
}