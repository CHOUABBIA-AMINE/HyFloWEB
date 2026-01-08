# Unified Utilities Module

## Overview

This directory contains centralized, reusable utility functions for the entire HyFlo application. All validators, formatters, and helpers are consolidated here to maintain a single source of truth and reduce code duplication.

## Structure

```
src/shared/utils/
├── validators.ts    # Validation functions for all entity types
├── formatters.ts    # Formatting functions for display and output
├── helpers.ts       # Generic helper functions for common operations
├── index.ts         # Centralized export point
└── README.md        # This file
```

## Modules

### 1. validators.ts

Comprehensive validation functions for all application entities.

#### Generic Validators
```typescript
import { isNotEmpty, isEmpty, isValidEmail } from '@/shared/utils';

isNotEmpty('hello');           // true
isValidEmail('user@example.com'); // true
```

#### Localization Validators
```typescript
import {
  isValidCountryCode,
  isValidStateCode,
  isValidLatitude,
  isValidLongitude,
  isValidCoordinates
} from '@/shared/utils';

isValidCountryCode('DZ');      // true
isValidLatitude(45.5);          // true
```

#### Organization Validators
```typescript
import {
  isValidRegistrationNumber,
  isValidStructureCode,
  isValidPhone,
  isValidBirthDate
} from '@/shared/utils';

isValidPhone('+213555123456');  // true
isValidBirthDate('1990-01-15'); // true (if past date)
```

#### Date Validators
```typescript
import {
  isValidDateRange,
  isValidPastDate
} from '@/shared/utils';

isValidDateRange('2023-01-01', '2023-12-31'); // true
```

### 2. formatters.ts

Formatting functions for displaying data in various formats.

#### Generic Formatters
```typescript
import { toTitleCase, truncate, formatDate } from '@/shared/utils';

toTitleCase('hello world');     // 'Hello World'
truncate('long text...', 5);    // 'long ...'
formatDate('2024-01-08');       // '08/01/2024' (locale-aware)
```

#### Localization Formatters
```typescript
import {
  formatCoordinates,
  formatFullAddress,
  formatLocationLabel
} from '@/shared/utils';

formatCoordinates(36.737, 3.086); // "36.7370° N, 3.0860° E"
formatFullAddress('Algiers', 'Algiers', 'Algiers', 'Algeria');
```

#### Organization Formatters
```typescript
import {
  formatPersonName,
  formatEmployeeLabel,
  formatPhone
} from '@/shared/utils';

formatPersonName('John', 'Doe', null, null, 'lt');
// "John DOE"

formatPhone('+213 555 123 456');
// "+213 555 123 456"
```

### 3. helpers.ts

Generic helper functions for common operations.

#### Array Operations
```typescript
import {
  sortBy,
  groupBy,
  findByKey,
  filterByKey,
  removeDuplicates,
  arrayIntersection,
  createOptions
} from '@/shared/utils';

// Sort
const sorted = sortBy(users, 'name', 'asc');

// Group
const grouped = groupBy(users, 'departmentId');

// Create dropdown options
const options = createOptions(countries, 'id', 'name');
// [{ value: 1, label: 'Algeria' }, ...]
```

#### Object Operations
```typescript
import {
  deepClone,
  mergeObjects,
  isEmptyObject
} from '@/shared/utils';

const cloned = deepClone(user);
const merged = mergeObjects(obj1, obj2, obj3);
```

#### String Operations
```typescript
import {
  toKebabCase,
  toSnakeCase,
  toCamelCase,
  capitalize
} from '@/shared/utils';

toKebabCase('firstName');  // 'first-name'
toSnakeCase('firstName');  // 'first_name'
toCamelCase('first_name'); // 'firstName'
```

#### Geographic Operations
```typescript
import {
  calculateDistance,
  findNearest
} from '@/shared/utils';

const distanceKm = calculateDistance(48.8566, 2.3522, 51.5074, -0.1278);
// Distance between Paris and London in kilometers

const nearest = findNearest(locations, 45.5, 3.0);
```

