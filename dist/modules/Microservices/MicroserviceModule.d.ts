import { EventEmitter } from 'node:events';
import { Service } from '../../interfaces/Service';
import { ServiceCriteria } from '../../interfaces/ServiceCriteria';
export declare class MicroserviceModule extends EventEmitter {
    private services;
    private serviceRegistry;
    constructor();
    registerService(service: Service): void;
    discoverServices(criteria: ServiceCriteria): Service[];
    getService(serviceId: string): Service | undefined;
    getAllServices(): Service[];
}
