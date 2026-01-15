# Network Core Module - DTO Field-by-Field Trace Table

**Date:** January 15, 2026, 8:04 PM  
**Module:** `network/core`  
**Purpose:** Detailed field alignment comparison between backend (Java) and frontend (TypeScript) DTOs

---

## Summary Table

| DTO Name | Backend Fields | Frontend Fields | Status | Notes |
|----------|----------------|-----------------|--------|-------|
| **EquipmentDTO** | 16 | 16 | ✅ **ALIGNED** | All fields match |
| **FacilityDTO** | 13 | 13 | ✅ **ALIGNED** | All fields match (updated U-006) |
| **InfrastructureDTO** | 10 | 10 | ✅ **ALIGNED** | All fields match |
| **PipelineDTO** | 35 | ? | ⚠️ **VERIFY** | Complex DTO with many pressure/capacity fields |
| **PipelineSegmentDTO** | ~20 | ? | ⚠️ **VERIFY** | Needs field count |
| **PipelineSystemDTO** | 9 | 9 | ✅ **ALIGNED** | All fields match |
| **StationDTO** | ~15 | ? | ⚠️ **VERIFY** | Needs verification |
| **TerminalDTO** | ~13 | ? | ⚠️ **VERIFY** | Needs verification |
| **ProcessingPlantDTO** | ? | ❌ **MISSING** | ❌ **NOT FOUND** | Backend DTO exists, frontend missing |
| **ProductionFieldDTO** | ? | ❌ **MISSING** | ❌ **NOT FOUND** | Backend DTO exists, frontend missing |
| **HydrocarbonFieldDTO** | ❌ **N/A** | 7 | ⚠️ **EXTRA** | Frontend has this, backend doesn't |

---

## Detailed Field Comparisons

### 1. EquipmentDTO ✅

**Backend:** `dz.sh.trc.hyflo.network.core.dto.EquipmentDTO`  
**Frontend:** `src/modules/network/core/dto/EquipmentDTO.ts`

| # | Field Name | Backend Type | Frontend Type | Match | Notes |
|---|------------|--------------|---------------|-------|-------|
| 1 | id | Long | number? | ✅ | Optional identifier |
| 2 | name | String | string | ✅ | @NotBlank, max 100 chars |
| 3 | code | String | string | ✅ | @NotBlank, max 50 chars |
| 4 | modelNumber | String | string | ✅ | @NotBlank, max 50 chars |
| 5 | serialNumber | String | string | ✅ | @NotBlank, max 100 chars |
| 6 | manufacturingDate | LocalDate | string | ✅ | ISO format YYYY-MM-DD |
| 7 | installationDate | LocalDate | string | ✅ | ISO format YYYY-MM-DD |
| 8 | lastMaintenanceDate | LocalDate | string | ✅ | ISO format YYYY-MM-DD |
| 9 | operationalStatusId | Long | number | ✅ | @NotNull |
| 10 | equipmentTypeId | Long | number | ✅ | @NotNull |
| 11 | facilityId | Long | number | ✅ | @NotNull |
| 12 | manufacturerId | Long | number | ✅ | @NotNull (Vendor reference) |
| 13 | operationalStatus | OperationalStatusDTO | OperationalStatusDTO? | ✅ | Nested object (optional) |
| 14 | equipmentType | EquipmentTypeDTO | EquipmentTypeDTO? | ✅ | Nested object (optional) |
| 15 | facility | FacilityDTO | FacilityDTO? | ✅ | Nested object (optional) |
| 16 | manufacturer | VendorDTO | VendorDTO? | ✅ | Nested object (optional) |

**Total:** 16/16 fields aligned ✅

---

### 2. FacilityDTO ✅

**Backend:** `dz.sh.trc.hyflo.network.core.dto.FacilityDTO`  
**Frontend:** `src/modules/network/core/dto/FacilityDTO.ts`  
**Updated:** U-006 (Jan 7, 2026) - Added locationId field

| # | Field Name | Backend Type | Frontend Type | Match | Notes |
|---|------------|--------------|---------------|-------|-------|
| 1 | id | Long | number? | ✅ | Optional identifier |
| 2 | code | String | string | ✅ | @NotBlank, max 20 chars |
| 3 | name | String | string | ✅ | @NotBlank, max 100 chars |
| 4 | installationDate | LocalDate | string? | ✅ | Optional, ISO format |
| 5 | commissioningDate | LocalDate | string? | ✅ | Optional, ISO format |
| 6 | decommissioningDate | LocalDate | string? | ✅ | Optional, ISO format |
| 7 | operationalStatusId | Long | number | ✅ | @NotNull |
| 8 | structureId | Long | number | ✅ | @NotNull |
| 9 | vendorId | Long | number | ✅ | @NotNull |
| 10 | locationId | Long | number | ✅ | @NotNull (ADDED in U-006) |
| 11 | operationalStatus | OperationalStatusDTO | OperationalStatusDTO? | ✅ | Nested object (optional) |
| 12 | structure | StructureDTO | StructureDTO? | ✅ | Nested object (optional) |
| 13 | vendor | VendorDTO | VendorDTO? | ✅ | Nested object (optional) |
| 14 | location | LocationDTO | LocationDTO? | ✅ | Nested object (optional, U-006) |

