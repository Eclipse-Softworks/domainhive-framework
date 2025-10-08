"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingModule = exports.LogLevel = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 4] = "FATAL";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class LoggingModule extends events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.currentFileSize = 0;
        this.logCount = 0;
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
    initializeFileLogging() {
        const logDir = this.config.logDirectory;
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        this.rotateLogFile();
    }
    rotateLogFile() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.currentLogFile = path.join(this.config.logDirectory, `app-${timestamp}.log`);
        this.currentFileSize = 0;
        // Clean up old log files
        this.cleanupOldLogs();
    }
    cleanupOldLogs() {
        const logDir = this.config.logDirectory;
        const files = fs.readdirSync(logDir)
            .filter(f => f.startsWith('app-') && f.endsWith('.log'))
            .map(f => ({
            name: f,
            path: path.join(logDir, f),
            time: fs.statSync(path.join(logDir, f)).mtime.getTime()
        }))
            .sort((a, b) => b.time - a.time);
        // Remove oldest files if exceeding maxFiles
        if (files.length > this.config.maxFiles) {
            files.slice(this.config.maxFiles).forEach(file => {
                fs.unlinkSync(file.path);
            });
        }
    }
    shouldLog(level) {
        return level >= this.config.minLevel;
    }
    formatLogEntry(entry) {
        const levelName = LogLevel[entry.level];
        const timestamp = entry.timestamp.toISOString();
        const context = entry.context ? `[${entry.context}]` : '';
        const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
        const error = entry.error ? `\n${entry.error.stack}` : '';
        return `${timestamp} ${levelName} ${context} ${entry.message}${metadata}${error}`;
    }
    writeToConsole(entry) {
        const levelColors = {
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
    writeToFile(entry) {
        if (!this.currentLogFile)
            return;
        const logLine = this.formatLogEntry(entry) + '\n';
        const logSize = Buffer.byteLength(logLine);
        // Check if rotation is needed
        if (this.currentFileSize + logSize > this.config.maxFileSize) {
            this.rotateLogFile();
        }
        fs.appendFileSync(this.currentLogFile, logLine);
        this.currentFileSize += logSize;
    }
    log(level, message, context, metadata, error) {
        if (!this.shouldLog(level))
            return;
        const entry = {
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
    debug(message, context, metadata) {
        this.log(LogLevel.DEBUG, message, context, metadata);
    }
    info(message, context, metadata) {
        this.log(LogLevel.INFO, message, context, metadata);
    }
    warn(message, context, metadata) {
        this.log(LogLevel.WARN, message, context, metadata);
    }
    error(message, error, context, metadata) {
        this.log(LogLevel.ERROR, message, context, metadata, error);
    }
    fatal(message, error, context, metadata) {
        this.log(LogLevel.FATAL, message, context, metadata, error);
    }
    setLevel(level) {
        this.config.minLevel = level;
    }
    getLogCount() {
        return this.logCount;
    }
    getCurrentLogFile() {
        return this.currentLogFile;
    }
}
exports.LoggingModule = LoggingModule;
