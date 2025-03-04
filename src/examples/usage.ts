import { brokerReady } from '../broker/mqtt-broker';
import { DomainHive } from '../core/DomainHive';
import { IoTModule } from '../modules/IoT/IoTModule';

async function main() {
  // Wait until the MQTT Broker is ready
  await brokerReady;

  const hive = DomainHive.getInstance();

  hive.setConfig({
    mqtt: {
      brokerUrl: 'mqtt://localhost:1883',
      options: {
        clientId: 'domainhive-client'
      }
    }
  });

  const iotModule = new IoTModule();
  hive.registerModule('iot', iotModule);

  try {
    const device = await iotModule.connectDevice('device1', {
      type: 'sensor',
      protocol: 'mqtt',
      connectionConfig: {
        brokerUrl: hive.getConfig().mqtt.brokerUrl,
        options: hive.getConfig().mqtt.options
      }
    });

    console.log('Device connected:', device);

    await iotModule.sendToDevice('device1', {
      topic: 'sensors/temperature',
      message: { value: 25.5, unit: 'C' }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

main();