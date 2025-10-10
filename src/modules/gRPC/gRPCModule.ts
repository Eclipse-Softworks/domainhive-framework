import { EventEmitter } from 'events';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

export interface GRPCConfig {
  host?: string;
  port?: number;
  protoFiles?: string[];
  protoOptions?: protoLoader.Options;
  credentials?: grpc.ServerCredentials;
  maxReceiveMessageLength?: number;
  maxSendMessageLength?: number;
}

export interface ServiceDefinition {
  name: string;
  implementation: grpc.UntypedServiceImplementation;
}

export class GRPCModule extends EventEmitter {
  private server: grpc.Server;
  private config: Required<GRPCConfig>;
  private services: Map<string, ServiceDefinition> = new Map();
  private packageDefinitions: Map<string, any> = new Map();
  private isRunning: boolean = false;

  constructor(config: GRPCConfig = {}) {
    super();
    this.config = {
      host: config.host || '0.0.0.0',
      port: config.port || 50051,
      protoFiles: config.protoFiles || [],
      protoOptions: config.protoOptions || {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
      credentials: config.credentials || grpc.ServerCredentials.createInsecure(),
      maxReceiveMessageLength: config.maxReceiveMessageLength || 4 * 1024 * 1024,
      maxSendMessageLength: config.maxSendMessageLength || 4 * 1024 * 1024,
    };

    this.server = new grpc.Server({
      'grpc.max_receive_message_length': this.config.maxReceiveMessageLength,
      'grpc.max_send_message_length': this.config.maxSendMessageLength,
    });

    this.loadProtoFiles();
  }

  private loadProtoFiles(): void {
    this.config.protoFiles.forEach((protoFile) => {
      try {
        const packageDefinition = protoLoader.loadSync(protoFile, this.config.protoOptions);
        const grpcObject = grpc.loadPackageDefinition(packageDefinition);
        this.packageDefinitions.set(protoFile, grpcObject);
        this.emit('protoLoaded', { file: protoFile });
      } catch (error) {
        this.emit('error', { message: 'Failed to load proto file', file: protoFile, error });
      }
    });
  }

  loadProtoFile(protoFile: string): any | null {
    try {
      const packageDefinition = protoLoader.loadSync(protoFile, this.config.protoOptions);
      const grpcObject = grpc.loadPackageDefinition(packageDefinition);
      this.packageDefinitions.set(protoFile, grpcObject);
      this.emit('protoLoaded', { file: protoFile });
      return grpcObject;
    } catch (error) {
      this.emit('error', { message: 'Failed to load proto file', file: protoFile, error });
      return null;
    }
  }

  addService(
    serviceName: string,
    serviceDefinition: grpc.ServiceDefinition,
    implementation: grpc.UntypedServiceImplementation
  ): void {
    try {
      this.server.addService(serviceDefinition, implementation);
      this.services.set(serviceName, { name: serviceName, implementation });
      this.emit('serviceAdded', { name: serviceName });
    } catch (error) {
      this.emit('error', { message: 'Failed to add service', service: serviceName, error });
    }
  }

  getPackageDefinition(protoFile: string): any | undefined {
    return this.packageDefinitions.get(protoFile);
  }

  getService(serviceName: string): ServiceDefinition | undefined {
    return this.services.get(serviceName);
  }

  getAllServices(): ServiceDefinition[] {
    return Array.from(this.services.values());
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isRunning) {
        reject(new Error('gRPC server is already running'));
        return;
      }

      const bindAddress = `${this.config.host}:${this.config.port}`;

      this.server.bindAsync(bindAddress, this.config.credentials, (error, port) => {
        if (error) {
          this.emit('error', error);
          reject(error);
          return;
        }

        this.server.start();
        this.isRunning = true;
        this.emit('started', {
          host: this.config.host,
          port: port,
          address: `${this.config.host}:${port}`,
        });
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isRunning) {
        resolve();
        return;
      }

      this.server.tryShutdown(() => {
        this.isRunning = false;
        this.emit('stopped');
        resolve();
      });
    });
  }

  forceStop(): void {
    this.server.forceShutdown();
    this.isRunning = false;
    this.emit('forceStopped');
  }

  getServer(): grpc.Server {
    return this.server;
  }

  getStatus(): { isRunning: boolean; host: string; port: number; services: string[] } {
    return {
      isRunning: this.isRunning,
      host: this.config.host,
      port: this.config.port,
      services: Array.from(this.services.keys()),
    };
  }

  static createClient<T>(
    address: string,
    serviceConstructor: new (
      address: string,
      credentials: grpc.ChannelCredentials,
      options?: object
    ) => T,
    credentials?: grpc.ChannelCredentials,
    options?: object
  ): T {
    return new serviceConstructor(
      address,
      credentials || grpc.credentials.createInsecure(),
      options
    );
  }
}
