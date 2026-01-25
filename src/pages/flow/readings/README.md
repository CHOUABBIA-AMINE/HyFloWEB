# Flow Readings - ReadingEdit Component

## Quick Start

### Installation

All components are already created. No additional installation needed.

### Basic Usage

```tsx
import { ReadingEdit } from './ReadingEdit';

// Create new reading
<ReadingEdit mode="create" />

// Edit existing reading
<ReadingEdit mode="edit" />

// Validate reading (for validators)
<ReadingEdit mode="validate" />
```

## Components

### 📝 ReadingEdit
Main orchestrator component with multi-step wizard.

### 🔧 PipelineSelection
Step 1: Select pipeline from user's authorized structures.

### 📊 MeasurementForm
Step 2: Enter measurements with real-time validation.

### 🎯 ThresholdIndicator
Visual feedback component for threshold status.

### ✅ ValidationReview
Step 3: Review and submit/validate readings.

## Features

- ✅ Multi-step form with progress indicator
- ✅ Real-time threshold validation
- ✅ Structure-based pipeline filtering
- ✅ Visual threshold indicators (green/yellow/red)
- ✅ Unsaved changes warning
- ✅ Comprehensive error handling
- ✅ Loading states and skeletons
- ✅ Validator approve/reject actions
- ✅ Mobile responsive design

## API Dependencies

### Required Endpoints

```
GET  /auth/me
GET  /network/core/pipeline/structure/{structureId}
GET  /flow/core/flowReading/{id}
GET  /flow/core/flowReading/pipeline/{id}/latest
POST /flow/core/flowReading
PUT  /flow/core/flowReading/{id}
POST /flow/core/flowReading/{id}/validate
GET  /flow/core/flowThreshold/pipeline/{id}/active
GET  /flow/common/validationStatus/all
```

## Data Flow

```
User → Pipeline Selection → Measurement Entry → Review → Submit
  ↓          ↓                    ↓              ↓        ↓
Auth    Load Pipelines    Threshold Check    Validate   Create/Update
```

## State Management

Uses **React Hook Form** for:
- Form state management
- Validation handling
- Error tracking
- Dirty state detection

## Validation

### Frontend Validation
1. Required fields check
2. Range validation (min/max)
3. Format validation
4. Business rules (at least one measurement)

### Real-time Threshold Validation
- 🟢 Green: Within normal range
- 🟡 Yellow: Near threshold (tolerance zone)
- 🔴 Red: Breach detected

### Backend Validation
- Authorization check
- Duplicate detection
- Threshold breach alert generation

## User Roles

### Regular User
- Create readings
- Edit own draft readings
- Submit for validation

### Validator
- All regular user permissions
- Approve pending readings
- Reject with notes
- Modify reading values

## Customization

See [Implementation Documentation](../../../docs/ReadingEdit_Implementation.md) for detailed customization guide.

## Troubleshooting

### Pipelines not loading?
1. Check user is authenticated
2. Verify user has structure assigned
3. Check browser console for errors

### Threshold not showing?
1. Verify pipeline has active threshold
2. Check backend threshold service

### Cannot submit?
1. Ensure at least one measurement is entered
2. Check all validation errors are resolved
3. Verify user permissions

## Support

For issues or questions, contact:
- **Frontend**: CHOUABBIA Amine
- **Backend**: MEDJERAB Abir

---

✅ **Status**: Production Ready
📅 **Last Updated**: January 25, 2026
