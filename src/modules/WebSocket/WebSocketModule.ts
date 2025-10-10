import { EventEmitter } from 'events';
import { WebSocketServer, WebSocket, ServerOptions } from 'ws';
import { Server as HTTPServer } from 'http';

export interface WebSocketConfig {
  port?: number;
  server?: HTTPServer;
  path?: string;
  verifyClient?: (info: { origin: string; req: any; secure: boolean }) => boolean;
  maxPayload?: number;
  perMessageDeflate?: boolean;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: number;
}

export interface ConnectionInfo {
  id: string;
  remoteAddress?: string;
  connectedAt: number;
  metadata: Record<string, any>;
}

export class WebSocketModule extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private config: WebSocketConfig & {
    port: number;
    path: string;
    maxPayload: number;
    perMessageDeflate: boolean;
  };
  private connections: Map<string, { socket: WebSocket; info: ConnectionInfo }> = new Map();
  private messageHandlers: Map<string, (data: any, connectionId: string) => void> = new Map();
  private connectionIdCounter: number = 0;

  constructor(config: WebSocketConfig = {}) {
    super();
    this.config = {
      port: config.port || 8080,
      server: config.server,
      path: config.path || '/',
      verifyClient: config.verifyClient,
      maxPayload: config.maxPayload || 1024 * 1024,
      perMessageDeflate: config.perMessageDeflate !== false,
    };
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const options: ServerOptions = {
          path: this.config.path,
          maxPayload: this.config.maxPayload,
          perMessageDeflate: this.config.perMessageDeflate,
          verifyClient: this.config.verifyClient,
        };

        if (this.config.server) {
          options.server = this.config.server;
        } else {
          options.port = this.config.port;
        }

        this.wss = new WebSocketServer(options);

        this.wss.on('connection', (socket, request) => {
          const connectionId = this.generateConnectionId();
          const info: ConnectionInfo = {
            id: connectionId,
            remoteAddress: request.socket.remoteAddress,
            connectedAt: Date.now(),
            metadata: {},
          };

          this.connections.set(connectionId, { socket, info });

          this.emit('connection', { connectionId, info });

          socket.on('message', (rawData) => {
            try {
              const message = JSON.parse(rawData.toString()) as WebSocketMessage;
              this.handleMessage(connectionId, message);
            } catch (error) {
              this.emit('parseError', { connectionId, error });
            }
          });

          socket.on('close', () => {
            this.connections.delete(connectionId);
            this.emit('disconnection', { connectionId, info });
          });

          socket.on('error', (error) => {
            this.emit('error', { connectionId, error });
          });
        });

        this.wss.on('error', (error) => {
          this.emit('error', error);
          reject(error);
        });

        this.wss.on('listening', () => {
          this.emit('started', {
            port: this.config.port,
            path: this.config.path,
          });
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.wss) {
        resolve();
        return;
      }

      this.connections.forEach(({ socket }) => {
        socket.close();
      });

      this.wss.close(() => {
        this.emit('stopped');
        this.wss = null;
        this.connections.clear();
        resolve();
      });
    });
  }

  private generateConnectionId(): string {
    return `ws-${Date.now()}-${++this.connectionIdCounter}`;
  }

  private handleMessage(connectionId: string, message: WebSocketMessage): void {
    const handler = this.messageHandlers.get(message.type);

    if (handler) {
      handler(message.data, connectionId);
    }

    this.emit('message', { connectionId, message });
  }

  onMessage(type: string, handler: (data: any, connectionId: string) => void): void {
    this.messageHandlers.set(type, handler);
  }

  send(connectionId: string, message: WebSocketMessage): boolean {
    const connection = this.connections.get(connectionId);

    if (!connection || connection.socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || Date.now(),
    };

    connection.socket.send(JSON.stringify(messageWithTimestamp));
    return true;
  }

  broadcast(message: WebSocketMessage, excludeConnectionId?: string): number {
    let sentCount = 0;
    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || Date.now(),
    };

    this.connections.forEach(({ socket }, connectionId) => {
      if (connectionId !== excludeConnectionId && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(messageWithTimestamp));
        sentCount++;
      }
    });

    return sentCount;
  }

  getConnection(connectionId: string): ConnectionInfo | undefined {
    return this.connections.get(connectionId)?.info;
  }

  getAllConnections(): ConnectionInfo[] {
    return Array.from(this.connections.values()).map((c) => c.info);
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  disconnect(connectionId: string): boolean {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      return false;
    }

    connection.socket.close();
    this.connections.delete(connectionId);
    return true;
  }

  setConnectionMetadata(connectionId: string, key: string, value: any): boolean {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      return false;
    }

    connection.info.metadata[key] = value;
    return true;
  }

  getConnectionMetadata(connectionId: string, key: string): any {
    const connection = this.connections.get(connectionId);
    return connection?.info.metadata[key];
  }

  isRunning(): boolean {
    return this.wss !== null;
  }
}
