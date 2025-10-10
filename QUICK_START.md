# DomainHive Framework - Quick Start

**Get a complete backend running in 5 minutes!** Perfect for hackathons, MVPs, and rapid prototyping.

## 🚀 Instant Setup

### Option 1: Run the Pre-Built Server (Fastest)

```bash
# Clone the repository
git clone https://github.com/Eclipse-Softworks/domainhive-framework.git
cd domainhive-framework

# Install and build
npm install

# Run the full-featured backend server
npm run server
```

**That's it!** You now have a complete backend with:
- ✅ Auth (login, register, verify token)
- ✅ User management with caching
- ✅ Real-time notifications
- ✅ Chat with rooms (REST + WebSocket)
- ✅ GraphQL API
- ✅ WebSocket events

Visit: http://localhost:3000 for REST API  
Visit: http://localhost:3000/graphql for GraphQL  
Connect: ws://localhost:8080/ws for WebSocket

Test credentials: `admin/admin123` or `user/user123`

### Option 2: Install as Package

```bash
# Install in your project
npm install domainhive-framework
```

Then create your custom server (see examples below).

## 📦 Hackathon-Ready Examples

### Example 1: Chat Backend (2 minutes)

Perfect for building a real-time chat application:

```javascript
const { WebSocketModule, CacheModule, logger } = require('domainhive-framework');

async function chatServer() {
  const cache = new CacheModule({ type: 'memory' });
  await cache.connect();
  
  const ws = new WebSocketModule({ port: 8080 });
  
  // Handle chat messages
  ws.onMessage('chat', async (data, connectionId) => {
    const message = {
      id: Date.now(),
      username: data.username,
      text: data.message,
      room: data.room || 'general',
      timestamp: Date.now()
    };
    
    // Store messages
    const key = `messages:${message.room}`;
    const messages = await cache.get(key) || [];
    messages.push(message);
    await cache.set(key, messages, 3600);
    
    // Broadcast to all clients
    ws.broadcast({ type: 'chat', data: message });
  });
  
  await ws.start();
  logger.info('💬 Chat server ready at ws://localhost:8080');
}

chatServer();
```

### Example 2: Auth + REST API (3 minutes)

Complete authentication system:

```javascript
const { RESTModule, AuthModule, logger } = require('domainhive-framework');

async function authAPI() {
  const auth = new AuthModule({ secretKey: 'my-secret-key' });
  const rest = new RESTModule({ port: 3000 });
  
  // Create a test user
  await auth.register('testuser', 'test@example.com', 'password123');
  
  // Login endpoint
  rest.addRoute({
    method: 'POST',
    path: '/login',
    handler: async (req, res) => {
      const { username, password } = req.body;
      const result = await auth.login(username, password);
      res.json({ success: true, ...result });
    }
  });
  
  // Protected endpoint
  rest.addRoute({
    method: 'GET',
    path: '/me',
    handler: async (req, res) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const user = await auth.verifyAuth(token);
      res.json({ user });
    }
  });
  
  await rest.start();
  logger.info('🔐 Auth API ready at http://localhost:3000');
}

authAPI();
```

### Example 3: Notification System (3 minutes)

Push notifications with real-time updates:

```javascript
const { RESTModule, WebSocketModule, CacheModule, logger } = require('domainhive-framework');

async function notificationServer() {
  const cache = new CacheModule({ type: 'memory' });
  await cache.connect();
  
  const rest = new RESTModule({ port: 3000 });
  const ws = new WebSocketModule({ port: 8080 });
  
  // Send notification
  rest.addRoute({
    method: 'POST',
    path: '/notify',
    handler: async (req, res) => {
      const { title, message, type = 'info' } = req.body;
      
      const notification = {
        id: Date.now(),
        title,
        message,
        type,
        timestamp: Date.now()
      };
      
      // Store notification
      const notifications = await cache.get('notifications') || [];
      notifications.push(notification);
      await cache.set('notifications', notifications, 3600);
      
      // Broadcast to all connected clients
      ws.broadcast({ type: 'notification', data: notification });
      
      res.json({ success: true, notification });
    }
  });
  
  // Get all notifications
  rest.addRoute({
    method: 'GET',
    path: '/notifications',
    handler: async (req, res) => {
      const notifications = await cache.get('notifications') || [];
      res.json({ notifications });
    }
  });
  
  await rest.start();
  await ws.start();
  
  logger.info('🔔 Notification server ready!');
  logger.info('   REST: http://localhost:3000');
  logger.info('   WebSocket: ws://localhost:8080');
}

notificationServer();
```

