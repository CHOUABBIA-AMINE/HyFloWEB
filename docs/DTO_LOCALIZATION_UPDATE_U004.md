# Backend Update Sync - Localization DTOs (U-004)
## January 7, 2026 - LocationDTO Field Rename

## Overview

This document tracks the **U-004** backend update that renamed a relationship field in LocationDTO from `infrastructureId` to `facilityId`.

---

## Backend Update: U-004

**Date:** January 7, 2026, 10:30 AM  
**Commit:** [03e82309eaaed23d13ab57f10e02d64a02d7457e](https://github.com/CHOUABBIA-AMINE/HyFloAPI/commit/03e82309eaaed23d13ab57f10e02d64a02d7457e)  
**Title:** U-004 : Update Location (Model, DTO, Repository, Service, Controller)  
**Author:** Amine CHOUABBIA

### Files Changed:

1. `Location.java` (Model) - Field renamed
2. `LocationDTO.java` - Field renamed
3. `LocationRepository.java` - Updated queries
4. `LocationService.java` - Updated logic
5. `LocationController.java` - Updated endpoints

---

## Change Summary

### 🔄 **Field Renamed: infrastructureId → facilityId**

The backend renamed the relationship field to better reflect the domain model.

#### **U-001 (Previous):**
```java
private Long infrastructureId;

.infrastructureId(entity.getInfrastructure() != null ? 
                  entity.getInfrastructure().getId() : null)
```

#### **U-004 (Current):**
```java
private Long facilityId;

.facilityId(entity.getFacility() != null ? 
            entity.getFacility().getId() : null)
```

---

## Rationale for Change

### Domain Model Clarification:

**"Infrastructure" → "Facility"**

1. **More Specific**: "Facility" is more precise than "Infrastructure"
2. **Domain Language**: Better aligns with industry terminology
3. **Clarity**: Clearly indicates physical locations/buildings/installations
4. **Consistency**: Matches naming conventions in other modules

**Examples of Facilities:**
- Buildings
- Warehouses
- Data centers
- Plants
- Stations
- Installations

---

## Complete LocationDTO Structure

### Backend (U-004):

```java
@Data
@EqualsAndHashCode(callSuper = true)
public class LocationDTO extends GenericDTO<Location> {

    @NotBlank(message = "Sequence is required")
    private int sequence;

    @NotBlank(message = "Code is required")
    @Size(max = 10, message = "Code must not exceed 10 characters")
    private String code;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private Double elevation;

    private Long facilityId;  // ← RENAMED from infrastructureId

    private Long localityId;
    
    private LocalityDTO locality;
}
```

### Frontend (Updated):

```typescript
export interface LocationDTO {
  // Identifier
  id?: number;

  // Core fields
  sequence: number;     // Required
  code: string;         // Required, max 10 chars
  latitude: number;     // Required
  longitude: number;    // Required
  elevation?: number;   // Optional
  
  // Relationships
  facilityId?: number;  // ← RENAMED from infrastructureId
  localityId?: number;  // Optional
  
  // Nested objects
  locality?: LocalityDTO;
}
```

---

## Field Details

### Required Fields:

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| `sequence` | number | @NotBlank | Sequential identifier |
| `code` | string | @NotBlank, max 10 | Location code |
| `latitude` | number | @NotNull, -90 to 90 | Geographic latitude |
| `longitude` | number | @NotNull, -180 to 180 | Geographic longitude |

### Optional Fields:

| Field | Type | Description |
|-------|------|-------------|
| `elevation` | number | Elevation above sea level (meters) |
| `facilityId` | number | Reference to Facility entity (renamed) |
| `localityId` | number | Reference to Locality entity |
| `locality` | LocalityDTO | Nested locality object (in responses) |

---

## Frontend Synchronization

### Changes Applied:

#### **LocationDTO.ts** - Field Renamed

**File:** `src/modules/general/localization/dto/LocationDTO.ts`

**Commit:** [27b5df8e8c942733402e421b42ffd144ec50809d](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/27b5df8e8c942733402e421b42ffd144ec50809d)

**Changes:**
```typescript
export interface LocationDTO {
  id?: number;
  sequence: number;
  code: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  
  // RENAMED: infrastructureId → facilityId
  facilityId?: number;  // Was: infrastructureId
  localityId?: number;
  
  locality?: LocalityDTO;
}
```

---

## Breaking Changes

### ⚠️ **Impact on Existing Code:**

#### 1. **API Requests - Field Name Changed**

**Before U-004 (Incorrect):**
```typescript
const location = {
  sequence: 1,
  code: "LOC001",
  latitude: 36.7538,
  longitude: 3.0588,
  infrastructureId: 42  // ❌ OLD field name
};

await LocationService.create(location);
```

**After U-004 (Correct):**
```typescript
const location = {
  sequence: 1,
  code: "LOC001",
  latitude: 36.7538,
  longitude: 3.0588,
  facilityId: 42  // ✅ NEW field name
};

await LocationService.create(location);
```

#### 2. **API Responses - Field Name Changed**

**Before U-004:**
```json
{
  "id": 1,
  "sequence": 1,
  "code": "LOC001",
  "latitude": 36.7538,
  "longitude": 3.0588,
  "infrastructureId": 42
}
```

**After U-004:**
```json
{
  "id": 1,
  "sequence": 1,
  "code": "LOC001",
  "latitude": 36.7538,
  "longitude": 3.0588,
  "facilityId": 42
}
```

#### 3. **Form Fields - Update Names**

**Before U-004:**
```tsx
<Select
  name="infrastructureId"  // ❌ OLD
  label="Infrastructure"
  value={formData.infrastructureId}
  onChange={handleChange}
/>
```

**After U-004:**
```tsx
<Select
  name="facilityId"  // ✅ NEW
  label="Facility"
  value={formData.facilityId}
  onChange={handleChange}
/>
```

#### 4. **Service Methods - Update References**

**Before U-004:**
```typescript
const getLocationsByInfrastructure = async (infrastructureId: number) => {
  return await api.get(`/locations?infrastructureId=${infrastructureId}`);
};
```

**After U-004:**
```typescript
const getLocationsByFacility = async (facilityId: number) => {
  return await api.get(`/locations?facilityId=${facilityId}`);
};
```

---

## Migration Guide

### Step 1: Update Interface/Type Definitions

**Find and replace in LocationDTO:**
```bash
# Search for:
infrastructureId

# Replace with:
facilityId
```

### Step 2: Update Form Components

**Update form field names:**
```tsx
// Change field name
<Select
  name="facilityId"              // ← Updated
  label="Facility"                // ← Updated label
  value={formData.facilityId}     // ← Updated
  onChange={handleChange}
  options={facilities}             // ← Updated variable name
/>
```

### Step 3: Update State Management

**Update form state:**
```typescript
const [formData, setFormData] = useState<Partial<LocationDTO>>({
  sequence: 0,
  code: "",
  latitude: 0,
  longitude: 0,
  facilityId: undefined  // ← Updated from infrastructureId
});
```

### Step 4: Update Service Methods

**Rename service methods and parameters:**
```typescript
// Before
getLocationsByInfrastructure(infrastructureId: number)

// After
getLocationsByFacility(facilityId: number)
```

### Step 5: Update API Query Parameters

**Update query strings:**
```typescript
// Before
const url = `/locations?infrastructureId=${id}`;

// After
const url = `/locations?facilityId=${id}`;
```

### Step 6: Update Display Components

**Update labels and text:**
```tsx
// Before
<span>Infrastructure: {location.infrastructureId}</span>

// After
<span>Facility: {location.facilityId}</span>
```

---

## Testing Checklist

### Location CRUD Operations:
- [ ] Create location with facilityId (should succeed)
- [ ] Create location without facilityId (should succeed - optional)
- [ ] Update location changing facilityId
- [ ] GET location - verify facilityId in response (not infrastructureId)
- [ ] List locations filtering by facilityId

### Form Testing:
- [ ] Location form displays "Facility" field
- [ ] Facility dropdown populated correctly
- [ ] Form submission includes facilityId
- [ ] Form validation works with facilityId

### API Testing:
- [ ] POST /locations with facilityId succeeds
- [ ] GET /locations returns facilityId
- [ ] Query parameter ?facilityId={id} works
- [ ] Verify infrastructureId is NOT in requests/responses

### Service Testing:
- [ ] LocationService methods use facilityId
- [ ] Filter/search by facility works
- [ ] No references to infrastructureId remain

---

## API Examples

### POST /api/locations

**Request:**
```json
{
  "sequence": 1,
  "code": "LOC-ALG-001",
  "latitude": 36.7538,
  "longitude": 3.0588,
  "elevation": 50.0,
  "facilityId": 42,
  "localityId": 16
}
```

**Response:**
```json
{
  "id": 101,
  "sequence": 1,
  "code": "LOC-ALG-001",
  "latitude": 36.7538,
  "longitude": 3.0588,
  "elevation": 50.0,
  "facilityId": 42,
  "localityId": 16,
  "locality": {
    "id": 16,
    "code": "ALG",
    "designationFr": "Alger",
    "designationAr": "الجزائر"
  }
}
```

### GET /api/locations?facilityId=42

**Response:**
```json
[
  {
    "id": 101,
    "sequence": 1,
    "code": "LOC-ALG-001",
    "latitude": 36.7538,
    "longitude": 3.0588,
    "facilityId": 42
  },
  {
    "id": 102,
    "sequence": 2,
    "code": "LOC-ALG-002",
    "latitude": 36.7698,
    "longitude": 3.0586,
    "facilityId": 42
  }
]
```

---

## Code Search & Replace

### Global Find & Replace:

**In TypeScript files:**
```bash
# Find:
infrastructureId

# Replace with:
facilityId
```

**In JSX/TSX files:**
```bash
# Find:
Infrastructure

# Replace with (where appropriate):
Facility
```

**In comments/labels:**
```bash
# Find:
infrastructure

# Replace with:
facility
```

### Files to Check:

1. `src/modules/general/localization/dto/LocationDTO.ts` ✅ Updated
2. `src/modules/general/localization/services/LocationService.ts` - Check if exists
3. `src/modules/general/localization/components/LocationForm.tsx` - Check if exists
4. `src/modules/general/localization/components/LocationList.tsx` - Check if exists
5. Any other files referencing LocationDTO

---

## Validation Rules

### Unchanged Validation:

All validation rules remain the same, only the field name changed:

```typescript
export const validateLocationDTO = (data: Partial<LocationDTO>): string[] => {
  const errors: string[] = [];
  
  // Sequence: Required
  if (data.sequence === undefined || data.sequence === null) {
    errors.push("Sequence is required");
  }
  
  // Code: Required, max 10 chars
  if (!data.code) {
    errors.push("Code is required");
  } else if (data.code.length > 10) {
    errors.push("Code must not exceed 10 characters");
  }
  
  // Latitude: Required, -90 to 90
  if (data.latitude === undefined || data.latitude === null) {
    errors.push("Latitude is required");
  } else if (data.latitude < -90 || data.latitude > 90) {
    errors.push("Latitude must be between -90 and 90 degrees");
  }
  
  // Longitude: Required, -180 to 180
  if (data.longitude === undefined || data.longitude === null) {
    errors.push("Longitude is required");
  } else if (data.longitude < -180 || data.longitude > 180) {
    errors.push("Longitude must be between -180 and 180 degrees");
  }
  
  // facilityId: Optional (no validation needed)
  // localityId: Optional (no validation needed)
  // elevation: Optional (no validation needed)
  
  return errors;
};
```

---

## Summary

### Changes Applied:

✅ **LocationDTO updated** - infrastructureId renamed to facilityId  
✅ **Documentation updated** - Comments and headers reflect U-004  
✅ **Validation unchanged** - All validation rules remain the same  
✅ **Type safety maintained** - TypeScript interface updated

### Field Rename:

**Before:** `infrastructureId?: number`  
**After:** `facilityId?: number`

### Alignment Status:

**LocationDTO: 100% aligned with backend ✅**

### Impact:

**Breaking Change:** ⚠️ Yes - Field name changed
- Update all API requests using infrastructureId
- Update all forms using infrastructureId
- Update all services referencing infrastructureId
- Update all display components showing infrastructureId

### Next Actions:

1. Search codebase for "infrastructureId" references
2. Update all forms to use "facilityId"
3. Update all service methods
4. Update API query parameters
5. Update display labels ("Infrastructure" → "Facility")
6. Test all location CRUD operations
7. Test location filtering by facility
8. Update documentation/help text

---

**Sync Date:** January 7, 2026, 11:35 AM CET  
**Backend Version:** U-004 (03e8230)  
**Frontend Version:** Latest (27b5df8)  
**Status:** ✅ Synchronized  
**Breaking Change:** ⚠️ Yes - Field rename requires code updates
