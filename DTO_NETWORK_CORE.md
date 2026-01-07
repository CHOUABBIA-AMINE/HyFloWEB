# Network Core DTOs - Complete Implementation
## January 7, 2026 - All 9 Core DTOs Synchronized

## Overview

This document covers the **Network Core DTOs** - the main entity DTOs for the Network module representing physical infrastructure elements in the oil & gas pipeline network.

---

## Backend Source

**Repository:** [HyFloAPI](https://github.com/CHOUABBIA-AMINE/HyFloAPI)  
**Package:** `dz.sh.trc.hyflo.network.core.dto`  
**Author:** MEDJERAB Abir  
**Created:** 06-26-2025  
**Updated:** 01-02-2026

---

## Core DTOs Summary (9 Total)

All Network Core DTOs are now synchronized between backend and frontend:

### **Complete List:**

| # | DTO | Purpose | Status |
|---|-----|---------|--------|
| 1 | **[EquipmentDTO](#equipmentdto)** | Facility equipment tracking | ✅ Synchronized |
| 2 | **[FacilityDTO](#facilitydto)** | Processing/storage facilities | ✅ Synchronized |
| 3 | **[HydrocarbonFieldDTO](#hydrocarbonfielddto)** | Oil & gas fields | ✅ Synchronized |
| 4 | **[InfrastructureDTO](#infrastructuredto)** | Base infrastructure entity | ✅ Synchronized |
| 5 | **[PipelineDTO](#pipelinedto)** | Pipeline entities (complex) | ✅ Synchronized |
| 6 | **[PipelineSegmentDTO](#pipelinesegmentdto)** | Pipeline segments | ✅ Synchronized |
| 7 | **[PipelineSystemDTO](#pipelinesystemdto)** | Pipeline system groups | ✅ Synchronized |
| 8 | **[StationDTO](#stationdto)** | Pumping/compression stations | ✅ Synchronized |
| 9 | **[TerminalDTO](#terminaldto)** | Import/export terminals | ✅ Synchronized |

---

## DTO Hierarchy

### **Infrastructure Base:**

```
InfrastructureDTO (Base)
├── code (2-20 chars)
├── name (3-100 chars)
├── installationDate (optional)
├── commissioningDate (optional)
├── decommissioningDate (optional)
├── operationalStatusId
└── structureId
```

### **Specialized Entities:**

All specialized entities extend or follow similar patterns with additional fields.

---

## Detailed DTO Documentation

---

## EquipmentDTO

### **Purpose:**
Tracks equipment installed at facilities with manufacturing details, maintenance records, and operational status.

### **Structure:**

```typescript
export interface EquipmentDTO {
  id?: number;
  
  // Core information (all required)
  name: string;                    // max 100 chars
  code: string;                    // max 50 chars
  modelNumber: string;             // max 50 chars
  serialNumber: string;            // max 100 chars
  
  // Dates (all required, ISO format: YYYY-MM-DD)
  manufacturingDate: string;       
  installationDate: string;        
  lastMaintenanceDate: string;     
  
  // Required relationships
  operationalStatusId: number;     
  equipmentTypeId: number;         
  facilityId: number;              
  manufacturerId: number;          // References Vendor
  
  // Nested objects (in responses)
  operationalStatus?: OperationalStatusDTO;
  equipmentType?: EquipmentTypeDTO;
  facility?: FacilityDTO;
  manufacturer?: VendorDTO;
}
```

### **Key Features:**
- Complete equipment lifecycle tracking
- Manufacturing and maintenance date tracking
- Vendor/manufacturer association
- Linked to facility and equipment type

### **Validation:**
- All core fields are required
- All dates must be in YYYY-MM-DD format
- All relationship IDs are required

### **Example:**

```typescript
const equipment: EquipmentDTO = {
  name: "Main Pump Unit A",
  code: "PUMP-001",
  modelNumber: "XYZ-5000",
  serialNumber: "SN123456789",
  manufacturingDate: "2020-05-15",
  installationDate: "2020-08-20",
  lastMaintenanceDate: "2025-12-01",
  operationalStatusId: 1,
  equipmentTypeId: 3,
  facilityId: 5,
  manufacturerId: 7
};
```

---

## FacilityDTO

### **Purpose:**
Represents processing or storage facilities in the network.

### **Structure:**

```typescript
export interface FacilityDTO {
  id?: number;
  
  // Core fields
  code: string;                    // 2-20 chars (required)
  name: string;                    // 3-100 chars (required)
  
  // Dates (optional, ISO format)
  installationDate?: string;       
  commissioningDate?: string;      
  decommissioningDate?: string;    
  
  // Required relationships
  operationalStatusId: number;     
  structureId: number;             
  facilityTypeId: number;          
  
  // Nested objects
  operationalStatus?: OperationalStatusDTO;
  structure?: StructureDTO;
  facilityType?: FacilityTypeDTO;
}
```

### **Example:**

```typescript
const facility: FacilityDTO = {
  code: "FAC-001",
  name: "Processing Plant A",
  installationDate: "2018-03-15",
  commissioningDate: "2018-06-01",
  operationalStatusId: 1,
  structureId: 2,
  facilityTypeId: 3
};
```

---

## HydrocarbonFieldDTO

### **Purpose:**
Represents oil or gas fields in the network.

### **Structure:**

```typescript
export interface HydrocarbonFieldDTO {
  id?: number;
  
  // Core fields
  code: string;                    // 2-20 chars (required)
  name: string;                    // 3-100 chars (required)
  
  // Dates (optional)
  discoveryDate?: string;          
  productionStartDate?: string;    
  
  // Required relationships
  structureId: number;             
  hydrocarbonFieldTypeId: number;  
  
  // Nested objects
  structure?: StructureDTO;
  hydrocarbonFieldType?: HydrocarbonFieldTypeDTO;
}
```

---

## InfrastructureDTO

### **Purpose:**
Base infrastructure entity with common fields for all network infrastructure types.

### **Structure:**

```typescript
export interface InfrastructureDTO {
  id?: number;
  
  // Core fields
  code: string;                    // 2-20 chars (required)
  name: string;                    // 3-100 chars (required)
  
  // Dates (optional, ISO format)
  installationDate?: string;       
  commissioningDate?: string;      
  decommissioningDate?: string;    
  
  // Required relationships
  operationalStatusId: number;     
  structureId: number;             
  
  // Nested objects
  operationalStatus?: OperationalStatusDTO;
  structure?: StructureDTO;
}
```

---

## PipelineDTO

### **Purpose:**
Complex pipeline entity with detailed physical properties, pressure/capacity specifications, material/coating information, and facility connections.

### **Structure:**

```typescript
export interface PipelineDTO {
  id?: number;
  
  // Core infrastructure fields
  code: string;                              // 2-20 chars (required)
  name: string;                              // 3-100 chars (required)
  
  // Dates (optional)
  installationDate?: string;                 
  commissioningDate?: string;                
  decommissioningDate?: string;              
  
  // Physical dimensions (all required, must be >= 0)
  nominalDiameter: number;                   
  length: number;                            
  nominalThickness: number;                  
  nominalRoughness: number;                  
  
  // Pressure specifications (all required, >= 0)
  designMaxServicePressure: number;          
  operationalMaxServicePressure: number;     
  designMinServicePressure: number;          
  operationalMinServicePressure: number;     
  
  // Capacity specifications (all required, >= 0)
  designCapacity: number;                    
  operationalCapacity: number;               
  
  // Required relationships
  operationalStatusId: number;               
  structureId: number;                       
  nominalConstructionMaterialId: number;     // Alloy
  nominalExteriorCoatingId: number;          // Alloy
  nominalInteriorCoatingId: number;          // Alloy
  vendorId: number;                          
  pipelineSystemId: number;                  
  departureFacilityId: number;               // Start point
  arrivalFacilityId: number;                 // End point
  
  // Collections
  locationIds?: number[];                    // Route locations
  
  // Nested objects (in responses)
  operationalStatus?: OperationalStatusDTO;
  structure?: StructureDTO;
  nominalConstructionMaterial?: AlloyDTO;
  nominalExteriorCoating?: AlloyDTO;
  nominalInteriorCoating?: AlloyDTO;
  vendor?: VendorDTO;
  pipelineSystem?: PipelineSystemDTO;
  departureFacility?: FacilityDTO;
  arrivalFacility?: FacilityDTO;
}
```

### **Key Features:**
- **Comprehensive physical properties:** diameter, length, thickness, roughness
- **Pressure specifications:** design vs operational (max and min)
- **Capacity specifications:** design vs operational
- **Material specifications:** construction material + exterior/interior coatings
- **Facility connections:** departure and arrival facilities
- **Route tracking:** locationIds array for geographic route

### **Validation Highlights:**
- All numeric fields must be >= 0 (@PositiveOrZero)
- 9 required relationship IDs
- Comprehensive physical and operational specifications

### **Example:**

```typescript
const pipeline: PipelineDTO = {
  code: "PL-001",
  name: "Main Transport Pipeline",
  installationDate: "2019-05-01",
  commissioningDate: "2019-08-15",
  
  // Physical properties
  nominalDiameter: 36.0,           // inches
  length: 125000.0,                // meters
  nominalThickness: 0.5,           // inches
  nominalRoughness: 0.045,         // mm
  
  // Pressure specs
  designMaxServicePressure: 100.0,         // bar
  operationalMaxServicePressure: 95.0,     // bar
  designMinServicePressure: 10.0,          // bar
  operationalMinServicePressure: 15.0,     // bar
  
  // Capacity specs
  designCapacity: 50000.0,                 // m³/day
  operationalCapacity: 45000.0,            // m³/day
  
  // Relationships
  operationalStatusId: 1,
  structureId: 2,
  nominalConstructionMaterialId: 5,
  nominalExteriorCoatingId: 8,
  nominalInteriorCoatingId: 9,
  vendorId: 12,
  pipelineSystemId: 3,
  departureFacilityId: 7,
  arrivalFacilityId: 11,
  
  locationIds: [101, 102, 103, 104, 105]
};
```

---

## PipelineSegmentDTO

### **Purpose:**
Represents a physical segment of a pipeline with specific dimensions, materials, coatings, and position markers.

### **Structure:**

```typescript
export interface PipelineSegmentDTO {
  id?: number;
  
  // Core infrastructure fields
  code: string;                    // 2-20 chars (required)
  name: string;                    // 3-100 chars (required)
  
  // Dates (optional)
  installationDate?: string;       
  commissioningDate?: string;      
  decommissioningDate?: string;    
  
  // Physical dimensions (all required, >= 0)
  diameter: number;                
  length: number;                  
  thickness: number;               
  roughness: number;               
  
  // Position markers (required, >= 0)
  startPoint: number;              // Position along pipeline
  endPoint: number;                // Position along pipeline
  
  // Required relationships
  operationalStatusId: number;     
  structureId: number;             
  constructionMaterialId: number;  // Alloy
  exteriorCoatingId: number;       // Alloy
  interiorCoatingId: number;       // Alloy
  pipelineId: number;              // Parent pipeline
  
  // Nested objects
  operationalStatus?: OperationalStatusDTO;
  structure?: StructureDTO;
  constructionMaterial?: AlloyDTO;
  exteriorCoating?: AlloyDTO;
  interiorCoating?: AlloyDTO;
  pipeline?: PipelineDTO;
}
```

### **Key Features:**
- Represents a portion of a larger pipeline
- **Position markers:** startPoint and endPoint define segment location
- **Individual materials:** each segment can have different materials/coatings
- Linked to parent pipeline

### **Validation Highlights:**
- endPoint must be > startPoint (logical validation)
- All physical dimensions must be >= 0

### **Example:**

```typescript
const segment: PipelineSegmentDTO = {
  code: "SEG-001",
  name: "Segment 1 - KM 0-5",
  installationDate: "2019-06-01",
  
  // Physical properties
  diameter: 36.0,
  length: 5000.0,              // 5km segment
  thickness: 0.5,
  roughness: 0.045,
  
  // Position markers
  startPoint: 0.0,             // KM 0
  endPoint: 5000.0,            // KM 5
  
  // Relationships
  operationalStatusId: 1,
  structureId: 2,
  constructionMaterialId: 5,
  exteriorCoatingId: 8,
  interiorCoatingId: 9,
  pipelineId: 3                // Parent pipeline
};
```

---

## PipelineSystemDTO

### **Purpose:**
Represents a collection of related pipelines that transport a specific product and belong to a specific organization structure.

### **Structure:**

```typescript
export interface PipelineSystemDTO {
  id?: number;
  
  // Core fields
  code: string;                    // max 50 chars (required)
  name: string;                    // max 100 chars (required)
  
  // Required relationships
  productId: number;               // Product transported
  operationalStatusId: number;     
  structureId: number;             // Owning organization
  
  // Nested objects
  product?: ProductDTO;
  operationalStatus?: OperationalStatusDTO;
  structure?: StructureDTO;
}
```

### **Example:**

```typescript
const system: PipelineSystemDTO = {
  code: "SYS-001",
  name: "Crude Oil Transport System",
  productId: 1,                    // Crude oil
  operationalStatusId: 1,
  structureId: 2
};
```

---

## StationDTO

### **Purpose:**
Represents pumping or compression stations in the network.

### **Structure:**

```typescript
export interface StationDTO {
  id?: number;
  
  // Core fields
  code: string;                    // 2-20 chars (required)
  name: string;                    // 3-100 chars (required)
  
  // Dates (optional)
  installationDate?: string;       
  commissioningDate?: string;      
  decommissioningDate?: string;    
  
  // Required relationships
  operationalStatusId: number;     
  structureId: number;             
  stationTypeId: number;           
  
  // Nested objects
  operationalStatus?: OperationalStatusDTO;
  structure?: StructureDTO;
  stationType?: StationTypeDTO;
}
```

---

## TerminalDTO

### **Purpose:**
Represents import/export terminals in the network.

### **Structure:**

```typescript
export interface TerminalDTO {
  id?: number;
  
  // Core fields
  code: string;                    // 2-20 chars (required)
  name: string;                    // 3-100 chars (required)
  
  // Dates (optional)
  installationDate?: string;       
  commissioningDate?: string;      
  decommissioningDate?: string;    
  
  // Capacity (required, >= 0)
  capacity: number;                
  
  // Required relationships
  operationalStatusId: number;     
  structureId: number;             
  terminalTypeId: number;          
  
  // Nested objects
  operationalStatus?: OperationalStatusDTO;
  structure?: StructureDTO;
  terminalType?: TerminalTypeDTO;
}
```

---

## Common Patterns

### **Date Fields:**
All dates are optional and follow ISO 8601 format (YYYY-MM-DD):
- `installationDate`
- `commissioningDate`
- `decommissioningDate`

### **Required Relationships:**
Most entities require:
- `operationalStatusId` - Current operational state
- `structureId` - Owning organization structure
- Type-specific ID (e.g., `facilityTypeId`, `stationTypeId`)

### **Nested Objects:**
All relationship IDs have corresponding nested objects populated in API responses.

---

## Validation Functions

All DTOs include validation functions:

```typescript
// Example validation
const errors = validateEquipmentDTO(data);
if (errors.length > 0) {
  console.error("Validation errors:", errors);
} else {
  // Submit to API
  await EquipmentService.create(data);
}
```

---

## Frontend Files

All Core DTOs are located in: `src/modules/network/core/dto/`

### **Files Created/Updated:**

1. **[EquipmentDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/dto/EquipmentDTO.ts)** - Latest commit: [59b6082](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/59b60821ff4e6060f65cb16c4ce775ee6a65ce80)
2. **[FacilityDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/dto/FacilityDTO.ts)** - Previously created
3. **[HydrocarbonFieldDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/dto/HydrocarbonFieldDTO.ts)** - Previously created
4. **[InfrastructureDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/dto/InfrastructureDTO.ts)** - Latest commit: [59b6082](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/59b60821ff4e6060f65cb16c4ce775ee6a65ce80)
5. **[PipelineDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/dto/PipelineDTO.ts)** - Latest commit: [08128de](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/08128de8c2486db71cd68c94d0da1b695a1976f1)
6. **[PipelineSegmentDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/dto/PipelineSegmentDTO.ts)** - Latest commit: [08128de](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/08128de8c2486db71cd68c94d0da1b695a1976f1)
7. **[PipelineSystemDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/dto/PipelineSystemDTO.ts)** - Latest commit: [59b6082](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/59b60821ff4e6060f65cb16c4ce775ee6a65ce80)
8. **[StationDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/dto/StationDTO.ts)** - Previously created
9. **[TerminalDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/core/dto/TerminalDTO.ts)** - Previously created

---

## Backend Alignment

### **Alignment Status:** ✅ 100%

All frontend DTOs are fully aligned with backend Java DTOs:
- ✅ All fields present
- ✅ All validations match
- ✅ All relationships defined
- ✅ All types correct (string, number, Date)
- ✅ All optional/required flags match

---

## Summary

### **Network Core DTOs: 9/9 ✅**

All Network Core DTOs have been successfully synchronized!

**Categories:**
1. **Infrastructure:** InfrastructureDTO (base)
2. **Facilities:** FacilityDTO, StationDTO, TerminalDTO
3. **Fields:** HydrocarbonFieldDTO
4. **Pipelines:** PipelineDTO, PipelineSegmentDTO, PipelineSystemDTO
5. **Equipment:** EquipmentDTO

**Common Features:**
- ✅ **Complete validation functions**
- ✅ **Backend alignment: 100%**
- ✅ **Documentation with examples**
- ✅ **Type safety with TypeScript**
- ✅ **Consistent naming conventions**

**Latest Updates:**
- January 7, 2026: Created Equipment, PipelineSystem, Infrastructure DTOs
- January 7, 2026: Created complex Pipeline and PipelineSegment DTOs
- All 9 Core DTOs now complete and documented

---

**Sync Date:** January 7, 2026, 1:00 PM CET  
**Backend Package:** `dz.sh.trc.hyflo.network.core.dto`  
**Frontend Location:** `src/modules/network/core/dto/`  
**Status:** ✅ All 9 Core DTOs Synchronized  
**Alignment:** 100%
