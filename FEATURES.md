# DomainHive Framework - Feature List

Complete list of features available in the DomainHive Framework for everyday development tasks.

## Core Framework

### DomainHive Singleton
- **Centralized Configuration Management**: Store and retrieve app-wide settings
- **Module Registry**: Register and retrieve modules dynamically
- **Event System**: Built-in event emitter for module communication
- **Singleton Pattern**: Ensure single instance across application

```typescript
const hive = DomainHive.getInstance();
hive.setConfig({ key: 'value' });
hive.registerModule('moduleName', moduleInstance);
```

---

## Authentication & Authorization

### AuthModule
- **User Registration**: Create new users with roles and metadata
- **Login/Logout**: Secure authentication with token generation
- **Token Management**: JWT-like token generation and verification
- **Role-Based Access Control**: Check user roles and permissions
- **User Management**: Update, delete, and retrieve users
- **Password Hashing**: Secure password storage with SHA-256

**Key Methods:**
- `register(username, email, password, roles)`
- `login(username, password)`
- `verifyAuth(token)`
- `logout(token)`
- `hasRole(user, role)`
- `hasAnyRole(user, roles)`
- `hasAllRoles(user, roles)`

---

## Logging

### Simple Logger Utility
- **Multiple Log Levels**: DEBUG, INFO, WARN, ERROR
- **Colored Console Output**: Visual distinction between log levels
- **Contextual Logging**: Add context to log messages
- **Metadata Support**: Include structured data in logs
- **Child Loggers**: Create contextual child loggers

### Advanced LoggingModule
- **File Logging**: Write logs to rotating files
- **Log Rotation**: Automatic file rotation based on size
- **Log Level Filtering**: Control which logs are output
- **Multiple Handlers**: Support custom log handlers
- **Structured Logging**: JSON-formatted log entries

---

## Data Validation

### Validator
- **Schema-Based Validation**: Define validation rules as schemas
- **Built-in Rules**:
  - Required fields
  - Type checking (string, number, boolean, object, array)
  - Min/max length for strings and arrays
  - Min/max value for numbers
  - Pattern matching with RegExp
  - Custom validation functions
- **Common Schemas**: Pre-built schemas for email, password, username
- **Validation Helpers**: `email()`, `url()`, `alphanumeric()`, `numeric()`

**Example:**
```typescript
const validator = new Validator({
  email: { required: true, type: 'string', custom: Validator.email },
  age: { type: 'number', min: 18, max: 120 }
});
```

---

## HTTP Client

### HttpClient
- **RESTful Methods**: GET, POST, PUT, DELETE, PATCH
- **Authentication**: Built-in token authentication support
- **Configurable**: Base URL, timeout, custom headers
- **Promise-Based**: Async/await support
- **Error Handling**: Structured error responses
- **Typed Responses**: Full TypeScript support

**Methods:**
- `get<T>(url, options)`
- `post<T>(url, body, options)`
- `put<T>(url, body, options)`
- `delete<T>(url, options)`
- `patch<T>(url, body, options)`
- `setAuthToken(token)`

---

## Utility Helpers

### Common Functions

**Object & Array Manipulation:**
- `deepClone<T>(obj)` - Deep clone any object
- `flatten(obj)` - Flatten nested objects
- `pick(obj, keys)` - Pick specific properties
- `omit(obj, keys)` - Omit specific properties
- `chunk(array, size)` - Split array into chunks
- `unique(array)` - Get unique values

**Function Utilities:**
- `debounce(fn, wait)` - Debounce function calls
- `throttle(fn, limit)` - Throttle function calls
- `asyncHandler(fn)` - Wrap async functions with error handling

**Async Utilities:**
- `sleep(ms)` - Async sleep/delay
- `retry(fn, options)` - Retry with exponential backoff
  - Configurable max attempts
  - Exponential backoff with factor
  - Min and max delay

**Data Utilities:**
- `uuid()` - Generate UUID v4
- `isEmpty(value)` - Check if value is empty

---

## Error Handling

### Custom Error Classes
- **DomainHiveError**: Base error class with code and status
- **ValidationError**: Data validation failures (400)
- **AuthenticationError**: Authentication failures (401)
- **AuthorizationError**: Authorization failures (403)
- **NotFoundError**: Resource not found (404)
- **ConflictError**: Resource conflicts (409)
- **TimeoutError**: Operation timeouts (408)
- **RateLimitError**: Rate limit exceeded (429)
- **ServiceUnavailableError**: Service unavailable (503)

**Features:**
- HTTP status codes
- Error codes
- Structured details
- Stack traces
- JSON serialization

**Utilities:**
- `asyncHandler(fn)` - Wrap functions with error handling
- `assert(condition, message)` - Assertion helper
- `isErrorType(error, ErrorClass)` - Type checking

---

## IoT Module

### IoTModule
- **Device Management**: Connect and manage IoT devices
- **Protocol Support**: MQTT protocol (extensible)
- **Device Registry**: Track connected devices
- **Device Communication**: Send data to devices
- **Status Tracking**: Monitor device status and last seen time
- **Event System**: Device connection/disconnection events

**Features:**
- Register custom protocols
- Connect devices with configuration
- Send messages to devices
- Query device status
- List all devices

---

## Microservices

### MicroserviceModule
- **Service Registry**: Register and discover services
- **Service Discovery**: Find services by criteria
- **Health Checks**: Built-in health check support
- **Version Management**: Service versioning
- **Endpoint Management**: Multiple endpoints per service
- **Event System**: Service registration events

**Features:**
- Register services with metadata
- Discover services by name, version, tags
- Get service by ID
- List all services

---

## TypeScript Support

### Full Type Safety
- Complete TypeScript definitions
- Generic type support
- Interface exports
- Type inference
- JSDoc comments

---

## Developer Experience

### Easy Integration
- Single entry point (`index.ts`)
- Named exports for all features
- Default instances for common utilities
- Consistent API design
- Comprehensive documentation

### Documentation
- Quick Start Guide
- Comprehensive Usage Guide
- API Reference
- Code Examples
- Best Practices

---

## Examples

### Included Examples
1. **Basic Usage** (`src/examples/usage.ts`):
   - IoT device connection
   - MQTT communication
   - Basic framework setup

2. **Comprehensive Usage** (`src/examples/comprehensive-usage.ts`):
   - Authentication flow
   - Data validation
   - HTTP requests
   - Logging
   - Error handling
   - Utility functions

---

## Coming Soon

Future features being considered:
- GraphQL client
- WebSocket support
- Caching module
- Rate limiting
- Job queue
- Email module
- SMS module
- Payment integration
- Database connectors
- Redis integration

---

## Performance

- **Lightweight**: Minimal dependencies
- **Efficient**: Optimized for Node.js
- **Scalable**: Designed for high-load applications
- **Async**: Full async/await support

---

## Security

- **Secure Authentication**: Token-based auth with HMAC signatures
- **Password Hashing**: SHA-256 password hashing
- **Input Validation**: Comprehensive validation framework
- **Error Handling**: Secure error messages
- **Type Safety**: TypeScript for compile-time safety

---

For detailed usage instructions, see:
- [Quick Start Guide](./QUICK_START.md)
- [Usage Guide](./USAGE_GUIDE.md)
- [Examples](./src/examples/)
