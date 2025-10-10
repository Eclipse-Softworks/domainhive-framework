# DomainHive Framework
![1](https://github.com/user-attachments/assets/cc03469d-df9f-4fca-ab34-c95c0e74e0e7)

**The Ultimate Hackathon Backend Framework**

**DomainHive Framework** is a production-ready, full-stack backend framework designed for developers who need to build robust backend services quickly - perfect for hackathons, MVPs, and rapid prototyping. Install it, configure it in minutes, and focus on your frontend while we handle the entire backend infrastructure.

**Why DomainHive for Hackathons?**
- ⚡ **5-Minute Setup**: `npm install domainhive-framework` and you're ready to go
- 🚀 **Pre-Built Endpoints**: Auth, notifications, chat, data storage - all ready out of the box
- 🔌 **Multiple Protocols**: REST, GraphQL, WebSocket, gRPC - choose what fits your needs
- 💾 **Database Ready**: PostgreSQL, MongoDB, MySQL support with zero configuration
- 🔐 **Security Built-In**: JWT-like authentication, rate limiting, CORS, helmet protection
- 📡 **Real-Time Ready**: WebSocket support for chat apps, notifications, and live updates
- 📦 **All-in-One Package**: No need to install Express, Socket.io, or any other dependencies

Developed and maintained by **Eclipse Softworks (ES)**, DomainHive Framework eliminates the repetitive setup work so you can focus on building unique features that win hackathons.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Project Structure](#project-structure)
- [Usage](#usage)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Contact](#contact)

---

## Overview

DomainHive Framework is your complete backend-in-a-box solution. Whether you're at a hackathon racing against the clock, building an MVP for a startup pitch, or prototyping a new idea, DomainHive gives you a production-ready backend in minutes, not days.

### Perfect for Hackathons

Stop wasting time setting up Express, configuring WebSockets, or implementing authentication from scratch. DomainHive provides:

- **Ready-to-Use Server**: Run `npm run server` and get a fully functional backend with 15+ endpoints
- **Common Features Built-In**: User auth, real-time chat, notifications, data storage
- **Copy-Paste Ready**: All examples work out of the box - just customize to your needs
- **Frontend-Friendly**: Clean REST APIs, GraphQL support, and real-time WebSocket events

### Key Highlights

- **Complete Backend Solution:** Everything needed to build production-ready backend systems
- **Multi-Protocol Support:** REST, GraphQL, gRPC, WebSocket, and MQTT protocols
- **Database Agnostic:** Support for PostgreSQL, MongoDB, and MySQL with zero configuration
- **Built for Speed:** Get your backend running in under 5 minutes
- **Developer Friendly:** TypeScript support, clean APIs, comprehensive documentation
- **Real-Time Ready:** WebSocket server for chat apps, live updates, and notifications
- **Enterprise Ready:** Production-grade security, rate limiting, caching, and error handling

### Common Hackathon Use Cases

✅ **Social Media App**: Auth + user profiles + real-time feed  
✅ **Chat Application**: WebSocket messaging + chat rooms + notifications  
✅ **Collaboration Tool**: Real-time updates + user management + data sync  
✅ **IoT Dashboard**: MQTT support + data visualization + real-time monitoring  
✅ **API Gateway**: REST + GraphQL + gRPC all in one place  
✅ **Mobile Backend**: Complete backend for iOS/Android apps

---

## Key Features

### API & Communication Protocols

- **REST API Server**
  - Express-based HTTP server with routing and middleware
  - Built-in CORS, helmet security, and rate limiting
  - Request logging and monitoring
  - Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH)

- **GraphQL Server**
  - Schema definition and type system
  - Query and mutation support
  - GraphiQL interface for development
  - Type-safe resolvers

- **gRPC Server**
  - Protocol buffer support
  - Bidirectional streaming
  - High-performance RPC communication
  - Service definition and implementation

- **WebSocket Server**
  - Real-time bidirectional communication
  - Event-based messaging system
  - Connection management and tracking
  - Broadcast and targeted messaging

- **MQTT Protocol**
  - IoT device communication
  - Embedded MQTT broker
  - Publish/subscribe messaging

### Data Management

- **Database Module**
  - PostgreSQL support with connection pooling
  - MongoDB support with native driver
  - MySQL support with connection pooling
  - Unified query interface
  - Transaction support

- **Cache Module**
  - Redis integration for distributed caching
  - In-memory caching for simple use cases
  - TTL (Time-To-Live) support
  - Automatic cleanup and eviction

### Security & Authentication

- **Authentication Module**
  - JWT-like token-based authentication
  - User registration and login
  - Role-based access control (RBAC)
  - Password hashing with SHA-256
  - Token expiration and refresh

- **Security Middleware**
  - Helmet.js security headers
  - CORS configuration
  - Rate limiting to prevent abuse
  - Request validation

### Developer Experience

- **Logging Module**
  - Structured logging with multiple levels
  - File rotation and console output
  - Context-aware logging
  - Performance tracking

- **Validation Module**
  - Schema-based data validation
  - Custom validation rules
  - Type checking and pattern matching
  - Detailed error reporting

- **HTTP Client**
  - Promise-based API
  - Retry logic with exponential backoff
  - Authentication support
  - Request/response interceptors

- **Utility Helpers**
  - UUID generation
  - Deep cloning and object manipulation
  - Debounce and throttle functions
  - Async retry with backoff
  - Custom error types

### Architecture & Scalability

- **Modular Design**
  - Independent, self-contained modules
  - Clean interfaces and dependency injection
  - Easy to extend and customize

- **Production Ready**
  - TypeScript for type safety
  - Error handling and recovery
  - Connection pooling and resource management
  - Performance optimized

- **Microservices Support**
  - Service registry and discovery
  - Multiple communication protocols
  - Distributed system patterns

---

## Architecture

The DomainHive Framework is built using a modular architecture that includes:

- **Core Module:**  
  Contains the fundamental APIs, configuration management, and utility functions.

- **Modules Directory:**  
  Houses individual modules that can be integrated into projects as needed (e.g., authentication, logging, data connectors).

- **Utilities:**  
  Common helper functions and scripts used across the framework.

- **Documentation & Examples:**  
  Complete documentation (in `docs/`) and example projects (in `examples/`) to facilitate onboarding and showcase best practices.

This design enables independent development, testing, and deployment of each module while ensuring a unified and cohesive overall system.

---

## Getting Started

### Quick Start for Hackathons (5 Minutes)

Get a full backend running in 5 minutes:

```bash
# Install the framework
npm install domainhive-framework

# Create a new file: server.js
```

```javascript
const { 
  DomainHive, 
  RESTModule, 
  WebSocketModule, 
  CacheModule, 
  AuthModule, 
  logger 
} = require('domainhive-framework');

async function startServer() {
  const hive = DomainHive.getInstance();
  
  // Initialize modules
  const cache = new CacheModule({ type: 'memory' });
  await cache.connect();
  
  const auth = new AuthModule({ secretKey: 'your-secret-key' });
  await auth.register('admin', 'admin@test.com', 'admin123', ['admin']);
  
  const rest = new RESTModule({ port: 3000 });
  const ws = new WebSocketModule({ port: 8080 });
  
  // Add auth endpoints
  rest.addRoute({
    method: 'POST',
    path: '/auth/login',
    handler: async (req, res) => {
      const { username, password } = req.body;
      const result = await auth.login(username, password);
      res.json({ success: true, ...result });
    }
  });
  
  // Add chat via WebSocket
  ws.onMessage('chat', (data, connectionId) => {
    ws.broadcast({ type: 'chat', data });
  });
  
  await rest.start();
  await ws.start();
  
  logger.info('🚀 Backend ready at http://localhost:3000');
  logger.info('💬 WebSocket ready at ws://localhost:8080');
}

startServer();
```

```bash
# Run your server
node server.js
```

**That's it!** You now have auth, WebSocket chat, and a REST API running.

### Prerequisites

- **Node.js:** Version 16 or above
- **npm or yarn:** Package manager

### Installation Options

#### Option 1: Use as NPM Package (Recommended for Hackathons)

```bash
# Install in your project
npm install domainhive-framework

# Use pre-built features
```

#### Option 2: Clone and Customize

```bash
# Clone the repository
git clone https://github.com/Eclipse-Softworks/domainhive-framework.git
cd domainhive-framework

# Install dependencies
npm install

# Run the full example server
npm run server

# Visit http://localhost:3000 to see all endpoints
```

The example server includes:
- ✅ Auth endpoints (login, register, verify)
- ✅ User management
- ✅ Real-time notifications
- ✅ Chat with rooms
- ✅ Data storage
- ✅ GraphQL API
- ✅ WebSocket events

### Project Structure

```
domainhive-framework/
├── src/
│   ├── core/                # Core framework (DomainHive singleton)
│   ├── modules/             # Feature modules
│   │   ├── REST/            # REST API server with Express
│   │   ├── GraphQL/         # GraphQL server with schema support
│   │   ├── gRPC/            # gRPC server with protocol buffers
│   │   ├── WebSocket/       # WebSocket server for real-time
│   │   ├── Database/        # Database connectors (PostgreSQL, MongoDB, MySQL)
│   │   ├── Cache/           # Caching (Redis, in-memory)
│   │   ├── Auth/            # Authentication and authorization
│   │   ├── Logging/         # Advanced logging with file support
│   │   ├── IoT/             # IoT device management
│   │   └── Microservices/   # Service registry and discovery
│   ├── utils/               # Utility functions and helpers
│   ├── interfaces/          # TypeScript interfaces
│   ├── broker/              # MQTT broker
│   └── examples/            # Example implementations
├── dist/                    # Compiled JavaScript output
├── README.md                # Project overview and setup
├── FEATURES.md              # Detailed feature list
├── USAGE_GUIDE.md           # Comprehensive usage documentation
├── QUICK_START.md           # Quick start guide
└── package.json             # Project dependencies and scripts
```

---

## Usage

### Hackathon-Ready Examples

#### 1. Simple Chat Backend (2 minutes)

```javascript
const { WebSocketModule, CacheModule } = require('domainhive-framework');

async function chatServer() {
  const cache = new CacheModule({ type: 'memory' });
  await cache.connect();
  
  const ws = new WebSocketModule({ port: 8080 });
  
  ws.onMessage('chat', async (data, connectionId) => {
    const message = {
      id: Date.now(),
      username: data.username,
      message: data.message,
      timestamp: Date.now()
    };
    
    // Store message
    const messages = await cache.get('messages') || [];
    messages.push(message);
    await cache.set('messages', messages, 3600);
    
    // Broadcast to all
    ws.broadcast({ type: 'chat', data: message });
  });
  
  await ws.start();
  console.log('Chat server ready! Connect to ws://localhost:8080');
}

chatServer();
```

#### 2. Auth + REST API (3 minutes)

```javascript
const { RESTModule, AuthModule } = require('domainhive-framework');

async function apiServer() {
  const auth = new AuthModule({ secretKey: 'my-secret' });
  const rest = new RESTModule({ port: 3000 });
  
  // Register a test user
  await auth.register('user', 'user@test.com', 'password123');
  
  // Login endpoint
  rest.addRoute({
    method: 'POST',
    path: '/login',
    handler: async (req, res) => {
      const { username, password } = req.body;
      const result = await auth.login(username, password);
      res.json(result);
    }
  });
  
  // Protected endpoint
  rest.addRoute({
    method: 'GET',
    path: '/profile',
    handler: async (req, res) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const user = await auth.verifyAuth(token);
      res.json({ user });
    }
  });
  
  await rest.start();
  console.log('API ready at http://localhost:3000');
}

apiServer();
```

#### 3. Full-Featured Backend (Run the Example)

```bash
npm run server
```

This starts a complete backend with:
- **Auth**: Login, register, token verification
- **Users**: Get user list with caching
- **Notifications**: Create and retrieve notifications
- **Chat**: REST and WebSocket messaging with rooms
- **GraphQL**: Query users and data
- **WebSocket**: Real-time events (ping, chat, broadcasts)

### Documentation

- **[Quick Start Guide](./QUICK_START.md):** Get started in 5 minutes
- **[Usage Guide](./USAGE_GUIDE.md):** Detailed documentation for all features
- **[Features List](./FEATURES.md):** Complete feature reference
- **[Example Projects](./src/examples/):** Copy-paste ready implementations

### Complete Feature Set

- **REST API Server**: Express-based with routing, CORS, rate limiting, helmet security
- **GraphQL Server**: Schema-based GraphQL with queries and mutations
- **gRPC Server**: High-performance RPC with protocol buffers
- **WebSocket Server**: Real-time bidirectional communication with event handling
- **Database Support**: PostgreSQL, MongoDB, MySQL with connection pooling
- **Caching**: Redis and in-memory caching with TTL support
- **Authentication**: JWT-like tokens, user registration, RBAC (role-based access control)
- **Logging**: Structured logging with file rotation and console output
- **Validation**: Schema-based data validation with custom rules
- **HTTP Client**: Retry logic, authentication, interceptors
- **Utilities**: UUID, deep clone, debounce, throttle, retry, sleep
- **Error Handling**: Custom error types with detailed messages
- **IoT Support**: MQTT protocol for device communication
- **Microservices**: Service registry and discovery

---

## Documentation

The full documentation is available in the `docs/` directory and on the GitHub Wiki. It includes:

- API Reference
- Developer Guides
- Architecture Diagrams
- FAQ & Troubleshooting

---

## Contributing

We welcome contributions from the community! Please check our [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to:

- Report bugs or request features.
- Submit pull requests.
- Participate in discussions on GitHub Discussions.

---

## Release

To publish a new release:

1. Update version in `package.json`
2. Update `CHANGELOG.md` with release notes
3. Run `npm run release` to create tag and publish

See [RELEASE.md](RELEASE.md) for detailed release instructions.

---

## Roadmap

Our planned milestones include:

- **v1.0.0 (MVP):**  
  Core modules implementation, basic API support, and initial documentation.
- **v1.1.0:**  
  Additional modules (e.g., advanced logging, analytics), enhanced testing suite, and CI/CD improvements.
- **v2.0.0:**  
  Extended domain-specific modules, integration with container orchestration tools, and community-driven enhancements.

Check the [ROADMAP.md](ROADMAP.md) file for more details.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contact

For questions, support, or to contribute to DomainHive Framework, please reach out to us:

- **Eclipse Softworks (ES) GitHub Organization:** [github.com/EclipseSoftworks](https://github.com/EclipseSoftworks)
- **Email:** support@eclipsesoftworks.com

We look forward to building a dynamic, collaborative ecosystem around DomainHive Framework!

---

*Happy coding and thank you for contributing to DomainHive Framework by Eclipse Softworks!*
```
