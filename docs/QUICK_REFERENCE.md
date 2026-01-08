# Unified Utilities - Quick Reference Guide

## Quick Import

```typescript
// Import any utilities you need
import {
  // Validators
  isNotEmpty,
  isValidEmail,
  isValidPhone,
  
  // Formatters
  toTitleCase,
  formatDate,
  formatPersonName,
  
  // Helpers
  sortBy,
  groupBy,
  createOptions
} from '@/shared/utils';
```

## Validators Quick Reference

### Generic
```typescript
isNotEmpty(value)           // Check if value is not empty
isEmpty(value)              // Check if value is empty
isValidEmail(email)         // Validate email format
isValidUrl(url)             // Validate URL format
isValidPassword(pwd)        // Validate password strength
```

### Geographic
```typescript
isValidCountryCode('DZ')    // Check country code
isValidLatitude(45.5)       // Check latitude range
isValidLongitude(3.086)     // Check longitude range
isValidCoordinates(lat, lon) // Check coordinate pair
```

### Organization
```typescript
isValidPhone('+213555123456')  // Phone format
isValidBirthDate('1990-01-15') // Past date check
isValidEmployeeCode('EMP001')   // Employee code format
```

### Dates
```typescript
isValidDateRange(start, end)   // Date range valid
isValidPastDate(date)          // Is past date
```

## Formatters Quick Reference

### Generic
```typescript
toTitleCase('hello world')       // "Hello World"
truncate('long text...', 5)      // "long ..."
capitalize('hello')              // "Hello"
formatText('hello world', 'title') // "Hello World"
```

### Date/Time
```typescript
formatDate('2024-01-08')         // "08/01/2024" (locale-aware)
formatTime('14:30:00')           // "14:30" or "2:30 PM"
formatDateRange(start, end)      // "01/01/2024 - 31/01/2024"
formatRelativeTime(date)         // "2 hours ago"
```

### Location
```typescript
formatCoordinates(36.737, 3.086) // "36.7370° N, 3.0860° E"
formatFullAddress(city, state, postal, country)
// "Algiers, Algiers, 16000, Algeria"
formatLocationLabel(name, city)  // "Location - City"
```

### Organization
```typescript
formatPersonName('John', 'Doe', 'جون', 'دو', 'lt')
// "John DOE" (language-aware)
formatEmployeeLabel(emp)        // "FNAME LNAME - Position"
formatPhone('+213 555 123 456') // "+213 555 123 456"
```

## Helpers Quick Reference

### Array Operations
```typescript
// Sorting
const sorted = sortBy(users, 'name', 'asc');
const sorted = sortBy(users, 'age', 'desc');

// Grouping
const grouped = groupBy(users, 'departmentId');
// Returns: { '1': [...], '2': [...] }

// Finding
const user = findByKey(users, 'id', 5);

// Filtering
const admins = filterByKey(users, 'role', 'admin');

// Remove duplicates
const unique = removeDuplicates(ids);

// Create dropdown options
const options = createOptions(countries, 'id', 'name');
// Returns: [{ value: 1, label: 'Algeria' }, ...]
```

### Object Operations
```typescript
// Deep clone
const cloned = deepClone(user);

// Merge objects
const merged = mergeObjects(obj1, obj2, obj3);

// Check if empty
const empty = isEmptyObject(obj); // true/false

// Get values/keys
const values = getObjectValues(obj);
const keys = getObjectKeys(obj);
```

### String Operations
```typescript
toKebabCase('firstName')  // "first-name"
toSnakeCase('firstName')  // "first_name"
toCamelCase('first_name') // "firstName"
repeatString('x', 5)      // "xxxxx"
padStart('5', 3, '0')     // "005"
padEnd('5', 3, '0')       // "500"
```

### Geographic
```typescript
// Calculate distance (Haversine formula)
const km = calculateDistance(48.8566, 2.3522, 51.5074, -0.1278);
// Paris to London: ~340 km

// Find nearest
const nearest = findNearest(locations, 45.5, 3.0);
```

### Number
```typescript
formatNumber(1234567.89, 'fr-FR') // "1 234 567,89"
round(3.14159, 2)                 // 3.14
isBetween(5, 0, 10)                // true
```

