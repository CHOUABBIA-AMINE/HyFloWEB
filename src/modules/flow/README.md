# Flow Module Documentation

## Overview

The **Flow Module** is a standalone module at the same level as `network`, `system`, and `general` modules. It manages all hydrocarbon flow monitoring functionality for the HyFlo platform.

**Created**: 2026-01-25  
**Aligned with Backend**: HyFloAPI (commit 8af691e, 2026-01-23)  
**Author**: CHOUABBIA Amine

---

## Module Structure

```
src/modules/flow/
├── common/              # Common lookup/reference DTOs
│   └── dto/
│       ├── ValidationStatusDTO.ts
│       ├── AlertStatusDTO.ts
│       ├── EventStatusDTO.ts
│       ├── SeverityDTO.ts
│       ├── QualityFlagDTO.ts
│       ├── DataSourceDTO.ts
│       └── index.ts
├── core/                # Core business domain DTOs
│   └── dto/
│       ├── FlowReadingDTO.ts
│       ├── FlowOperationDTO.ts
│       ├── FlowAlertDTO.ts
│       ├── FlowEventDTO.ts
│       ├── FlowForecastDTO.ts
│       ├── FlowThresholdDTO.ts
│       └── index.ts
├── type/                # Type classification DTOs
│   └── dto/
│       ├── OperationTypeDTO.ts
│       ├── EventTypeDTO.ts
│       ├── ParameterTypeDTO.ts
│       └── index.ts
├── index.ts             # Main barrel export
└── README.md            # This file
```

---

## Backend Alignment

This frontend structure **exactly mirrors** the backend package structure:

| Backend Package | Frontend Module | Purpose |
|----------------|-----------------|----------|
| `dz.sh.trc.hyflo.flow.common` | `flow/common` | Shared lookup/reference data |
| `dz.sh.trc.hyflo.flow.core` | `flow/core` | Core business entities |
| `dz.sh.trc.hyflo.flow.type` | `flow/type` | Type classifications |

---

## DTO Categories

### 1. Common DTOs (`flow/common/dto`)

Shared reference data used across flow operations:

#### ValidationStatusDTO
- **Purpose**: Track validation workflow states
- **Codes**: `DRAFT`, `PENDING`, `VALIDATED`, `REJECTED`, `ARCHIVED`
- **Fields**: code, designations (ar/en/fr), descriptions (ar/en/fr)
- **UI Usage**: Status badges, workflow filters

#### AlertStatusDTO
- **Purpose**: Track alert lifecycle
- **Codes**: `ACTIVE`, `ACKNOWLEDGED`, `RESOLVED`, `DISMISSED`
- **UI Usage**: Alert panel, notification center

