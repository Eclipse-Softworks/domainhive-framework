export declare enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}
export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    message: string;
    context?: string;
    metadata?: Record<string, any>;
}
export declare class Logger {
    private context;
    private minLevel;
    private handlers;
    constructor(context?: string, minLevel?: LogLevel);
    private shouldLog;
    private log;
    addHandler(handler: (entry: LogEntry) => void): void;
    setLevel(level: LogLevel): void;
    debug(message: string, metadata?: Record<string, any>): void;
    info(message: string, metadata?: Record<string, any>): void;
    warn(message: string, metadata?: Record<string, any>): void;
    error(message: string, metadata?: Record<string, any>): void;
    child(context: string): Logger;
}
export declare const logger: Logger;
