/**
 * Common utility helper functions for everyday development tasks
 */
/**
 * Deep clone an object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Debounce a function
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Throttle a function
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * Sleep/delay for a specified time
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Retry a function with exponential backoff
 */
export declare function retry<T>(fn: () => Promise<T>, options?: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
}): Promise<T>;
/**
 * Generate a UUID v4
 */
export declare function uuid(): string;
/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export declare function isEmpty(value: any): boolean;
/**
 * Flatten a nested object
 */
export declare function flatten(obj: Record<string, any>, prefix?: string): Record<string, any>;
/**
 * Pick specific keys from an object
 */
export declare function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
/**
 * Omit specific keys from an object
 */
export declare function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
/**
 * Chunk an array into smaller arrays
 */
export declare function chunk<T>(array: T[], size: number): T[][];
/**
 * Get unique values from array
 */
export declare function unique<T>(array: T[]): T[];
