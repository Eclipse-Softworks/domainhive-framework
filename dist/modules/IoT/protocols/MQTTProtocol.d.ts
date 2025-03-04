import * as mqtt from 'mqtt';
import { Protocol } from '../../../interfaces/Protocol';
export declare class MQTTProtocol implements Protocol {
    private client;
    name: string;
    connect(config: {
        brokerUrl: string;
        options?: mqtt.IClientOptions;
    }): Promise<void>;
    disconnect(): Promise<void>;
    send(data: {
        topic: string;
        message: any;
    }): Promise<void>;
    receive(callback: (data: any) => void): void;
}
