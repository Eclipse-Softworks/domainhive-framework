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
exports.httpClient = exports.HttpClient = void 0;
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const url_1 = require("url");
class HttpClient {
    constructor(config = {}) {
        this.config = {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'DomainHive-Framework/1.0.0'
            },
            ...config
        };
    }
    async request(url, options = {}) {
        const fullUrl = this.config.baseURL ? new url_1.URL(url, this.config.baseURL).toString() : url;
        const parsedUrl = new url_1.URL(fullUrl);
        const isHttps = parsedUrl.protocol === 'https:';
        const client = isHttps ? https : http;
        const mergedHeaders = {
            ...this.config.headers,
            ...options.headers
        };
        const requestOptions = {
            method: options.method || 'GET',
            headers: mergedHeaders,
            timeout: options.timeout || this.config.timeout
        };
        return new Promise((resolve, reject) => {
            const req = client.request(fullUrl, requestOptions, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const parsedData = mergedHeaders['Content-Type']?.includes('application/json')
                            ? JSON.parse(data || '{}')
                            : data;
                        const response = {
                            status: res.statusCode || 0,
                            statusText: res.statusMessage || '',
                            headers: res.headers,
                            data: parsedData
                        };
                        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(response);
                        }
                        else {
                            reject(new Error(`HTTP Error: ${res.statusCode} ${res.statusMessage}`));
                        }
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            });
            req.on('error', (error) => {
                reject(error);
            });
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            if (options.body) {
                const bodyString = typeof options.body === 'string'
                    ? options.body
                    : JSON.stringify(options.body);
                req.write(bodyString);
            }
            req.end();
        });
    }
    async get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    }
    async post(url, body, options = {}) {
        return this.request(url, { ...options, method: 'POST', body });
    }
    async put(url, body, options = {}) {
        return this.request(url, { ...options, method: 'PUT', body });
    }
    async delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    }
    async patch(url, body, options = {}) {
        return this.request(url, { ...options, method: 'PATCH', body });
    }
    setHeader(key, value) {
        this.config.headers = this.config.headers || {};
        this.config.headers[key] = value;
    }
    setAuthToken(token) {
        this.setHeader('Authorization', `Bearer ${token}`);
    }
}
exports.HttpClient = HttpClient;
// Default client instance
exports.httpClient = new HttpClient();
