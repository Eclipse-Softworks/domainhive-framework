"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MicroserviceModule = void 0;
const node_events_1 = require("node:events");
const ServiceRegistry_1 = require("../../interfaces/ServiceRegistry");
class MicroserviceModule extends node_events_1.EventEmitter {
    constructor() {
        super();
        this.services = [];
        this.serviceRegistry = new ServiceRegistry_1.ServiceRegistry();
    }
    registerService(service) {
        this.serviceRegistry.add(service);
        this.services.push(service);
        this.emit('serviceRegistered', service);
    }
    discoverServices(criteria) {
        return this.serviceRegistry.discover(criteria);
    }
    getService(serviceId) {
        return this.serviceRegistry.getService(serviceId);
    }
    getAllServices() {
        return this.serviceRegistry.getAllServices();
    }
}
exports.MicroserviceModule = MicroserviceModule;
