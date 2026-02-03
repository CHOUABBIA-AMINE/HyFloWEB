# Slot Coverage DTOs Documentation

**Created**: 2026-02-03  
**Author**: CHOUABBIA Amine  
**Purpose**: Slot-centric monitoring workflow for SONATRACH pipeline operations

---

## Overview

The **SlotCoverageDTO** and related types enable a **slot-centric operational console** for monitoring hydrocarbon pipeline readings. This replaces the traditional pipeline-centric CRUD interface with a workflow-driven approach aligned with SONATRACH's operational practices.

### SONATRACH Monitoring Workflow

```
1 Day = 1 Shift (24 hours)
1 Shift = 12 Reading Slots
1 Slot = 2 Hours

Slot 1:  00:00 - 02:00
Slot 2:  02:00 - 04:00
Slot 3:  04:00 - 06:00
...
Slot 12: 22:00 - 00:00
```

**Business Rule**: Each pipeline MUST have exactly **ONE reading per slot**.

---

## Reading Lifecycle

```
NOT_RECORDED → DRAFT → SUBMITTED → APPROVED ✓
                  ↓                      ↓
                  └─────────→ REJECTED → (loop back to DRAFT)
```

### Status Definitions

| Status | Description | User Role | Actions Available |
|--------|-------------|-----------|-------------------|
| **NOT_RECORDED** | No reading exists for this slot yet | Operator | Create |
| **DRAFT** | Operator saved but not submitted | Operator | Edit, Submit, Delete |
| **SUBMITTED** | Awaiting validation | Validator | Approve, Reject |
| **APPROVED** | Validated and locked | All | View only |
| **REJECTED** | Needs correction | Operator | Edit, Resubmit |

---

## DTOs Structure

### 1. `ReadingStatus` (Type)

```typescript
type ReadingStatus = 
  | 'NOT_RECORDED'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED';
```

### 2. `PipelineCoverageItemDTO` (Interface)

Represents a single pipeline's reading status within a slot.

```typescript
interface PipelineCoverageItemDTO {
  pipeline: PipelineDTO;              // Pipeline metadata
  status: ReadingStatus;               // Current lifecycle status
  reading: FlowReadingDTO | null;      // Reading data (null if NOT_RECORDED)
  
  // Permission flags (from backend RBAC)
  canCreate: boolean;                  // Can create new reading
  canEdit: boolean;                    // Can edit existing reading
  canSubmit: boolean;                  // Can submit for validation
  canApprove: boolean;                 // Can approve (validators only)
  canReject: boolean;                  // Can reject (validators only)
  canDelete?: boolean;                 // Can delete (optional)
}
```

**Key Principle**: **NO HARDCODED ROLES IN FRONTEND**. The backend controls all permission flags based on:
- User's role and permissions
- Current reading status
- Business rules
- Structure/pipeline assignments

### 3. `CoverageSummaryDTO` (Interface)

Aggregated statistics for a slot.

```typescript
interface CoverageSummaryDTO {
  totalPipelines: number;    // Total pipelines managed by structure
  notRecorded: number;       // Missing readings
  draft: number;             // Saved but not submitted
  submitted: number;         // Pending validation
  approved: number;          // Validated
  rejected: number;          // Needs correction
}
```

**Usage**: Display summary cards at top of slot dashboard.

### 4. `SlotCoverageDTO` (Interface)

Main response from coverage API.

```typescript
interface SlotCoverageDTO {
  date: string;                              // YYYY-MM-DD
  slot: ReadingSlotDTO;                      // Slot metadata (number, time range)
  structure: StructureDTO;                   // Organizational structure
  pipelineCoverage: PipelineCoverageItemDTO[]; // Coverage items
  summary: CoverageSummaryDTO;               // Statistics
  generatedAt?: string;                      // ISO timestamp
  userRole?: string;                         // Context
}
```

---

## Backend API Integration

### Expected Endpoint

