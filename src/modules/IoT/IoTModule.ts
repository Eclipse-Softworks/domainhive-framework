import { Device } from '../../interfaces/Device';
import { Protocol } from '../../interfaces/Protocol';
import { MQTTProtocol } from './protocols/MQTTProtocol';
import { EventEmitter } from 'events';

export class IoTModule extends EventEmitter {
  private devices: Map<string, Device>;
  private protocols: Map<string, Protocol>;

  constructor() {
    super();
    this.devices = new Map();
    this.protocols = new Map();
    
    // Register default protocols
    this.registerProtocol(new MQTTProtocol());
  }

  registerProtocol(protocol: Protocol): void {
    this.protocols.set(protocol.name, protocol);
  }

  async connectDevice(deviceId: string, config: {
    type: string;
    protocol: string;
    connectionConfig: any;
  }): Promise<Device> {
    const protocol = this.protocols.get(config.protocol);
    if (!protocol) {
      throw new Error(`Protocol ${config.protocol} not supported`);
    }

    await protocol.connect(config.connectionConfig);

    const device: Device = {
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

  async sendToDevice(deviceId: string, data: any): Promise<void> {
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

  getDevice(deviceId: string): Device | undefined {
    return this.devices.get(deviceId);
  }

  getAllDevices(): Device[] {
    return Array.from(this.devices.values());
  }
}
