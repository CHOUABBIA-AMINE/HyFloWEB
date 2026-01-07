# General Localization Services & Utils Documentation
## January 7, 2026 - Complete Service Layer

## Overview

This document covers the **General Localization Services and Utilities** - the service layer for geographic entities. These services manage the complete geographic hierarchy from countries down to specific locations, plus administrative zones.

---

## Backend Source

**Repository:** [HyFloAPI](https://github.com/CHOUABBIA-AMINE/HyFloAPI)  
**Package:** `dz.sh.trc.hyflo.general.localization.service`  
**Author:** MEDJERAB Abir  
**Created:** 06-26-2025  
**Updated:** 01-02-2026

---

## Geographic Hierarchy

```
Country (e.g., Algeria, France)
  └─> State/Province (e.g., Algiers, Paris)
       └─> Locality/City (e.g., Bab El Oued, 15th Arrondissement)
            └─> Location/Address (e.g., specific addresses)

Zone (administrative/geographic regions, independent)
```

---

## Services Summary (5 Total)

All General Localization Services have been created from backend:

| # | Service | DTO | Purpose | Relationships | Methods | Status |
|---|---------|-----|---------|---------------|---------|--------|
| 1 | **[CountryService](#countryservice)** | CountryDTO | Countries management | Top level | 7 | ✅ Created |
| 2 | **[StateService](#stateservice)** | StateDTO | States/Provinces | Country | 7 | ✅ Created |
| 3 | **[LocalityService](#localityservice)** | LocalityDTO | Cities/Localities | State | 8 | ✅ Created |
| 4 | **[LocationService](#locationservice)** | LocationDTO | Addresses/Locations | Locality | 8 | ✅ Created |
| 5 | **[ZoneService](#zoneservice)** | ZoneDTO | Administrative zones | Independent | 7 | ✅ Created |

---

## Utils Summary (4 Categories)

Utility functions created for the General Localization module:

| # | Util | Purpose | Functions | Status |
|---|------|---------|-----------|--------|
| 1 | **[validation.ts](#validationts)** | Location validations | 10 functions | ✅ Created |
| 2 | **[formatters.ts](#formattersts)** | Location formatting | 9 functions | ✅ Created |
| 3 | **[helpers.ts](#helpersts)** | Location helpers | 16 functions | ✅ Created |
| 4 | **[constants.ts](#constantsts)** | Location constants | 8 constant groups | ✅ Created |

---

## Service Architecture

### **Standard Service Pattern:**

All localization services follow the same pattern:

1. **CRUD Operations:**
   - `getAll(pageable)` - Get all with pagination
   - `getAllNoPagination()` - Get all without pagination
   - `getById(id)` - Get single entity
   - `create(dto)` - Create new entity
   - `update(id, dto)` - Update existing entity
   - `delete(id)` - Delete entity

2. **Search Operations:**
   - `globalSearch(searchTerm, pageable)` - Search across all fields

3. **Relationship Operations (varies by service):**
   - `getByStateId(stateId)` - LocalityService
   - `findByLocality(localityId)` - LocationService

---

## Detailed Service Documentation

---

## CountryService

### **Purpose:**
Manages countries - the top level of the geographic hierarchy.

### **Base URL:**
```typescript
/api/general/localization/countries
```

### **Entity Fields:**
- `id` - Unique identifier
- `code` - ISO country code (2-3 letters, e.g., DZ, FR, USA)
- `designationFr` - French name
- `designationEn` - English name
- `description` - Optional description

### **Methods (7 total):**

```typescript
// Standard CRUD
static async getAll(pageable): Promise<Page<CountryDTO>>
static async getAllNoPagination(): Promise<CountryDTO[]>
static async getById(id): Promise<CountryDTO>
static async create(dto): Promise<CountryDTO>  // Logs: "Creating country: code={code}, designationFr={designationFr}"
static async update(id, dto): Promise<CountryDTO>  // Logs: "Updating country with ID: {id}"
static async delete(id): Promise<void>
static async globalSearch(term, pageable): Promise<Page<CountryDTO>>
```

### **Usage Example:**

```typescript
import { CountryService } from '@/modules/general/localization/services';

// Get all countries for dropdown
const countries = await CountryService.getAllNoPagination();

// Create new country
const algeria = await CountryService.create({
  code: 'DZ',
  designationFr: 'Algérie',
  designationEn: 'Algeria',
  description: 'North African country'
});

// Search countries
const results = await CountryService.globalSearch('algeria', {
  page: 0,
  size: 20,
  sort: 'designationFr,asc'
});
```

---

## StateService

### **Purpose:**
Manages states/provinces - second level of geographic hierarchy, belongs to countries.

### **Base URL:**
```typescript
/api/general/localization/states
```

### **Entity Fields:**
- `id` - Unique identifier
- `code` - State code (2-5 characters, e.g., AL, ALG, 16)
- `designationFr` - French name
- `designationEn` - English name
- `countryId` - Parent country
- `description` - Optional description

### **Methods (7 total):**

Same as CountryService pattern.

**Backend logs:**
- Create: "Creating state: code={code}, designationFr={designationFr}"
- Update: "Updating state with ID: {id}"

### **Usage Example:**

```typescript
import { StateService } from '@/modules/general/localization/services';

// Create state
const algiers = await StateService.create({
  code: '16',
  designationFr: 'Alger',
  designationEn: 'Algiers',
  countryId: 1,  // Algeria
  description: 'Capital state'
});

// Get all states
const states = await StateService.getAllNoPagination();
```

---

## LocalityService

### **Purpose:**
Manages localities/cities - third level of geographic hierarchy, belongs to states.

### **Base URL:**
```typescript
/api/general/localization/localities
```

### **Entity Fields:**
- `id` - Unique identifier
- `code` - Locality code
- `designationFr` - French name
- `designationEn` - English name
- `stateId` - Parent state
- `postalCode` - Postal/ZIP code (optional)
- `description` - Optional description

### **Methods (8 total):**

**Standard 7 methods PLUS:**
8. `getByStateId(stateId)` - Get all localities in a state

**Backend logs:**
- Create: "Creating locality: code={code}, designationFr={designationFr}, stateId={stateId}"
- Update: "Updating locality with ID: {id}"

### **Usage Example:**

```typescript
import { LocalityService } from '@/modules/general/localization/services';

// Create locality
const babElOued = await LocalityService.create({
  code: 'BEO',
  designationFr: 'Bab El Oued',
  designationEn: 'Bab El Oued',
  stateId: 1,  // Algiers
  postalCode: '16000'
});

// Get localities by state
const algiersLocalities = await LocalityService.getByStateId(1);
```

---

## LocationService

### **Purpose:**
Manages locations/addresses - lowest level of geographic hierarchy, belongs to localities.

### **Base URL:**
```typescript
/api/general/localization/locations
```

### **Entity Fields:**
- `id` - Unique identifier
- `placeName` - Place name/address
- `localityId` - Parent locality
- `latitude` - GPS latitude (optional)
- `longitude` - GPS longitude (optional)
- `address` - Full address (optional)
- `description` - Optional description

### **Methods (8 total):**

**Standard 7 methods PLUS:**
8. `findByLocality(localityId)` - Get all locations in a locality

**Backend logs:**
- Create: "Creating location: code={placeName}"
- Update: "Updating location with ID: {id}"

### **Usage Example:**

```typescript
import { LocationService } from '@/modules/general/localization/services';

// Create location with coordinates
const office = await LocationService.create({
  placeName: 'TRC Office',
  localityId: 1,  // Bab El Oued
  latitude: 36.7538,
  longitude: 3.0588,
  address: '123 Main Street, Bab El Oued 16000'
});

// Find locations by locality
const locations = await LocationService.findByLocality(1);
```

---

## ZoneService

### **Purpose:**
Manages zones/regions - administrative or geographic regions, independent of the geographic hierarchy.

### **Base URL:**
```typescript
/api/general/localization/zones
```

### **Special Validations:**
- `designationFr` must be unique
- `code` must be unique
- Backend throws `BusinessValidationException` for duplicates

### **Entity Fields:**
- `id` - Unique identifier
- `code` - Zone code (unique)
- `designationFr` - French name (unique)
- `designationEn` - English name
- `description` - Optional description

### **Methods (7 total):**

Same as CountryService pattern.

**Backend validations:**
- Create/Update: Checks for duplicate designationFr
- Create/Update: Checks for duplicate code

**Backend logs:**
- Create: "Creating zone: designationFr={designationFr}"
- Update: "Updating zone with ID: {id}"

### **Usage Example:**

```typescript
import { ZoneService } from '@/modules/general/localization/services';

// Create zone (validates uniqueness)
const southZone = await ZoneService.create({
  code: 'SOUTH',
  designationFr: 'Zone Sud',
  designationEn: 'South Zone',
  description: 'Southern operational zone'
});

// Get all zones
const zones = await ZoneService.getAllNoPagination();
```

---

## Service Comparison

| Service | Level | Parent | Unique Fields | Methods | Special Features |
|---------|-------|--------|---------------|---------|------------------|
| CountryService | 1 | - | code | 7 | Top level |
| StateService | 2 | Country | code | 7 | - |
| LocalityService | 3 | State | code, postalCode | 8 | getByStateId() |
| LocationService | 4 | Locality | placeName, lat/lon | 8 | findByLocality() |
| ZoneService | Independent | - | code, designationFr | 7 | Uniqueness validation |

---

## Utility Functions

---

## validation.ts

### **Purpose:**
Validation functions for localization entities.

### **Functions:**

1. **isValidCountryCode(code)** - ISO country code (2-3 uppercase)
2. **isValidStateCode(code)** - State code (2-5 alphanumeric)
3. **isValidLocalityCode(code)** - Locality code
4. **isValidZoneCode(code)** - Zone code
5. **isValidPostalCode(postalCode)** - Postal/ZIP code (3-10 chars)
6. **isValidLatitude(latitude)** - Latitude (-90 to 90)
7. **isValidLongitude(longitude)** - Longitude (-180 to 180)
8. **isValidCoordinates(lat, lon)** - Both coordinates valid
9. **isValidDesignation(designation)** - Not empty
10. **isValidPlaceName(placeName)** - Not empty

### **Usage Example:**

```typescript
import {
  isValidCountryCode,
  isValidStateCode,
  isValidCoordinates,
  isValidPostalCode
} from '@/modules/general/localization/utils';

// Validate country
if (!isValidCountryCode('DZ')) {  // true
  errors.push('Invalid country code');
}

if (!isValidCountryCode('INVALID')) {  // false
  errors.push('Country code must be 2-3 uppercase letters');
}

// Validate coordinates
if (!isValidCoordinates(36.7538, 3.0588)) {  // true
  errors.push('Invalid coordinates');
}

// Validate postal code
if (!isValidPostalCode('16000')) {  // true
  errors.push('Invalid postal code');
}
```

---

## formatters.ts

### **Purpose:**
Formatting functions with bilingual support and geographic formatting.

### **Functions:**

1. **formatDesignation(designationFr, designationEn, locale)** - By locale
2. **formatCountryCode(code)** - Uppercase
3. **formatStateCode(code)** - Uppercase
4. **formatPostalCode(postalCode)** - Uppercase
5. **formatCoordinates(lat, lon, precision)** - "36.7538° N, 3.0588° E"
6. **formatLatitude(latitude, precision)** - "36.7538° N"
7. **formatLongitude(longitude, precision)** - "3.0588° E"
8. **formatFullAddress(place, locality, state, country)** - Full address string
9. **formatLocationLabel(code, designation)** - "CODE - Designation"

### **Usage Example:**

```typescript
import {
  formatDesignation,
  formatCoordinates,
  formatFullAddress,
  formatCountryCode
} from '@/modules/general/localization/utils';

// Format designation by locale
const name = formatDesignation('Algérie', 'Algeria', 'en');  // "Algeria"

// Format coordinates
const coords = formatCoordinates(36.7538, 3.0588, 4);  // "36.7538° N, 3.0588° E"

// Format full address
const address = formatFullAddress(
  'TRC Office',
  'Bab El Oued',
  'Algiers',
  'Algeria'
);  // "TRC Office, Bab El Oued, Algiers, Algeria"

// Format country code
const code = formatCountryCode('dz');  // "DZ"
```

---

## helpers.ts

### **Purpose:**
Helper functions for data manipulation and geographic calculations.

### **Functions:**

1. **sortCountriesByDesignation(countries, locale, order)** - Sort countries
2. **sortStatesByDesignation(states, locale, order)** - Sort states
3. **sortLocalitiesByDesignation(localities, locale, order)** - Sort localities
4. **findCountryByCode(countries, code)** - Find country
5. **findStateByCode(states, code)** - Find state
6. **filterStatesByCountry(states, countryId)** - Filter states
7. **filterLocalitiesByState(localities, stateId)** - Filter localities
8. **filterLocationsByLocality(locations, localityId)** - Filter locations
9. **createCountryOptions(countries, locale)** - Dropdown options
10. **createStateOptions(states, locale)** - Dropdown options
11. **createLocalityOptions(localities, locale)** - Dropdown options
12. **createZoneOptions(zones, locale)** - Dropdown options
13. **calculateDistance(lat1, lon1, lat2, lon2)** - Haversine distance in km
14. **findNearestLocation(locations, lat, lon)** - Find nearest location
15. **groupLocationsByLocality(locations)** - Group by locality

### **Usage Example:**

```typescript
import {
  sortCountriesByDesignation,
  filterStatesByCountry,
  createCountryOptions,
  calculateDistance,
  findNearestLocation
} from '@/modules/general/localization/utils';

// Get and sort countries
const countries = await CountryService.getAllNoPagination();
const sorted = sortCountriesByDesignation(countries, 'fr', 'asc');

// Filter states by country
const allStates = await StateService.getAllNoPagination();
const algerianStates = filterStatesByCountry(allStates, 1);

// Create dropdown options
const countryOptions = createCountryOptions(countries, 'en');
// Result: [{ value: 1, label: 'Algeria', code: 'DZ' }, ...]

// Calculate distance between two points
const distance = calculateDistance(36.7538, 3.0588, 36.8538, 3.1588);
console.log(`Distance: ${distance.toFixed(2)} km`);

// Find nearest location
const locations = await LocationService.getAllNoPagination();
const nearest = findNearestLocation(locations, 36.7538, 3.0588);
```

---

## constants.ts

### **Purpose:**
Constants for localization including validation rules and map configuration.

### **Constant Groups:**

1. **API_ENDPOINTS** - All 5 API URLs
2. **VALIDATION_CONSTRAINTS** - Field limits and coordinate ranges
3. **DEFAULTS** - Default values (locale, precision, zoom)
4. **LOCALES** - Locale codes
5. **SORT_OPTIONS** - Sorting options
6. **ERROR_MESSAGES** - Standard errors
7. **SUCCESS_MESSAGES** - Standard success messages
8. **MAP_CONFIG** - Map settings and marker colors

### **Usage Example:**

```typescript
import {
  API_ENDPOINTS,
  VALIDATION_CONSTRAINTS,
  MAP_CONFIG,
  ERROR_MESSAGES
} from '@/modules/general/localization/utils';

// Use API endpoints
const url = API_ENDPOINTS.COUNTRIES;

// Validate constraints
if (latitude < VALIDATION_CONSTRAINTS.MIN_LATITUDE) {
  alert(ERROR_MESSAGES.LATITUDE_INVALID);
}

// Use map config
const mapCenter = MAP_CONFIG.DEFAULT_CENTER;  // Algiers
const countryColor = MAP_CONFIG.MARKER_COLORS.COUNTRY;  // '#4CAF50'
```

---

## Complete Usage Example

### **Full Geographic Hierarchy Management:**

```typescript
import { useState, useEffect } from 'react';
import {
  CountryService,
  StateService,
  LocalityService,
  LocationService
} from '@/modules/general/localization/services';
import {
  createCountryOptions,
  filterStatesByCountry,
  filterLocalitiesByState,
  formatCoordinates,
  formatFullAddress,
  isValidCountryCode,
  isValidCoordinates,
  VALIDATION_CONSTRAINTS
} from '@/modules/general/localization/utils';

function LocationManagement() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [locations, setLocations] = useState([]);
  
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [selectedLocality, setSelectedLocality] = useState<number | null>(null);
  
  // Load all data
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    const [countriesData, statesData, localitiesData] = await Promise.all([
      CountryService.getAllNoPagination(),
      StateService.getAllNoPagination(),
      LocalityService.getAllNoPagination()
    ]);
    
    setCountries(countriesData);
    setStates(statesData);
    setLocalities(localitiesData);
  };
  
  // Filter states by selected country
  const filteredStates = selectedCountry
    ? filterStatesByCountry(states, selectedCountry)
    : [];
  
  // Filter localities by selected state
  const filteredLocalities = selectedState
    ? filterLocalitiesByState(localities, selectedState)
    : [];
  
  // Load locations when locality selected
  useEffect(() => {
    if (selectedLocality) {
      loadLocations(selectedLocality);
    }
  }, [selectedLocality]);
  
  const loadLocations = async (localityId: number) => {
    const data = await LocationService.findByLocality(localityId);
    setLocations(data);
  };
  
  // Create location
  const handleCreateLocation = async (dto) => {
    // Validate
    const errors = [];
    
    if (!isValidCoordinates(dto.latitude, dto.longitude)) {
      errors.push('Invalid coordinates');
    }
    
    if (dto.latitude < VALIDATION_CONSTRAINTS.MIN_LATITUDE ||
        dto.latitude > VALIDATION_CONSTRAINTS.MAX_LATITUDE) {
      errors.push('Latitude out of range');
    }
    
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    // Create
    await LocationService.create(dto);
    if (selectedLocality) {
      loadLocations(selectedLocality);
    }
  };
  
  // Create dropdown options
  const countryOptions = createCountryOptions(countries, 'en');
  
  return (
    <div className="location-management">
      <h1>Location Management</h1>
      
      {/* Country Selection */}
      <div>
        <label>Country:</label>
        <select 
          value={selectedCountry || ''} 
          onChange={(e) => setSelectedCountry(Number(e.target.value))}
        >
          <option value="">Select country...</option>
          {countryOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.code} - {opt.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* State Selection */}
      {selectedCountry && (
        <div>
          <label>State:</label>
          <select 
            value={selectedState || ''}
            onChange={(e) => setSelectedState(Number(e.target.value))}
          >
            <option value="">Select state...</option>
            {filteredStates.map(state => (
              <option key={state.id} value={state.id}>
                {state.code} - {state.designationEn}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Locality Selection */}
      {selectedState && (
        <div>
          <label>Locality:</label>
          <select 
            value={selectedLocality || ''}
            onChange={(e) => setSelectedLocality(Number(e.target.value))}
          >
            <option value="">Select locality...</option>
            {filteredLocalities.map(locality => (
              <option key={locality.id} value={locality.id}>
                {locality.code} - {locality.designationEn}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Locations List */}
      {selectedLocality && (
        <div>
          <h2>Locations</h2>
          <table>
            <thead>
              <tr>
                <th>Place Name</th>
                <th>Coordinates</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {locations.map(location => (
                <tr key={location.id}>
                  <td>{location.placeName}</td>
                  <td>
                    {formatCoordinates(location.latitude, location.longitude, 4)}
                  </td>
                  <td>{location.address || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

## Frontend Files

All services and utils are located in: `src/modules/general/localization/`

### **Services (6 files):**

1. **[CountryService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/localization/services/CountryService.ts)**
2. **[StateService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/localization/services/StateService.ts)**
3. **[LocalityService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/localization/services/LocalityService.ts)**
4. **[LocationService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/localization/services/LocationService.ts)**
5. **[ZoneService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/localization/services/ZoneService.ts)**
6. **[index.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/localization/services/index.ts)** - Barrel export

### **Utils (5 files):**

1. **[validation.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/localization/utils/validation.ts)** - Validations (10 functions)
2. **[formatters.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/localization/utils/formatters.ts)** - Formatting (9 functions)
3. **[helpers.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/localization/utils/helpers.ts)** - Helpers (16 functions)
4. **[constants.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/localization/utils/constants.ts)** - Constants (8 groups)
5. **[index.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/localization/utils/index.ts)** - Barrel export

**Latest Commits:**
- [6152284](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/61522847eb7a89a63c412ba7251888a4848931fe) - Part 1: Country, State, Locality services
- [9c786ca](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/9c786cabdbca1edf2eb11366fb5af8906b0cb0d9) - Part 2: Location, Zone services + index
- [6f5c700](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/6f5c700fc2d31472a893adbfb72056add1ed2aab) - Utils: validation, formatters, helpers, constants

---

## Backend Alignment

### **Alignment Status:** ✅ 100%

All services fully aligned with backend:
- ✅ All 5 services present
- ✅ All methods implemented
- ✅ All relationship finders included
- ✅ Zone uniqueness validation documented
- ✅ Logging matches backend
- ✅ Complete service layer

---

## Summary

### **General Localization Services & Utils: Complete ✅**

**Services: 5/5 Created**
1. CountryService (7 methods)
2. StateService (7 methods)
3. LocalityService (8 methods) - with getByStateId()
4. LocationService (8 methods) - with findByLocality()
5. ZoneService (7 methods) - with uniqueness validation

**Utils: 4 categories**
1. validation.ts (10 functions)
2. formatters.ts (9 functions)
3. helpers.ts (16 functions)
4. constants.ts (8 groups)

**Key Features:**
- ✅ **Complete CRUD operations** - All 5 services
- ✅ **Global search** - All services
- ✅ **Geographic hierarchy** - Country > State > Locality > Location
- ✅ **Cascading filters** - Filter by parent entity
- ✅ **Bilingual support** - French/English
- ✅ **Coordinate validation** - Latitude/Longitude ranges
- ✅ **ISO code validation** - Country/State codes
- ✅ **Coordinate formatting** - N/S, E/W with degrees
- ✅ **Distance calculations** - Haversine formula
- ✅ **Nearest location finder** - Geographic proximity
- ✅ **Dropdown helpers** - For all entity types
- ✅ **Map configuration** - Zoom, center, marker colors
- ✅ **100% backend alignment**

**Total Functions:** 35+ utility functions for comprehensive geographic management

---

**Created:** January 7, 2026, 2:35 PM CET  
**Backend Package:** `dz.sh.trc.hyflo.general.localization.service`  
**Frontend Location:** `src/modules/general/localization/`  
**Status:** ✅ All Services & Utils Created  
**Alignment:** 100% - Complete geographic hierarchy service layer