```http
GET /api/flow/core/reading/coverage
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | Yes | Reading date (YYYY-MM-DD) |
| `slotNumber` | number | Yes | Slot number (1-12) |
| `structureId` | number | Yes | Organizational structure ID |

### Example Request

```bash
GET /api/flow/core/reading/coverage?date=2026-02-03&slotNumber=5&structureId=12
```

### Example Response

```json
{
  "date": "2026-02-03",
  "slot": {
    "id": 5,
    "slotNumber": 5,
    "startTime": "08:00",
    "endTime": "10:00",
    "designationAr": "الفترة 5",
    "designationFr": "Créneau 5",
    "designationEn": "Slot 5"
  },
  "structure": {
    "id": 12,
    "code": "DP-HASSI",
    "designationFr": "Direction Pipeline Hassi Messaoud",
    "designationAr": "مديرية خطوط الأنابيب حاسي مسعود"
  },
  "pipelineCoverage": [
    {
      "pipeline": {
        "id": 101,
        "code": "OB1",
        "name": "Hassi Messaoud - Arzew"
      },
      "status": "APPROVED",
      "reading": {
        "id": 4521,
        "pressure": 85.5,
        "temperature": 42.3,
        "flowRate": 1850.0,
        "recordedBy": { ... }
      },
      "canCreate": false,
      "canEdit": false,
      "canSubmit": false,
      "canApprove": false,
      "canReject": false
    },
    {
      "pipeline": {
        "id": 102,
        "code": "GZ1",
        "name": "Hassi R'mel - Arzew"
      },
      "status": "NOT_RECORDED",
      "reading": null,
      "canCreate": true,
      "canEdit": false,
      "canSubmit": false,
      "canApprove": false,
      "canReject": false
    },
    {
      "pipeline": {
        "id": 103,
        "code": "OB2",
        "name": "In Amenas - Skikda"
      },
      "status": "SUBMITTED",
      "reading": { ... },
      "canCreate": false,
      "canEdit": false,
      "canSubmit": false,
      "canApprove": true,
      "canReject": true
    }
  ],
  "summary": {
    "totalPipelines": 12,
    "notRecorded": 2,
    "draft": 1,
    "submitted": 4,
    "approved": 4,
    "rejected": 1
  },
  "generatedAt": "2026-02-03T14:30:00Z",
  "userRole": "VALIDATOR"
}
```

---

## Helper Functions

### `calculateSlotCompletionPercentage(summary)`

Calculates completion percentage based on approved readings.

```typescript
const completionRate = calculateSlotCompletionPercentage(coverage.summary);
// Returns: 33 (4 approved out of 12 total = 33%)
```

### `getReadingStatusColor(status)`

Returns MUI Chip color for status badges.

```typescript
const color = getReadingStatusColor('APPROVED');
// Returns: 'success'
```

**Color Mapping**:
- `NOT_RECORDED` → `default` (grey)
- `DRAFT` → `info` (blue)
- `SUBMITTED` → `warning` (orange)
- `APPROVED` → `success` (green)
- `REJECTED` → `error` (red)

### `getReadingStatusLabelKey(status)`

Returns i18n translation key.

```typescript
const key = getReadingStatusLabelKey('SUBMITTED');
// Returns: 'flow.status.submitted'
```

### `isSlotComplete(summary)`

Checks if all readings are approved.

```typescript
const complete = isSlotComplete(coverage.summary);
// Returns: false (not all approved)
```

### `hasPendingValidations(summary)`

Checks if any readings need validation.

```typescript
const pending = hasPendingValidations(coverage.summary);
// Returns: true (4 submitted)
```

### `hasSlotIssues(summary)`

Checks for rejections or missing readings.

```typescript
const issues = hasSlotIssues(coverage.summary);
// Returns: true (2 not recorded + 1 rejected)
```

---

## Frontend Usage

### Import DTOs

```typescript
import {
  SlotCoverageDTO,
  PipelineCoverageItemDTO,
  ReadingStatus,
  CoverageSummaryDTO,
  calculateSlotCompletionPercentage,
  getReadingStatusColor,
  isSlotComplete,
} from '@/modules/flow/core/dto';
```

### Slot Dashboard Example

```typescript
const SlotDashboard: React.FC = () => {
  const [coverage, setCoverage] = useState<SlotCoverageDTO | null>(null);
  
  const loadCoverage = async (date: string, slotNumber: number, structureId: number) => {
    const data = await SlotCoverageService.getSlotCoverage(date, slotNumber, structureId);
    setCoverage(data);
  };
  
  const completionRate = coverage ? calculateSlotCompletionPercentage(coverage.summary) : 0;
  
  return (
    <Box>
      <Typography>Completion: {completionRate}%</Typography>
      {coverage?.pipelineCoverage.map(item => (
        <TableRow key={item.pipeline.id}>
          <TableCell>{item.pipeline.code}</TableCell>
          <TableCell>
            <Chip 
              label={item.status} 
              color={getReadingStatusColor(item.status)}
            />
          </TableCell>
          <TableCell>
            {item.canCreate && <Button>Create</Button>}
            {item.canEdit && <Button>Edit</Button>}
            {item.canSubmit && <Button>Submit</Button>}
            {item.canApprove && <Button>Approve</Button>}
            {item.canReject && <Button>Reject</Button>}
          </TableCell>
        </TableRow>
      ))}
    </Box>
  );
};
```

---

## Permission-Driven UI Pattern

### ❌ BAD (Hardcoded Roles)

```typescript
// DON'T DO THIS
{user.roles.includes('VALIDATOR') && (
  <Button onClick={handleApprove}>Approve</Button>
)}
```

### ✅ GOOD (Backend-Controlled Permissions)

```typescript
// DO THIS
{item.canApprove && (
  <Button onClick={handleApprove}>Approve</Button>
)}
```

**Why?**
- Backend controls all business logic
- Permissions can change based on:
  - User role
  - Reading status
  - Structure assignment
  - Time constraints
  - Custom business rules
- Frontend just renders what backend allows
- Easier to test and maintain

---

## Related Files

- **DTO**: `src/modules/flow/core/dto/SlotCoverageDTO.ts`
- **Service**: `src/modules/flow/core/services/SlotCoverageService.ts` (to be created)
- **Page**: `src/modules/flow/core/pages/SlotDashboard.tsx` (to be created)
- **Component**: `src/modules/flow/core/components/SlotCoverageTable.tsx` (to be created)
- **Common DTOs**: 
  - `src/modules/flow/common/dto/ReadingSlotDTO.ts`
  - `src/modules/general/organization/dto/StructureDTO.ts`
  - `src/modules/network/core/dto/PipelineDTO.ts`

---

## Next Steps

1. ✅ **DTOs Created** (this file)
2. ⏳ Create `SlotCoverageService.ts` for API integration
3. ⏳ Create `SlotDashboard.tsx` main page
4. ⏳ Create `SlotCoverageTable.tsx` component
5. ⏳ Create `SlotSummaryCards.tsx` component
6. ⏳ Add i18n translation keys
7. ⏳ Update routing to make slot dashboard primary
8. ⏳ Test workflow: NOT_RECORDED → DRAFT → SUBMITTED → APPROVED
9. ⏳ Test permission enforcement

---

## Support

**Questions?** Contact CHOUABBIA Amine (chouabbia.amine@gmail.com)

**Backend Integration**: Ensure HyFloAPI exposes `/flow/core/reading/coverage` endpoint with RBAC permission flags.