## Common Use Cases

### Form Validation
```typescript
const validateForm = (data) => {
  return {
    email: isValidEmail(data.email),
    phone: isValidPhone(data.phone),
    birthDate: isValidBirthDate(data.birthDate),
    hasName: isNotEmpty(data.firstName)
  };
};
```

### Data Display
```typescript
const displayLocalization = (loc) => ({
  name: formatLocationLabel(loc.designationFr, loc.city),
  coords: formatCoordinates(loc.latitude, loc.longitude),
  fullAddress: formatFullAddress(
    loc.designationFr,
    loc.state,
    loc.postalCode,
    loc.country
  )
});
```

### Dropdown/Select Options
```typescript
const countryOptions = createOptions(
  countries,
  'id',      // Value field
  'name'     // Label field
);
// Returns: [{ value: 1, label: 'Algeria' }, ...]

const sorted = sortBy(countryOptions, 'label', 'asc');
```

### Data Grouping
```typescript
const groupByDept = (employees) => {
  const grouped = groupBy(employees, 'departmentId');
  
  return Object.entries(grouped).map(([deptId, emps]) => ({
    departmentId: deptId,
    employees: sortBy(emps, 'lastName', 'asc'),
    count: emps.length
  }));
};
```

### Location Services
```typescript
const findClosestOffice = (userLocation, offices) => {
  const nearest = findNearest(offices, userLocation.lat, userLocation.lng);
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    nearest.latitude,
    nearest.longitude
  );
  
  return {
    office: nearest,
    distanceKm: round(distance, 2)
  };
};
```

## TypeScript Generics

Many helpers use TypeScript generics for type safety:

```typescript
// sortBy<T> preserves type
const users: User[] = [...];
const sorted = sortBy(users, 'name', 'asc');
// Type: User[] ✓

// groupBy<T> returns proper types
const grouped = groupBy(users, 'departmentId');
// Type: Record<string, User[]> ✓

// createOptions works with any array
const options = createOptions(countries, 'id', 'name');
// Type: Array<{ value: any; label: string }> ✓
```

## Error Handling

All utilities are defensive and handle edge cases:

```typescript
// Safe with null/undefined
isNotEmpty(null)      // false
isNotEmpty(undefined) // false
isNotEmpty('')        // false

// Safe with empty arrays
findByKey([], 'id', 1)     // undefined
sortBy([], 'name', 'asc')  // []

// Safe with invalid coordinates
findNearest([], 45.5, 3.0) // undefined

// Safe with division by zero scenarios
round(Infinity, 2)         // Infinity (handled gracefully)
```

## Performance Tips

1. **Use createOptions for dropdowns**: Pre-formats data correctly
2. **Use sortBy once**: Sorts in-place, creates new array
3. **Use groupBy for aggregation**: Reduces iteration overhead
4. **Use deepClone sparingly**: Recursive, use spread operator for shallow clones
5. **Cache formatted results**: Don't reformat in every render

## Locale Support

Formatters support multiple locales:

```typescript
formatDate('2024-01-08', 'fr-FR')  // "08/01/2024"
formatDate('2024-01-08', 'en-US')  // "01/08/2024"
formatDate('2024-01-08', 'de-DE')  // "08.01.2024"

formatNumber(1234.56, 'fr-FR')     // "1 234,56"
formatNumber(1234.56, 'en-US')     // "1,234.56"
formatNumber(1234.56, 'de-DE')     // "1.234,56"
```

## RTL Support

Perfect for Arabic/Hebrew text:

```typescript
formatPersonName(
  'John',
  'Doe',
  'جون',
  'دو',
  'ar'  // Arabic language code
);
// Returns properly formatted name for Arabic layout
```

## Related Documentation

- **Full Reference**: See `src/shared/utils/README.md`
- **Migration Guide**: See `UNIFIED_UTILS_MIGRATION.md`
- **Implementation**: 
  - `src/shared/utils/validators.ts`
  - `src/shared/utils/formatters.ts`
  - `src/shared/utils/helpers.ts`

---

**Last Updated**: 2026-01-08  
**For Full Documentation**: Open `src/shared/utils/README.md`