**Total:** 14/14 fields aligned ✅  
**Note:** Frontend properly synced with backend U-006 update

---

### 3. InfrastructureDTO ✅

**Backend:** `dz.sh.trc.hyflo.network.core.dto.InfrastructureDTO`  
**Frontend:** `src/modules/network/core/dto/InfrastructureDTO.ts`

| # | Field Name | Backend Type | Frontend Type | Match | Notes |
|---|------------|--------------|---------------|-------|-------|
| 1 | id | Long | number? | ✅ | Optional identifier |
| 2 | code | String | string | ✅ | @NotBlank, 2-20 chars |
| 3 | name | String | string | ✅ | @NotBlank, 3-100 chars |
| 4 | installationDate | LocalDate | string? | ✅ | Optional, ISO format |
| 5 | commissioningDate | LocalDate | string? | ✅ | Optional, ISO format |
| 6 | decommissioningDate | LocalDate | string? | ✅ | Optional, ISO format |
| 7 | operationalStatusId | Long | number | ✅ | @NotNull |
| 8 | structureId | Long | number | ✅ | @NotNull |
| 9 | operationalStatus | OperationalStatusDTO | OperationalStatusDTO? | ✅ | Nested object (optional) |
| 10 | structure | StructureDTO | StructureDTO? | ✅ | Nested object (optional) |

**Total:** 10/10 fields aligned ✅

---

### 4. PipelineDTO ⚠️

**Backend:** `dz.sh.trc.hyflo.network.core.dto.PipelineDTO`  
**Frontend:** `src/modules/network/core/dto/PipelineDTO.ts`

#### Backend Fields (35 total):

**Core Fields (6):**
1. id (Long)
2. code (String) - @NotBlank, 2-20 chars
3. name (String) - @NotBlank, 3-100 chars
4. installationDate (LocalDate)
5. commissioningDate (LocalDate)
6. decommissioningDate (LocalDate)

**Physical Properties (4):**
7. nominalDiameter (String) - @NotNull
8. length (Double) - @NotNull
9. nominalThickness (String) - @NotNull
10. nominalRoughness (String) - @NotNull

**Pressure Specifications (4):**
11. designMaxServicePressure (Double) - @NotNull
12. operationalMaxServicePressure (Double) - @NotNull
13. designMinServicePressure (Double) - @NotNull
14. operationalMinServicePressure (Double) - @NotNull

**Capacity Specifications (2):**
15. designCapacity (Double) - @NotNull
16. operationalCapacity (Double) - @NotNull

**Relationship IDs (9):**
17. operationalStatusId (Long) - @NotNull
18. structureId (Long) - @NotNull
19. nominalConstructionMaterialId (Long) - @NotNull (Alloy)
20. nominalExteriorCoatingId (Long) - @NotNull (Alloy)
21. nominalInteriorCoatingId (Long) - @NotNull (Alloy)
22. vendorId (Long) - @NotNull
23. pipelineSystemId (Long) - @NotNull
24. departureTerminalId (Long) - @NotNull
25. arrivalTerminalId (Long) - @NotNull

**Collections (1):**
26. locationIds (Set<Long>) - Set of location IDs

**Nested Objects (9):**
27. operationalStatus (OperationalStatusDTO)
28. structure (StructureDTO)
29. nominalConstructionMaterial (AlloyDTO)
30. nominalExteriorCoating (AlloyDTO)
31. nominalInteriorCoating (AlloyDTO)
32. vendor (VendorDTO)
33. pipelineSystem (PipelineSystemDTO)
34. departureTerminal (TerminalDTO)
35. arrivalTerminal (TerminalDTO)

**Status:** ⚠️ **Needs frontend field-by-field verification**  
**Critical:** Check if frontend has all 35 fields including:
- 4 pressure fields (design/operational min/max)
- 2 capacity fields (design/operational)
- nominalRoughness field
- 3 coating/material Alloy references
- locationIds collection

---

### 5. PipelineSystemDTO ✅

**Backend:** `dz.sh.trc.hyflo.network.core.dto.PipelineSystemDTO`  
**Frontend:** `src/modules/network/core/dto/PipelineSystemDTO.ts`

| # | Field Name | Backend Type | Frontend Type | Match | Notes |
|---|------------|--------------|---------------|-------|-------|
| 1 | id | Long | number? | ✅ | Optional identifier |
| 2 | code | String | string | ✅ | @NotBlank, max 50 chars |
| 3 | name | String | string | ✅ | @NotBlank, max 100 chars |
| 4 | productId | Long | number | ✅ | @NotNull |
| 5 | operationalStatusId | Long | number | ✅ | @NotNull |
| 6 | structureId | Long | number | ✅ | @NotNull |
| 7 | product | ProductDTO | ProductDTO? | ✅ | Nested object (optional) |
| 8 | operationalStatus | OperationalStatusDTO | OperationalStatusDTO? | ✅ | Nested object (optional) |
| 9 | structure | StructureDTO | StructureDTO? | ✅ | Nested object (optional) |

