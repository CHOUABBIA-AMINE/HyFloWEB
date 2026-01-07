/**
 * Helper Utilities - Network Common Module
 * 
 * Common helper functions for Network Common entities.
 * Provides utility functions for data manipulation and transformation.
 * 
 * @author CHOUABBIA Amine
 */

import type { Page } from '@/types/pagination';

/**
 * Check if a value is null or undefined
 */
export const isNullOrUndefined = (value: any): value is null | undefined => {
  return value === null || value === undefined;
};

/**
 * Get a value or return a default
 */
export const getOrDefault = <T>(value: T | null | undefined, defaultValue: T): T => {
  return isNullOrUndefined(value) ? defaultValue : value!;
};

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Compare two values for equality
 */
export const isEqual = (a: any, b: any): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

/**
 * Extract unique values from an array
 */
export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

/**
 * Group array items by a key
 */
export const groupBy = <T>(
  array: T[],
  key: keyof T
): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

/**
 * Sort array by a key
 */
export const sortBy = <T>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Filter array by search term
 */
export const filterBySearch = <T>(
  array: T[],
  searchTerm: string,
  keys: (keyof T)[]
): T[] => {
  if (!searchTerm) return array;
  const term = searchTerm.toLowerCase();
  return array.filter((item) =>
    keys.some((key) => {
      const value = item[key];
      return String(value).toLowerCase().includes(term);
    })
  );
};

/**
 * Paginate an array
 */
export const paginate = <T>(
  array: T[],
  page: number,
  size: number
): T[] => {
  const start = page * size;
  return array.slice(start, start + size);
};

/**
 * Create a Page object from array
 */
export const createPage = <T>(
  content: T[],
  page: number,
  size: number,
  totalElements: number
): Page<T> => {
  const totalPages = Math.ceil(totalElements / size);
  return {
    content,
    page: {
      size,
      number: page,
      totalElements,
      totalPages,
    },
    totalElements,
    totalPages,
    size,
    number: page,
    first: page === 0,
    last: page === totalPages - 1,
    numberOfElements: content.length,
    empty: content.length === 0,
  };
};

/**
 * Debounce a function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle a function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Generate a random ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sleep for a specified time
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry a function with exponential backoff
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (maxRetries <= 0) throw error;
    await sleep(delay);
    return retry(fn, maxRetries - 1, delay * 2);
  }
};
