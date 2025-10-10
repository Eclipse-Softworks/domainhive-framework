import { EventEmitter } from 'events';
import { createClient, RedisClientType, RedisClientOptions } from 'redis';

export type CacheType = 'memory' | 'redis';

export interface CacheConfig {
  type?: CacheType;
  redis?: {
    url?: string;
    host?: string;
    port?: number;
    password?: string;
    database?: number;
    keyPrefix?: string;
  };
  memory?: {
    maxSize?: number;
    ttl?: number;
  };
}

interface MemoryCacheEntry {
  value: any;
  expiresAt?: number;
}

export class CacheModule extends EventEmitter {
  private config: CacheConfig;
  private redisClient?: RedisClientType;
  private memoryCache: Map<string, MemoryCacheEntry> = new Map();
  private connected: boolean = false;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: CacheConfig = {}) {
    super();
    this.config = {
      type: config.type || 'memory',
      redis: config.redis,
      memory: {
        maxSize: config.memory?.maxSize || 1000,
        ttl: config.memory?.ttl || 3600,
      },
    };

    if (this.config.type === 'memory') {
      this.startMemoryCleanup();
    }
  }

  async connect(): Promise<void> {
    try {
      if (this.config.type === 'redis') {
        await this.connectRedis();
      }
      this.connected = true;
      this.emit('connected', { type: this.config.type });
    } catch (error) {
      this.emit('error', { message: 'Connection failed', error });
      throw error;
    }
  }

  private async connectRedis(): Promise<void> {
    if (!this.config.redis) {
      throw new Error('Redis configuration is required');
    }

    const options: RedisClientOptions = this.config.redis.url
      ? { url: this.config.redis.url }
      : {
          socket: {
            host: this.config.redis.host || 'localhost',
            port: this.config.redis.port || 6379,
          },
          password: this.config.redis.password,
          database: this.config.redis.database || 0,
        };

    this.redisClient = createClient(options) as RedisClientType;

    this.redisClient.on('error', (error) => {
      this.emit('error', { message: 'Redis error', error });
    });

    await this.redisClient.connect();
  }

  async disconnect(): Promise<void> {
    try {
      if (this.config.type === 'redis' && this.redisClient) {
        await this.redisClient.quit();
        this.redisClient = undefined;
      }

      if (this.config.type === 'memory') {
        this.stopMemoryCleanup();
        this.memoryCache.clear();
      }

      this.connected = false;
      this.emit('disconnected', { type: this.config.type });
    } catch (error) {
      this.emit('error', { message: 'Disconnection failed', error });
      throw error;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (this.config.type === 'redis') {
        await this.setRedis(key, value, ttl);
      } else {
        this.setMemory(key, value, ttl);
      }
      this.emit('set', { key, ttl });
    } catch (error) {
      this.emit('error', { message: 'Set failed', key, error });
      throw error;
    }
  }

  private async setRedis(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.redisClient) {
      throw new Error('Redis client not initialized');
    }

    const fullKey = this.config.redis?.keyPrefix ? `${this.config.redis.keyPrefix}${key}` : key;
    const serialized = JSON.stringify(value);

    if (ttl) {
      await this.redisClient.setEx(fullKey, ttl, serialized);
    } else {
      await this.redisClient.set(fullKey, serialized);
    }
  }

  private setMemory(key: string, value: any, ttl?: number): void {
    const effectiveTtl = ttl || this.config.memory?.ttl || 3600;
    const expiresAt = Date.now() + effectiveTtl * 1000;

    if (this.memoryCache.size >= (this.config.memory?.maxSize || 1000)) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }

    this.memoryCache.set(key, { value, expiresAt });
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = this.config.type === 'redis' ? await this.getRedis(key) : this.getMemory(key);

      this.emit('get', { key, found: value !== null });
      return value;
    } catch (error) {
      this.emit('error', { message: 'Get failed', key, error });
      throw error;
    }
  }

  private async getRedis(key: string): Promise<any | null> {
    if (!this.redisClient) {
      throw new Error('Redis client not initialized');
    }

    const fullKey = this.config.redis?.keyPrefix ? `${this.config.redis.keyPrefix}${key}` : key;
    const value = await this.redisClient.get(fullKey);

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  private getMemory(key: string): any | null {
    const entry = this.memoryCache.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value;
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result =
        this.config.type === 'redis' ? await this.deleteRedis(key) : this.deleteMemory(key);

      this.emit('delete', { key, deleted: result });
      return result;
    } catch (error) {
      this.emit('error', { message: 'Delete failed', key, error });
      throw error;
    }
  }

  private async deleteRedis(key: string): Promise<boolean> {
    if (!this.redisClient) {
      throw new Error('Redis client not initialized');
    }

    const fullKey = this.config.redis?.keyPrefix ? `${this.config.redis.keyPrefix}${key}` : key;
    const result = await this.redisClient.del(fullKey);
    return result > 0;
  }

  private deleteMemory(key: string): boolean {
    return this.memoryCache.delete(key);
  }

  async has(key: string): Promise<boolean> {
    try {
      const result = this.config.type === 'redis' ? await this.hasRedis(key) : this.hasMemory(key);

      return result;
    } catch (error) {
      this.emit('error', { message: 'Has check failed', key, error });
      throw error;
    }
  }

  private async hasRedis(key: string): Promise<boolean> {
    if (!this.redisClient) {
      throw new Error('Redis client not initialized');
    }

    const fullKey = this.config.redis?.keyPrefix ? `${this.config.redis.keyPrefix}${key}` : key;
    const result = await this.redisClient.exists(fullKey);
    return result > 0;
  }

  private hasMemory(key: string): boolean {
    const entry = this.memoryCache.get(key);

    if (!entry) {
      return false;
    }

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return false;
    }

    return true;
  }

  async clear(): Promise<void> {
    try {
      if (this.config.type === 'redis') {
        if (!this.redisClient) {
          throw new Error('Redis client not initialized');
        }
        await this.redisClient.flushDb();
      } else {
        this.memoryCache.clear();
      }

      this.emit('clear');
    } catch (error) {
      this.emit('error', { message: 'Clear failed', error });
      throw error;
    }
  }

  private startMemoryCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.expiresAt && now > entry.expiresAt) {
          this.memoryCache.delete(key);
        }
      }
    }, 60000);
  }

  private stopMemoryCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getType(): CacheType {
    return this.config.type || 'memory';
  }

  getSize(): number {
    if (this.config.type === 'memory') {
      return this.memoryCache.size;
    }
    return 0;
  }
}
