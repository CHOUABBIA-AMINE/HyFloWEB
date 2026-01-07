# Backend Update Sync - Network DTOs (U-006)
## January 7, 2026 - Network Entities Location Integration

## Overview

This document tracks the **U-006** backend update that added **location references** to all Network entities (Facility, Station, Terminal, HydrocarbonField), following the U-005 architectural change where Location became an independent entity.

---

## Backend Update: U-006

**Date:** January 7, 2026, 10:59 AM  
**Commit:** [dc30339c701a4d4af5809983cd50e02a0db832fa](https://github.com/CHOUABBIA-AMINE/HyFloAPI/commit/dc30339c701a4d4af5809983cd50e02a0db832fa)  
**Title:** U-006 : Update Network entities (Model, DTO, Repository, Service, Controller)  
**Author:** Amine CHOUABBIA  
**Type:** Feature Addition - Location Integration

### Files Changed:

1. `FacilityDTO.java` - Added locationId field
2. `StationDTO.java` - Added locationId field
3. `TerminalDTO.java` - Added locationId field
4. `HydrocarbonFieldDTO.java` - Added locationId field
5. `FacilityRepository.java` - Updated queries
6. `FacilityService.java` - Updated logic
7. `FacilityController.java` - Updated endpoints

---

## Key Change: Location Integration

### ➕ **Added Field: locationId**

All Network entities now have a **required** location reference.

**Reason:**
- Follows U-005 architectural change
- Location is now an independent, reusable entity
- Network entities point TO Location (not vice versa)
- Relationship: `NetworkEntity → has → Location`

**Impact:**
- All Network entities (Facility, Station, Terminal, HydrocarbonField) now require a location
- Location can be shared across multiple Network entities
- More flexible and normalized data model

---

## DTOs Updated

### 1. FacilityDTO

**Added Fields:**
```java
@NotNull(message = "Location is required")
private Long locationId;

private LocationDTO location; // Nested object
```

**Structure:**
```typescript
export interface FacilityDTO {
  id?: number;
  
  // Core fields (required)
  code: string; // max 20 chars
  name: string; // max 100 chars
  
  // Dates (optional)
  installationDate?: string;
  commissioningDate?: string;
  decommissioningDate?: string;
  
  // Required relationships
  operationalStatusId: number;
  structureId: number;
  vendorId: number;
  locationId: number; // ← ADDED in U-006
  
  // Nested objects
  operationalStatus?: OperationalStatusDTO;
  structure?: StructureDTO;
  vendor?: VendorDTO;
  location?: LocationDTO; // ← ADDED in U-006
}
```

---

### 2. StationDTO

**Added Fields:**
```java
@NotNull(message = "Location is required")
private Long locationId;

private LocationDTO location; // Nested object
```

**Structure:**
```typescript
export interface StationDTO {
  id?: number;
  
  // Core fields (required)
  code: string; // 2-20 chars
  name: string; // 3-100 chars
  
  // Dates (optional)
  installationDate?: string;
  commissioningDate?: string;
  decommissioningDate?: string;
  
  // Required relationships
  operationalStatusId: number;
  structureId: number;
  vendorId: number;
  locationId: number; // ← ADDED in U-006
  stationTypeId: number;
  pipelineSystemId: number;
  
  // Collections
  pipelineIds?: number[];
  
  // Nested objects
  operationalStatus?: OperationalStatusDTO;
  structure?: StructureDTO;
  vendor?: VendorDTO;
  location?: LocationDTO; // ← ADDED in U-006
  stationType?: StationTypeDTO;
  pipelineSystem?: PipelineSystemDTO;
}
```

---

### 3. TerminalDTO

**Added Fields:**
```java
@NotNull(message = "Location is required")
private Long locationId;

private LocationDTO location; // Nested object
```

**Note:** TerminalDTO has **legacy location fields** (placeName, latitude, longitude, elevation) that appear redundant with the location reference but are kept for backend compatibility.

**Structure:**
```typescript
export interface TerminalDTO {
  id?: number;
  
  // Core fields (required)
  code: string; // 2-20 chars
  name: string; // 3-100 chars
  
  // Dates (optional)
  installationDate?: string;
  commissioningDate?: string;
  decommissioningDate?: string;
  
  // Legacy location fields (redundant but required)
  placeName: string; // max 100 chars
  latitude: number;
  longitude: number;
  elevation: number;
  
  // Required relationships
  operationalStatusId: number;
  structureId: number;
  vendorId: number;
  locationId: number; // ← ADDED in U-006
  terminalTypeId: number;
  
  // Collections
  pipelineIds?: number[];
  
  // Nested objects
  operationalStatus?: OperationalStatusDTO;
  structure?: StructureDTO;
  vendor?: VendorDTO;
  location?: LocationDTO; // ← ADDED in U-006
  terminalType?: TerminalTypeDTO;
}
```

---

### 4. HydrocarbonFieldDTO

**Added Fields:**
```java
@NotNull(message = "Location is required")
private Long locationId;

private LocationDTO location; // Nested object
```

**Structure:**
```typescript
export interface HydrocarbonFieldDTO {
  id?: number;
  
  // Core fields (required)
  code: string; // 2-20 chars
  name: string; // 3-100 chars
  
  // Dates (optional)
  installationDate?: string;
  commissioningDate?: string;
  decommissioningDate?: string;
  
  // Required relationships
  operationalStatusId: number;
  structureId: number;
  vendorId: number;
  locationId: number; // ← ADDED in U-006
  hydrocarbonFieldTypeId: number;
  
  // Collections
  pipelineIds?: number[];
  partnerIds?: number[];
  productIds?: number[];
  
  // Nested objects
  operationalStatus?: OperationalStatusDTO;
  structure?: StructureDTO;
  vendor?: VendorDTO;
  location?: LocationDTO; // ← ADDED in U-006
  hydrocarbonFieldType?: HydrocarbonFieldTypeDTO;
}
```

---

## Common Structure

All Network entities now share this common structure:

### **Required Fields:**

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| `code` | string | 2-20 chars (Facility: max 20) | Unique identifier |
| `name` | string | 3-100 chars (Facility: max 100) | Entity name |
| `operationalStatusId` | number | @NotNull | Reference to OperationalStatus |
| `structureId` | number | @NotNull | Reference to Structure (organization) |
| `vendorId` | number | @NotNull | Reference to Vendor (provider) |
| **`locationId`** | number | @NotNull | Reference to Location ← **NEW** |

### **Optional Date Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `installationDate` | string | Date when installed (ISO format) |
| `commissioningDate` | string | Date when commissioned (ISO format) |
| `decommissioningDate` | string | Date when decommissioned (ISO format) |

### **Nested Objects (Response Only):**

| Field | Type | Description |
|-------|------|-------------|
| `operationalStatus` | OperationalStatusDTO | Nested operational status object |
| `structure` | StructureDTO | Nested structure object |
| `vendor` | VendorDTO | Nested vendor object |
| **`location`** | LocationDTO | Nested location object ← **NEW** |

---

## Frontend Synchronization

### Files Created/Updated:

#### **1. FacilityDTO.ts**

**File:** `src/modules/network/core/dto/FacilityDTO.ts`  
**Commit:** [f6d165f047ac21582ca68f09848866a88aba3d1f](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/f6d165f047ac21582ca68f09848866a88aba3d1f)

**Changes:**
- Added `locationId: number` (required)
- Added `location?: LocationDTO` (nested object)
- Updated validation to require locationId

---

#### **2. StationDTO.ts**

**File:** `src/modules/network/core/dto/StationDTO.ts`  
**Commit:** [b52187612b2a546d7e454da6c1ddccd9e57ed191](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/b52187612b2a546d7e454da6c1ddccd9e57ed191)

**Changes:**
- Added `locationId: number` (required)
- Added `location?: LocationDTO` (nested object)
- Updated validation to require locationId

---

#### **3. TerminalDTO.ts**

**File:** `src/modules/network/core/dto/TerminalDTO.ts`  
**Commit:** [b52187612b2a546d7e454da6c1ddccd9e57ed191](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/b52187612b2a546d7e454da6c1ddccd9e57ed191)

**Changes:**
- Added `locationId: number` (required)
- Added `location?: LocationDTO` (nested object)
- Updated validation to require locationId
- **Note:** Kept legacy location fields (placeName, lat, lng, elevation) for backend compatibility

---

#### **4. HydrocarbonFieldDTO.ts**

**File:** `src/modules/network/core/dto/HydrocarbonFieldDTO.ts`  
**Commit:** [b52187612b2a546d7e454da6c1ddccd9e57ed191](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/b52187612b2a546d7e454da6c1ddccd9e57ed191)

**Changes:**
- Added `locationId: number` (required)
- Added `location?: LocationDTO` (nested object)
- Updated validation to require locationId

---

## Breaking Changes

### ⚠️ **CRITICAL: locationId is Now Required**

All Network entity creation/update requests **MUST** include a `locationId`.

#### **Before U-006 (No longer valid):**

```typescript
const facility = {
  code: "FAC001",
  name: "Main Facility",
  operationalStatusId: 1,
  structureId: 10,
  vendorId: 5
  // No locationId!
};

await FacilityService.create(facility);
// ❌ Will fail - locationId is required!
```

#### **After U-006 (Correct):**

```typescript
const facility = {
  code: "FAC001",
  name: "Main Facility",
  operationalStatusId: 1,
  structureId: 10,
  vendorId: 5,
  locationId: 101 // ✅ Required!
};

await FacilityService.create(facility);
// ✅ Success
```

---

## Usage Examples

### Creating a Facility with Location

```typescript
// Step 1: Create or get a Location
const location = {
  sequence: 1,
  placeName: "LOC-ALG",
  latitude: 36.7538,
  longitude: 3.0588,
  elevation: 50.0
};

const createdLocation = await LocationService.create(location);

// Step 2: Create Facility referencing the Location
const facility = {
  code: "FAC001",
  name: "Algiers Main Facility",
  operationalStatusId: 1,
  structureId: 10,
  vendorId: 5,
  locationId: createdLocation.id, // Reference the location
  installationDate: "2020-01-15",
  commissioningDate: "2020-06-01"
};

const createdFacility = await FacilityService.create(facility);
```

---

### Creating a Station with Location

```typescript
// Reuse the same location for multiple entities
const station = {
  code: "STA001",
  name: "Main Pumping Station",
  operationalStatusId: 1,
  structureId: 10,
  vendorId: 5,
  locationId: 101, // Same location as Facility!
  stationTypeId: 2,
  pipelineSystemId: 7
};

const createdStation = await StationService.create(station);
```

---

### API Response with Nested Location

```json
{
  "id": 42,
  "code": "FAC001",
  "name": "Algiers Main Facility",
  "installationDate": "2020-01-15",
  "commissioningDate": "2020-06-01",
  "operationalStatusId": 1,
  "structureId": 10,
  "vendorId": 5,
  "locationId": 101,
  "operationalStatus": {
    "id": 1,
    "code": "OPERATIONAL",
    "name": "Operational"
  },
  "structure": {
    "id": 10,
    "code": "STRUCT001",
    "name": "Main Structure"
  },
  "vendor": {
    "id": 5,
    "name": "Vendor ABC"
  },
  "location": {
    "id": 101,
    "sequence": 1,
    "placeName": "LOC-ALG",
    "latitude": 36.7538,
    "longitude": 3.0588,
    "elevation": 50.0
  }
}
```

---

## Form Updates

### Add Location Field to Network Entity Forms

```tsx
import { Select } from '@/components/ui/select';

<Form>
  {/* Existing fields */}
  <Input name="code" label="Code" required />
  <Input name="name" label="Name" required />
  
  {/* Add Location field */}
  <Select
    name="locationId"
    label="Location"
    required
    options={locations.map(loc => ({
      value: loc.id,
      label: `${loc.placeName} (${loc.latitude}, ${loc.longitude})`
    }))}
  />
  
  {/* Other fields */}
  <Select name="operationalStatusId" label="Status" required />
  <Select name="structureId" label="Structure" required />
  <Select name="vendorId" label="Vendor" required />
</Form>
```

---

## Migration Guide

### Step 1: Update Interface Definitions

✅ Already completed - all Network DTOs updated

### Step 2: Update Form Components

**Add location selector to all Network entity forms:**
- FacilityForm.tsx
- StationForm.tsx
- TerminalForm.tsx
- HydrocarbonFieldForm.tsx

### Step 3: Update Service Methods

**Ensure all create/update methods include locationId:**

```typescript
// In FacilityService.ts
export const createFacility = async (data: Partial<FacilityDTO>) => {
  // Validate locationId is present
  if (!data.locationId) {
    throw new Error("Location is required");
  }
  
  return await api.post('/facilities', data);
};
```

### Step 4: Update Display Components

**Show location information in lists/details:**

```tsx
// In FacilityDetails.tsx
<div>
  <h3>Location</h3>
  {facility.location && (
    <div>
      <p>Place: {facility.location.placeName}</p>
      <p>Coordinates: {facility.location.latitude}, {facility.location.longitude}</p>
      <p>Elevation: {facility.location.elevation}m</p>
    </div>
  )}
</div>
```

### Step 5: Handle Terminal Legacy Fields

**For TerminalDTO, manage both location reference AND legacy fields:**

```typescript
// When creating Terminal
const terminal = {
  code: "TERM001",
  name: "Export Terminal",
  // New location reference
  locationId: 101,
  // Legacy fields (for backward compatibility)
  placeName: "TERM-EXPORT",
  latitude: 36.7538,
  longitude: 3.0588,
  elevation: 10.0,
  // ... other fields
};
```

---

## Testing Checklist

### Network Entity CRUD:
- [ ] Create Facility with locationId succeeds
- [ ] Create Station with locationId succeeds
- [ ] Create Terminal with locationId AND legacy fields succeeds
- [ ] Create HydrocarbonField with locationId succeeds
- [ ] Creating without locationId fails with validation error
- [ ] GET requests return nested location object

### Form Testing:
- [ ] Location selector appears in all Network entity forms
- [ ] Location is marked as required
- [ ] Form submission includes locationId
- [ ] Validation prevents submission without location

### Display Testing:
- [ ] List views show location information
- [ ] Detail views display full location data
- [ ] Map components use location coordinates (if applicable)

### Location Reuse:
- [ ] Multiple entities can reference the same location
- [ ] Updating a location affects all referencing entities
- [ ] Deleting a location is prevented if referenced by entities

---

## Architectural Benefits

### Location Reusability:

**Scenario:** Multiple facilities at the same location

```typescript
// One Location
const location = { id: 101, placeName: "Industrial Zone A", ... };

// Multiple entities sharing the location
const facility1 = { id: 1, code: "FAC001", locationId: 101 };
const facility2 = { id: 2, code: "FAC002", locationId: 101 };
const station = { id: 10, code: "STA001", locationId: 101 };

// All three entities are at the same physical location!
```

**Benefits:**
1. ✅ **Data Normalization**: Location data stored once
2. ✅ **Consistency**: All entities use the same coordinates
3. ✅ **Maintainability**: Update location once, affects all
4. ✅ **Flexibility**: Easy to model complex relationships

---

## Summary

### Changes Applied:

✅ **FacilityDTO** - Added locationId and location nested object  
✅ **StationDTO** - Added locationId and location nested object  
✅ **TerminalDTO** - Added locationId and location nested object  
✅ **HydrocarbonFieldDTO** - Added locationId and location nested object  
✅ **Validation** - All DTOs require locationId  
✅ **Documentation** - Complete U-006 documentation

### Field Added:

**`locationId: number`** - Required reference to Location entity (added to all Network entities)

### Architectural Change:

**Location Integration:**
- Network entities now point TO Location
- Location is reusable across entities
- Follows U-005 architectural change

### Alignment Status:

**All Network DTOs: 100% aligned with backend ✅**

### Breaking Changes:

⚠️ **Yes** - locationId is now required for all Network entities

### Next Actions:

1. ⚠️ **Add location selector to all Network entity forms**
2. ⚠️ **Update service methods to validate locationId**
3. Update display components to show location info
4. Test all Network entity CRUD operations
5. Test location reusability across entities
6. Handle Terminal legacy location fields appropriately

---

**Sync Date:** January 7, 2026, 12:20 PM CET  
**Backend Version:** U-006 (dc30339)  
**Frontend Version:** Latest (f6d165f, b521876)  
**Status:** ✅ Synchronized  
**Breaking Changes:** ⚠️ Yes - locationId is required  
**Impact Level:** 🟡 MEDIUM - Requires form and service updates
