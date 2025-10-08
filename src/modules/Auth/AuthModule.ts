import { EventEmitter } from 'events';
import * as crypto from 'crypto';

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
  tokenExpiration?: number; // in seconds, default 3600 (1 hour)
  refreshTokenExpiration?: number; // in seconds, default 604800 (7 days)
}

export class AuthModule extends EventEmitter {
  private users: Map<string, User>;
  private passwords: Map<string, string>; // userId -> hashed password
  private tokens: Map<string, TokenPayload>; // token -> payload
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    super();
    this.users = new Map();
    this.passwords = new Map();
    this.tokens = new Map();
    this.config = {
      tokenExpiration: 3600,
      refreshTokenExpiration: 604800,
      ...config
    };
  }

  /**
   * Hash a password using SHA256
   */
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Generate a secure token
   */
  private generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: TokenPayload = {
      ...payload,
      iat: now,
      exp: now + this.config.tokenExpiration!
    };

    // Create token: base64(payload).signature
    const payloadStr = Buffer.from(JSON.stringify(fullPayload)).toString('base64');
    const signature = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(payloadStr)
      .digest('hex');

    const token = `${payloadStr}.${signature}`;
    this.tokens.set(token, fullPayload);
    
    return token;
  }

  /**
   * Verify and decode a token
   */
  private verifyToken(token: string): TokenPayload | null {
    try {
      const [payloadStr, signature] = token.split('.');
      
      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', this.config.secretKey)
        .update(payloadStr)
        .digest('hex');

      if (signature !== expectedSignature) {
        return null;
      }

      // Decode payload
      const payload: TokenPayload = JSON.parse(
        Buffer.from(payloadStr, 'base64').toString('utf-8')
      );

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        this.tokens.delete(token);
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Register a new user
   */
  async register(username: string, email: string, password: string, roles: string[] = ['user']): Promise<User> {
    // Check if user already exists
    const existingUser = Array.from(this.users.values()).find(
      u => u.username === username || u.email === email
    );

    if (existingUser) {
      throw new Error('User already exists');
    }

    const userId = crypto.randomUUID();
    const user: User = {
      id: userId,
      username,
      email,
      roles,
      metadata: {}
    };

    this.users.set(userId, user);
    this.passwords.set(userId, this.hashPassword(password));
    
    this.emit('userRegistered', user);
    
    return user;
  }

  /**
   * Authenticate a user and return a token
   */
  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    // Find user
    const user = Array.from(this.users.values()).find(u => u.username === username);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const hashedPassword = this.hashPassword(password);
    const storedPassword = this.passwords.get(user.id);

    if (hashedPassword !== storedPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      username: user.username,
      roles: user.roles
    });

    this.emit('userLoggedIn', user);

    return { user, token };
  }

  /**
   * Verify a token and return the user
   */
  async verifyAuth(token: string): Promise<User | null> {
    const payload = this.verifyToken(token);
    
    if (!payload) {
      return null;
    }

    return this.users.get(payload.userId) || null;
  }

  /**
   * Logout (invalidate token)
   */
  async logout(token: string): Promise<void> {
    this.tokens.delete(token);
    this.emit('userLoggedOut', { token });
  }

  /**
   * Get user by ID
   */
  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  /**
   * Get user by username
   */
  getUserByUsername(username: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updates: Partial<Omit<User, 'id'>>): Promise<User> {
    const user = this.users.get(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = { ...user, ...updates, id: userId };
    this.users.set(userId, updatedUser);
    
    this.emit('userUpdated', updatedUser);
    
    return updatedUser;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    this.users.delete(userId);
    this.passwords.delete(userId);
    
    this.emit('userDeleted', { userId });
  }

  /**
   * Check if user has specific role
   */
  hasRole(user: User, role: string): boolean {
    return user.roles.includes(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(user: User, roles: string[]): boolean {
    return roles.some(role => user.roles.includes(role));
  }

  /**
   * Check if user has all of the specified roles
   */
  hasAllRoles(user: User, roles: string[]): boolean {
    return roles.every(role => user.roles.includes(role));
  }
}
