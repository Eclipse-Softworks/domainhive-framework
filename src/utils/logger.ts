export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, any>;
}

export class Logger {
  private context: string;
  private minLevel: LogLevel;
  private handlers: ((entry: LogEntry) => void)[] = [];

  constructor(context: string = 'App', minLevel: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.minLevel = minLevel;
    
    // Default console handler
    this.addHandler((entry) => {
      const levelColors: Record<LogLevel, string> = {
        DEBUG: '\x1b[36m',
        INFO: '\x1b[32m',
        WARN: '\x1b[33m',
        ERROR: '\x1b[31m'
      };
      const reset = '\x1b[0m';
      const color = levelColors[entry.level];
      const timestamp = entry.timestamp.toISOString();
      const context = entry.context ? `[${entry.context}]` : '';
      const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
      
      console.log(`${color}${timestamp} ${entry.level}${reset} ${context} ${entry.message}${metadata}`);
    });
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: this.context,
      metadata
    };

    this.handlers.forEach(handler => handler(entry));
  }

  addHandler(handler: (entry: LogEntry) => void): void {
    this.handlers.push(handler);
  }

  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, metadata);
  }

  child(context: string): Logger {
    const childLogger = new Logger(`${this.context}:${context}`, this.minLevel);
    childLogger.handlers = [...this.handlers];
    return childLogger;
  }
}

// Default logger instance
export const logger = new Logger();
