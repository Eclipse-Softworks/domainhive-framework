# DomainHive Framework
![1](https://github.com/user-attachments/assets/cc03469d-df9f-4fca-ab34-c95c0e74e0e7)


**DomainHive Framework** is an open-source, domain-specific framework designed to empower developers with a plug-and-play, modular architecture for niche markets such as IoT, mobile development, and microservices. Developed and maintained by **Eclipse Softworks (ES)**, DomainHive Framework simplifies rapid prototyping, integration, and scalable application development by providing robust APIs, reusable components, and comprehensive documentation.

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

DomainHive Framework is a comprehensive, enterprise-ready backend framework designed to empower developers and corporations to build scalable applications efficiently. It provides a complete suite of backend capabilities including REST APIs, GraphQL, gRPC, real-time WebSocket communication, database connectivity, caching, and more. The framework is built with TypeScript for type safety and follows industry best practices.

Key highlights:
- **Complete Backend Solution:** Everything needed to build production-ready backend systems
- **Multi-Protocol Support:** REST, GraphQL, gRPC, WebSocket, and MQTT protocols
- **Database Agnostic:** Support for PostgreSQL, MongoDB, and MySQL
- **Built for Scale:** Caching, rate limiting, security middleware, and optimized performance
- **Developer Friendly:** Clean APIs, comprehensive documentation, and TypeScript support
- **Enterprise Ready:** Suitable for startups to large corporations building mission-critical applications

By leveraging DomainHive Framework, teams can reduce development time, maintain high code quality, and build robust backend systems without reinventing the wheel.

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

### Prerequisites

- **Operating System:** Windows 10 or later.
- **Git:** [Git for Windows](https://gitforwindows.org/)
- **Node.js:** Version 16 or above (if using JavaScript/TypeScript).
- **Visual Studio Code:** Recommended IDE for development.

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Eclipse-Softworks/domainhive-framework.git
   cd domainhive-framework
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Build the Framework:**
   ```bash
   npm run build
   ```

4. **Run Examples:**
   ```bash
   npm run example
   ```

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

After installation, you can start using the framework right away:

```typescript
import { DomainHive, logger, AuthModule } from 'domainhive-framework';

const hive = DomainHive.getInstance();
logger.info('Framework ready!');
```

For comprehensive guides, see:

- **[Quick Start Guide](./QUICK_START.md):** Get started in 5 minutes
- **[Usage Guide](./USAGE_GUIDE.md):** Detailed documentation for all features
- **[Example Projects](./src/examples/):** Practical implementations

### Key Capabilities

- **REST API Server**: Build RESTful APIs with Express, routing, and middleware
- **GraphQL Server**: Create GraphQL APIs with schema and resolvers
- **gRPC Server**: High-performance RPC with protocol buffers
- **WebSocket Server**: Real-time bidirectional communication
- **Database Support**: PostgreSQL, MongoDB, and MySQL connectors
- **Caching**: Redis and in-memory caching with TTL support
- **Authentication**: Secure JWT-like token authentication with RBAC
- **Logging**: Structured logging with multiple levels and file support
- **Validation**: Comprehensive data validation with custom rules
- **HTTP Client**: Promise-based HTTP client with retry logic
- **Utilities**: Common helpers (retry, debounce, uuid, sleep, etc.)
- **Error Handling**: Custom error types with proper error management
- **IoT Support**: Device management with MQTT protocol
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
