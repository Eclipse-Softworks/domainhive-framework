import aedes from 'aedes';
import net from 'net';

const broker = new aedes();
const port = 1883;
const server = net.createServer(broker.handle);

export const brokerReady = new Promise<void>((resolve, reject) => {
  server.listen(port, (err?: Error) => {
    if (err) {
      console.error("Failed to start Aedes broker", err);
      return reject(err);
    }
    console.log(`Aedes MQTT broker started and listening on port ${port}`);
    resolve();
  });
});

import { Client } from 'aedes';

broker.on('client', (client: Client) => {
  console.log('Client connected:', client.id);
});

export default broker;
