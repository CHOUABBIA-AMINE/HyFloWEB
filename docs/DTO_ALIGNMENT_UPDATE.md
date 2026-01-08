# DTO Alignment Update - January 6, 2026

## Overview

This document outlines the changes made to align TypeScript DTOs with Java backend DTOs in the Localization module.

## Changes Made

### 1. ✅ Updated DTO Files

All TypeScript DTOs in `src/modules/general/localization/dto/` have been updated:

#### Field Name Changes
**Before:**
```typescript
export interface CountryDTO {
  nameAr: string;    // ❌ Wrong - frontend-specific naming
  nameFr: string;
  nameEn: string;
}
```

**After:**
```typescript
export interface CountryDTO {
  designationAr?: string;  // ✅ Aligned with Java backend
  designationFr: string;
  designationEn?: string;
}
```

**DTOs Updated:**
- ✅ `CountryDTO.ts` - field names aligned, validation added
- ✅ `StateDTO.ts` - field names aligned, removed nested country object, uses countryId
- ✅ `LocalityDTO.ts` - field names aligned, removed nested state object, uses stateId
- ✅ `ZoneDTO.ts` - field names aligned, removed description field
- ✅ `LocationDTO.ts` - field names aligned, removed geographic coordinates, uses localityId & zoneId

### 2. ✅ Added Validation Functions

Each DTO now includes a validation function that enforces backend constraints:

```typescript
export const validateCountryDTO = (data: Partial<CountryDTO>): string[] => {
  const errors: string[] = [];
  
  if (!data.code) {
    errors.push("Code is required");
  } else if (data.code.length > 3) {
    errors.push("Code must not exceed 3 characters");
  }
  // ... more validations
  
  return errors;
};
```

**Validation Rules Enforced:**

| DTO | Field | Constraint |
|-----|-------|------------|
| Country | code | Required, max 3 chars |
| Country | designationFr | Required, max 100 chars |
| Country | designationAr | Optional, max 100 chars |
| Country | designationEn | Optional, max 100 chars |
| State | code | Required, max 2 chars |
| State | countryId | Required |
| State | designationFr | Required, max 100 chars |
| Locality | code | Required, max 5 chars |
| Locality | stateId | Required |
| Locality | designationFr | Required, max 100 chars |
| Zone | code | Required, max 5 chars |
| Zone | localityId | Required |
| Zone | designationFr | Required, max 100 chars |
| Location | code | Required, max 5 chars |
| Location | localityId | Required |
| Location | zoneId | Required |
| Location | designationFr | Required, max 100 chars |

### 3. ✅ Created LocalizationMapper Utility

New file: `src/modules/general/localization/utils/localizationMapper.ts`

Provides bidirectional DTO transformations:

```typescript
// Map backend response to frontend DTO
const country = LocalizationMapper.mapToCountryDTO(backendResponse);

// Map frontend DTO to backend request payload
const payload = LocalizationMapper.mapFromCountryDTO(formData);

// Map arrays
const countries = LocalizationMapper.mapCountriesArray(backendArray);
```

**Mapper Methods Available:**
- `mapToCountryDTO()` / `mapFromCountryDTO()` / `mapCountriesArray()`
- `mapToStateDTO()` / `mapFromStateDTO()` / `mapStatesArray()`
- `mapToLocalityDTO()` / `mapFromLocalityDTO()` / `mapLocalitiesArray()`
- `mapToZoneDTO()` / `mapFromZoneDTO()` / `mapZonesArray()`
- `mapToLocationDTO()` / `mapFromLocationDTO()` / `mapLocationsArray()`

### 4. ✅ Updated DTO Exports

File: `src/modules/general/localization/dto/index.ts`

Now exports both types and validation functions:

```typescript
export type { CountryDTO };
export { validateCountryDTO };
export type { StateDTO };
export { validateStateDTO };
// ... etc
```

## Migration Checklist

### For Services
- [ ] Import `LocalizationMapper` from `./utils/localizationMapper`
- [ ] Use `LocalizationMapper.mapToCountryDTO()` for API responses
- [ ] Use `LocalizationMapper.mapFromCountryDTO()` for request payloads
- [ ] Use `LocalizationMapper.map*Array()` for array responses

### For Components
- [ ] Replace all `nameAr` with `designationAr`
- [ ] Replace all `nameFr` with `designationFr`
- [ ] Replace all `nameEn` with `designationEn`
- [ ] Import validation functions: `import { validateCountryDTO } from '../dto'`
- [ ] Call validation before form submission
- [ ] Remove nested object references (e.g., `state.name` → use `stateId`)

