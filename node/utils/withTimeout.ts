import { AppError } from '../errors/AppError'

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new AppError(`Request timeout after ${ms}ms`, 504, 'TIMEOUT')), ms)
  )

  return Promise.race([promise, timeout])
}
