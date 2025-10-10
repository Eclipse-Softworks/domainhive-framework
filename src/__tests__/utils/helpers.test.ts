/**
 * Unit tests for helper utility functions
 */

import { uuid, isEmpty, deepClone, chunk, unique, sleep } from '../../utils/helpers';

describe('Helper Utilities', () => {
  describe('uuid', () => {
    it('should generate a valid UUID v4', () => {
      const id = uuid();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique UUIDs', () => {
      const id1 = uuid();
      const id2 = uuid();
      expect(id1).not.toBe(id2);
    });
  });

  describe('isEmpty', () => {
    it('should return true for null', () => {
      expect(isEmpty(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return true for empty string', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
    });

    it('should return true for empty array', () => {
      expect(isEmpty([])).toBe(true);
    });

    it('should return true for empty object', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('should return false for non-empty values', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty([1, 2, 3])).toBe(false);
      expect(isEmpty({ key: 'value' })).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });

  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('hello')).toBe('hello');
      expect(deepClone(true)).toBe(true);
    });

    it('should clone arrays', () => {
      const arr = [1, 2, 3];
      const cloned = deepClone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
    });

    it('should clone objects', () => {
      const obj = { a: 1, b: 2, c: { d: 3 } };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.c).not.toBe(obj.c);
    });

    it('should handle nested structures', () => {
      const complex = {
        array: [1, 2, { nested: true }],
        object: { deep: { value: 42 } },
      };
      const cloned = deepClone(complex);
      expect(cloned).toEqual(complex);
      const nestedItem = cloned.array[2] as { nested: boolean };
      nestedItem.nested = false;
      const originalNestedItem = complex.array[2] as { nested: boolean };
      expect(originalNestedItem.nested).toBe(true);
    });
  });

  describe('chunk', () => {
    it('should split array into chunks', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7];
      const chunked = chunk(arr, 3);
      expect(chunked).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    it('should handle empty arrays', () => {
      expect(chunk([], 3)).toEqual([]);
    });

    it('should handle chunk size larger than array', () => {
      expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
    });
  });

  describe('unique', () => {
    it('should return unique values', () => {
      const arr = [1, 2, 2, 3, 3, 3, 4];
      expect(unique(arr)).toEqual([1, 2, 3, 4]);
    });

    it('should work with strings', () => {
      const arr = ['a', 'b', 'a', 'c', 'b'];
      expect(unique(arr)).toEqual(['a', 'b', 'c']);
    });

    it('should handle empty arrays', () => {
      expect(unique([])).toEqual([]);
    });
  });

  describe('sleep', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await sleep(100);
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(90);
    });
  });
});
