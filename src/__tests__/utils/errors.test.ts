/**
 * Unit tests for custom error classes
 */

import {
  DomainHiveError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  assert,
  isErrorType,
} from '../../utils/errors';

describe('Error Classes', () => {
  describe('DomainHiveError', () => {
    it('should create error with message', () => {
      const error = new DomainHiveError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('DomainHiveError');
    });

    it('should have default status code', () => {
      const error = new DomainHiveError('Test');
      expect(error.statusCode).toBe(500);
    });

    it('should allow custom status code', () => {
      const error = new DomainHiveError('Test', 'TEST_ERROR', 400);
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
    });
  });

  describe('ValidationError', () => {
    it('should have correct status code', () => {
      const error = new ValidationError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('AuthenticationError', () => {
    it('should have correct status code', () => {
      const error = new AuthenticationError('Invalid credentials');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });
  });

  describe('NotFoundError', () => {
    it('should have correct status code', () => {
      const error = new NotFoundError('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('assert', () => {
    it('should not throw when condition is true', () => {
      expect(() => assert(true, 'Should not throw')).not.toThrow();
    });

    it('should throw DomainHiveError when condition is false', () => {
      expect(() => assert(false, 'Should throw')).toThrow(DomainHiveError);
      expect(() => assert(false, 'Should throw')).toThrow('Should throw');
    });
  });

  describe('isErrorType', () => {
    it('should correctly identify error types', () => {
      const validationError = new ValidationError('Test');
      const authError = new AuthenticationError('Test');

      expect(isErrorType(validationError, ValidationError)).toBe(true);
      expect(isErrorType(validationError, AuthenticationError)).toBe(false);
      expect(isErrorType(authError, AuthenticationError)).toBe(true);
    });

    it('should handle base Error objects', () => {
      const regularError = new Error('Test');
      expect(isErrorType(regularError, DomainHiveError)).toBe(false);
    });
  });
});
