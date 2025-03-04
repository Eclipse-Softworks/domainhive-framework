"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.brokerReady = void 0;
const aedes_1 = __importDefault(require("aedes"));
const net_1 = __importDefault(require("net"));
const broker = new aedes_1.default();
const port = 1883;
const server = net_1.default.createServer(broker.handle);
exports.brokerReady = new Promise((resolve, reject) => {
    server.listen(port, (err) => {
        if (err) {
            console.error("Failed to start Aedes broker", err);
            return reject(err);
        }
        console.log(`Aedes MQTT broker started and listening on port ${port}`);
        resolve();
    });
});
broker.on('client', (client) => {
    console.log('Client connected:', client.id);
});
exports.default = broker;
