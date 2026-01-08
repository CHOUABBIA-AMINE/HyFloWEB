/**
 * Unified Helper Utilities
 * 
 * Centralized helper functions for all application modules.
 * Used across General, Network, and System modules.
 * 
 * @author CHOUABBIA Amine
 */

/**
 * Generic sorting and filtering helpers
 */

/**
 * Generic sortBy helper function
 * Sorts an array of objects by a given key
 */
export const sortBy = <T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal === bVal) return 0;
    
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    const comparison = aVal < bVal ? -1 : 1;
    return order === 'asc' ? comparison : -comparison;
  });
};

/**
 * Group array items by a key
 */
export const groupBy = <T>(
  arr: T[],
  key: keyof T
): Record<string, T[]> => {
  return arr.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

/**
 * Find item in array by key
 */
export const findByKey = <T>(
  arr: T[],
  key: keyof T,
  value: any
): T | undefined => {
  return arr.find(item => item[key] === value);
};

/**
 * Filter array items by key
 */
export const filterByKey = <T>(
  arr: T[],
  key: keyof T,
  value: any
): T[] => {
  return arr.filter(item => item[key] === value);
};

/**
 * Remove duplicates from array
 */
export const removeDuplicates = <T>(
  arr: T[],
  key?: keyof T
): T[] => {
  if (!key) {
    return [...new Set(arr)];
  }
  
  const seen = new Set<any>();
  return arr.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

/**
 * Check if array contains item
 */
export const arrayContains = <T>(
  arr: T[],
  item: T
): boolean => {
  return arr.includes(item);
};

/**
 * Check if array contains item by key
 */
export const arrayContainsByKey = <T>(
  arr: T[],
  key: keyof T,
  value: any
): boolean => {
  return arr.some(item => item[key] === value);
};

/**
 * Create key-value pairs from array
 */
export const createMap = <T>(
  arr: T[],
  keyField: keyof T,
  valueField?: keyof T
): Record<string, any> => {
  return arr.reduce((acc, item) => {
    const key = String(item[keyField]);
    const value = valueField ? item[valueField] : item;
    acc[key] = value;
    return acc;
  }, {} as Record<string, any>);
};

/**
 * Create dropdown options from array
 */
export const createOptions = <T>(
  arr: T[],
  valueField: keyof T,
  labelField: keyof T
): Array<{ value: any; label: string }> => {
  return arr.map(item => ({
    value: item[valueField],
    label: String(item[labelField]),
  }));
};

/**
 * Merge arrays without duplicates
 */
export const mergeArrays = <T>(arrays: T[][]): T[] => {
  return [...new Set(arrays.flat())];
};

/**
 * Intersection of arrays
 */
export const arrayIntersection = <T>(arr1: T[], arr2: T[]): T[] => {
  const set2 = new Set(arr2);
  return arr1.filter(item => set2.has(item));
};

/**
 * Difference of arrays
 */
export const arrayDifference = <T>(arr1: T[], arr2: T[]): T[] => {
  const set2 = new Set(arr2);
  return arr1.filter(item => !set2.has(item));
};

/**
 * Object manipulation helpers
 */

/**
 * Check if object is empty
 */
export const isEmptyObject = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Get object values
 */
export const getObjectValues = (obj: Record<string, any>): any[] => {
  return Object.values(obj);
};

/**
 * Get object keys
 */
export const getObjectKeys = (obj: Record<string, any>): string[] => {
  return Object.keys(obj);
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  
  const clonedObj = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
};

/**
 * Merge objects
 */
export const mergeObjects = <T>(...objects: T[]): T => {
  return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {} as T);
};

/**
 * String manipulation helpers
 */

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert string to kebab case
 */
export const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

/**
 * Convert string to snake case
 */
export const toSnakeCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
};

/**
 * Convert string to camel case
 */
export const toCamelCase = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[\s_-]([a-z])/g, (match, char) => char.toUpperCase())
    .replace(/^[A-Z]/, char => char.toLowerCase());
};

/**
 * Repeat string
 */
export const repeatString = (str: string, count: number): string => {
  return str.repeat(Math.max(0, count));
};

/**
 * Pad string start
 */
export const padStart = (str: string, targetLength: number, padString: string = ' '): string => {
  return str.padStart(targetLength, padString);
};

/**
 * Pad string end
 */
export const padEnd = (str: string, targetLength: number, padString: string = ' '): string => {
  return str.padEnd(targetLength, padString);
};

/**
 * Geographic helpers
 */

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Find nearest location to given coordinates
 */
export const findNearest = <T extends { latitude: number; longitude: number }>(
  items: T[],
  latitude: number,
  longitude: number
): T | undefined => {
  if (items.length === 0) return undefined;
  
  let nearest = items[0];
  let minDistance = Infinity;
  
  for (const item of items) {
    if (item.latitude !== null && item.longitude !== null) {
      const distance = calculateDistance(latitude, longitude, item.latitude, item.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = item;
      }
    }
  }
  
  return nearest;
};

/**
 * Number helpers
 */

/**
 * Format number with separators
 */
export const formatNumber = (num: number, locale: string = 'fr-FR'): string => {
  return num.toLocaleString(locale);
};

/**
 * Round number to decimal places
 */
export const round = (num: number, decimals: number = 2): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

/**
 * Check if number is between range
 */
export const isBetween = (num: number, min: number, max: number): boolean => {
  return num >= min && num <= max;
};
