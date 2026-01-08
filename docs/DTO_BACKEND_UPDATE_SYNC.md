# Backend Update Sync - LocationDTO
## January 7, 2026

## Overview

This document tracks the synchronization of frontend DTOs with backend changes from the HyFloAPI repository.

---

## Backend Update: U-001

**Date:** January 7, 2026, 10:04 AM  
**Commit:** [58fa73362ba5ee169f293bfdcbfa783ad6d35790](https://github.com/CHOUABBIA-AMINE/HyFloAPI/commit/58fa73362ba5ee169f293bfdcbfa783ad6d35790)  
**Title:** U-001 : Update Location (Model, DTO, Repository, Service, Controller)  
**Author:** Amine CHOUABBIA

### Files Changed in Backend:

1. `LocationDTO.java` - Added new fields
2. `Location.java` (Model) - Updated entity
3. `LocationRepository.java` - Updated repository
4. `LocationService.java` - Updated service
5. `LocationController.java` - Updated controller
6. `Pipeline.java` - Related changes

---

## LocationDTO Changes

### New Fields Added:

#### 1. **sequence** (int)
- **Type:** `int` (primitive)
- **Constraint:** `@NotBlank` (required)
- **Purpose:** Ordering/sequencing of locations
- **Default:** Must be provided (required field)

#### 2. **infrastructureId** (Long)
- **Type:** `Long` (nullable)
- **Constraint:** None (optional)
- **Purpose:** Links Location to Infrastructure entity
- **Relationship:** Many-to-One (Location → Infrastructure)

### Complete Updated Structure:

```java
@Data
public class LocationDTO extends GenericDTO<Location> {
    private int sequence;              // NEW - Required
    private String code;               // Existing - Required
    private Double latitude;           // Existing - Required
    private Double longitude;          // Existing - Required
    private Double elevation;          // Existing - Optional
    private Long infrastructureId;     // NEW - Optional
    private Long localityId;           // Existing - Optional
    private LocalityDTO locality;      // Existing - Optional nested
}
```

---

## Frontend Synchronization

### Changes Applied to HyFloWEB:

#### 1. **LocationDTO.ts** - Updated Interface

**File:** `src/modules/general/localization/dto/LocationDTO.ts`

**Changes:**
```typescript
export interface LocationDTO {
  id?: number;
  
  // NEW FIELDS:
  sequence: number;              // Required - ordering
  infrastructureId?: number;     // Optional - infrastructure link
  
  // EXISTING FIELDS:
  code: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  localityId?: number;           // Made optional (Long in backend)
  locality?: LocalityDTO;
}
```

**Validation Updates:**
- Added `sequence` validation (required, non-negative)
- Removed `localityId` validation (now optional in backend)

#### 2. **localizationMapper.ts** - Updated Mapper

**File:** `src/modules/general/localization/utils/localizationMapper.ts`

**Changes:**
```typescript
static mapToLocationDTO(data: any): LocationDTO {
  return {
    id: data.id,
    sequence: data.sequence,              // NEW
    code: data.code,
    latitude: data.latitude,
    longitude: data.longitude,
    elevation: data.elevation,
    infrastructureId: data.infrastructureId, // NEW
    localityId: data.localityId,
    locality: data.locality ? this.mapToLocalityDTO(data.locality) : undefined,
  };
}

static mapFromLocationDTO(data: Partial<LocationDTO>): Record<string, any> {
  return {
    sequence: data.sequence,              // NEW
    code: data.code,
    latitude: data.latitude,
    longitude: data.longitude,
    elevation: data.elevation,
    infrastructureId: data.infrastructureId, // NEW
    localityId: data.localityId,
  };
}
```

---

## Field-by-Field Comparison

| Field | Backend Type | Frontend Type | Required | Notes |
|-------|-------------|---------------|----------|-------|
| id | Long | number? | No | From GenericDTO |
| **sequence** | **int** | **number** | **Yes** | **NEW - Ordering** |
| code | String | string | Yes | max 10 chars |
| latitude | Double | number | Yes | -90 to 90 |
| longitude | Double | number | Yes | -180 to 180 |
| elevation | Double | number? | No | Optional altitude |
| **infrastructureId** | **Long** | **number?** | **No** | **NEW - Infrastructure link** |
| localityId | Long | number? | No | Changed to optional |
| locality | LocalityDTO | LocalityDTO? | No | Nested object |

---

## Breaking Changes

### ⚠️ **Impact on Existing Code:**

#### 1. **Forms Must Include Sequence**

**Before:**
```typescript
const newLocation = {
  code: "LOC001",
  latitude: 36.7538,
  longitude: 3.0588,
  localityId: 5
};
```

**After:**
```typescript
const newLocation = {
  sequence: 1,              // NOW REQUIRED!
  code: "LOC001",
  latitude: 36.7538,
  longitude: 3.0588,
  localityId: 5
};
```

#### 2. **Validation Now Requires Sequence**

**Error if sequence missing:**
```typescript
const errors = validateLocationDTO(location);
// Will return: ["Sequence is required"]
```

#### 3. **Optional Infrastructure Link**

Locations can now be linked to infrastructure entities:
```typescript
const locationWithInfrastructure = {
  sequence: 1,
  code: "LOC001",
  latitude: 36.7538,
  longitude: 3.0588,
  infrastructureId: 42,  // Links to Infrastructure #42
  localityId: 5
};
```

---

## Migration Guide

### Step 1: Update Existing Location Forms

**Add sequence input:**
```tsx
<Input
  type="number"
  name="sequence"
  label="Sequence"
  required
  min={0}
  value={formData.sequence}
  onChange={handleChange}
/>
```

### Step 2: Update API Calls

**Ensure sequence is included:**
```typescript
const createLocation = async (data: Partial<LocationDTO>) => {
  // Validate sequence is present
  if (data.sequence === undefined) {
    throw new Error("Sequence is required");
  }
  
  return await api.post('/locations', data);
};
```

### Step 3: Update Existing Data

If you have existing locations without sequence values:

```typescript
// Add sequence to existing locations
const updateLocationsWithSequence = async () => {
  const locations = await fetchAllLocations();
  
  for (let i = 0; i < locations.length; i++) {
    if (locations[i].sequence === undefined) {
      await updateLocation(locations[i].id!, {
        ...locations[i],
        sequence: i + 1  // Assign sequential numbers
      });
    }
  }
};
```

### Step 4: Optional - Add Infrastructure Selection

If using infrastructure linking:

```tsx
<Select
  name="infrastructureId"
  label="Infrastructure (Optional)"
  value={formData.infrastructureId}
  onChange={handleChange}
  options={infrastructures}
/>
```

---

## Testing Checklist

- [ ] Create new location with sequence
- [ ] Update existing location with sequence
- [ ] Validate sequence is required
- [ ] Test negative sequence rejection
- [ ] Test location without infrastructureId (optional)
- [ ] Test location with infrastructureId
- [ ] Test location without localityId (now optional)
- [ ] Verify mapper handles all new fields
- [ ] Check nested locality object mapping
- [ ] Test array mapping with new fields

---

## Database Considerations

### Backend Changes:

The backend update likely includes database migration:

```sql
ALTER TABLE location ADD COLUMN sequence INT NOT NULL DEFAULT 0;
ALTER TABLE location ADD COLUMN infrastructure_id BIGINT;
ALTER TABLE location ADD CONSTRAINT fk_location_infrastructure 
    FOREIGN KEY (infrastructure_id) REFERENCES infrastructure(id);
```

**Note:** Check with backend team for actual migration scripts.

---

## API Endpoint Changes

### Expected Request Format:

**POST /api/locations**
```json
{
  "sequence": 1,
  "code": "LOC001",
  "latitude": 36.7538,
  "longitude": 3.0588,
  "elevation": 24.0,
  "infrastructureId": 42,
  "localityId": 5
}
```

### Expected Response Format:

**GET /api/locations/1**
```json
{
  "id": 1,
  "sequence": 1,
  "code": "LOC001",
  "latitude": 36.7538,
  "longitude": 3.0588,
  "elevation": 24.0,
  "infrastructureId": 42,
  "localityId": 5,
  "locality": {
    "id": 5,
    "code": "LOC05",
    "designationFr": "Alger Centre",
    "stateId": 16
  }
}
```

---

## Commits

### HyFloWEB Repository:

1. **feat: add sequence and infrastructureId fields to LocationDTO**
   - Commit: [aa7e585c45659027d420d48c443c460753df8d8b](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/aa7e585c45659027d420d48c443c460753df8d8b)
   - Updated LocationDTO interface
   - Added sequence validation
   - Made localityId optional

2. **feat: update LocalizationMapper with sequence and infrastructureId**
   - Commit: [ff0ccd2b0ac5a05cc6b829b6fe444a5fce4d556a](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/ff0ccd2b0ac5a05cc6b829b6fe444a5fce4d556a)
   - Updated mapToLocationDTO
   - Updated mapFromLocationDTO
   - Added inline documentation

---

## Related Documentation

- [DTO_CLEANUP_REPORT.md](./DTO_CLEANUP_REPORT.md) - Initial cleanup documentation
- [DTO_COMPLETE_ALIGNMENT_SUMMARY.md](./DTO_COMPLETE_ALIGNMENT_SUMMARY.md) - Complete alignment overview
- [Backend Repository](https://github.com/CHOUABBIA-AMINE/HyFloAPI) - HyFloAPI backend
- [Backend Commit U-001](https://github.com/CHOUABBIA-AMINE/HyFloAPI/commit/58fa73362ba5ee169f293bfdcbfa783ad6d35790) - Location update

---

## Summary

### Changes Applied:

✅ **Added `sequence` field (required)** - For ordering locations  
✅ **Added `infrastructureId` field (optional)** - For infrastructure linking  
✅ **Made `localityId` optional** - Backend allows null  
✅ **Updated validation** - Includes sequence validation  
✅ **Updated mapper** - Handles all new fields  
✅ **Documentation** - Complete migration guide

### Alignment Status:

**LocationDTO: 100% aligned with backend ✅**

### Next Actions:

1. Update Location forms to include sequence field
2. Add infrastructure selection (if needed)
3. Test all CRUD operations
4. Update existing location records with sequence values
5. Verify integration with backend API

---

**Sync Date:** January 7, 2026, 11:13 AM CET  
**Backend Version:** U-001 (58fa733)  
**Frontend Version:** Latest (ff0ccd2)  
**Status:** ✅ Synchronized