### For API Calls
- [ ] Update request/response type hints
- [ ] Ensure mappers are used consistently
- [ ] Test serialization/deserialization

## Example Service Update

### Before (❌ Old way)
```typescript
const response = await api.get('/general/countries');
const countries = response.data; // Raw response
setCountries(countries); // Type mismatch!
```

### After (✅ New way)
```typescript
import { LocalizationMapper } from '../utils/localizationMapper';
import { CountryDTO, validateCountryDTO } from '../dto';

const response = await api.get('/general/countries');
const countries = LocalizationMapper.mapCountriesArray(response.data);
setCountries(countries); // Type-safe!
```

## Example Component Update

### Before (❌ Old way)
```typescript
const [data, setData] = useState({
  nameAr: '',    // ❌ Wrong field name
  nameFr: '',
  nameEn: '',
});

const handleSubmit = () => {
  // ❌ No validation
  api.post('/general/countries', data);
};
```

### After (✅ New way)
```typescript
import { CountryDTO, validateCountryDTO } from '../dto';
import { LocalizationMapper } from '../utils/localizationMapper';

const [data, setData] = useState<Partial<CountryDTO>>({
  designationAr: '',  // ✅ Correct field name
  designationFr: '',
  designationEn: '',
});
const [errors, setErrors] = useState<string[]>([]);

const handleSubmit = () => {
  // ✅ Validate before submission
  const validationErrors = validateCountryDTO(data);
  if (validationErrors.length > 0) {
    setErrors(validationErrors);
    return;
  }
  
  // ✅ Use mapper for request
  const payload = LocalizationMapper.mapFromCountryDTO(data);
  api.post('/general/countries', payload);
};
```

## Testing

After applying changes, verify:

```bash
# TypeScript compilation
npm run build

# Type checking
npm run type-check

# Unit tests (if available)
npm run test

# Development server
npm run dev
```

## Files Changed

### Modified Files
- `src/modules/general/localization/dto/CountryDTO.ts`
- `src/modules/general/localization/dto/StateDTO.ts`
- `src/modules/general/localization/dto/LocalityDTO.ts`
- `src/modules/general/localization/dto/ZoneDTO.ts`
- `src/modules/general/localization/dto/LocationDTO.ts`
- `src/modules/general/localization/dto/index.ts`

### New Files
- `src/modules/general/localization/utils/localizationMapper.ts`

### Documentation
- `DTO_ALIGNMENT_UPDATE.md` (this file)

## Git Commits

1. `fix: align CountryDTO field names with Java backend (designation* instead of name*)`
2. `fix: align StateDTO field names with Java backend (designation* instead of name*)`
3. `fix: align LocalityDTO field names with Java backend (designation* instead of name*)`
4. `fix: align ZoneDTO field names with Java backend (designation* instead of name*)`
5. `fix: align LocationDTO field names with Java backend (designation* instead of name*)`
6. `feat: add LocalizationMapper utility for DTO transformations`
7. `refactor: export validation functions from localization DTOs`

## Next Steps

1. **Update Services** - Apply mappers to all service methods
   - `src/modules/general/localization/services/*.ts`

2. **Update Components** - Replace field names and add validation
   - `src/modules/general/localization/components/**/*.tsx`
   - `src/modules/general/localization/pages/**/*.tsx`

3. **Update State Management** - If using Redux/Zustand
   - Review and update state type definitions
   - Update reducers to use mappers

4. **Testing** - Create/update tests
   - Service transformation tests
   - Component integration tests
   - Validation function tests

5. **Documentation** - Update API documentation
   - Swagger/OpenAPI specs
   - Component documentation
   - Service documentation

## FAQ

**Q: Why change from `name*` to `designation*`?**
A: The Java backend uses `designation*` field names. For consistency and to match API contracts, the frontend must use the same names.

**Q: Do I need to update all components immediately?**
A: Components should be updated as they're modified. Validation functions help catch issues early.

**Q: What about nested objects like `state: StateDTO`?**
A: Replace with `stateId: number` to match backend DTOs. Fetch full objects separately if needed.

**Q: How do I handle API responses that still use old field names?**
A: Use the `LocalizationMapper` to transform responses automatically.

## Support

For questions or issues:
1. Review `DTO_alignment_guide.md` for detailed analysis
2. Check `DTO_quick_fix_guide.md` for implementation patterns
3. Review mapper utility documentation
4. Test with real API responses

---

**Updated:** January 6, 2026  
**Status:** ✅ Complete - DTOs updated and aligned with Java backend