#### Number Operations
```typescript
import {
  formatNumber,
  round,
  isBetween
} from '@/shared/utils';

formatNumber(1234567.89, 'fr-FR'); // "1 234 567,89"
round(3.14159, 2);                 // 3.14
isBetween(5, 0, 10);                // true
```

## Usage Examples

### Example 1: Form Validation
```typescript
import { isNotEmpty, isValidEmail, isValidPhone } from '@/shared/utils';

function validateEmployee(employee: any) {
  return {
    firstNameValid: isNotEmpty(employee.firstName),
    emailValid: isValidEmail(employee.email),
    phoneValid: isValidPhone(employee.phone)
  };
}
```

### Example 2: Data Display
```typescript
import {
  toTitleCase,
  truncate,
  formatPersonName,
  formatDate
} from '@/shared/utils';

function formatEmployeeDisplay(employee: Employee) {
  return {
    name: formatPersonName(
      employee.firstNameLt,
      employee.lastNameLt,
      employee.firstNameAr,
      employee.lastNameAr
    ),
    hireDate: formatDate(employee.hireDate),
    department: toTitleCase(employee.department)
  };
}
```

### Example 3: Data Manipulation
```typescript
import {
  sortBy,
  groupBy,
  createOptions,
  filterByKey
} from '@/shared/utils';

function prepareLocalizationDropdowns(localizations: Localization[]) {
  const byCountry = groupBy(localizations, 'countryId');
  const sorted = sortBy(localizations, 'designationFr', 'asc');
  const options = createOptions(sorted, 'id', 'designationFr');
  
  return { byCountry, options };
}
```

## Migration Guide

If you're updating existing code to use the centralized utilities:

### Before (Duplicate Imports)
```typescript
import { isNotEmpty } from '../organization/utils/validation';
import { toTitleCase } from '../localization/utils/formatters';
import { sortBy } from '../localization/utils/helpers';
```

### After (Centralized Import)
```typescript
import { isNotEmpty, toTitleCase, sortBy } from '@/shared/utils';
```

## Adding New Utilities

When adding new utility functions:

1. **Validators**: Add to `validators.ts` with proper documentation
2. **Formatters**: Add to `formatters.ts` with proper documentation
3. **Helpers**: Add to `helpers.ts` with proper documentation
4. **Export**: Ensure the function is exported in `index.ts`

### Template for New Function
```typescript
/**
 * Brief description of what the function does
 * 
 * @param param1 - Description
 * @param param2 - Description (optional)
 * @returns Description of return value
 * @example
 * myFunction('value'); // Result
 */
export const myFunction = (param1: string, param2?: string): string => {
  // Implementation
  return result;
};
```

## Benefits

- ✅ **Single Source of Truth**: One location for all utilities
- ✅ **No Duplication**: Reduce code duplication across modules
- ✅ **Easy Maintenance**: Update utilities in one place, affects entire app
- ✅ **Better Organization**: Clear structure and categorization
- ✅ **Type Safety**: Full TypeScript support with proper typing
- ✅ **Discoverability**: All utilities in one place for developers
- ✅ **Consistency**: Standard patterns for validation, formatting, and helpers

## Testing

Each utility should have corresponding unit tests. Tests are located in:
```
src/__tests__/shared/utils/
├── validators.test.ts
├── formatters.test.ts
└── helpers.test.ts
```

## Performance Considerations

- All functions are pure and side-effect free
- Array functions create new arrays/objects (immutable)
- Geographic calculations use efficient algorithms
- String operations are optimized for common cases

## Accessibility

All formatters support:
- Multiple locales (fr-FR, en-US, ar-SA)
- RTL text (Arabic)
- Internationalized number and date formatting

## Contributing

When adding utilities:
1. Add comprehensive JSDoc comments
2. Add usage examples in the module
3. Add unit tests
4. Update this README with examples
5. Follow TypeScript best practices
6. Ensure functions are pure (no side effects)

---

**Last Updated**: 2026-01-08  
**Maintainer**: CHOUABBIA Amine
