import { EventEmitter } from 'node:events';
import { Service } from '../../interfaces/Service';
import { ServiceRegistry } from '../../interfaces/ServiceRegistry';
import { ServiceCriteria } from '../../interfaces/ServiceCriteria';

export class MicroserviceModule extends EventEmitter {
  private services: Service[];
  private serviceRegistry: ServiceRegistry;

  constructor() {
    super();
    this.services = [];
    this.serviceRegistry = new ServiceRegistry();
  }

  registerService(service: Service) {
    this.serviceRegistry.add(service);
    this.services.push(service);
    this.emit('serviceRegistered', service);
  }

  discoverServices(criteria: ServiceCriteria) {
    return this.serviceRegistry.discover(criteria);
  }

  getService(serviceId: string): Service | undefined {
    return this.serviceRegistry.getService(serviceId);
  }

  getAllServices(): Service[] {
    return this.serviceRegistry.getAllServices();
  }
}