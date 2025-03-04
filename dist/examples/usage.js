"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mqtt_broker_1 = require("../broker/mqtt-broker");
const DomainHive_1 = require("../core/DomainHive");
const IoTModule_1 = require("../modules/IoT/IoTModule");
async function main() {
    // Wait until the MQTT Broker is ready
    await mqtt_broker_1.brokerReady;
    const hive = DomainHive_1.DomainHive.getInstance();
    hive.setConfig({
        mqtt: {
            brokerUrl: 'mqtt://localhost:1883',
            options: {
                clientId: 'domainhive-client'
            }
        }
    });
    const iotModule = new IoTModule_1.IoTModule();
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
    }
    catch (error) {
        console.error('Error:', error);
    }
}
main();
