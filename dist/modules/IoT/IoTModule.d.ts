import { Device } from '../../interfaces/Device';
import { Protocol } from '../../interfaces/Protocol';
import { EventEmitter } from 'events';
export declare class IoTModule extends EventEmitter {
    private devices;
    private protocols;
    constructor();
    registerProtocol(protocol: Protocol): void;
    connectDevice(deviceId: string, config: {
        type: string;
        protocol: string;
        connectionConfig: any;
    }): Promise<Device>;
    sendToDevice(deviceId: string, data: any): Promise<void>;
    getDevice(deviceId: string): Device | undefined;
    getAllDevices(): Device[];
}