**Total:** 9/9 fields aligned ✅

---

### 6. StationDTO ⚠️

**Backend:** `dz.sh.trc.hyflo.network.core.dto.StationDTO`  
**Frontend:** `src/modules/network/core/dto/StationDTO.ts`

**Status:** ⚠️ **Needs verification**  
**Action Required:** Fetch and compare field lists

---

### 7. TerminalDTO ⚠️

**Backend:** `dz.sh.trc.hyflo.network.core.dto.TerminalDTO`  
**Frontend:** `src/modules/network/core/dto/TerminalDTO.ts`

**Status:** ⚠️ **Needs verification**  
**Action Required:** Fetch and compare field lists

---

### 8. PipelineSegmentDTO ⚠️

**Backend:** `dz.sh.trc.hyflo.network.core.dto.PipelineSegmentDTO`  
**Frontend:** `src/modules/network/core/dto/PipelineSegmentDTO.ts`

**Status:** ⚠️ **Needs verification**  
**Action Required:** Fetch and compare field lists

---

## Missing DTOs (Backend → Frontend)

### 9. ProcessingPlantDTO ❌

**Backend:** `dz.sh.trc.hyflo.network.core.dto.ProcessingPlantDTO` ✅ EXISTS  
**Frontend:** ❌ **MISSING**

**Status:** ❌ **NOT IMPLEMENTED IN FRONTEND**  
**Action Required:** Create `ProcessingPlantDTO.ts` in frontend

---

### 10. ProductionFieldDTO ❌

**Backend:** `dz.sh.trc.hyflo.network.core.dto.ProductionFieldDTO` ✅ EXISTS  
**Frontend:** ❌ **MISSING**

**Status:** ❌ **NOT IMPLEMENTED IN FRONTEND**  
**Action Required:** Create `ProductionFieldDTO.ts` in frontend

---

## Extra DTOs (Frontend Only)

### 11. HydrocarbonFieldDTO ⚠️

**Backend:** ❌ **NOT FOUND** (no matching DTO in backend/core)  
**Frontend:** `src/modules/network/core/dto/HydrocarbonFieldDTO.ts` ✅ EXISTS

**Frontend Fields (7):**
1. id (number?)
2. code (string)
3. name (string)
4. discoveryDate (string?)
5. operationalStatusId (number)
6. structureId (number)
7. operationalStatus (OperationalStatusDTO?)
8. structure (StructureDTO?)

**Status:** ⚠️ **ORPHANED / LEGACY DTO**  
**Question:** Is this deprecated? Should it be removed? Or does it map to `ProductionFieldDTO`?

---

## Type Mapping Reference

| Java Backend | TypeScript Frontend | Notes |
|--------------|---------------------|-------|
| Long | number | ID fields |
| String | string | Text fields |
| LocalDate | string (ISO) | Format: YYYY-MM-DD |
| Double | number | Numeric measurements |
| Boolean | boolean | Flags |
| Set<Long> | number[] or Set<number> | Collections of IDs |
| DTO | DTO? | Nested objects (optional) |

---

## Alignment Summary

| Status | Count | DTOs |
|--------|-------|------|
| ✅ **Aligned** | 4 | EquipmentDTO, FacilityDTO, InfrastructureDTO, PipelineSystemDTO |
| ⚠️ **Needs Verification** | 4 | PipelineDTO, PipelineSegmentDTO, StationDTO, TerminalDTO |
| ❌ **Missing in Frontend** | 2 | ProcessingPlantDTO, ProductionFieldDTO |
| ⚠️ **Extra in Frontend** | 1 | HydrocarbonFieldDTO (orphaned?) |
| **Total Backend DTOs** | 10 | |
| **Total Frontend DTOs** | 9 | |

---

## Action Items

### High Priority ❌
1. **Create ProcessingPlantDTO.ts** - Missing in frontend
2. **Create ProductionFieldDTO.ts** - Missing in frontend
3. **Verify PipelineDTO.ts** - 35 fields with complex pressure/capacity specifications

### Medium Priority ⚠️
4. **Verify PipelineSegmentDTO.ts** - Field-by-field comparison needed
5. **Verify StationDTO.ts** - Field-by-field comparison needed
6. **Verify TerminalDTO.ts** - Field-by-field comparison needed

### Low Priority ⚠️
7. **Resolve HydrocarbonFieldDTO.ts** - Determine if legacy/deprecated or needs backend counterpart

---

## Notes

- **FacilityDTO** was properly updated (U-006) to add `locationId` field on Jan 7, 2026
- **PipelineDTO** is the most complex DTO with 35 fields including detailed pressure and capacity specifications
- Backend has more DTOs (10) than frontend (9) - missing ProcessingPlant and ProductionField
- Frontend has HydrocarbonField which doesn't exist in backend - might be legacy or renamed

---

**Last Updated:** January 15, 2026, 8:04 PM  
**Reviewed By:** DTO Alignment Analysis  
**Next Review:** After implementing missing DTOs and verifying unverified ones
