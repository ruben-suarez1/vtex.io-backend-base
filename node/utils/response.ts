export function buildSuccessResponse<T>(data: T) {
  return {
    success: true,
    ...data,
  }
}

export function buildErrorResponse(message: string, code?: string, details?: unknown) {
  return {
    success: false,
    message,
    code,
    details,
  }
}