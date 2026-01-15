# Localization Module - Backend Alignment Status

**Module**: General/Localization  
**Last Aligned**: 2026-01-15  
**Status**: ✅ FULLY ALIGNED

---

## Backend Geographic Hierarchy

### Corrected Structure (No Country-State Relationship)

```
Country (Independent entity)

State (Independent entity)
  └─ Locality
      └─ District (NEW - Added 2026-01-15)
          └─ Location (GPS coordinates)

Zone (Independent entity - No relationships)
```

**Key Points:**
- ❌ **NO relationship** between Country and State
- ✅ State → Locality → District → Location chain
- ✅ Zone is independent (no parent relationship)
- ✅ District is NEW entity added to hierarchy

---

## Entity DTOs

### 1. CountryDTO ✅
**Backend**: `dz.sh.trc.hyflo.general.localization.dto.CountryDTO`  
**Status**: Aligned

```typescript
interface CountryDTO {
  id?: number;
  code: string;              // @NotBlank, max 3 chars
  designationAr?: string;    // max 100 chars
  designationEn?: string;    // max 100 chars
  designationFr: string;     // @NotBlank, max 100 chars (required)
}
```

**Validation Rules:**
- ✅ `code`: Required, max 3 characters
- ✅ `designationFr`: Required, max 100 characters
- ✅ `designationAr`, `designationEn`: Optional, max 100 characters

**Relationships:** None (independent entity)

---

### 2. StateDTO ✅
**Backend**: `dz.sh.trc.hyflo.general.localization.dto.StateDTO`  
**Status**: Aligned

```typescript
interface StateDTO {
  id?: number;
  code: string;              // @NotBlank, max 10 chars
  designationAr?: string;    // max 100 chars
  designationEn?: string;    // max 100 chars
  designationFr: string;     // @NotBlank, max 100 chars (required)
}
```

**Validation Rules:**
- ✅ `code`: Required, max 10 characters
- ✅ `designationFr`: Required, max 100 characters
- ✅ `designationAr`, `designationEn`: Optional, max 100 characters

**Relationships:** None (independent entity - NO countryId)

---

### 3. LocalityDTO ✅
**Backend**: `dz.sh.trc.hyflo.general.localization.dto.LocalityDTO`  
**Status**: Aligned

```typescript
interface LocalityDTO {
  id?: number;
  code: string;              // @NotBlank, max 10 chars
  designationAr?: string;    // max 100 chars
  designationEn?: string;    // max 100 chars
  designationFr: string;     // @NotBlank, max 100 chars (required)
  stateId: number;           // @NotNull - FK to State (required)
  state?: StateDTO;          // Optional nested object
}
```

**Validation Rules:**
- ✅ `code`: Required, max 10 characters
- ✅ `designationFr`: Required, max 100 characters
- ✅ `stateId`: Required, positive number
- ✅ `designationAr`, `designationEn`: Optional, max 100 characters

**Relationships:** 
- Parent: State (via `stateId`)
- Children: District entities

---

### 4. DistrictDTO ✅ NEW
**Backend**: `dz.sh.trc.hyflo.general.localization.dto.DistrictDTO`  
**Status**: Newly Added (2026-01-15)

```typescript
interface DistrictDTO {
  id?: number;
  code: string;              // @NotBlank, max 10 chars
  designationAr?: string;    // max 100 chars
  designationEn?: string;    // max 100 chars
  designationFr: string;     // @NotBlank, max 100 chars (required)
  localityId: number;        // @NotNull - FK to Locality (required)
  locality?: LocalityDTO;    // Optional nested object
}
```

**Validation Rules:**
- ✅ `code`: Required, max 10 characters
- ✅ `designationFr`: Required, max 100 characters
- ✅ `localityId`: Required, positive number
- ✅ `designationAr`, `designationEn`: Optional, max 100 characters

**Relationships:**
- Parent: Locality (via `localityId`)
- Children: Location entities

**API Endpoints:**
- GET `/general/localization/district` - Paginated list
- GET `/general/localization/district/all` - All districts
- GET `/general/localization/district/{id}` - By ID
- POST `/general/localization/district` - Create
- PUT `/general/localization/district/{id}` - Update
- DELETE `/general/localization/district/{id}` - Delete
- GET `/general/localization/district/search?q=...` - Search
- GET `/general/localization/district/by-locality/{localityId}` - Filter by locality

---

### 5. ZoneDTO ✅
**Backend**: `dz.sh.trc.hyflo.general.localization.dto.ZoneDTO`  
**Status**: Aligned

```typescript
interface ZoneDTO {
  id?: number;
  code: string;              // @NotBlank, max 10 chars
  designationAr?: string;    // max 100 chars
  designationEn?: string;    // max 100 chars
  designationFr: string;     // @NotBlank, max 100 chars (required)
}
```

**Validation Rules:**
- ✅ `code`: Required, max 10 characters
- ✅ `designationFr`: Required, max 100 characters
- ✅ `designationAr`, `designationEn`: Optional, max 100 characters

**Relationships:** None (independent entity - NO localityId)

**Note:** Backend confirmed Zone has NO parent relationship field

---

### 6. LocationDTO ✅
**Backend**: `dz.sh.trc.hyflo.general.localization.dto.LocationDTO`  
**Status**: Aligned (Updated U-005, 2026-01-07)

```typescript
interface LocationDTO {
  id?: number;
  sequence: number;          // @NotBlank - Sort order (required)
  placeName: string;         // @NotBlank, max 10 chars (renamed from 'code')
  latitude: number;          // @NotNull - GPS latitude (required)
  longitude: number;         // @NotNull - GPS longitude (required)
  elevation?: number;        // Optional - Altitude in meters
  localityId?: number;       // Optional - FK to Locality
  locality?: LocalityDTO;    // Optional nested object
}
```

