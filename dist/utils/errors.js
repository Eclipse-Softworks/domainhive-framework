"use strict";
/**
 * Custom error classes for better error handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUnavailableError = exports.RateLimitError = exports.TimeoutError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.DomainHiveError = void 0;
exports.asyncHandler = asyncHandler;
exports.assert = assert;
exports.isErrorType = isErrorType;
class DomainHiveError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500, details) {
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
            stack: this.stack
        };
    }
}
exports.DomainHiveError = DomainHiveError;
class ValidationError extends DomainHiveError {
    constructor(message, details) {
        super(message, 'VALIDATION_ERROR', 400, details);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends DomainHiveError {
    constructor(message = 'Authentication failed', details) {
        super(message, 'AUTHENTICATION_ERROR', 401, details);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends DomainHiveError {
    constructor(message = 'Access denied', details) {
        super(message, 'AUTHORIZATION_ERROR', 403, details);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends DomainHiveError {
    constructor(resource) {
        super(`${resource} not found`, 'NOT_FOUND', 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends DomainHiveError {
    constructor(message, details) {
        super(message, 'CONFLICT', 409, details);
    }
}
exports.ConflictError = ConflictError;
class TimeoutError extends DomainHiveError {
    constructor(message = 'Operation timed out') {
        super(message, 'TIMEOUT', 408);
    }
}
exports.TimeoutError = TimeoutError;
class RateLimitError extends DomainHiveError {
    constructor(message = 'Rate limit exceeded') {
        super(message, 'RATE_LIMIT', 429);
    }
}
exports.RateLimitError = RateLimitError;
class ServiceUnavailableError extends DomainHiveError {
    constructor(service) {
        super(`${service} is currently unavailable`, 'SERVICE_UNAVAILABLE', 503);
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
/**
 * Error handler wrapper for async functions
 */
function asyncHandler(fn) {
    return async function (...args) {
        try {
            return await fn(...args);
        }
        catch (error) {
            if (error instanceof DomainHiveError) {
                throw error;
            }
            // Wrap unknown errors
            throw new DomainHiveError(error instanceof Error ? error.message : 'An unknown error occurred', 'INTERNAL_ERROR', 500, error);
        }
    };
}
/**
 * Assert a condition and throw error if false
 */
function assert(condition, message, ErrorClass = DomainHiveError) {
    if (!condition) {
        throw new ErrorClass(message);
    }
}
/**
 * Check if error is of specific type
 */
function isErrorType(error, ErrorClass) {
    return error instanceof ErrorClass;
}