#### EventStatusDTO
- **Purpose**: Track operational event states
- **Codes**: `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- **UI Usage**: Event calendar, timeline view

#### SeverityDTO
- **Purpose**: Classify issue severity levels
- **Codes**: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- **Color Mapping**: info, warning, warning, error
- **UI Usage**: Alert priority, threshold configuration

#### QualityFlagDTO
- **Purpose**: Data quality indicators
- **Codes**: `GOOD`, `ESTIMATED`, `SUSPECT`, `MISSING`, `OUT_OF_RANGE`
- **Field**: `requiresReview` (boolean)
- **UI Usage**: Data grid indicators, quality reports

#### DataSourceDTO
- **Purpose**: Track data origin
- **Codes**: `MANUAL_ENTRY`, `EXCEL_IMPORT`, `SCADA_EXPORT`, `METER_READING`, `ESTIMATED`
- **Fields**: `isManual`, `requiresValidation`
- **UI Usage**: Data provenance tracking

---

### 2. Core DTOs (`flow/core/dto`)

Main business entities for flow monitoring:

#### FlowReadingDTO 🔑 **Priority 1**
- **Backend API**: `/flow/core/reading`
- **Purpose**: Capture pipeline measurement readings
- **Key Fields**:
  - `recordedAt` (DateTime, required)
  - `pressure` (0-500 bar)
  - `temperature` (-50 to 200°C)
  - `flowRate` (m³/h)
  - `containedVolume` (m³)
  - `pipelineId`, `recordedById`, `validationStatusId`
- **UI Screens**: Reading list, entry form, import wizard
- **Backend Endpoints**:
  ```
  GET    /flow/core/reading?page=0&size=20&sortBy=recordedAt&sortDir=desc
  GET    /flow/core/reading/{id}
  POST   /flow/core/reading
  PUT    /flow/core/reading/{id}
  DELETE /flow/core/reading/{id}
  GET    /flow/core/reading/pipeline/{pipelineId}
  GET    /flow/core/reading/time-range?startTime=...&endTime=...
  ```

#### FlowOperationDTO
- **Backend API**: `/flow/core/operation`
- **Purpose**: Daily flow operations tracking
- **Key Fields**:
  - `date` (Date, required)
  - `volume` (required, ≥ 0, 13 digits + 2 decimals)
  - `infrastructureId`, `productId`, `typeId`
- **UI Screens**: Operation calendar, volume tracking

#### FlowAlertDTO
- **Backend API**: `/flow/core/alert`
- **Purpose**: Threshold violations and anomalies
- **Key Fields**:
  - `triggeredAt`, `message`, `measuredValue`
  - `pipelineId`, `thresholdId`, `severityId`, `statusId`
  - `acknowledgedAt`, `resolvedAt`
- **UI Screens**: Alert dashboard, notification panel

#### FlowEventDTO
- **Backend API**: `/flow/core/event`
- **Purpose**: Operational incidents tracking
- **Key Fields**:
  - `startTime`, `endTime`, `title`, `description`
  - `impact`, `resolution`
  - `infrastructureId`, `typeId`, `severityId`
- **UI Screens**: Event timeline, incident log

#### FlowForecastDTO
- **Backend API**: `/flow/core/forecast`
- **Purpose**: Planning and volume forecasting
- **Key Fields**:
  - `forecastDate` (future date)
  - `estimatedVolume`, `confidence` (0-100%)
  - `infrastructureId`, `productId`
- **UI Screens**: Forecast planner, capacity planning

#### FlowThresholdDTO
- **Backend API**: `/flow/core/threshold`
- **Purpose**: Monitoring limits configuration
- **Key Fields**:
  - `minValue`, `maxValue`
  - `effectiveFrom`, `effectiveTo`
  - `pipelineId`, `parameterTypeId`, `severityId`
- **UI Screens**: Threshold configuration, alarm setup

---

### 3. Type DTOs (`flow/type/dto`)

Classification and categorization:

#### OperationTypeDTO
- **Codes**: `PRODUCTION`, `CONSUMPTION`, `TRANSPORTATION`, `STORAGE`, `EXPORT`, `IMPORT`
- **Usage**: Classify flow operations

#### EventTypeDTO
- **Codes**: `MAINTENANCE`, `SHUTDOWN`, `LEAK`, `PRESSURE_DROP`, `EQUIPMENT_FAILURE`, `INSPECTION`
- **Usage**: Categorize operational events

#### ParameterTypeDTO
- **Codes**: `PRESSURE`, `TEMPERATURE`, `FLOW_RATE`, `VOLUME`, `DENSITY`
- **Field**: `unit` (e.g., "bar", "°C", "m³/h")
- **Usage**: Define threshold parameters

---

## Usage Examples

### Import DTOs

```typescript
// Import specific DTO
import { FlowReadingDTO, CreateFlowReadingDTO } from '@/modules/flow/core/dto';
import { ValidationStatusDTO, ValidationStatusCode } from '@/modules/flow/common/dto';

// Import all from module
import * as FlowDTOs from '@/modules/flow';
```

### Type-Safe Data Handling

```typescript
import { FlowReadingDTO, FlowReadingConstraints } from '@/modules/flow';