**Validation Rules:**
- ✅ `sequence`: Required, non-negative number
- ✅ `placeName`: Required, max 10 characters
- ✅ `latitude`: Required, -90 to 90 degrees
- ✅ `longitude`: Required, -180 to 180 degrees
- ✅ `elevation`: Optional
- ✅ `localityId`: Optional

**Relationships:**
- Parent: Locality (optional, via `localityId`)
- Note: District relationship may be added later

**Recent Changes (U-005):**
- ✅ Renamed `code` → `placeName`
- ✅ Removed `facilityId` (relationship inverted)
- ✅ Added `sequence` field
- ✅ Location is now independent entity

---

## Services

All 6 services follow the same pattern:

### Standard Methods (All Services)
```typescript
class EntityService {
  static async getAll(pageable: Pageable): Promise<Page<DTO>>
  static async getAllNoPagination(): Promise<DTO[]>
  static async getById(id: number): Promise<DTO>
  static async create(dto: DTO): Promise<DTO>
  static async update(id: number, dto: DTO): Promise<DTO>
  static async delete(id: number): Promise<void>
  static async globalSearch(searchTerm: string, pageable: Pageable): Promise<Page<DTO>>
}
```

### Additional Service Methods

**LocalityService:**
```typescript
static async findByState(stateId: number): Promise<LocalityDTO[]>
```

**DistrictService:** (NEW)
```typescript
static async findByLocality(localityId: number): Promise<DistrictDTO[]>
```

**LocationService:**
```typescript
static async findByLocality(localityId: number): Promise<LocationDTO[]>
```

---

## API Endpoints Summary

| Entity | Base URL | Has Relationship Filter |
|--------|----------|-------------------------|
| Country | `/general/localization/country` | No |
| State | `/general/localization/state` | No |
| Locality | `/general/localization/locality` | Yes (by-state) |
| District | `/general/localization/district` | Yes (by-locality) |
| Zone | `/general/localization/zone` | No |
| Location | `/general/localization/location` | Yes (by-locality) |

---

## Data Flow Examples

### Example 1: Algerian Wilaya (State) with Locality and District
```
State: Ouargla (Independent)
  └─ Locality: Hassi Messaoud
      └─ District: Industrial Zone
          └─ Location: Field GPS (31.6808°N, 6.0731°E)
              ↑
              └── Used by ProductionFieldDTO
```

### Example 2: Creating Full Geographic Entry
```typescript
// 1. Create State (no parent needed)
const state = await StateService.create({
  code: '30',
  designationFr: 'Ouargla',
  designationAr: 'ورقلة',
  designationEn: 'Ouargla'
});

// 2. Create Locality (linked to State)
const locality = await LocalityService.create({
  code: 'HM',
  designationFr: 'Hassi Messaoud',
  designationAr: 'حاسي مسعود',
  designationEn: 'Hassi Messaoud',
  stateId: state.id
});

// 3. Create District (linked to Locality)
const district = await DistrictService.create({
  code: 'IZ',
  designationFr: 'Zone Industrielle',
  designationAr: 'المنطقة الصناعية',
  designationEn: 'Industrial Zone',
  localityId: locality.id
});

// 4. Create Location (GPS coordinates)
const location = await LocationService.create({
  sequence: 1,
  placeName: 'Field-A',
  latitude: 31.6808,
  longitude: 6.0731,
  elevation: 145,
  localityId: locality.id
});
```

---

## Migration Notes

### What Changed (2026-01-15)

#### ✅ ADDED:
1. **DistrictDTO** - New entity in hierarchy
2. **DistrictService** - Full CRUD service
3. Backend alignment documentation

#### ✅ CLARIFIED:
1. Country and State are **independent** (no relationship)
2. Zone is **independent** (no localityId)
3. Hierarchy is: State → Locality → District → Location

#### ❌ REMOVED (Incorrect Assumptions):
1. countryId from StateDTO (never existed in backend)
2. localityId from ZoneDTO (confirmed not in backend)

---

## Validation Summary

| Field Type | Validation Rules |
|------------|------------------|
| **code** | Required, max 3-10 chars (varies by entity) |
| **designationFr** | Required, max 100 chars |
| **designationAr** | Optional, max 100 chars |
| **designationEn** | Optional, max 100 chars |
| **Foreign Keys** | Required (where applicable), positive integers |
| **GPS Coordinates** | latitude: -90 to 90, longitude: -180 to 180 |

---

## Testing Checklist

### ✅ Entities to Test
- [ ] CountryDTO - No relationships
- [ ] StateDTO - No relationships
- [ ] LocalityDTO - Has stateId
- [ ] DistrictDTO - Has localityId (NEW)
- [ ] ZoneDTO - No relationships
- [ ] LocationDTO - Has optional localityId

### ✅ Services to Test
- [ ] All CRUD operations
- [ ] Pagination
- [ ] Global search
- [ ] Relationship filters (findByState, findByLocality)

### ✅ Integration Tests
- [ ] Create full hierarchy (State → Locality → District → Location)
- [ ] Fetch nested objects
- [ ] Validate foreign key constraints

---

## Future Enhancements

### Potential Additions:
1. **District-Location Relationship**: Consider adding `districtId` to LocationDTO
2. **Country Integration**: If needed in future, add country selection
3. **Zone Purpose**: Clarify Zone entity usage (currently independent)
4. **Geocoding**: Add reverse geocoding for locations
5. **Distance Calculations**: Between locations for routing

---

**Status**: ✅ **FULLY ALIGNED WITH BACKEND**  
**Last Updated**: 2026-01-15 23:49 CET  
**Next Review**: When backend updates occur
