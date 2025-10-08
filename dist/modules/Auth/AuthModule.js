"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
class AuthModule extends events_1.EventEmitter {
    constructor(config) {
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
    hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }
    /**
     * Generate a secure token
     */
    generateToken(payload) {
        const now = Math.floor(Date.now() / 1000);
        const fullPayload = {
            ...payload,
            iat: now,
            exp: now + this.config.tokenExpiration
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
    verifyToken(token) {
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
            const payload = JSON.parse(Buffer.from(payloadStr, 'base64').toString('utf-8'));
            // Check expiration
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp < now) {
                this.tokens.delete(token);
                return null;
            }
            return payload;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Register a new user
     */
    async register(username, email, password, roles = ['user']) {
        // Check if user already exists
        const existingUser = Array.from(this.users.values()).find(u => u.username === username || u.email === email);
        if (existingUser) {
            throw new Error('User already exists');
        }
        const userId = crypto.randomUUID();
        const user = {
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
    async login(username, password) {
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
    async verifyAuth(token) {
        const payload = this.verifyToken(token);
        if (!payload) {
            return null;
        }
        return this.users.get(payload.userId) || null;
    }
    /**
     * Logout (invalidate token)
     */
    async logout(token) {
        this.tokens.delete(token);
        this.emit('userLoggedOut', { token });
    }
    /**
     * Get user by ID
     */
    getUser(userId) {
        return this.users.get(userId);
    }
    /**
     * Get user by username
     */
    getUserByUsername(username) {
        return Array.from(this.users.values()).find(u => u.username === username);
    }
    /**
     * Update user
     */
    async updateUser(userId, updates) {
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
    async deleteUser(userId) {
        this.users.delete(userId);
        this.passwords.delete(userId);
        this.emit('userDeleted', { userId });
    }
    /**
     * Check if user has specific role
     */
    hasRole(user, role) {
        return user.roles.includes(role);
    }
    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole(user, roles) {
        return roles.some(role => user.roles.includes(role));
    }
    /**
     * Check if user has all of the specified roles
     */
    hasAllRoles(user, roles) {
        return roles.every(role => user.roles.includes(role));
    }
}
exports.AuthModule = AuthModule;
