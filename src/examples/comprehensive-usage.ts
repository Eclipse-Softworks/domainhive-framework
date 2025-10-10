import { DomainHive } from '../core/DomainHive';
import { AuthModule } from '../modules/Auth/AuthModule';
import { LoggingModule, LogLevel } from '../modules/Logging/LoggingModule';
import { MicroserviceModule } from '../modules/Microservices/MicroserviceModule';
import { logger } from '../utils/logger';
import { httpClient } from '../utils/http-client';
import { Validator } from '../utils/validator';
import { retry, sleep, uuid } from '../utils/helpers';
import { ValidationError, NotFoundError } from '../utils/errors';

async function main() {
  logger.info('Starting DomainHive Framework Comprehensive Example');

  // Initialize DomainHive
  const hive = DomainHive.getInstance();

  // Configure the framework
  hive.setConfig({
    app: {
      name: 'DomainHive Example App',
      version: '1.0.0',
      environment: 'development',
    },
    auth: {
      secretKey: 'your-super-secret-key-change-in-production',
    },
    logging: {
      level: LogLevel.DEBUG,
      enableFile: true,
      logDirectory: './logs',
    },
  });

  logger.info('Configuration loaded', { config: hive.getConfig() });

  // ===== 1. Authentication Module Demo =====
  logger.info('=== Authentication Module Demo ===');

  const authModule = new AuthModule({
    secretKey: hive.getConfig().auth.secretKey,
    tokenExpiration: 3600,
  });
  hive.registerModule('auth', authModule);

  try {
    // Register a new user
    const user = await authModule.register('john_doe', 'john@example.com', 'password123', [
      'user',
      'admin',
    ]);
    logger.info('User registered successfully', { userId: user.id, username: user.username });

    // Login
    const { token } = await authModule.login('john_doe', 'password123');
    logger.info('User logged in successfully', { token: token.substring(0, 20) + '...' });

    // Verify authentication
    const verifiedUser = await authModule.verifyAuth(token);
    if (verifiedUser) {
      logger.info('Token verified', { user: verifiedUser.username });
    }

    // Check roles
    if (authModule.hasRole(user, 'admin')) {
      logger.info('User has admin role');
    }
  } catch (error) {
    logger.error('Authentication error', { error: error instanceof Error ? error.message : error });
  }

  // ===== 2. Logging Module Demo =====
  logger.info('=== Logging Module Demo ===');

  const loggingModule = new LoggingModule({
    minLevel: LogLevel.INFO,
    enableConsole: true,
    enableFile: false, // Set to true to enable file logging
  });
  hive.registerModule('logging', loggingModule);

  loggingModule.info('This is an info message', 'AppContext');
  loggingModule.warn('This is a warning', 'AppContext', { detail: 'some detail' });
  loggingModule.debug('This debug message will not show if level is INFO');

  // ===== 3. Validation Demo =====
  logger.info('=== Validation Demo ===');

  const userValidator = new Validator({
    username: {
      required: true,
      type: 'string',
      min: 3,
      max: 20,
      pattern: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      required: true,
      type: 'string',
      custom: (value: string) => Validator.email(value) || 'Invalid email format',
    },
    age: {
      type: 'number',
      min: 18,
      max: 120,
    },
  });

  // Valid data
  const validData = {
    username: 'test_user',
    email: 'test@example.com',
    age: 25,
  };

  const validationResult = userValidator.validate(validData);
  logger.info('Validation result', {
    valid: validationResult.valid,
    errors: validationResult.errors,
  });

  // Invalid data
  const invalidData = {
    username: 'ab', // too short
    email: 'not-an-email',
    age: 15, // too young
  };

  const invalidResult = userValidator.validate(invalidData);
  if (!invalidResult.valid) {
    logger.warn('Validation failed', { errors: invalidResult.errors });
  }

  // ===== 4. HTTP Client Demo =====
  logger.info('=== HTTP Client Demo ===');

  // Example API call (using a public API)
  try {
    logger.info('Making HTTP request to JSONPlaceholder API...');
    const response = await httpClient.get('https://jsonplaceholder.typicode.com/todos/1');
    logger.info('HTTP response received', { status: response.status, data: response.data });
  } catch (error) {
    logger.error('HTTP request failed', { error: error instanceof Error ? error.message : error });
  }

  // ===== 5. Helper Functions Demo =====
  logger.info('=== Helper Functions Demo ===');

  // UUID generation
  const id = uuid();
  logger.info('Generated UUID', { id });

  // Sleep
  logger.info('Sleeping for 1 second...');
  await sleep(1000);
  logger.info('Awake!');

  // Retry with exponential backoff
  let attempts = 0;
  try {
    const result = await retry(
      async () => {
        attempts++;
        logger.debug(`Attempt ${attempts}`);
        if (attempts < 2) {
          throw new Error('Simulated failure');
        }
        return 'Success!';
      },
      { maxAttempts: 3, initialDelay: 100 }
    );
    logger.info('Retry succeeded', { result, attempts });
  } catch (error) {
    logger.error('Retry failed after max attempts');
  }

  // ===== 6. Error Handling Demo =====
  logger.info('=== Error Handling Demo ===');

  try {
    throw new ValidationError('Invalid input data', { field: 'email' });
  } catch (error) {
    if (error instanceof ValidationError) {
      logger.error('Caught validation error', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      });
    }
  }

  try {
    throw new NotFoundError('User');
  } catch (error) {
    if (error instanceof NotFoundError) {
      logger.error('Caught not found error', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      });
    }
  }

  // ===== 7. Microservices Module Demo =====
  logger.info('=== Microservices Module Demo ===');

  const microserviceModule = new MicroserviceModule();
  hive.registerModule('microservices', microserviceModule);

  microserviceModule.registerService({
    id: 'user-service',
    name: 'User Service',
    version: '1.0.0',
    endpoints: ['http://localhost:3001/users'],
    health: async () => true,
  });

  const services = microserviceModule.getAllServices();
  logger.info('Registered services', {
    count: services.length,
    services: services.map((s) => s.name),
  });

  // ===== Summary =====
  logger.info('=== Framework Capabilities Summary ===');
  logger.info('✓ Authentication with JWT-like tokens');
  logger.info('✓ Comprehensive logging with levels and file support');
  logger.info('✓ Data validation with custom rules');
  logger.info('✓ HTTP client for API requests');
  logger.info('✓ Utility helpers (retry, sleep, uuid, etc.)');
  logger.info('✓ Custom error types with proper error handling');
  logger.info('✓ IoT device management');
  logger.info('✓ Microservices registry and discovery');
  logger.info('✓ Modular and extensible architecture');

  logger.info('DomainHive Framework comprehensive example completed successfully!');
}

main().catch((error) => {
  logger.error('Fatal error in main', { error: error instanceof Error ? error.message : error });
  process.exit(1);
});
