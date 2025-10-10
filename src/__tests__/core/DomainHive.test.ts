/**
 * Unit tests for DomainHive core
 */

import { DomainHive } from '../../core/DomainHive';

describe('DomainHive Core', () => {
  let hive: DomainHive;

  beforeEach(() => {
    hive = DomainHive.getInstance();
  });

  afterEach(() => {
    // Reset the singleton for next test
    (DomainHive as any).instance = undefined;
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = DomainHive.getInstance();
      const instance2 = DomainHive.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Configuration', () => {
    it('should set and get configuration', () => {
      const config = {
        app: {
          name: 'Test App',
          version: '1.0.0',
        },
      };
      hive.setConfig(config);
      const storedConfig = hive.getConfig();
      expect(storedConfig.app.name).toBe('Test App');
      expect(storedConfig.app.version).toBe('1.0.0');
    });

    it('should merge configuration', () => {
      hive.setConfig({ key1: 'value1' });
      hive.setConfig({ key2: 'value2' });
      const config = hive.getConfig();
      expect(config.key1).toBe('value1');
      expect(config.key2).toBe('value2');
    });

    it('should support nested configuration', () => {
      hive.setConfig({
        database: {
          connection: {
            host: 'localhost',
            port: 5432,
          },
        },
      });
      const config = hive.getConfig();
      expect(config.database.connection.host).toBe('localhost');
      expect(config.database.connection.port).toBe(5432);
    });
  });

  describe('Module Registry', () => {
    it('should register a module', () => {
      const mockModule = { name: 'test-module' };
      hive.registerModule('test', mockModule);
      expect(hive.getModule('test')).toBe(mockModule);
    });

    it('should throw error for non-existent modules', () => {
      expect(() => hive.getModule('non-existent')).toThrow('Module non-existent not found');
    });

    it('should emit event when module is registered', (done) => {
      const mockModule = { name: 'test' };
      hive.on('moduleRegistered', (data) => {
        expect(data.name).toBe('test');
        expect(data.module).toBe(mockModule);
        done();
      });
      hive.registerModule('test', mockModule);
    });
  });

  describe('Event System', () => {
    it('should emit and handle events', (done) => {
      hive.on('test-event', (data) => {
        expect(data).toEqual({ message: 'test' });
        done();
      });
      hive.emit('test-event', { message: 'test' });
    });

    it('should support once listeners', () => {
      let callCount = 0;
      hive.once('once-event', () => {
        callCount++;
      });
      hive.emit('once-event');
      hive.emit('once-event');
      expect(callCount).toBe(1);
    });
  });
});
