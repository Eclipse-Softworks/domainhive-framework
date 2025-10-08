import { EventEmitter } from 'events';
export interface User {
    id: string;
    username: string;
    email: string;
    roles: string[];
    metadata?: Record<string, any>;
}
export interface TokenPayload {
    userId: string;
    username: string;
    roles: string[];
    iat: number;
    exp: number;
}
export interface AuthConfig {
    secretKey: string;
    tokenExpiration?: number;
    refreshTokenExpiration?: number;
}
export declare class AuthModule extends EventEmitter {
    private users;
    private passwords;
    private tokens;
    private config;
    constructor(config: AuthConfig);
    /**
     * Hash a password using SHA256
     */
    private hashPassword;
    /**
     * Generate a secure token
     */
    private generateToken;
    /**
     * Verify and decode a token
     */
    private verifyToken;
    /**
     * Register a new user
     */
    register(username: string, email: string, password: string, roles?: string[]): Promise<User>;
    /**
     * Authenticate a user and return a token
     */
    login(username: string, password: string): Promise<{
        user: User;
        token: string;
    }>;
    /**
     * Verify a token and return the user
     */
    verifyAuth(token: string): Promise<User | null>;
    /**
     * Logout (invalidate token)
     */
    logout(token: string): Promise<void>;
    /**
     * Get user by ID
     */
    getUser(userId: string): User | undefined;
    /**
     * Get user by username
     */
    getUserByUsername(username: string): User | undefined;
    /**
     * Update user
     */
    updateUser(userId: string, updates: Partial<Omit<User, 'id'>>): Promise<User>;
    /**
     * Delete user
     */
    deleteUser(userId: string): Promise<void>;
    /**
     * Check if user has specific role
     */
    hasRole(user: User, role: string): boolean;
    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole(user: User, roles: string[]): boolean;
    /**
     * Check if user has all of the specified roles
     */
    hasAllRoles(user: User, roles: string[]): boolean;
}
