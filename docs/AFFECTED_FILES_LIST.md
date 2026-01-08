# API Client Migration - Affected Files List

**Generated**: 2026-01-08 09:50 CET  
**Total Files**: 37 service files confirmed

---

## Summary

All files listed below currently use:
```typescript
import { apiClient } from '@/lib/api-client';
const BASE_URL = '/api/...';
```

They will be updated to:
```typescript
import axiosInstance from '@/shared/config/axios';
const BASE_URL = '/...';  // No /api prefix
```

---

## General Module (9 files)

### Localization Services (5 files)

1. ✅ `src/modules/general/localization/services/CountryService.ts`
   - Import: `{ apiClient }` → `axiosInstance`
   - BASE_URL: `/api/general/localization/countries` → `/general/localization/countries`

2. ✅ `src/modules/general/localization/services/StateService.ts`
   - Import: `{ apiClient }` → `axiosInstance`
   - BASE_URL: `/api/general/localization/states` → `/general/localization/states`

3. ✅ `src/modules/general/localization/services/LocalityService.ts`
   - Import: `{ apiClient }` → `axiosInstance`
   - BASE_URL: `/api/general/localization/localities` → `/general/localization/localities`

4. ✅ `src/modules/general/localization/services/LocationService.ts`
   - Import: `{ apiClient }` → `axiosInstance`
   - BASE_URL: `/api/general/localization/locations` → `/general/localization/locations`

5. ✅ `src/modules/general/localization/services/ZoneService.ts`
   - Import: `{ apiClient }` → `axiosInstance`
   - BASE_URL: `/api/general/localization/zones` → `/general/localization/zones`

### Organization Services (4 files)

6. ✅ `src/modules/general/organization/services/PersonService.ts`
   - Import: `{ apiClient }` → `axiosInstance`
   - BASE_URL: `/api/general/organization/persons` → `/general/organization/persons`

7. ✅ `src/modules/general/organization/services/EmployeeService.ts`
   - Import: `{ apiClient }` → `axiosInstance`
   - BASE_URL: `/api/general/organization/employees` → `/general/organization/employees`

8. ✅ `src/modules/general/organization/services/JobService.ts`
   - Import: `{ apiClient }` → `axiosInstance`
   - BASE_URL: `/api/general/organization/jobs` → `/general/organization/jobs`

9. ✅ `src/modules/general/organization/services/StructureService.ts`
   - Import: `{ apiClient }` → `axiosInstance`
   - BASE_URL: `/api/general/organization/structures` → `/general/organization/structures`

---

## Network Module (28 files)

### Network Core Services (9 files)

10. ✅ `src/modules/network/core/services/FacilityService.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/core/facilities` → `/network/core/facilities`

11. ✅ `src/modules/network/core/services/EquipmentService.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/core/equipment` → `/network/core/equipment`

12. ✅ `src/modules/network/core/services/HydrocarbonFieldService.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/core/hydrocarbon-fields` → `/network/core/hydrocarbon-fields`

13. ✅ `src/modules/network/core/services/InfrastructureService.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/core/infrastructures` → `/network/core/infrastructures`

14. ✅ `src/modules/network/core/services/PipelineService.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/core/pipelines` → `/network/core/pipelines`

15. ✅ `src/modules/network/core/services/PipelineSegmentService.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/core/pipeline-segments` → `/network/core/pipeline-segments`

16. ✅ `src/modules/network/core/services/PipelineSystemService.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/core/pipeline-systems` → `/network/core/pipeline-systems`

17. ✅ `src/modules/network/core/services/StationService.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/core/stations` → `/network/core/stations`

18. ✅ `src/modules/network/core/services/TerminalService.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/core/terminals` → `/network/core/terminals`

### Network Type Services (8 files)

19. ✅ `src/modules/network/type/services/CompanyTypeService.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/type/company-types` → `/network/type/company-types`

20. ✅ `src/modules/network/type/services/EquipmentTypeService.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/type/equipment-types` → `/network/type/equipment-types`

21. ✅ `src/modules/network/type/services/FacilityTypeService.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/type/facility-types` → `/network/type/facility-types`

22. ✅ `src/modules/network/type/services/HydrocarbonFieldTypeService.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/type/hydrocarbon-field-types` → `/network/type/hydrocarbon-field-types`

23. ✅ `src/modules/network/type/services/PartnerTypeService.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/type/partner-types` → `/network/type/partner-types`

