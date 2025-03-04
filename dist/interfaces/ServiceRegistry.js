"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRegistry = void 0;
class ServiceRegistry {
    constructor() {
        this.services = new Map();
    }
    add(service) {
        this.services.set(service.id, service);
    }
    remove(serviceId) {
        this.services.delete(serviceId);
    }
    discover(criteria) {
        return Array.from(this.services.values()).filter(service => {
            if (criteria.name && service.name !== criteria.name)
                return false;
            if (criteria.version && service.version !== criteria.version)
                return false;
            return true;
        });
    }
    getService(serviceId) {
        return this.services.get(serviceId);
    }
    getAllServices() {
        return Array.from(this.services.values());
    }
}
exports.ServiceRegistry = ServiceRegistry;
