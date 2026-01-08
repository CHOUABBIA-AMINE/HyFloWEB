# Unified Utilities Migration Guide

## Overview

This document guides the migration of all modules from using duplicated utility functions across different folders to using the centralized, unified utilities in `src/shared/utils`.

## Status

**Centralized Utilities Created**: ✅
- `src/shared/utils/validators.ts` - All validation functions
- `src/shared/utils/formatters.ts` - All formatting functions
- `src/shared/utils/helpers.ts` - All helper functions
- `src/shared/utils/index.ts` - Centralized export point
- `src/shared/utils/README.md` - Complete documentation

**Next Step**: Update individual modules to use centralized utilities

## Migration Plan

### Phase 1: Update Import Statements (Current)

Update all modules to import from the new centralized location.

#### 1.1 General/Localization Module

**File**: `src/modules/general/localization/utils/validation.ts`  
**Action**: Delete (replaced by centralized validators.ts)  
**Migration**: Update all imports in localization components

```typescript
// Before
import { isNotEmpty, isValidCountryCode } from '../utils/validation';

// After
import { isNotEmpty, isValidCountryCode } from '@/shared/utils';
```

**File**: `src/modules/general/localization/utils/formatters.ts`  
**Action**: Delete (replaced by centralized formatters.ts)  
**Migration**: Update all imports in localization components

```typescript
// Before
import { toTitleCase, formatCoordinates } from '../utils/formatters';

// After
import { toTitleCase, formatCoordinates } from '@/shared/utils';
```

**File**: `src/modules/general/localization/utils/helpers.ts`  
**Action**: Delete (replaced by centralized helpers.ts)  
**Migration**: Update all imports in localization components

```typescript
// Before
import { sortBy, findByKey } from '../utils/helpers';

// After
import { sortBy, findByKey } from '@/shared/utils';
```

**File**: `src/modules/general/localization/utils/index.ts`  
**Action**: Delete (replaced by centralized utils index)

#### 1.2 General/Organization Module

**File**: `src/modules/general/organization/utils/validation.ts`  
**Action**: Delete (replaced by centralized validators.ts)  
**Migration**: Update all imports in organization components

```typescript
// Before
import { isValidEmail, isValidPhone } from '../utils/validation';

// After
import { isValidEmail, isValidPhone } from '@/shared/utils';
```

**File**: `src/modules/general/organization/utils/formatters.ts`  
**Action**: Delete (replaced by centralized formatters.ts)  
**Migration**: Update all imports in organization components

```typescript
// Before
import { formatPersonName, formatPhone } from '../utils/formatters';

// After
import { formatPersonName, formatPhone } from '@/shared/utils';
```

**File**: `src/modules/general/organization/utils/helpers.ts`  
**Action**: Delete (replaced by centralized helpers.ts)  
**Migration**: Update all imports in organization components

```typescript
// Before
import { sortBy } from '../utils/helpers';

// After
import { sortBy } from '@/shared/utils';
```

**File**: `src/modules/general/organization/utils/index.ts`  
**Action**: Delete (replaced by centralized utils index)

#### 1.3 Keep Module-Specific Files

**Keep**: `src/modules/general/localization/utils/constants.ts`  
**Keep**: `src/modules/general/localization/utils/localizationMapper.ts`  
**Keep**: `src/modules/general/localization/utils/localizationUtils.ts`  
**Keep**: `src/modules/general/organization/utils/constants.ts`  
**Keep**: `src/modules/general/organization/utils/organizationMapper.ts`  

*Reason*: These contain domain-specific mappings and constants that are module-specific.

### Phase 2: Update All Module Components (In Progress)

Update all component files within modules to use centralized utilities.

#### Components Affected

**General/Localization**:
- `src/modules/general/localization/components/**/*.tsx`
- `src/modules/general/localization/pages/**/*.tsx`
- `src/modules/general/localization/services/*.ts`

**General/Organization**:
- `src/modules/general/organization/components/**/*.tsx`
- `src/modules/general/organization/pages/**/*.tsx`
- `src/modules/general/organization/services/*.ts`

**General/Type**:
- `src/modules/general/type/components/**/*.tsx`
- `src/modules/general/type/pages/**/*.tsx`
- `src/modules/general/type/services/*.ts`

**Other Modules**:
- `src/modules/network/**/*.tsx`
- `src/modules/dashboard/**/*.tsx`
- `src/modules/system/**/*.tsx`
- `src/modules/common/**/*.tsx`

#### Example: Updating a Component

**Before**:
```typescript
// src/modules/general/localization/components/LocalizationForm.tsx
import { isNotEmpty, isValidCountryCode } from '../utils/validation';
import { toTitleCase, formatCoordinates } from '../utils/formatters';
import { sortBy } from '../utils/helpers';

function LocalizationForm() {
  const validateForm = () => {
    const valid = isNotEmpty(formData.country);
    return valid && isValidCountryCode(formData.countryCode);
  };
  
  const displayName = toTitleCase(localization.name);
  const sortedList = sortBy(items, 'name', 'asc');
}
```

