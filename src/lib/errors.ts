/**
 * Standardized API error response structure.
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
}

/**
 * Creates a standardized JSON error response.
 *
 * @param status - HTTP status code
 * @param error - Short error type (e.g., "Unauthorized", "Bad Request")
 * @param message - Optional detailed error message
 * @returns Response object with JSON body and appropriate headers
 */
export function createErrorResponse(status: number, error: string, message?: string): Response {
  const body: ApiErrorResponse = { error };
  if (message) {
    body.message = message;
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Creates a 401 Unauthorized response.
 */
export function unauthorizedResponse(): Response {
  return createErrorResponse(401, "Unauthorized");
}

/**
 * Creates a 400 Bad Request response with validation error details.
 *
 * @param message - Validation error message
 */
export function badRequestResponse(message: string): Response {
  return createErrorResponse(400, "Bad Request", message);
}

/**
 * Creates a 404 Not Found response.
 *
 * @param message - Optional message describing what was not found
 */
export function notFoundResponse(message?: string): Response {
  return createErrorResponse(404, "Not Found", message);
}

/**
 * Creates a 429 Too Many Requests response for rate limiting.
 *
 * @param message - Optional message describing the rate limit (e.g., daily limit exceeded)
 */
export function tooManyRequestsResponse(message?: string): Response {
  return createErrorResponse(429, "Too Many Requests", message);
}

/**
 * Creates a 500 Internal Server Error response.
 */
export function internalServerErrorResponse(): Response {
  return createErrorResponse(500, "Internal Server Error");
}

/**
 * Error logging context for debugging.
 */
export interface ErrorLogContext {
  userId?: string;
  endpoint?: string;
  method?: string;
  params?: Record<string, unknown>;
  error?: unknown;
}

/**
 * Logs an error with context for debugging.
 * In production, this should be replaced with a proper logging service.
 *
 * @param message - Error message describing what failed
 * @param context - Additional context for debugging
 */
export function logError(message: string, context: ErrorLogContext): void {
  const errorMessage = context.error instanceof Error ? context.error.message : String(context.error);

  // eslint-disable-next-line no-console
  console.error(`[API Error] ${message}`, {
    timestamp: new Date().toISOString(),
    userId: context.userId,
    endpoint: context.endpoint,
    method: context.method,
    params: context.params,
    error: errorMessage,
  });
}

/**
 * Creates a standardized JSON success response.
 *
 * @param data - Response data to serialize
 * @param status - HTTP status code (default: 200)
 * @returns Response object with JSON body
 */
export function createSuccessResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
