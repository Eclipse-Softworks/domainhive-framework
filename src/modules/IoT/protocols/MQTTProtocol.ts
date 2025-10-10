import * as mqtt from 'mqtt';
import { Protocol } from '../../../interfaces/Protocol';

export class MQTTProtocol implements Protocol {
  private client: mqtt.MqttClient | null = null;
  name = 'mqtt';

  async connect(config: { brokerUrl: string; options?: mqtt.IClientOptions }): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = mqtt.connect(config.brokerUrl, config.options);
      this.client.on('connect', () => resolve());
      this.client.on('error', (err: Error) => reject(err));
    });
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      return new Promise((resolve) => {
        this.client!.end(false, () => resolve());
      });
    }
    return Promise.resolve();
  }

  async send(data: { topic: string; message: any }): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    return new Promise((resolve, reject) => {
      this.client!.publish(data.topic, JSON.stringify(data.message), (error?: Error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  receive(callback: (data: any) => void): void {
    if (!this.client) throw new Error('Not connected');
    this.client.on('message', (topic: string, message: Buffer) => {
      callback({
        topic,
        message: JSON.parse(message.toString()),
      });
    });
  }
}
