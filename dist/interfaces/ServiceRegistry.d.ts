import { Service } from './Service';
import { ServiceCriteria } from './ServiceCriteria';
export declare class ServiceRegistry {
    private services;
    constructor();
    add(service: Service): void;
    remove(serviceId: string): void;
    discover(criteria: ServiceCriteria): Service[];
    getService(serviceId: string): Service | undefined;
    getAllServices(): Service[];
}
