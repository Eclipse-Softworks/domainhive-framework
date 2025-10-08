"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonSchemas = exports.Validator = void 0;
class Validator {
    constructor(schema) {
        this.schema = schema;
    }
    validate(data) {
        const errors = [];
        for (const [field, rules] of Object.entries(this.schema)) {
            const value = data[field];
            // Required check
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push({
                    field,
                    message: rules.message || `${field} is required`,
                    rule: 'required'
                });
                continue;
            }
            // Skip other validations if not required and value is empty
            if (!rules.required && (value === undefined || value === null || value === '')) {
                continue;
            }
            // Type check
            if (rules.type) {
                const actualType = Array.isArray(value) ? 'array' : typeof value;
                if (actualType !== rules.type) {
                    errors.push({
                        field,
                        message: rules.message || `${field} must be of type ${rules.type}`,
                        rule: 'type'
                    });
                    continue;
                }
            }
            // Min/Max for strings and arrays (length)
            if ((rules.min !== undefined || rules.max !== undefined) &&
                (typeof value === 'string' || Array.isArray(value))) {
                const length = value.length;
                if (rules.min !== undefined && length < rules.min) {
                    errors.push({
                        field,
                        message: rules.message || `${field} must be at least ${rules.min} characters/items`,
                        rule: 'min'
                    });
                }
                if (rules.max !== undefined && length > rules.max) {
                    errors.push({
                        field,
                        message: rules.message || `${field} must be at most ${rules.max} characters/items`,
                        rule: 'max'
                    });
                }
            }
            // Min/Max for numbers
            if ((rules.min !== undefined || rules.max !== undefined) && typeof value === 'number') {
                if (rules.min !== undefined && value < rules.min) {
                    errors.push({
                        field,
                        message: rules.message || `${field} must be at least ${rules.min}`,
                        rule: 'min'
                    });
                }
                if (rules.max !== undefined && value > rules.max) {
                    errors.push({
                        field,
                        message: rules.message || `${field} must be at most ${rules.max}`,
                        rule: 'max'
                    });
                }
            }
            // Pattern check for strings
            if (rules.pattern && typeof value === 'string') {
                if (!rules.pattern.test(value)) {
                    errors.push({
                        field,
                        message: rules.message || `${field} does not match required pattern`,
                        rule: 'pattern'
                    });
                }
            }
            // Custom validation
            if (rules.custom) {
                const customResult = rules.custom(value);
                if (customResult !== true) {
                    errors.push({
                        field,
                        message: typeof customResult === 'string' ? customResult : (rules.message || `${field} validation failed`),
                        rule: 'custom'
                    });
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    static email(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }
    static url(value) {
        try {
            new URL(value);
            return true;
        }
        catch {
            return false;
        }
    }
    static alphanumeric(value) {
        return /^[a-zA-Z0-9]+$/.test(value);
    }
    static numeric(value) {
        return /^[0-9]+$/.test(value);
    }
}
exports.Validator = Validator;
// Common validation schemas
exports.commonSchemas = {
    email: {
        email: {
            required: true,
            type: 'string',
            custom: (value) => Validator.email(value) || 'Invalid email format'
        }
    },
    password: {
        password: {
            required: true,
            type: 'string',
            min: 8,
            message: 'Password must be at least 8 characters long'
        }
    },
    username: {
        username: {
            required: true,
            type: 'string',
            min: 3,
            max: 20,
            pattern: /^[a-zA-Z0-9_]+$/,
            message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
        }
    }
};
