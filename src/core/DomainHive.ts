import { EventEmitter } from 'events';

export class DomainHive extends EventEmitter {
  private static instance: DomainHive;
  private modules: Map<string, any>;
  private config: Record<string, any>;

  private constructor() {
    super();
    this.modules = new Map();
    this.config = {};
  }

  static getInstance(): DomainHive {
    if (!DomainHive.instance) {
      DomainHive.instance = new DomainHive();
    }
    return DomainHive.instance;
  }

  registerModule(name: string, module: any): void {
    this.modules.set(name, module);
    super.emit('moduleRegistered', { name, module });
  }

  getModule<T>(name: string): T {
    const module = this.modules.get(name);
    if (!module) {
      throw new Error(`Module ${name} not found`);
    }
    return module as T;
  }

  setConfig(config: Record<string, any>): void {
    this.config = { ...this.config, ...config };
    super.emit('configUpdated', this.config);
  }

  getConfig(): Record<string, any> {
    return this.config;
  }
}
