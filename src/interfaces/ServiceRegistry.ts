import { Service } from './Service';
import { ServiceCriteria } from './ServiceCriteria';

export class ServiceRegistry {
  private services: Map<string, Service>;

  constructor() {
    this.services = new Map();
  }

  add(service: Service): void {
    this.services.set(service.id, service);
  }

  remove(serviceId: string): void {
    this.services.delete(serviceId);
  }

  discover(criteria: ServiceCriteria): Service[] {
    return Array.from(this.services.values()).filter((service) => {
      if (criteria.name && service.name !== criteria.name) return false;
      if (criteria.version && service.version !== criteria.version) return false;
      return true;
    });
  }

  getService(serviceId: string): Service | undefined {
    return this.services.get(serviceId);
  }

  getAllServices(): Service[] {
    return Array.from(this.services.values());
  }
}