**After**:
```typescript
// src/modules/general/localization/components/LocalizationForm.tsx
import { isNotEmpty, isValidCountryCode, toTitleCase, sortBy } from '@/shared/utils';

function LocalizationForm() {
  const validateForm = () => {
    const valid = isNotEmpty(formData.country);
    return valid && isValidCountryCode(formData.countryCode);
  };
  
  const displayName = toTitleCase(localization.name);
  const sortedList = sortBy(items, 'name', 'asc');
}
```

### Phase 3: Delete Old Module-Specific Utils

Once all components are updated, delete the old utility folders:

```bash
# Delete old utility files (after migration is complete)
rm -rf src/modules/general/localization/utils/validation.ts
rm -rf src/modules/general/localization/utils/formatters.ts
rm -rf src/modules/general/localization/utils/helpers.ts
rm -rf src/modules/general/localization/utils/index.ts

rm -rf src/modules/general/organization/utils/validation.ts
rm -rf src/modules/general/organization/utils/formatters.ts
rm -rf src/modules/general/organization/utils/helpers.ts
rm -rf src/modules/general/organization/utils/index.ts
```

### Phase 4: Update Tests

Update all test files to import from centralized location:

```typescript
// Before
import { isNotEmpty } from '../src/modules/general/localization/utils/validation';

// After
import { isNotEmpty } from '@/shared/utils';
```

## Benefits of Migration

✅ **Reduced Duplication**: Single copy of each utility function  
✅ **Easier Maintenance**: Update once, affects entire app  
✅ **Better Organization**: Clear structure in shared folder  
✅ **Type Safety**: Full TypeScript support  
✅ **Discoverability**: Developers find utilities in one place  
✅ **Consistency**: Same validation/formatting rules everywhere  
✅ **Smaller Bundle**: Less duplicated code in final build  
✅ **Better Tree-Shaking**: Unused utilities can be eliminated  

## Breaking Changes

**None** - The centralized utilities have the exact same function signatures as the old ones.

## Checklist for Migration

### Phase 1: Setup ✅
- [x] Create `src/shared/utils/validators.ts`
- [x] Create `src/shared/utils/formatters.ts`
- [x] Create `src/shared/utils/helpers.ts`
- [x] Create `src/shared/utils/index.ts`
- [x] Create `src/shared/utils/README.md`

### Phase 2: Update Imports
- [ ] Update `src/modules/general/localization/` components
- [ ] Update `src/modules/general/organization/` components
- [ ] Update `src/modules/general/type/` components
- [ ] Update `src/modules/network/` components
- [ ] Update `src/modules/dashboard/` components
- [ ] Update `src/modules/system/` components
- [ ] Update `src/modules/common/` components
- [ ] Update all service files
- [ ] Update all test files

### Phase 3: Delete Old Files
- [ ] Delete `src/modules/general/localization/utils/validation.ts`
- [ ] Delete `src/modules/general/localization/utils/formatters.ts`
- [ ] Delete `src/modules/general/localization/utils/helpers.ts`
- [ ] Delete `src/modules/general/localization/utils/index.ts`
- [ ] Delete `src/modules/general/organization/utils/validation.ts`
- [ ] Delete `src/modules/general/organization/utils/formatters.ts`
- [ ] Delete `src/modules/general/organization/utils/helpers.ts`
- [ ] Delete `src/modules/general/organization/utils/index.ts`

### Phase 4: Cleanup
- [ ] Run `npm run build` to verify no errors
- [ ] Run `npm run lint` to check code quality
- [ ] Run tests to ensure functionality
- [ ] Remove old utility folders if empty

## Testing Strategy

1. **Automated Tests**: Run existing tests with new imports
2. **Build Verification**: Ensure `npm run build` passes
3. **Lint Verification**: Ensure `npm run lint` passes
4. **Manual Testing**: Test critical flows in browser
5. **Bundle Analysis**: Verify bundle size reduction

## Rollback Plan

If issues occur during migration:

1. Revert commits to before utilities consolidation
2. Keep old module-specific utilities in place
3. Remove centralized utils
4. Address issues and retry

## Timeline

- **Phase 1**: ✅ Completed (Jan 8, 2026)
- **Phase 2**: In Progress
- **Phase 3**: Pending Phase 2 completion
- **Phase 4**: Pending Phase 3 completion

## Questions & Support

For questions about the migration:

1. Refer to `src/shared/utils/README.md` for detailed documentation
2. Check usage examples in `UNIFIED_UTILS_MIGRATION.md`
3. Review commit history for changes
4. Contact CHOUABBIA Amine

## References

- **Documentation**: `src/shared/utils/README.md`
- **Implementation**: 
  - `src/shared/utils/validators.ts` (70+ validators)
  - `src/shared/utils/formatters.ts` (35+ formatters)
  - `src/shared/utils/helpers.ts` (40+ helpers)

---

**Created**: 2026-01-08  
**Status**: In Progress  
**Next Update**: When Phase 2 begins
