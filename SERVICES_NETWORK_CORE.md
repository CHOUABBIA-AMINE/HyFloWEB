# Network Core Services & Utils Documentation
## January 7, 2026 - Complete Service Layer

## Overview

This document covers the **Network Core Services and Utilities** - the main service layer for core network infrastructure entities. These services manage the physical assets of the hydrocarbon transport network including pipelines, equipment, facilities, and fields.

---

## Backend Source

**Repository:** [HyFloAPI](https://github.com/CHOUABBIA-AMINE/HyFloAPI)  
**Package:** `dz.sh.trc.hyflo.network.core.service`  
**Author:** MEDJERAB Abir  
**Created:** 06-26-2025  
**Updated:** 01-02-2026

---

## Services Summary (9 Total)

All Network Core Services have been created from backend:

| # | Service | DTO | Purpose | Relationships | Status |
|---|---------|-----|---------|---------------|--------|
| 1 | **[PipelineService](#pipelineservice)** | PipelineDTO | Manage pipelines | PipelineSystem | ✅ Created |
| 2 | **[PipelineSystemService](#pipelinesystemservice)** | PipelineSystemDTO | Manage pipeline systems | Product, Pipelines | ✅ Created |
| 3 | **[PipelineSegmentService](#pipelinesegmentservice)** | PipelineSegmentDTO | Manage pipeline segments | Pipeline | ✅ Created |
| 4 | **[EquipmentService](#equipmentservice)** | EquipmentDTO | Manage equipment | Facility, EquipmentType | ✅ Created |
| 5 | **[FacilityService](#facilityservice)** | FacilityDTO | Manage facilities | Infrastructure | ✅ Created |
| 6 | **[InfrastructureService](#infrastructureservice)** | InfrastructureDTO | Manage infrastructures | Facilities | ✅ Created |
| 7 | **[HydrocarbonFieldService](#hydrocarbonfieldservice)** | HydrocarbonFieldDTO | Manage hydrocarbon fields | - | ✅ Created |
| 8 | **[StationService](#stationservice)** | StationDTO | Manage stations | - | ✅ Created |
| 9 | **[TerminalService](#terminalservice)** | TerminalDTO | Manage terminals | - | ✅ Created |

---

## Utils Summary (4 Categories)

Utility functions created for the Network Core module:

| # | Util | Purpose | Functions | Status |
|---|------|---------|-----------|--------|
| 1 | **[validation.ts](#validationts)** | Core validations | 10 functions | ✅ Created |
| 2 | **[formatters.ts](#formattersts)** | Core formatting | 11 functions | ✅ Created |
| 3 | **[helpers.ts](#helpersts)** | Core helpers | 17 functions | ✅ Created |
| 4 | **[constants.ts](#constantsts)** | Core constants | 13 constant groups | ✅ Created |

---

## Service Architecture

### **Common Service Pattern:**

All Network Core services follow the same pattern:

1. **Standard CRUD Operations:**
   - `getAll(pageable)` - Get all with pagination
   - `getAllNoPagination()` - Get all without pagination
   - `getById(id)` - Get single entity
   - `create(dto)` - Create new entity
   - `update(id, dto)` - Update existing entity
   - `delete(id)` - Delete entity

2. **Search Operations:**
   - `globalSearch(searchTerm, pageable)` - Search across all fields

3. **Relationship Operations:**
   - `findByXxx(id)` - Find by related entity (varies by service)

---

## Detailed Service Documentation

---

## PipelineService

### **Purpose:**
Manages pipelines - the main transport infrastructure connecting fields to terminals.

### **Base URL:**
```typescript
/api/network/core/pipelines
```

### **Unique Validation:**
- `code` must be unique

### **Methods:**

#### **Standard CRUD + Search** (7 methods)
1. `getAll(pageable)` - Get all with pagination
2. `getAllNoPagination()` - Get all without pagination
3. `getById(id)` - Get single pipeline
4. `create(dto)` - Create new (validates code uniqueness)
5. `update(id, dto)` - Update existing (validates code)
6. `delete(id)` - Delete pipeline
7. `globalSearch(searchTerm, pageable)` - Search pipelines

#### **Relationship Methods:**
8. `findByPipelineSystem(systemId)` - Get pipelines by system

### **Usage Example:**

```typescript
import { PipelineService } from '@/modules/network/core/services';

// Create new pipeline
const pipeline = await PipelineService.create({
  code: 'GR1',
  designation: 'GR1 Gas Pipeline',
  pipelineSystemId: 1,
  diameter: 48,
  length: 550,
  operationalStatusId: 1
});

// Find pipelines by system
const systemPipelines = await PipelineService.findByPipelineSystem(1);

// Search pipelines
const results = await PipelineService.globalSearch('GR1', {
  page: 0,
  size: 20,
  sort: 'code,asc'
});
```

---

## EquipmentService

### **Purpose:**
Manages equipment - machinery and devices installed at facilities.

### **Base URL:**
```typescript
/api/network/core/equipment
```

### **Unique Validation:**
- `code` must be unique
- `serialNumber` must be unique

### **Methods:**

#### **Standard CRUD + Search** (7 methods)
Same as PipelineService

#### **Relationship Methods:**
8. `findByFacility(facilityId)` - Get equipment by facility
9. `findByEquipmentType(typeId)` - Get equipment by type

### **Usage Example:**

```typescript
import { EquipmentService } from '@/modules/network/core/services';

// Create new equipment
const equipment = await EquipmentService.create({
  code: 'PUMP-001',
  serialNumber: 'SN-2024-001',
  designation: 'Main Centrifugal Pump',
  facilityId: 1,
  equipmentTypeId: 1,
  installationYear: 2020,
  operationalStatusId: 1
});

// Find equipment by facility
const facilityEquipment = await EquipmentService.findByFacility(1);

// Find equipment by type
const pumps = await EquipmentService.findByEquipmentType(1);
```

---

## FacilityService

### **Purpose:**
Manages facilities - physical locations where equipment is installed.

### **Base URL:**
```typescript
/api/network/core/facilities
```

### **Unique Validation:**
- `code` must be unique

### **Methods:**

#### **Standard CRUD + Search** (7 methods)
Same as PipelineService

#### **Relationship Methods:**
8. `findByInfrastructure(infrastructureId)` - Get facilities by infrastructure

### **Usage Example:**

```typescript
import { FacilityService } from '@/modules/network/core/services';

// Create new facility
const facility = await FacilityService.create({
  code: 'FAC-001',
  designation: 'Main Compression Station',
  infrastructureId: 1,
  latitude: 36.7538,
  longitude: 3.0588,
  capacity: 50000,
  operationalStatusId: 1
});

// Find facilities by infrastructure
const infraFacilities = await FacilityService.findByInfrastructure(1);
```

---

## PipelineSystemService

### **Purpose:**
Manages pipeline systems - collections of related pipelines forming a complete network.

### **Base URL:**
```typescript
/api/network/core/pipeline-systems
```

### **Unique Validation:**
- `code` must be unique

### **Methods:**

#### **Standard CRUD + Search** (7 methods)
Same as PipelineService

#### **Relationship Methods:**
8. `findByProduct(productId)` - Get pipeline systems by product

### **Usage Example:**

```typescript
import { PipelineSystemService } from '@/modules/network/core/services';

// Create new pipeline system
const system = await PipelineSystemService.create({
  code: 'GZ1-SYSTEM',
  designation: 'GZ1 Gas Transport System',
  productId: 1,  // Natural Gas
  totalLength: 1200,
  totalCapacity: 100000,
  operationalStatusId: 1
});

// Find systems by product
const gasSystems = await PipelineSystemService.findByProduct(1);
```

---

## PipelineSegmentService

### **Purpose:**
Manages pipeline segments - physical sections of a pipeline between two points.

### **Base URL:**
```typescript
/api/network/core/pipeline-segments
```

### **Unique Validation:**
- `code` must be unique

### **Methods:**

#### **Standard CRUD + Search** (7 methods)
Same as PipelineService

#### **Relationship Methods:**
8. `findByPipeline(pipelineId)` - Get segments by pipeline

### **Usage Example:**

```typescript
import { PipelineSegmentService } from '@/modules/network/core/services';

// Create new segment
const segment = await PipelineSegmentService.create({
  code: 'GR1-SEG-001',
  designation: 'GR1 Segment 1',
  pipelineId: 1,
  startLatitude: 36.7538,
  startLongitude: 3.0588,
  endLatitude: 36.8538,
  endLongitude: 3.1588,
  length: 15.5,
  diameter: 48,
  alloyId: 1,
  operationalStatusId: 1
});

// Find segments by pipeline
const pipelineSegments = await PipelineSegmentService.findByPipeline(1);
```

---

## InfrastructureService

### **Purpose:**
Manages infrastructures - major physical assets and installations.

### **Base URL:**
```typescript
/api/network/core/infrastructures
```

### **Unique Validation:**
- `code` must be unique

### **Methods:**

#### **Standard CRUD + Search** (7 methods)
Same as PipelineService (no additional relationship methods)

### **Usage Example:**

```typescript
import { InfrastructureService } from '@/modules/network/core/services';

// Create new infrastructure
const infrastructure = await InfrastructureService.create({
  code: 'INFRA-001',
  designation: 'Southern Region Infrastructure',
  description: 'Main infrastructure for southern region',
  operationalStatusId: 1
});
```

---

## HydrocarbonFieldService

### **Purpose:**
Manages hydrocarbon fields - geological formations where oil/gas is extracted.

### **Base URL:**
```typescript
/api/network/core/hydrocarbon-fields
```

### **Unique Validation:**
- `code` must be unique

### **Methods:**

#### **Standard CRUD + Search** (7 methods)
Same as PipelineService (no additional relationship methods)

### **Usage Example:**

```typescript
import { HydrocarbonFieldService } from '@/modules/network/core/services';

// Create new field
const field = await HydrocarbonFieldService.create({
  code: 'FIELD-001',
  designation: 'Hassi Messaoud Field',
  latitude: 31.6819,
  longitude: 6.0773,
  discoveryYear: 1956,
  productionStartYear: 1958,
  operationalStatusId: 1
});
```

---

## StationService

### **Purpose:**
Manages stations - intermediate facilities along pipelines (compression, pumping, etc.).

### **Base URL:**
```typescript
/api/network/core/stations
```

### **Unique Validation:**
- `code` must be unique

### **Methods:**

#### **Standard CRUD + Search** (7 methods)
Same as PipelineService (no additional relationship methods)

### **Usage Example:**

```typescript
import { StationService } from '@/modules/network/core/services';

// Create new station
const station = await StationService.create({
  code: 'STAT-001',
  designation: 'Compression Station 1',
  stationType: 'COMPRESSION',
  latitude: 36.7538,
  longitude: 3.0588,
  operationalStatusId: 1
});
```

---

## TerminalService

### **Purpose:**
Manages terminals - endpoints where hydrocarbons are received or dispatched.

### **Base URL:**
```typescript
/api/network/core/terminals
```

### **Unique Validation:**
- `code` must be unique

### **Methods:**

#### **Standard CRUD + Search** (7 methods)
Same as PipelineService (no additional relationship methods)

### **Usage Example:**

```typescript
import { TerminalService } from '@/modules/network/core/services';

// Create new terminal
const terminal = await TerminalService.create({
  code: 'TERM-001',
  designation: 'Arzew LNG Terminal',
  latitude: 35.8517,
  longitude: -0.3178,
  capacity: 150000,
  operationalStatusId: 1
});
```

---

## Service Comparison

| Service | Unique Fields | Methods | Relationship Finders |
|---------|---------------|---------|---------------------|
| PipelineService | code | 8 | findByPipelineSystem |
| EquipmentService | code, serialNumber | 9 | findByFacility, findByEquipmentType |
| FacilityService | code | 8 | findByInfrastructure |
| PipelineSystemService | code | 8 | findByProduct |
| PipelineSegmentService | code | 8 | findByPipeline |
| InfrastructureService | code | 7 | - |
| HydrocarbonFieldService | code | 7 | - |
| StationService | code | 7 | - |
| TerminalService | code | 7 | - |

---

## Utility Functions

---

## validation.ts

### **Purpose:**
Core validation functions with domain-specific rules.

### **Functions:**

1. **isValidPipelineCode(code)** - Validate pipeline code format (e.g., GR1, OZ1)
2. **isValidSerialNumber(serialNumber)** - Validate serial number (min 5 chars)
3. **isValidDiameter(diameter)** - Validate diameter (positive)
4. **isValidLength(length)** - Validate length (non-negative)
5. **isValidPressure(pressure)** - Validate pressure (non-negative)
6. **isValidCapacity(capacity)** - Validate capacity (positive)
7. **isValidCoordinate(lat, lon)** - Validate coordinates (lat: -90 to 90, lon: -180 to 180)
8. **isValidDateRange(start, end)** - Validate date range (start before end)
9. **isValidYear(year)** - Validate year (1900 to current+10)
10. Plus re-exported common validations

### **Usage Example:**

```typescript
import {
  isValidPipelineCode,
  isValidDiameter,
  isValidCoordinate,
  isValidYear
} from '@/modules/network/core/utils';

// Validate pipeline
const validatePipeline = (dto: PipelineDTO): string[] => {
  const errors: string[] = [];
  
  if (!isValidPipelineCode(dto.code)) {
    errors.push('Code must be 2 letters + digits (e.g., GR1)');
  }
  
  if (!isValidDiameter(dto.diameter)) {
    errors.push('Diameter must be positive');
  }
  
  if (!isValidCoordinate(dto.startLatitude, dto.startLongitude)) {
    errors.push('Invalid coordinates');
  }
  
  return errors;
};
```

---

## formatters.ts

### **Purpose:**
Core formatting functions with units and domain-specific formats.

### **Functions:**

1. **formatDiameter(diameter)** - Format with unit (inches)
2. **formatLength(length, unit)** - Format with km or m
3. **formatPressure(pressure, unit)** - Format with bar or psi
4. **formatCapacity(capacity, unit)** - Format capacity
5. **formatVolume(volume, unit)** - Format volume
6. **formatFlowRate(flowRate, unit)** - Format flow rate
7. **formatTemperature(temp, unit)** - Format with °C or °F
8. **formatCoordinates(lat, lon)** - Format as "36.7538° N, 3.0588° E"
9. **formatYear(year)** - Format year
10. **formatOperationalStatus(status)** - Format with emoji badge
11. Plus re-exported common formatters

### **Usage Example:**

```typescript
import {
  formatDiameter,
  formatLength,
  formatPressure,
  formatCoordinates,
  formatOperationalStatus
} from '@/modules/network/core/utils';

// Display pipeline info
const PipelineCard = ({ pipeline }) => (
  <div>
    <h3>{pipeline.code} - {pipeline.designation}</h3>
    <p>Diameter: {formatDiameter(pipeline.diameter)}</p>
    <p>Length: {formatLength(pipeline.length, 'km')}</p>
    <p>Pressure: {formatPressure(pipeline.maxPressure, 'bar')}</p>
    <p>Location: {formatCoordinates(pipeline.latitude, pipeline.longitude)}</p>
    <p>Status: {formatOperationalStatus(pipeline.status)}</p>
  </div>
);
```

---

## helpers.ts

### **Purpose:**
Core helper functions for calculations and data manipulation.

### **Functions:**

1. **calculateTotalLength(segments)** - Sum segment lengths
2. **calculateAverageDiameter(segments)** - Average diameter
3. **calculateDistance(lat1, lon1, lat2, lon2)** - Haversine distance in km
4. **groupPipelinesBySystem(pipelines)** - Group by system
5. **groupEquipmentByFacility(equipment)** - Group by facility
6. **filterByOperationalStatus(items, statusId)** - Filter by status
7. **filterByProduct(items, productId)** - Filter by product
8. **sortByLengthDesc(items)** - Sort by length descending
9. **sortByDiameterDesc(items)** - Sort by diameter descending
10. **getActiveItems(items)** - Get active only
11. **calculateTotalCapacity(items)** - Sum capacities
12. **findNearestFacility(facilities, lat, lon)** - Find nearest
13. **barToPsi(bar)** - Convert pressure
14. **psiToBar(psi)** - Convert pressure
15. **celsiusToFahrenheit(celsius)** - Convert temperature
16. **fahrenheitToCelsius(fahrenheit)** - Convert temperature
17. Plus re-exported common helpers

### **Usage Example:**

```typescript
import {
  calculateTotalLength,
  calculateDistance,
  groupPipelinesBySystem,
  findNearestFacility,
  barToPsi
} from '@/modules/network/core/utils';

// Calculate pipeline statistics
const segments = await PipelineSegmentService.findByPipeline(1);
const totalLength = calculateTotalLength(segments);

// Group pipelines
const pipelines = await PipelineService.getAllNoPagination();
const bySystem = groupPipelinesBySystem(pipelines);

// Find nearest facility to a point
const facilities = await FacilityService.getAllNoPagination();
const nearest = findNearestFacility(facilities, 36.7538, 3.0588);

// Convert units
const pressureInPsi = barToPsi(150); // 150 bar to psi
```

---

## constants.ts

### **Purpose:**
Core constants for the Network Core module.

### **Constant Groups:**

1. **API_ENDPOINTS** - All API URLs (9 endpoints)
2. **UNITS** - Measurement units (diameter, length, pressure, etc.)
3. **OPERATIONAL_STATUS** - Status codes
4. **PIPELINE_TYPES** - Pipeline type codes
5. **EQUIPMENT_TYPES** - Equipment type codes
6. **FACILITY_TYPES** - Facility type codes
7. **STATION_TYPES** - Station type codes
8. **VALIDATION_CONSTRAINTS** - Field limits and ranges
9. **MAP_CONFIG** - Map settings (zoom, center, marker colors)
10. **CHART_COLORS** - Chart color palette
11. **DATE_RANGE_PRESETS** - Date range options
12. **EXPORT_FORMATS** - Export format options

### **Usage Example:**

```typescript
import {
  API_ENDPOINTS,
  UNITS,
  OPERATIONAL_STATUS,
  PIPELINE_TYPES,
  MAP_CONFIG,
  VALIDATION_CONSTRAINTS
} from '@/modules/network/core/utils';

// Use API endpoints
const url = API_ENDPOINTS.PIPELINES;

// Use units
const diameterUnit = UNITS.DIAMETER;  // "inches"

// Use status codes
if (pipeline.status === OPERATIONAL_STATUS.ACTIVE) {
  // Handle active pipeline
}

// Use map config
const mapCenter = MAP_CONFIG.DEFAULT_CENTER;
const pipelineColor = MAP_CONFIG.MARKER_COLORS.PIPELINE;

// Use validation constraints
if (diameter < VALIDATION_CONSTRAINTS.MIN_DIAMETER) {
  errors.push('Diameter too small');
}
```

---

## Complete Usage Example

### **Full Pipeline Management Implementation:**

```typescript
import { useState, useEffect } from 'react';
import { PipelineService, PipelineSegmentService } from '@/modules/network/core/services';
import {
  formatDiameter,
  formatLength,
  formatCoordinates,
  calculateTotalLength,
  isValidPipelineCode,
  isValidDiameter,
  OPERATIONAL_STATUS,
  PAGINATION_DEFAULTS
} from '@/modules/network/core/utils';
import type { PipelineDTO, PipelineSegmentDTO } from '@/modules/network/core/dto';

function PipelineManagement() {
  const [pipelines, setPipelines] = useState(null);
  const [selectedPipeline, setSelectedPipeline] = useState<PipelineDTO | null>(null);
  const [segments, setSegments] = useState<PipelineSegmentDTO[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Load pipelines
  const loadPipelines = async (page = 0) => {
    setLoading(true);
    try {
      const data = await PipelineService.getAll({
        page,
        size: PAGINATION_DEFAULTS.SIZE,
        sort: 'code,asc'
      });
      setPipelines(data);
    } finally {
      setLoading(false);
    }
  };
  
  // Load segments for selected pipeline
  const loadSegments = async (pipelineId: number) => {
    const data = await PipelineSegmentService.findByPipeline(pipelineId);
    setSegments(data);
  };
  
  // Validate pipeline
  const validatePipeline = (dto: PipelineDTO): string[] => {
    const errors: string[] = [];
    
    if (!isValidPipelineCode(dto.code)) {
      errors.push('Code must be 2 letters + digits (e.g., GR1)');
    }
    
    if (!isValidDiameter(dto.diameter)) {
      errors.push('Diameter must be positive');
    }
    
    return errors;
  };
  
  // Create pipeline
  const handleCreate = async (dto: PipelineDTO) => {
    const errors = validatePipeline(dto);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    try {
      await PipelineService.create(dto);
      loadPipelines();
    } catch (error) {
      console.error('Failed to create pipeline:', error);
    }
  };
  
  // Select pipeline
  const handleSelectPipeline = (pipeline: PipelineDTO) => {
    setSelectedPipeline(pipeline);
    if (pipeline.id) {
      loadSegments(pipeline.id);
    }
  };
  
  useEffect(() => {
    loadPipelines();
  }, []);
  
  // Calculate total length from segments
  const totalLength = calculateTotalLength(segments);
  
  return (
    <div className="pipeline-management">
      <h1>Pipeline Management</h1>
      
      {/* Pipeline List */}
      <div className="pipeline-list">
        {pipelines?.content.map(pipeline => (
          <div 
            key={pipeline.id}
            className="pipeline-card"
            onClick={() => handleSelectPipeline(pipeline)}
          >
            <h3>{pipeline.code} - {pipeline.designation}</h3>
            <p>Diameter: {formatDiameter(pipeline.diameter)}</p>
            <p>Length: {formatLength(pipeline.length, 'km')}</p>
            <p>Status: {pipeline.operationalStatusId === 1 ? '🟢 Active' : '🔴 Inactive'}</p>
          </div>
        ))}
      </div>
      
      {/* Selected Pipeline Details */}
      {selectedPipeline && (
        <div className="pipeline-details">
          <h2>{selectedPipeline.code} Details</h2>
          <div className="info">
            <p><strong>Code:</strong> {selectedPipeline.code}</p>
            <p><strong>Designation:</strong> {selectedPipeline.designation}</p>
            <p><strong>Diameter:</strong> {formatDiameter(selectedPipeline.diameter)}</p>
            <p><strong>Total Length:</strong> {formatLength(totalLength, 'km')}</p>
          </div>
          
          {/* Segments */}
          <h3>Segments ({segments.length})</h3>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Length</th>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {segments.map(segment => (
                <tr key={segment.id}>
                  <td>{segment.code}</td>
                  <td>{formatLength(segment.length, 'km')}</td>
                  <td>{formatCoordinates(segment.startLatitude, segment.startLongitude)}</td>
                  <td>{formatCoordinates(segment.endLatitude, segment.endLongitude)}</td>
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

All services and utils are located in: `src/modules/network/core/`

### **Services (10 files):**

1. **[PipelineService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/services/PipelineService.ts)**
2. **[PipelineSystemService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/services/PipelineSystemService.ts)**
3. **[PipelineSegmentService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/services/PipelineSegmentService.ts)**
4. **[EquipmentService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/services/EquipmentService.ts)**
5. **[FacilityService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/services/FacilityService.ts)**
6. **[InfrastructureService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/services/InfrastructureService.ts)**
7. **[HydrocarbonFieldService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/services/HydrocarbonFieldService.ts)**
8. **[StationService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/services/StationService.ts)**
9. **[TerminalService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/services/TerminalService.ts)**
10. **[index.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/services/index.ts)** - Barrel export

### **Utils (5 files):**

1. **[validation.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/utils/validation.ts)** - Core validations (10 functions)
2. **[formatters.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/utils/formatters.ts)** - Core formatting (11 functions)
3. **[helpers.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/utils/helpers.ts)** - Core helpers (17 functions)
4. **[constants.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/utils/constants.ts)** - Core constants (13 groups)
5. **[index.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/utils/index.ts)** - Barrel export

**Latest Commits:**
- [911ea35](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/911ea35ccf89699ffca0db244db305fff46121dc) - Created services Part 1
- [6c1aec4](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/6c1aec4045609a432b58cacbfebe22859c4a3935) - Created services Part 2
- [b05eb5f](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/b05eb5f19db61f59cbad2c54c88f09a038af618e) - Created services Part 3
- [fee6b54](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/fee6b544e2335083d8cc8be55b8428b49965571a) - Created utils

---

## Backend Alignment

### **Alignment Status:** ✅ 100%

All services are fully aligned with backend:
- ✅ All 9 services present
- ✅ All methods implemented
- ✅ All validations match
- ✅ All relationship finders included
- ✅ Complete service layer
- ✅ Domain-specific utils

---

## Summary

### **Network Core Services & Utils: Complete ✅**

**Services: 9/9 Created**
1. PipelineService (8 methods)
2. PipelineSystemService (8 methods)
3. PipelineSegmentService (8 methods)
4. EquipmentService (9 methods)
5. FacilityService (8 methods)
6. InfrastructureService (7 methods)
7. HydrocarbonFieldService (7 methods)
8. StationService (7 methods)
9. TerminalService (7 methods)

**Utils: 4 categories**
1. validation.ts (10 core + common validations)
2. formatters.ts (11 core + common formatters)
3. helpers.ts (17 core + common helpers)
4. constants.ts (13 constant groups)

**Features:**
- ✅ **Complete CRUD operations** - All services
- ✅ **Global search** - Cross-field search
- ✅ **Relationship finders** - Navigate between entities
- ✅ **Pagination support** - With Page type
- ✅ **Domain-specific validations** - Pipeline codes, coordinates, etc.
- ✅ **Unit formatting** - Diameter, length, pressure, etc.
- ✅ **Geographic calculations** - Distance, coordinates
- ✅ **Unit conversions** - Pressure, temperature
- ✅ **100% backend alignment**

---

**Created:** January 7, 2026, 2:10 PM CET  
**Backend Package:** `dz.sh.trc.hyflo.network.core.service`  
**Frontend Location:** `src/modules/network/core/`  
**Status:** ✅ All Services & Utils Created  
**Alignment:** 100% - Complete core network service layer
