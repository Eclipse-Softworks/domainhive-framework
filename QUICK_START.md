# DomainHive Framework - Quick Start

Get up and running with DomainHive Framework in 5 minutes!

## Installation

```bash
npm install domainhive-framework
```

Or clone the repository:

```bash
git clone https://github.com/Eclipse-Softworks/domainhive-framework.git
cd domainhive-framework
npm install
npm run build
```

## Basic Usage

```typescript
import { DomainHive, logger } from 'domainhive-framework';

// Initialize framework
const hive = DomainHive.getInstance();

// Log a message
logger.info('Hello from DomainHive!');
```

## Common Use Cases

### 1. User Authentication

```typescript
import { AuthModule } from 'domainhive-framework';

const auth = new AuthModule({ secretKey: 'your-secret' });

// Register
await auth.register('username', 'email@example.com', 'password');

// Login
const { token } = await auth.login('username', 'password');

// Verify
const user = await auth.verifyAuth(token);
```

### 2. Data Validation

```typescript
import { Validator } from 'domainhive-framework';

const validator = new Validator({
  email: { required: true, type: 'string' },
  age: { type: 'number', min: 18 }
});

const result = validator.validate({ email: 'test@example.com', age: 25 });
console.log(result.valid); // true
```

### 3. HTTP Requests

```typescript
import { httpClient } from 'domainhive-framework';

// GET request
const response = await httpClient.get('https://api.example.com/data');

// POST request
await httpClient.post('https://api.example.com/data', { name: 'John' });
```

### 4. Logging

```typescript
import { logger } from 'domainhive-framework';

logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', { details: 'error info' });
```

### 5. Utility Helpers

```typescript
import { uuid, sleep, retry } from 'domainhive-framework';

// Generate UUID
const id = uuid();

// Sleep for 1 second
await sleep(1000);

// Retry a function
const result = await retry(async () => {
  return await unreliableOperation();
}, { maxAttempts: 3 });
```

### 6. Error Handling

```typescript
import { ValidationError, NotFoundError } from 'domainhive-framework';

try {
  throw new ValidationError('Invalid data');
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.code); // VALIDATION_ERROR
    console.log(error.statusCode); // 400
  }
}
```

## Run Examples

The framework includes comprehensive examples:

```bash
# Build the project
npm run build

# Run the basic example
npm start

# Run the comprehensive example
npm run example
```

## Project Structure

```
src/
├── core/              # Core framework (DomainHive singleton)
├── modules/           # Feature modules
│   ├── Auth/          # Authentication module
│   ├── Logging/       # Advanced logging
│   ├── IoT/           # IoT device management
│   └── Microservices/ # Service registry
├── utils/             # Utility functions
│   ├── logger.ts      # Simple logger
│   ├── helpers.ts     # Common helpers
│   ├── http-client.ts # HTTP client
│   ├── validator.ts   # Data validation
│   └── errors.ts      # Error classes
├── interfaces/        # TypeScript interfaces
└── index.ts           # Main entry point
```

## Available Modules

- **DomainHive**: Core framework singleton
- **AuthModule**: User authentication with tokens
- **LoggingModule**: Advanced logging with file support
- **IoTModule**: IoT device management and protocols
- **MicroserviceModule**: Service registry and discovery

## Available Utilities

- **Logger**: Simple structured logging
- **HttpClient**: HTTP request client
- **Validator**: Data validation engine
- **Helpers**: Common functions (uuid, sleep, retry, debounce, etc.)
- **Errors**: Custom error classes

## Next Steps

- Read the [Usage Guide](./USAGE_GUIDE.md) for detailed documentation
- Explore [examples](./src/examples/) for real-world use cases
- Check the [README](./README.md) for architecture and contributing guidelines

## Getting Help

- GitHub Issues: Report bugs or request features
- GitHub Discussions: Ask questions and share ideas
- Email: support@eclipsesoftworks.com

## License

MIT License - see [LICENSE](./LICENSE) file for details.