## 🎯 Common Hackathon Use Cases

### 1. REST API Server

```typescript
import { RESTModule } from 'domainhive-framework';

const rest = new RESTModule({ port: 3000 });

rest.addRoute({
  method: 'GET',
  path: '/api/hello',
  handler: (req, res) => res.json({ message: 'Hello World' })
});

await rest.start();
```

### 2. GraphQL API

```typescript
import { GraphQLModule, RESTModule } from 'domainhive-framework';
import { GraphQLString } from 'graphql';

const graphql = new GraphQLModule();

graphql.addQuery('hello', {
  type: GraphQLString,
  resolve: () => 'Hello from GraphQL'
});

const rest = new RESTModule({ port: 4000 });
rest.useAt('/graphql', graphql.getMiddleware());
await rest.start();
```

### 3. WebSocket Server

```typescript
import { WebSocketModule } from 'domainhive-framework';

const ws = new WebSocketModule({ port: 8080 });

ws.onMessage('chat', (data, connectionId) => {
  ws.broadcast({ type: 'chat', data });
});

await ws.start();
```

### 4. Database Connection

```typescript
import { DatabaseModule } from 'domainhive-framework';

const db = new DatabaseModule({
  type: 'postgresql',
  host: 'localhost',
  database: 'myapp',
  username: 'user',
  password: 'password'
});

await db.connect();
const result = await db.query('SELECT * FROM users');
```

### 5. Caching

```typescript
import { CacheModule } from 'domainhive-framework';

const cache = new CacheModule({ type: 'memory' });
await cache.connect();

await cache.set('key', { data: 'value' }, 3600);
const value = await cache.get('key');
```

### 6. User Authentication

```typescript
import { AuthModule } from 'domainhive-framework';

const auth = new AuthModule({ secretKey: 'your-secret' });

await auth.register('username', 'email@example.com', 'password');

const { token } = await auth.login('username', 'password');

const user = await auth.verifyAuth(token);
```

### 7. Data Validation

```typescript
import { Validator } from 'domainhive-framework';

const validator = new Validator({
  email: { required: true, type: 'string' },
  age: { type: 'number', min: 18 }
});

const result = validator.validate({ email: 'test@example.com', age: 25 });
console.log(result.valid);
```

### 8. HTTP Requests

```typescript
import { httpClient } from 'domainhive-framework';

// GET request
const response = await httpClient.get('https://api.example.com/data');

// POST request
await httpClient.post('https://api.example.com/data', { name: 'John' });
```

### 9. Logging

```typescript
import { logger } from 'domainhive-framework';

logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', { details: 'error info' });
```

### 10. Utility Helpers

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

# Run the backend server example (REST + GraphQL + WebSocket)
npm run server
```

## Project Structure

```
src/
├── core/              # Core framework (DomainHive singleton)
├── modules/           # Feature modules
│   ├── REST/          # REST API server with Express
│   ├── GraphQL/       # GraphQL server with schemas
│   ├── gRPC/          # gRPC server with protocol buffers
│   ├── WebSocket/     # WebSocket server for real-time
│   ├── Database/      # Database connectors (PostgreSQL, MongoDB, MySQL)
│   ├── Cache/         # Caching (Redis, in-memory)
│   ├── Auth/          # Authentication and authorization
│   ├── Logging/       # Advanced logging with file support
│   ├── IoT/           # IoT device management
│   └── Microservices/ # Service registry and discovery
├── utils/             # Utility functions
│   ├── logger.ts      # Simple logger
│   ├── helpers.ts     # Common helpers
│   ├── http-client.ts # HTTP client
│   ├── validator.ts   # Data validation
│   └── errors.ts      # Error classes
├── interfaces/        # TypeScript interfaces
├── examples/          # Example implementations
│   ├── usage.ts       # Basic usage example
│   ├── comprehensive-usage.ts  # Comprehensive features
│   └── backend-server.ts       # Full backend server
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
