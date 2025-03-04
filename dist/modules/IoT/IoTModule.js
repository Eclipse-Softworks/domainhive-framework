"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IoTModule = void 0;
const MQTTProtocol_1 = require("./protocols/MQTTProtocol");
const events_1 = require("events");
class IoTModule extends events_1.EventEmitter {
    constructor() {
        super();
        this.devices = new Map();
        this.protocols = new Map();
        // Register default protocols
        this.registerProtocol(new MQTTProtocol_1.MQTTProtocol());
    }
    registerProtocol(protocol) {
        this.protocols.set(protocol.name, protocol);
    }
    async connectDevice(deviceId, config) {
        const protocol = this.protocols.get(config.protocol);
        if (!protocol) {
            throw new Error(`Protocol ${config.protocol} not supported`);
        }
        await protocol.connect(config.connectionConfig);
        const device = {
            id: deviceId,
            type: config.type,
            status: 'connected',
            protocol: config.protocol,
            lastSeen: new Date(),
            metadata: {}
        };
        this.devices.set(deviceId, device);
        this.emit('deviceConnected', device);
        return device;
    }
    async sendToDevice(deviceId, data) {
        const device = this.devices.get(deviceId);
        if (!device) {
            throw new Error(`Device ${deviceId} not found`);
        }
        const protocol = this.protocols.get(device.protocol);
        if (!protocol) {
            throw new Error(`Protocol ${device.protocol} not found`);
        }
        await protocol.send(data);
        device.lastSeen = new Date();
    }
    getDevice(deviceId) {
        return this.devices.get(deviceId);
    }
    getAllDevices() {
        return Array.from(this.devices.values());
    }
}
exports.IoTModule = IoTModule;
