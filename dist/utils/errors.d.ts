/**
 * Custom error classes for better error handling
 */
export declare class DomainHiveError extends Error {
    code: string;
    statusCode: number;
    details?: any;
    constructor(message: string, code?: string, statusCode?: number, details?: any);
    toJSON(): {
        name: string;
        message: string;
        code: string;
        statusCode: number;
        details: any;
        stack: string | undefined;
    };
}
export declare class ValidationError extends DomainHiveError {
    constructor(message: string, details?: any);
}
export declare class AuthenticationError extends DomainHiveError {
    constructor(message?: string, details?: any);
}
export declare class AuthorizationError extends DomainHiveError {
    constructor(message?: string, details?: any);
}
export declare class NotFoundError extends DomainHiveError {
    constructor(resource: string);
}
export declare class ConflictError extends DomainHiveError {
    constructor(message: string, details?: any);
}
export declare class TimeoutError extends DomainHiveError {
    constructor(message?: string);
}
export declare class RateLimitError extends DomainHiveError {
    constructor(message?: string);
}
export declare class ServiceUnavailableError extends DomainHiveError {
    constructor(service: string);
}
/**
 * Error handler wrapper for async functions
 */
export declare function asyncHandler<T extends (...args: any[]) => Promise<any>>(fn: T): (...args: Parameters<T>) => Promise<ReturnType<T>>;
/**
 * Assert a condition and throw error if false
 */
export declare function assert(condition: boolean, message: string, ErrorClass?: typeof DomainHiveError): void;
/**
 * Check if error is of specific type
 */
export declare function isErrorType(error: any, ErrorClass: any): boolean;
