# DomainHive Framework - Usage Guide

This guide demonstrates how to use the DomainHive Framework for everyday development tasks.

## Quick Start

```typescript
import { DomainHive, logger } from 'domainhive-framework';

const hive = DomainHive.getInstance();
hive.setConfig({ appName: 'My App' });

logger.info('Application started!');
```

## Table of Contents

- [Core Framework](#core-framework)
- [Authentication](#authentication)
- [Logging](#logging)
- [Data Validation](#data-validation)
- [HTTP Client](#http-client)
- [Utility Helpers](#utility-helpers)
- [Error Handling](#error-handling)
- [IoT Module](#iot-module)
- [Microservices](#microservices)

---

## Core Framework

The `DomainHive` class is the central orchestrator for all modules and configuration.

```typescript
import { DomainHive } from 'domainhive-framework';

// Get singleton instance
const hive = DomainHive.getInstance();

// Set configuration
hive.setConfig({
  app: {
    name: 'My Application',
    version: '1.0.0',
    environment: 'production'
  }
});

// Get configuration
const config = hive.getConfig();

// Register modules
hive.registerModule('myModule', new MyModule());

// Get modules
const myModule = hive.getModule<MyModule>('myModule');
```

---

## Authentication

Secure authentication with JWT-like tokens.

```typescript
import { AuthModule } from 'domainhive-framework';

// Initialize
const auth = new AuthModule({
  secretKey: 'your-secret-key',
  tokenExpiration: 3600 // 1 hour
});

// Register a user
const user = await auth.register('username', 'email@example.com', 'password', ['user', 'admin']);

// Login
const { user, token } = await auth.login('username', 'password');

// Verify token
const verifiedUser = await auth.verifyAuth(token);

// Check roles
if (auth.hasRole(user, 'admin')) {
  // User has admin role
}

// Check multiple roles
if (auth.hasAnyRole(user, ['admin', 'moderator'])) {
  // User has at least one of the roles
}

// Update user
await auth.updateUser(user.id, {
  email: 'newemail@example.com',
  roles: ['user', 'admin', 'superuser']
});

// Logout
await auth.logout(token);
```

---

## Logging

Comprehensive logging with multiple levels and file support.

### Utility Logger (Simple)

```typescript
import { logger } from 'domainhive-framework';

logger.debug('Debug message', { detail: 'some detail' });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', { error: 'details' });

// Create child logger with context
const dbLogger = logger.child('Database');
dbLogger.info('Connection established');
```

### Logging Module (Advanced)

```typescript
import { LoggingModule, LogLevel } from 'domainhive-framework';

const logging = new LoggingModule({
  minLevel: LogLevel.INFO,
  enableConsole: true,
  enableFile: true,
  logDirectory: './logs',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5
});

logging.info('Info message', 'Context');
logging.warn('Warning', 'Context', { key: 'value' });
logging.error('Error occurred', new Error('Something went wrong'), 'Context');

// Set log level dynamically
logging.setLevel(LogLevel.DEBUG);
```

---

## Data Validation

Powerful data validation with custom rules.

```typescript
import { Validator } from 'domainhive-framework';

// Define schema
const userSchema = {
  username: {
    required: true,
    type: 'string',
    min: 3,
    max: 20,
    pattern: /^[a-zA-Z0-9_]+$/
  },
  email: {
    required: true,
    type: 'string',
    custom: (value: string) => Validator.email(value) || 'Invalid email'
  },
  age: {
    type: 'number',
    min: 18,
    max: 120
  }
};

// Create validator
const validator = new Validator(userSchema);

// Validate data
const result = validator.validate({
  username: 'john_doe',
  email: 'john@example.com',
  age: 25
});

if (!result.valid) {
  console.error('Validation errors:', result.errors);
  // [{ field: 'email', message: 'Invalid email', rule: 'custom' }]
}

// Use common schemas
import { commonSchemas } from 'domainhive-framework';

const emailValidator = new Validator(commonSchemas.email);
const passwordValidator = new Validator(commonSchemas.password);
```

---

## HTTP Client

Easy-to-use HTTP client for API requests.

```typescript
import { HttpClient, httpClient } from 'domainhive-framework';

// Using default client
const response = await httpClient.get('https://api.example.com/users');
console.log(response.data);

// POST request
await httpClient.post('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// With authentication
httpClient.setAuthToken('your-jwt-token');
const data = await httpClient.get('https://api.example.com/protected');

// Custom client instance
const apiClient = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'X-API-Key': 'your-api-key'
  }
});

const users = await apiClient.get('/users');
const newUser = await apiClient.post('/users', { name: 'Jane' });
await apiClient.put('/users/1', { name: 'Jane Updated' });
await apiClient.delete('/users/1');
```

---

## Utility Helpers

Common helper functions for everyday tasks.

```typescript
import {
  deepClone,
  debounce,
  throttle,
  sleep,
  retry,
  uuid,
  isEmpty,
  flatten,
  pick,
  omit,
  chunk,
  unique
} from 'domainhive-framework';

// Deep clone
const cloned = deepClone({ a: 1, b: { c: 2 } });

// Generate UUID
const id = uuid();

// Sleep/delay
await sleep(1000); // 1 second

// Retry with exponential backoff
const result = await retry(
  async () => {
    return await someUnreliableOperation();
  },
  {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    factor: 2
  }
);

// Debounce function
const debouncedSearch = debounce((query: string) => {
  console.log('Searching for:', query);
}, 300);

// Throttle function
const throttledScroll = throttle(() => {
  console.log('Scrolling...');
}, 100);

// Check if empty
isEmpty(null); // true
isEmpty(''); // true
isEmpty([]); // true
isEmpty({}); // true

// Flatten nested object
const flat = flatten({ a: { b: { c: 1 } } });
// { 'a.b.c': 1 }

// Pick/omit properties
const user = { id: 1, name: 'John', email: 'john@example.com', password: 'secret' };
const publicUser = omit(user, ['password']);
const credentials = pick(user, ['email', 'password']);

// Chunk array
const items = [1, 2, 3, 4, 5, 6, 7];
const pages = chunk(items, 3); // [[1,2,3], [4,5,6], [7]]

// Get unique values
const uniqueValues = unique([1, 2, 2, 3, 3, 4]); // [1, 2, 3, 4]
```

---

## Error Handling

Custom error types for better error management.

```typescript
import {
  DomainHiveError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  TimeoutError,
  RateLimitError,
  ServiceUnavailableError,
  asyncHandler,
  assert
} from 'domainhive-framework';

// Throw custom errors
throw new ValidationError('Invalid input', { field: 'email' });
throw new NotFoundError('User');
throw new AuthenticationError('Invalid credentials');
throw new AuthorizationError('Insufficient permissions');

// Catch and handle
try {
  // Your code
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.details);
  } else if (error instanceof NotFoundError) {
    console.log('Resource not found:', error.message);
  }
}

// Use assertions
assert(user !== null, 'User must be logged in', AuthenticationError);

// Async error handler wrapper
const safeFunction = asyncHandler(async (data: any) => {
  // Your async code that might throw
  return await processData(data);
});

// All errors will be wrapped in DomainHiveError
await safeFunction(data);
```

---

## IoT Module

Manage IoT devices with multiple protocol support.

```typescript
import { IoTModule, Device } from 'domainhive-framework';

const iot = new IoTModule();

// Connect a device
const device = await iot.connectDevice('sensor-001', {
  type: 'temperature-sensor',
  protocol: 'mqtt',
  connectionConfig: {
    brokerUrl: 'mqtt://localhost:1883',
    options: { clientId: 'sensor-001' }
  }
});

// Send data to device
await iot.sendToDevice('sensor-001', {
  topic: 'sensors/temperature',
  message: { value: 25.5, unit: 'C' }
});

// Get device
const myDevice = iot.getDevice('sensor-001');

// Get all devices
const allDevices = iot.getAllDevices();

// Listen to events
iot.on('deviceConnected', (device: Device) => {
  console.log('Device connected:', device.id);
});
```

---

## Microservices

Service registry and discovery for microservices architecture.

```typescript
import { MicroserviceModule, Service } from 'domainhive-framework';

const microservices = new MicroserviceModule();

// Register a service
microservices.registerService({
  id: 'user-service',
  name: 'User Service',
  version: '1.0.0',
  endpoints: ['http://localhost:3001/users'],
  health: async () => {
    // Check if service is healthy
    return true;
  }
});

// Discover services
const services = microservices.discoverServices({
  name: 'User Service',
  version: '1.0.0'
});

// Get specific service
const userService = microservices.getService('user-service');

// Get all services
const allServices = microservices.getAllServices();

// Listen to events
microservices.on('serviceRegistered', (service: Service) => {
  console.log('New service registered:', service.name);
});
```

---

## Complete Example

Here's a complete example combining multiple features:

```typescript
import {
  DomainHive,
  AuthModule,
  LoggingModule,
  LogLevel,
  logger,
  Validator,
  ValidationError,
  NotFoundError,
  httpClient,
  retry
} from 'domainhive-framework';

async function main() {
  // Initialize framework
  const hive = DomainHive.getInstance();
  
  hive.setConfig({
    app: { name: 'My App', version: '1.0.0' },
    auth: { secretKey: 'secret-key' }
  });

  // Setup logging
  const logging = new LoggingModule({
    minLevel: LogLevel.INFO,
    enableFile: true
  });
  hive.registerModule('logging', logging);

  // Setup authentication
  const auth = new AuthModule({
    secretKey: hive.getConfig().auth.secretKey
  });
  hive.registerModule('auth', auth);

  // Validate user input
  const userValidator = new Validator({
    email: {
      required: true,
      type: 'string',
      custom: (v) => Validator.email(v) || 'Invalid email'
    },
    password: {
      required: true,
      type: 'string',
      min: 8
    }
  });

  const userData = { email: 'user@example.com', password: 'password123' };
  const validation = userValidator.validate(userData);

  if (!validation.valid) {
    throw new ValidationError('Invalid data', validation.errors);
  }

  // Register and login
  try {
    await auth.register('username', userData.email, userData.password);
    const { token } = await auth.login('username', userData.password);
    
    logger.info('User authenticated', { token: token.substring(0, 20) });

    // Make API call with retry
    const data = await retry(
      async () => {
        httpClient.setAuthToken(token);
        return await httpClient.get('https://api.example.com/data');
      },
      { maxAttempts: 3 }
    );

    logger.info('Data fetched successfully', { data });
  } catch (error) {
    if (error instanceof ValidationError) {
      logger.error('Validation failed', { errors: error.details });
    } else if (error instanceof NotFoundError) {
      logger.error('Resource not found');
    } else {
      logger.error('Unknown error', { error });
    }
  }
}

main();
```

---

## Best Practices

1. **Use the singleton pattern for DomainHive**: Always use `DomainHive.getInstance()`.

2. **Configure early**: Set your configuration before registering modules.

3. **Use structured logging**: Always include context and metadata in log messages.

4. **Validate all inputs**: Use the Validator module for all user inputs and API data.

5. **Handle errors gracefully**: Use custom error types and handle them appropriately.

6. **Use retry for network calls**: Network operations can be unreliable; use the retry helper.

7. **Leverage TypeScript**: The framework is fully typed for better developer experience.

8. **Modular architecture**: Keep modules independent and communicate through events.

---

For more examples, see the `src/examples/` directory in the repository.
