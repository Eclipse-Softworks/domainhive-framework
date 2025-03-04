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
exports.MQTTProtocol = void 0;
const mqtt = __importStar(require("mqtt"));
class MQTTProtocol {
    constructor() {
        this.client = null;
        this.name = 'mqtt';
    }
    async connect(config) {
        return new Promise((resolve, reject) => {
            this.client = mqtt.connect(config.brokerUrl, config.options);
            this.client.on('connect', () => resolve());
            this.client.on('error', (err) => reject(err));
        });
    }
    async disconnect() {
        if (this.client) {
            return new Promise((resolve) => {
                this.client.end(false, () => resolve());
            });
        }
        return Promise.resolve();
    }
    async send(data) {
        if (!this.client)
            throw new Error('Not connected');
        return new Promise((resolve, reject) => {
            this.client.publish(data.topic, JSON.stringify(data.message), (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    receive(callback) {
        if (!this.client)
            throw new Error('Not connected');
        this.client.on('message', (topic, message) => {
            callback({
                topic,
                message: JSON.parse(message.toString())
            });
        });
    }
}
exports.MQTTProtocol = MQTTProtocol;
