import { EventEmitter } from 'events';
import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'http';

export interface RESTConfig {
  port?: number;
  host?: string;
  cors?: cors.CorsOptions;
  helmet?: boolean;
  rateLimit?: {
    windowMs?: number;
    max?: number;
    message?: string;
  };
  bodyLimit?: string;
  enableLogging?: boolean;
}

export interface RouteHandler {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  path: string;
  handler: RequestHandler | RequestHandler[];
  middleware?: RequestHandler[];
}

export interface RouterConfig {
  prefix?: string;
  middleware?: RequestHandler[];
}

export class RESTModule extends EventEmitter {
  private app: Express;
  private server: Server | null = null;
  private config: Required<RESTConfig>;
  private routes: Map<string, RouteHandler[]>;

  constructor(config: RESTConfig = {}) {
    super();
    this.config = {
      port: config.port || 3000,
      host: config.host || '0.0.0.0',
      cors: config.cors || { origin: '*', credentials: true },
      helmet: config.helmet !== false,
      rateLimit: config.rateLimit || {
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Too many requests',
      },
      bodyLimit: config.bodyLimit || '10mb',
      enableLogging: config.enableLogging !== false,
    };

    this.app = express();
    this.routes = new Map();
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    if (this.config.helmet) {
      this.app.use(helmet());
    }

    this.app.use(cors(this.config.cors));
    this.app.use(express.json({ limit: this.config.bodyLimit }));
    this.app.use(express.urlencoded({ extended: true, limit: this.config.bodyLimit }));

    if (this.config.enableLogging) {
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        const start = Date.now();
        res.on('finish', () => {
          const duration = Date.now() - start;
          this.emit('request', {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration,
          });
        });
        next();
      });
    }

    if (this.config.rateLimit) {
      const limiter = rateLimit({
        windowMs: this.config.rateLimit.windowMs,
        max: this.config.rateLimit.max,
        message: this.config.rateLimit.message,
      });
      this.app.use(limiter);
    }
  }

  addRoute(route: RouteHandler): void {
    const routeKey = `${route.method}:${route.path}`;
    const existingRoutes = this.routes.get(routeKey) || [];
    existingRoutes.push(route);
    this.routes.set(routeKey, existingRoutes);

    const handlers = [
      ...(route.middleware || []),
      ...(Array.isArray(route.handler) ? route.handler : [route.handler]),
    ];

    switch (route.method) {
      case 'GET':
        this.app.get(route.path, ...handlers);
        break;
      case 'POST':
        this.app.post(route.path, ...handlers);
        break;
      case 'PUT':
        this.app.put(route.path, ...handlers);
        break;
      case 'DELETE':
        this.app.delete(route.path, ...handlers);
        break;
      case 'PATCH':
        this.app.patch(route.path, ...handlers);
        break;
      case 'OPTIONS':
        this.app.options(route.path, ...handlers);
        break;
      case 'HEAD':
        this.app.head(route.path, ...handlers);
        break;
    }

    this.emit('routeAdded', route);
  }

  addRoutes(routes: RouteHandler[]): void {
    routes.forEach((route) => this.addRoute(route));
  }

  createRouter(config: RouterConfig = {}): {
    get: (path: string, ...handlers: RequestHandler[]) => void;
    post: (path: string, ...handlers: RequestHandler[]) => void;
    put: (path: string, ...handlers: RequestHandler[]) => void;
    delete: (path: string, ...handlers: RequestHandler[]) => void;
    patch: (path: string, ...handlers: RequestHandler[]) => void;
  } {
    const prefix = config.prefix || '';
    const middleware = config.middleware || [];

    return {
      get: (path: string, ...handlers: RequestHandler[]) => {
        this.addRoute({ method: 'GET', path: prefix + path, handler: handlers, middleware });
      },
      post: (path: string, ...handlers: RequestHandler[]) => {
        this.addRoute({ method: 'POST', path: prefix + path, handler: handlers, middleware });
      },
      put: (path: string, ...handlers: RequestHandler[]) => {
        this.addRoute({ method: 'PUT', path: prefix + path, handler: handlers, middleware });
      },
      delete: (path: string, ...handlers: RequestHandler[]) => {
        this.addRoute({ method: 'DELETE', path: prefix + path, handler: handlers, middleware });
      },
      patch: (path: string, ...handlers: RequestHandler[]) => {
        this.addRoute({ method: 'PATCH', path: prefix + path, handler: handlers, middleware });
      },
    };
  }

  use(middleware: RequestHandler): void {
    this.app.use(middleware);
  }

  useAt(path: string, middleware: RequestHandler): void {
    this.app.use(path, middleware);
  }

  getApp(): Express {
    return this.app;
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.config.port, this.config.host, () => {
          this.emit('started', {
            host: this.config.host,
            port: this.config.port,
            url: `http://${this.config.host}:${this.config.port}`,
          });
          resolve();
        });

        this.server.on('error', (error) => {
          this.emit('error', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close((error) => {
        if (error) {
          this.emit('error', error);
          reject(error);
        } else {
          this.emit('stopped');
          this.server = null;
          resolve();
        }
      });
    });
  }

  isRunning(): boolean {
    return this.server !== null;
  }

  getRoutes(): RouteHandler[] {
    return Array.from(this.routes.values()).flat();
  }
}
