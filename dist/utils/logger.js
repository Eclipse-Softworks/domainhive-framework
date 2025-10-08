"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor(context = 'App', minLevel = LogLevel.INFO) {
        this.handlers = [];
        this.context = context;
        this.minLevel = minLevel;
        // Default console handler
        this.addHandler((entry) => {
            const levelColors = {
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
    shouldLog(level) {
        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        return levels.indexOf(level) >= levels.indexOf(this.minLevel);
    }
    log(level, message, metadata) {
        if (!this.shouldLog(level))
            return;
        const entry = {
            timestamp: new Date(),
            level,
            message,
            context: this.context,
            metadata
        };
        this.handlers.forEach(handler => handler(entry));
    }
    addHandler(handler) {
        this.handlers.push(handler);
    }
    setLevel(level) {
        this.minLevel = level;
    }
    debug(message, metadata) {
        this.log(LogLevel.DEBUG, message, metadata);
    }
    info(message, metadata) {
        this.log(LogLevel.INFO, message, metadata);
    }
    warn(message, metadata) {
        this.log(LogLevel.WARN, message, metadata);
    }
    error(message, metadata) {
        this.log(LogLevel.ERROR, message, metadata);
    }
    child(context) {
        const childLogger = new Logger(`${this.context}:${context}`, this.minLevel);
        childLogger.handlers = [...this.handlers];
        return childLogger;
    }
}
exports.Logger = Logger;
// Default logger instance
exports.logger = new Logger();
