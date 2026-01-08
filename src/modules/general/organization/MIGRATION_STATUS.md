# Organization Module - Utilities Migration Status

**Module**: General/Organization  
**Date Started**: 2026-01-08  
**Status**: 🔄 IN PROGRESS

---

## Migration Strategy

Using the same **re-export pattern** successfully applied to Localization module.

### Phase 1: Update utils/index.ts ⏳ IN PROGRESS
**Action**: Redirect exports to centralized utilities

### Phase 2: Verify No Breakage
**Action**: Test that all imports still work

### Phase 3: Delete Old Files (Later)
**Action**: Remove validation.ts, formatters.ts, helpers.ts after verification

---

## Files in This Module

### ✅ Keep (Module-Specific)
- `constants.ts` - Organization-specific constants
- `organizationMapper.ts` - Domain-specific mapping logic
- `localizationUtils.ts` - Shared localization utilities

### 🔄 Replace with Centralized (To be deleted later)
- `validation.ts` → Use `@/shared/utils` validators
- `formatters.ts` → Use `@/shared/utils` formatters
- `helpers.ts` → Use `@/shared/utils` helpers

### 🔄 Update to Re-Export
- `index.ts` → Update to re-export from centralized utilities

---

## Migration Steps

### Step 1: Update utils/index.ts ⏳ IN PROGRESS
```typescript
// OLD (current)
export * from './validation';
export * from './formatters';
export * from './helpers';
export * from './constants';

// NEW (after migration)
export * from '@/shared/utils';  // validators, formatters, helpers
export * from './constants';       // keep module-specific
export * from './organizationMapper'; // keep module-specific
export * from './localizationUtils'; // keep module-specific
```

### Step 2: Test Imports
- Run `npm run build`
- Run `npm run lint`
- Verify no broken imports

### Step 3: Delete Old Files (Phase 3)
- Delete `validation.ts`
- Delete `formatters.ts`
- Delete `helpers.ts`

---

## Import Pattern (Transparent Migration)

### Before Migration
```typescript
import { isValidPhone, formatPersonName, sortBy } from '../utils';
// This imports from local validation.ts, formatters.ts, helpers.ts
```

### After Migration (Transparent)
```typescript
import { isValidPhone, formatPersonName, sortBy } from '../utils';
// This now imports from @/shared/utils through re-export
// Components don't need to change!
```

---

## Benefits

✅ **No Component Changes Required**: Components continue to import from `../utils`  
✅ **Transparent Migration**: Re-exports make it seamless  
✅ **Single Source of Truth**: Uses centralized utilities  
✅ **Easy Rollback**: Just revert utils/index.ts  
✅ **Consistent with Localization**: Same pattern, proven approach  

---

## Timeline

- **Step 1**: 2026-01-08 (Today) - Update utils/index.ts
- **Step 2**: 2026-01-08 (Today) - Testing and verification
- **Step 3**: 2026-01-09 (Tomorrow) - Delete old files after verification

---

## Notes

- Following same pattern as Localization module
- Uses **re-exports** for transparent migration
- Components don't need immediate updates
- Old utility files deleted after verification
- Module-specific files (constants, mapper, localizationUtils) preserved

---

**Last Updated**: 2026-01-08  
**Next Action**: Update utils/index.ts to re-export centralized utilities