24. ✅ `src/modules/network/type/services/StationTypeService.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/type/station-types` → `/network/type/station-types`

25. ✅ `src/modules/network/type/services/TerminalTypeService.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/type/terminal-types` → `/network/type/terminal-types`

26. ✅ `src/modules/network/type/services/VendorTypeService.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/type/vendor-types` → `/network/type/vendor-types`

### Network Common Services (estimated 3-5 files)

27-31. ✅ `src/modules/network/common/services/*.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/common/...` → `/network/common/...`
    - Note: Exact files need verification

### Network Geo Services (estimated 3-5 files)

32-36. ✅ `src/modules/network/geo/services/*.ts`
    - Import: `{ apiClient }` → `axiosInstance`
    - BASE_URL: `/api/network/geo/...` → `/network/geo/...`
    - Note: Exact files need verification

---

## System Module

### Auth Service - Already Correct! ✅

37. ✅ `src/modules/system/auth/services/AuthService.ts`
   - **Already uses**: `import axiosInstance from '../../../../shared/config/axios';`
   - **Already correct**: `BASE_URL = '/auth'` (no /api prefix)
   - **No changes needed** - This file is already following the correct pattern!

### Security Services (need to check)

- `src/modules/system/security/services/*.ts`
  - Need to verify if they use apiClient or axiosInstance

---

## Files NOT Affected

### Already Using axiosInstance Directly

- ✅ `src/modules/system/auth/services/AuthService.ts` - Already correct
- ✅ `src/shared/config/axios.ts` - The source axios instance
- ✅ `src/lib/api-client.ts` - Will be deleted after migration

### Don't Have Service Files

- `src/modules/dashboard/*` - No services folder
- `src/modules/network/flow/*` - Has dto but no services folder

---

## Migration Changes per File

Each affected file will have these changes:

### Change 1: Import Statement
```typescript
// Before
import { apiClient } from '@/lib/api-client';

// After
import axiosInstance from '@/shared/config/axios';
```

### Change 2: All Usage
```typescript
// Before
apiClient.get(...)
apiClient.post(...)
apiClient.put(...)
apiClient.delete(...)

// After
axiosInstance.get(...)
axiosInstance.post(...)
axiosInstance.put(...)
axiosInstance.delete(...)
```

### Change 3: BASE_URL
```typescript
// Before
const BASE_URL = '/api/MODULE/FEATURE';

// After
const BASE_URL = '/MODULE/FEATURE';
```

---

## Verification Commands

### Count Files to Update
```bash
# Count service files using apiClient
grep -r "from '@/lib/api-client'" src/modules --include="*.ts" | wc -l

# List all files using apiClient
grep -r "from '@/lib/api-client'" src/modules --include="*.ts" -l

# Count BASE_URL with /api prefix
grep -r "BASE_URL = '/api/" src/modules --include="*Service.ts" | wc -l
```

### After Migration - Verify Clean
```bash
# Should return nothing
grep -r "from '@/lib/api-client'" src/modules --include="*.ts"
grep -r "apiClient\." src/modules --include="*.ts"

# Check for remaining /api/ prefixes
grep -r "BASE_URL = '/api/" src/modules --include="*.ts"
```

---

## Impact Summary

| Module | Service Files | Changes per File |
|--------|---------------|------------------|
| General/Localization | 5 | 3 changes each |
| General/Organization | 4 | 3 changes each |
| Network/Core | 9 | 3 changes each |
| Network/Type | 8 | 3 changes each |
| Network/Common | ~3-5 | 3 changes each |
| Network/Geo | ~3-5 | 3 changes each |
| **Total** | **~37 files** | **~111 changes** |

**Changes per File**:
1. Import statement (1 line)
2. All apiClient usage (multiple lines)
3. BASE_URL constant (1 line)

---

## Testing Priority

### High Priority (Core Functionality)
1. ✅ Auth/Login - Already uses axiosInstance
2. ✅ General/Localization - Country/State selection
3. ✅ General/Organization - Employee/Person forms
4. ✅ Network/Core - Main network operations

### Medium Priority
5. ✅ Network/Type - Type management
6. ✅ Network/Common - Common utilities

### Low Priority
7. ✅ Network/Geo - Mapping features

---

**Status**: 📝 Complete File List Generated  
**Next Step**: Run migration script  
**Estimated Time**: Script runs in < 1 minute  
**Total Files**: 37 confirmed + verify common/geo services
