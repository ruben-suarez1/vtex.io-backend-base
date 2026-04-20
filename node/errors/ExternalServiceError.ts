import { AppError } from './AppError'

export class ExternalServiceError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', details)
    this.name = 'ExternalServiceError'
  }
}