"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainHive = void 0;
const events_1 = require("events");
class DomainHive extends events_1.EventEmitter {
    constructor() {
        super();
        this.modules = new Map();
        this.config = {};
    }
    static getInstance() {
        if (!DomainHive.instance) {
            DomainHive.instance = new DomainHive();
        }
        return DomainHive.instance;
    }
    registerModule(name, module) {
        this.modules.set(name, module);
        super.emit('moduleRegistered', { name, module });
    }
    getModule(name) {
        const module = this.modules.get(name);
        if (!module) {
            throw new Error(`Module ${name} not found`);
        }
        return module;
    }
    setConfig(config) {
        this.config = { ...this.config, ...config };
        super.emit('configUpdated', this.config);
    }
    getConfig() {
        return this.config;
    }
}
exports.DomainHive = DomainHive;
