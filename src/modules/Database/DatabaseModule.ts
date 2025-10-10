import { EventEmitter } from 'events';
import { Pool as PgPool, PoolConfig as PgPoolConfig, QueryResult } from 'pg';
import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import { createPool, Pool as MySQLPool, PoolOptions as MySQLPoolOptions } from 'mysql2/promise';

export type DatabaseType = 'postgresql' | 'mongodb' | 'mysql';

export interface DatabaseConfig {
  type: DatabaseType;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  connectionString?: string;
  poolSize?: number;
  ssl?: boolean;
  options?: any;
}

export interface QueryOptions {
  timeout?: number;
  parameters?: any[];
}

export class DatabaseModule extends EventEmitter {
  private config: DatabaseConfig;
  private pgPool?: PgPool;
  private mongoClient?: MongoClient;
  private mongoDB?: Db;
  private mysqlPool?: MySQLPool;
  private connected: boolean = false;

  constructor(config: DatabaseConfig) {
    super();
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      switch (this.config.type) {
        case 'postgresql':
          await this.connectPostgreSQL();
          break;
        case 'mongodb':
          await this.connectMongoDB();
          break;
        case 'mysql':
          await this.connectMySQL();
          break;
        default:
          throw new Error(`Unsupported database type: ${this.config.type}`);
      }
      this.connected = true;
      this.emit('connected', { type: this.config.type });
    } catch (error) {
      this.emit('error', { message: 'Connection failed', error });
      throw error;
    }
  }

  private async connectPostgreSQL(): Promise<void> {
    const poolConfig: PgPoolConfig = this.config.connectionString
      ? { connectionString: this.config.connectionString }
      : {
          host: this.config.host,
          port: this.config.port || 5432,
          database: this.config.database,
          user: this.config.username,
          password: this.config.password,
          max: this.config.poolSize || 10,
          ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
          ...this.config.options,
        };

    this.pgPool = new PgPool(poolConfig);
    await this.pgPool.query('SELECT NOW()');
  }

  private async connectMongoDB(): Promise<void> {
    const uri =
      this.config.connectionString ||
      `mongodb://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port || 27017}/${this.config.database}`;

    const options: MongoClientOptions = {
      maxPoolSize: this.config.poolSize || 10,
      ...this.config.options,
    };

    this.mongoClient = new MongoClient(uri, options);
    await this.mongoClient.connect();
    this.mongoDB = this.mongoClient.db(this.config.database);
  }

  private async connectMySQL(): Promise<void> {
    const poolConfig: MySQLPoolOptions = this.config.connectionString
      ? { uri: this.config.connectionString }
      : {
          host: this.config.host,
          port: this.config.port || 3306,
          database: this.config.database,
          user: this.config.username,
          password: this.config.password,
          connectionLimit: this.config.poolSize || 10,
          ssl: this.config.ssl ? {} : undefined,
          ...this.config.options,
        };

    this.mysqlPool = createPool(poolConfig);
    await this.mysqlPool.query('SELECT 1');
  }

  async disconnect(): Promise<void> {
    try {
      switch (this.config.type) {
        case 'postgresql':
          if (this.pgPool) {
            await this.pgPool.end();
            this.pgPool = undefined;
          }
          break;
        case 'mongodb':
          if (this.mongoClient) {
            await this.mongoClient.close();
            this.mongoClient = undefined;
            this.mongoDB = undefined;
          }
          break;
        case 'mysql':
          if (this.mysqlPool) {
            await this.mysqlPool.end();
            this.mysqlPool = undefined;
          }
          break;
      }
      this.connected = false;
      this.emit('disconnected', { type: this.config.type });
    } catch (error) {
      this.emit('error', { message: 'Disconnection failed', error });
      throw error;
    }
  }

  async query(sql: string, params?: any[]): Promise<any> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    try {
      let result: any;

      switch (this.config.type) {
        case 'postgresql':
          if (!this.pgPool) throw new Error('PostgreSQL pool not initialized');
          const pgResult: QueryResult = await this.pgPool.query(sql, params);
          result = { rows: pgResult.rows, rowCount: pgResult.rowCount };
          break;

        case 'mysql':
          if (!this.mysqlPool) throw new Error('MySQL pool not initialized');
          const [mysqlRows] = await this.mysqlPool.query(sql, params);
          result = { rows: mysqlRows, rowCount: Array.isArray(mysqlRows) ? mysqlRows.length : 0 };
          break;

        default:
          throw new Error(`Query not supported for database type: ${this.config.type}`);
      }

      this.emit('query', { sql, params, result });
      return result;
    } catch (error) {
      this.emit('error', { message: 'Query failed', sql, error });
      throw error;
    }
  }

  getCollection(name: string): any {
    if (this.config.type !== 'mongodb') {
      throw new Error('getCollection is only available for MongoDB');
    }
    if (!this.mongoDB) {
      throw new Error('MongoDB not connected');
    }
    return this.mongoDB.collection(name);
  }

  getDB(): Db | undefined {
    if (this.config.type !== 'mongodb') {
      throw new Error('getDB is only available for MongoDB');
    }
    return this.mongoDB;
  }

  getPool(): PgPool | MySQLPool | undefined {
    switch (this.config.type) {
      case 'postgresql':
        return this.pgPool;
      case 'mysql':
        return this.mysqlPool;
      default:
        return undefined;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getType(): DatabaseType {
    return this.config.type;
  }
}
