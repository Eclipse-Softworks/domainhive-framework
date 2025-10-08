import { EventEmitter } from 'events';
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4
}
export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    message: string;
    context?: string;
    metadata?: Record<string, any>;
    error?: Error;
}
export interface LoggingConfig {
    minLevel?: LogLevel;
    enableConsole?: boolean;
    enableFile?: boolean;
    logDirectory?: string;
    maxFileSize?: number;
    maxFiles?: number;
}
export declare class LoggingModule extends EventEmitter {
    private config;
    private currentLogFile?;
    private currentFileSize;
    private logCount;
    constructor(config?: LoggingConfig);
    private initializeFileLogging;
    private rotateLogFile;
    private cleanupOldLogs;
    private shouldLog;
    private formatLogEntry;
    private writeToConsole;
    private writeToFile;
    private log;
    debug(message: string, context?: string, metadata?: Record<string, any>): void;
    info(message: string, context?: string, metadata?: Record<string, any>): void;
    warn(message: string, context?: string, metadata?: Record<string, any>): void;
    error(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void;
    fatal(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void;
    setLevel(level: LogLevel): void;
    getLogCount(): number;
    getCurrentLogFile(): string | undefined;
}
