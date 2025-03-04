import { EventEmitter } from 'events';
export declare class DomainHive extends EventEmitter {
    private static instance;
    private modules;
    private config;
    private constructor();
    static getInstance(): DomainHive;
    registerModule(name: string, module: any): void;
    getModule<T>(name: string): T;
    setConfig(config: Record<string, any>): void;
    getConfig(): Record<string, any>;
}
