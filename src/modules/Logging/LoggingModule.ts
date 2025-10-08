import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
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
  maxFileSize?: number; // in bytes
  maxFiles?: number;
}

export class LoggingModule extends EventEmitter {
  private config: LoggingConfig;
  private currentLogFile?: string;
  private currentFileSize: number = 0;
  private logCount: number = 0;

  constructor(config: LoggingConfig = {}) {
    super();
    this.config = {
      minLevel: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      logDirectory: './logs',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      ...config
    };

    if (this.config.enableFile) {
      this.initializeFileLogging();
    }
  }

  private initializeFileLogging(): void {
    const logDir = this.config.logDirectory!;
    
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.rotateLogFile();
  }

  private rotateLogFile(): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.currentLogFile = path.join(this.config.logDirectory!, `app-${timestamp}.log`);
    this.currentFileSize = 0;

    // Clean up old log files
    this.cleanupOldLogs();
  }

  private cleanupOldLogs(): void {
    const logDir = this.config.logDirectory!;
    const files = fs.readdirSync(logDir)
      .filter(f => f.startsWith('app-') && f.endsWith('.log'))
      .map(f => ({
        name: f,
        path: path.join(logDir, f),
        time: fs.statSync(path.join(logDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    // Remove oldest files if exceeding maxFiles
    if (files.length > this.config.maxFiles!) {
      files.slice(this.config.maxFiles!).forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.minLevel!;
  }

  private formatLogEntry(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp.toISOString();
    const context = entry.context ? `[${entry.context}]` : '';
    const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
    const error = entry.error ? `\n${entry.error.stack}` : '';
    
    return `${timestamp} ${levelName} ${context} ${entry.message}${metadata}${error}`;
  }

  private writeToConsole(entry: LogEntry): void {
    const levelColors: Record<number, string> = {
      [LogLevel.DEBUG]: '\x1b[36m',
      [LogLevel.INFO]: '\x1b[32m',
      [LogLevel.WARN]: '\x1b[33m',
      [LogLevel.ERROR]: '\x1b[31m',
      [LogLevel.FATAL]: '\x1b[35m'
    };
    const reset = '\x1b[0m';
    const color = levelColors[entry.level];
    
    console.log(`${color}${this.formatLogEntry(entry)}${reset}`);
  }

  private writeToFile(entry: LogEntry): void {
    if (!this.currentLogFile) return;

    const logLine = this.formatLogEntry(entry) + '\n';
    const logSize = Buffer.byteLength(logLine);

    // Check if rotation is needed
    if (this.currentFileSize + logSize > this.config.maxFileSize!) {
      this.rotateLogFile();
    }

    fs.appendFileSync(this.currentLogFile, logLine);
    this.currentFileSize += logSize;
  }

  private log(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      metadata,
      error
    };

    if (this.config.enableConsole) {
      this.writeToConsole(entry);
    }

    if (this.config.enableFile) {
      this.writeToFile(entry);
    }

    this.emit('log', entry);
    this.logCount++;
  }

  debug(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  info(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  error(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, metadata, error);
  }

  fatal(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, context, metadata, error);
  }

  setLevel(level: LogLevel): void {
    this.config.minLevel = level;
  }

  getLogCount(): number {
    return this.logCount;
  }

  getCurrentLogFile(): string | undefined {
    return this.currentLogFile;
  }
}
