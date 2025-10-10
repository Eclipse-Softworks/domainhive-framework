/**
 * Custom error classes for better error handling
 */

export class DomainHiveError extends Error {
  public code: string;
  public statusCode: number;
  public details?: any;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      stack: this.stack,
    };
  }
}

export class ValidationError extends DomainHiveError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class AuthenticationError extends DomainHiveError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 'AUTHENTICATION_ERROR', 401, details);
  }
}

export class AuthorizationError extends DomainHiveError {
  constructor(message: string = 'Access denied', details?: any) {
    super(message, 'AUTHORIZATION_ERROR', 403, details);
  }
}

export class NotFoundError extends DomainHiveError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends DomainHiveError {
  constructor(message: string, details?: any) {
    super(message, 'CONFLICT', 409, details);
  }
}

export class TimeoutError extends DomainHiveError {
  constructor(message: string = 'Operation timed out') {
    super(message, 'TIMEOUT', 408);
  }
}

export class RateLimitError extends DomainHiveError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT', 429);
  }
}

export class ServiceUnavailableError extends DomainHiveError {
  constructor(service: string) {
    super(`${service} is currently unavailable`, 'SERVICE_UNAVAILABLE', 503);
  }
}

/**
 * Error handler wrapper for async functions
 */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async function (...args: Parameters<T>): Promise<ReturnType<T>> {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof DomainHiveError) {
        throw error;
      }

      // Wrap unknown errors
      throw new DomainHiveError(
        error instanceof Error ? error.message : 'An unknown error occurred',
        'INTERNAL_ERROR',
        500,
        error
      );
    }
  };
}

/**
 * Assert a condition and throw error if false
 */
export function assert(condition: boolean, message: string, ErrorClass = DomainHiveError): void {
  if (!condition) {
    throw new ErrorClass(message);
  }
}

/**
 * Check if error is of specific type
 */
export function isErrorType(error: any, ErrorClass: any): boolean {
  return error instanceof ErrorClass;
}
