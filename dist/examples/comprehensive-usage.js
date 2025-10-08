"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DomainHive_1 = require("../core/DomainHive");
const AuthModule_1 = require("../modules/Auth/AuthModule");
const LoggingModule_1 = require("../modules/Logging/LoggingModule");
const MicroserviceModule_1 = require("../modules/Microservices/MicroserviceModule");
const logger_1 = require("../utils/logger");
const http_client_1 = require("../utils/http-client");
const validator_1 = require("../utils/validator");
const helpers_1 = require("../utils/helpers");
const errors_1 = require("../utils/errors");
async function main() {
    logger_1.logger.info('Starting DomainHive Framework Comprehensive Example');
    // Initialize DomainHive
    const hive = DomainHive_1.DomainHive.getInstance();
    // Configure the framework
    hive.setConfig({
        app: {
            name: 'DomainHive Example App',
            version: '1.0.0',
            environment: 'development'
        },
        auth: {
            secretKey: 'your-super-secret-key-change-in-production'
        },
        logging: {
            level: LoggingModule_1.LogLevel.DEBUG,
            enableFile: true,
            logDirectory: './logs'
        }
    });
    logger_1.logger.info('Configuration loaded', { config: hive.getConfig() });
    // ===== 1. Authentication Module Demo =====
    logger_1.logger.info('=== Authentication Module Demo ===');
    const authModule = new AuthModule_1.AuthModule({
        secretKey: hive.getConfig().auth.secretKey,
        tokenExpiration: 3600
    });
    hive.registerModule('auth', authModule);
    try {
        // Register a new user
        const user = await authModule.register('john_doe', 'john@example.com', 'password123', ['user', 'admin']);
        logger_1.logger.info('User registered successfully', { userId: user.id, username: user.username });
        // Login
        const { token } = await authModule.login('john_doe', 'password123');
        logger_1.logger.info('User logged in successfully', { token: token.substring(0, 20) + '...' });
        // Verify authentication
        const verifiedUser = await authModule.verifyAuth(token);
        if (verifiedUser) {
            logger_1.logger.info('Token verified', { user: verifiedUser.username });
        }
        // Check roles
        if (authModule.hasRole(user, 'admin')) {
            logger_1.logger.info('User has admin role');
        }
    }
    catch (error) {
        logger_1.logger.error('Authentication error', { error: error instanceof Error ? error.message : error });
    }
    // ===== 2. Logging Module Demo =====
    logger_1.logger.info('=== Logging Module Demo ===');
    const loggingModule = new LoggingModule_1.LoggingModule({
        minLevel: LoggingModule_1.LogLevel.INFO,
        enableConsole: true,
        enableFile: false // Set to true to enable file logging
    });
    hive.registerModule('logging', loggingModule);
    loggingModule.info('This is an info message', 'AppContext');
    loggingModule.warn('This is a warning', 'AppContext', { detail: 'some detail' });
    loggingModule.debug('This debug message will not show if level is INFO');
    // ===== 3. Validation Demo =====
    logger_1.logger.info('=== Validation Demo ===');
    const userValidator = new validator_1.Validator({
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
            custom: (value) => validator_1.Validator.email(value) || 'Invalid email format'
        },
        age: {
            type: 'number',
            min: 18,
            max: 120
        }
    });
    // Valid data
    const validData = {
        username: 'test_user',
        email: 'test@example.com',
        age: 25
    };
    const validationResult = userValidator.validate(validData);
    logger_1.logger.info('Validation result', { valid: validationResult.valid, errors: validationResult.errors });
    // Invalid data
    const invalidData = {
        username: 'ab', // too short
        email: 'not-an-email',
        age: 15 // too young
    };
    const invalidResult = userValidator.validate(invalidData);
    if (!invalidResult.valid) {
        logger_1.logger.warn('Validation failed', { errors: invalidResult.errors });
    }
    // ===== 4. HTTP Client Demo =====
    logger_1.logger.info('=== HTTP Client Demo ===');
    // Example API call (using a public API)
    try {
        logger_1.logger.info('Making HTTP request to JSONPlaceholder API...');
        const response = await http_client_1.httpClient.get('https://jsonplaceholder.typicode.com/todos/1');
        logger_1.logger.info('HTTP response received', { status: response.status, data: response.data });
    }
    catch (error) {
        logger_1.logger.error('HTTP request failed', { error: error instanceof Error ? error.message : error });
    }
    // ===== 5. Helper Functions Demo =====
    logger_1.logger.info('=== Helper Functions Demo ===');
    // UUID generation
    const id = (0, helpers_1.uuid)();
    logger_1.logger.info('Generated UUID', { id });
    // Sleep
    logger_1.logger.info('Sleeping for 1 second...');
    await (0, helpers_1.sleep)(1000);
    logger_1.logger.info('Awake!');
    // Retry with exponential backoff
    let attempts = 0;
    try {
        const result = await (0, helpers_1.retry)(async () => {
            attempts++;
            logger_1.logger.debug(`Attempt ${attempts}`);
            if (attempts < 2) {
                throw new Error('Simulated failure');
            }
            return 'Success!';
        }, { maxAttempts: 3, initialDelay: 100 });
        logger_1.logger.info('Retry succeeded', { result, attempts });
    }
    catch (error) {
        logger_1.logger.error('Retry failed after max attempts');
    }
    // ===== 6. Error Handling Demo =====
    logger_1.logger.info('=== Error Handling Demo ===');
    try {
        throw new errors_1.ValidationError('Invalid input data', { field: 'email' });
    }
    catch (error) {
        if (error instanceof errors_1.ValidationError) {
            logger_1.logger.error('Caught validation error', {
                message: error.message,
                code: error.code,
                statusCode: error.statusCode,
                details: error.details
            });
        }
    }
    try {
        throw new errors_1.NotFoundError('User');
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError) {
            logger_1.logger.error('Caught not found error', {
                message: error.message,
                code: error.code,
                statusCode: error.statusCode
            });
        }
    }
    // ===== 7. Microservices Module Demo =====
    logger_1.logger.info('=== Microservices Module Demo ===');
    const microserviceModule = new MicroserviceModule_1.MicroserviceModule();
    hive.registerModule('microservices', microserviceModule);
    microserviceModule.registerService({
        id: 'user-service',
        name: 'User Service',
        version: '1.0.0',
        endpoints: ['http://localhost:3001/users'],
        health: async () => true
    });
    const services = microserviceModule.getAllServices();
    logger_1.logger.info('Registered services', { count: services.length, services: services.map(s => s.name) });
    // ===== Summary =====
    logger_1.logger.info('=== Framework Capabilities Summary ===');
    logger_1.logger.info('✓ Authentication with JWT-like tokens');
    logger_1.logger.info('✓ Comprehensive logging with levels and file support');
    logger_1.logger.info('✓ Data validation with custom rules');
    logger_1.logger.info('✓ HTTP client for API requests');
    logger_1.logger.info('✓ Utility helpers (retry, sleep, uuid, etc.)');
    logger_1.logger.info('✓ Custom error types with proper error handling');
    logger_1.logger.info('✓ IoT device management');
    logger_1.logger.info('✓ Microservices registry and discovery');
    logger_1.logger.info('✓ Modular and extensible architecture');
    logger_1.logger.info('DomainHive Framework comprehensive example completed successfully!');
}
main().catch(error => {
    logger_1.logger.error('Fatal error in main', { error: error instanceof Error ? error.message : error });
    process.exit(1);
});