const reading: FlowReadingDTO = {
  recordedAt: new Date().toISOString(),
  pressure: 85.5,  // Must be 0-500
  temperature: 65.3, // Must be -50 to 200
  flowRate: 1250.75,
  pipelineId: 1,
  recordedById: 10,
  validationStatusId: 2, // PENDING
};

// Validation
if (reading.pressure && reading.pressure > FlowReadingConstraints.pressure.max) {
  throw new Error(`Pressure exceeds maximum ${FlowReadingConstraints.pressure.max} bar`);
}
```

### UI Helper Functions

```typescript
import { getValidationStatusColor, getSeverityColor } from '@/modules/flow';

// In a React component
<Chip 
  label={reading.validationStatus?.designationEn} 
  color={getValidationStatusColor(reading.validationStatus?.code)}
/>

<Alert severity={getSeverityColor(alert.severity?.code)}>
  {alert.message}
</Alert>
```

---

## Next Steps

Now that DTOs are created, the following need to be built:

### Phase 1: Services Layer (Week 1)
- [ ] `flow/core/services/flowReadingService.ts`
- [ ] `flow/core/services/flowOperationService.ts`
- [ ] `flow/core/services/flowAlertService.ts`
- [ ] `flow/common/services/validationStatusService.ts`

### Phase 2: Components (Week 2)
- [ ] `flow/core/components/FlowReadingForm/`
- [ ] `flow/core/components/FlowReadingDataGrid/`
- [ ] `flow/core/components/ValidationStatusChip/`
- [ ] `flow/core/components/AlertPanel/`

### Phase 3: Pages (Week 2-3)
- [ ] `flow/core/pages/FlowReadingList.tsx`
- [ ] `flow/core/pages/FlowReadingEntry.tsx`
- [ ] `flow/core/pages/FlowReadingImport.tsx`
- [ ] `flow/core/pages/FlowDashboard.tsx`

### Phase 4: Routing (Week 3)
- [ ] Add routes to `App.tsx`
- [ ] Update Sidebar with flow menu items
- [ ] Add ProtectedRoute wrappers with permissions

---

## API Contract Alignment

All DTOs are **100% aligned** with backend contracts as of:
- **Backend Commit**: `8af691e2e19408cbacd307f94ef71378346ce4b5`
- **Backend Date**: 2026-01-23
- **Author**: MEDJERAB Abir

**Validation Rules Match**:
- ✅ Field names identical
- ✅ Data types compatible (Java → TypeScript)
- ✅ Validation constraints documented
- ✅ Nested relationships preserved
- ✅ Multilingual fields (ar/en/fr) supported

---

## Migration from network/flow

The old `network/flow` structure should be **deprecated** and removed:

```bash
# Old structure (to be deleted)
src/modules/network/flow/

# New structure (current)
src/modules/flow/
```

**Action Required**:
1. Update all imports from `@/modules/network/flow` to `@/modules/flow`
2. Remove `src/modules/network/flow/` directory
3. Update `tsconfig.json` path aliases if needed

---

## SONATRACH Domain Alignment

This module is designed specifically for **Algerian hydrocarbon infrastructure**:

- ✅ Multilingual support (Arabic primary, French official, English optional)
- ✅ Offline-first data entry (manual readings, batch imports)
- ✅ Validation workflow (operator → supervisor approval)
- ✅ Audit trail (who recorded, who validated, when)
- ✅ Engineering units (bar, °C, m³/h standard in Algeria)
- ✅ SONATRACH operational practices embedded

---

## Support

For questions or issues:
- **Frontend**: CHOUABBIA Amine (chouabbia.amine@gmail.com)
- **Backend**: MEDJERAB Abir
- **Repository**: [HyFloWEB](https://github.com/CHOUABBIA-AMINE/HyFloWEB)
