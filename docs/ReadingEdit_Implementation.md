# ReadingEdit Page - Implementation Documentation

## Overview

The ReadingEdit page is a comprehensive, multi-step form for creating, editing, and validating manual hydrocarbon flow readings. It implements real-time threshold validation, structure-based authorization, and a complete validation workflow.

## 📁 File Structure

```
src/
├── pages/
│   └── flow/
│       └── readings/
│           ├── ReadingEdit.tsx           # Main page component
│           └── components/
│               ├── PipelineSelection.tsx   # Step 1: Pipeline selector
│               ├── MeasurementForm.tsx     # Step 2: Measurement inputs
│               ├── ThresholdIndicator.tsx  # Real-time validation indicator
│               └── ValidationReview.tsx    # Step 3: Review & validate
├── modules/
│   └── flow/
│       ├── core/
│       │   ├── dto/
│       │   │   ├── FlowReadingDTO.ts
│       │   │   └── FlowThresholdDTO.ts
│       │   ├── services/
│       │   │   ├── FlowReadingService.ts
│       │   │   └── FlowThresholdService.ts
│       │   └── utils/
│       │       ├── formattingUtils.ts
│       │       ├── validationUtils.ts
│       │       └── index.ts
│       └── common/
│           ├── dto/
│           │   └── ValidationStatusDTO.ts
│           └── services/
│               └── ValidationStatusService.ts
└── services/
    └── AuthService.ts
```

## ⚙️ Component Architecture

### 1. ReadingEdit (Main Component)

**Purpose**: Orchestrates the multi-step form flow and manages overall state.

**Props**:
```typescript
interface ReadingEditProps {
  mode: 'create' | 'edit' | 'validate';
}
```

**Key Features**:
- Multi-step wizard navigation
- React Hook Form integration
- Unsaved changes warning
- Loading states and error handling
- Role-based rendering

**State Management**:
```typescript
const { control, handleSubmit, watch, setValue, formState } = useForm<ReadingFormData>();
```

### 2. PipelineSelection Component

**Purpose**: Allows users to select a pipeline from their authorized structure.

**Features**:
- Structure-based filtering
- Latest reading reference display
- Active threshold loading
- Real-time feedback

**Data Flow**:
```
User Structure ID → Load Pipelines → Pipeline Selected → Load Latest Reading + Threshold
```

### 3. MeasurementForm Component

**Purpose**: Collects measurement values with real-time validation.

**Measurements**:
- 📉 Pressure (0-500 bar)
- 🔥 Temperature (-50 to 200°C)
- ⚡ Flow Rate (≥0 m³/h)
- 📦 Contained Volume (≥0 m³)

**Validation Layers**:
1. **Frontend Range Validation**: Immediate feedback on min/max
2. **Threshold Comparison**: Visual indicators (green/yellow/red)
3. **Form-level Validation**: At least one measurement required

### 4. ThresholdIndicator Component

**Purpose**: Provides visual feedback on threshold status.

**Status Types**:
- ✅ **OK** (Green): Within normal range
- ⚠️ **WARNING** (Yellow): Near threshold limit (tolerance zone)
- ❌ **BREACH** (Red): Outside threshold range

**Visual Elements**:
- Color-coded badge
- Progress bar
- Range slider
- Threshold values display

### 5. ValidationReview Component

**Purpose**: Displays comprehensive reading summary for review and validation.

**Modes**:
- **User Review**: Before submission
- **Validator Mode**: Approve/reject/modify actions

**Validator Actions**:
- ✅ Approve reading
- ❌ Reject with notes (required)
- ✏️ Modify values (logged in audit trail)

## 🔄 Data Flow

### Create New Reading Flow

```
1. User Access Page
   ↓
2. Load Current User (AuthService.getCurrentUser())
   ↓
3. Load User's Pipelines (PipelineService.getByStructure())
   ↓
4. User Selects Pipeline
   ↓
5. Load Latest Reading (reference) + Active Threshold
   ↓
6. User Enters Measurements
   ↓
7. Real-time Threshold Validation (ThresholdIndicator)
   ↓
8. User Reviews Summary
   ↓
9. Submit (Draft or Pending)
   ↓
10. Backend Validation + Alert Generation
    ↓
11. Success: Navigate to detail page
```

### Validation Flow

```
1. Validator Opens Pending Reading
   ↓
2. Load Reading with All Relationships
   ↓
3. Display in ValidationReview Component
   ↓
4. Validator Reviews Measurements
   ↓
5. Decision:
   ├─ Approve → FlowReadingService.validate()
   ├─ Reject → Update with REJECTED status + notes
   └─ Modify → Update values + re-validate
   ↓
6. Success: Navigate to list
```

## ⚙️ Configuration

### Required Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "react-hook-form": "^7.48.0",
    "antd": "^5.12.0",
    "@ant-design/pro-components": "^2.6.0",
    "@ant-design/icons": "^5.2.0",
    "axios": "^1.6.0",
    "dayjs": "^1.11.0"
  }
}
```

### Route Configuration

Add to your route configuration:

```tsx
import { ReadingEdit } from '@/pages/flow/readings/ReadingEdit';

// Routes
<Route path="/flow/readings">
  <Route path="new" element={<ReadingEdit mode="create" />} />
  <Route path=":id/edit" element={<ReadingEdit mode="edit" />} />
  <Route path=":id/validate" element={<ReadingEdit mode="validate" />} />
</Route>
```

### Protected Routes (Optional)

```tsx
<Route 
  path="new" 
  element={
    <ProtectedRoute requiredPermission="READING_CREATE">
      <ReadingEdit mode="create" />
    </ProtectedRoute>
  } 
/>
```

## 🛡️ Security Implementation

### Frontend Security

1. **Authentication Check**: User must be logged in
2. **Structure Authorization**: Pipeline filtering by user's structure
3. **Role-based Actions**: Validator-only actions hidden from regular users
4. **Input Sanitization**: All text inputs sanitized before submission
5. **CSRF Protection**: Automatic token handling via axios

### Backend Security (Expected)

```java
@PreAuthorize("hasAuthority('READING_CREATE')")
public FlowReadingDTO create(@Valid FlowReadingDTO dto) {
    // Validate user can access pipeline's structure
    validateStructureAuthorization(dto.getPipelineId());
    // Implementation
}

@PreAuthorize("hasAuthority('ROLE_VALIDATOR')")
public FlowReadingDTO validate(Long readingId, Long validatorId) {
    // Cannot validate own reading
    // Must be authorized for pipeline's structure
    // Implementation
}
```

## ✅ Validation Rules

### Field Validation

| Field | Required | Min | Max | Format |
|-------|----------|-----|-----|--------|
| Pipeline | Yes | - | - | Must belong to user's structure |
| Recorded At | Yes | Past only | Now | ISO DateTime |
| Pressure | No | 0 | 500 | Decimal (bar) |
| Temperature | No | -50 | 200 | Decimal (°C) |
| Flow Rate | No | 0 | - | Decimal (m³/h) |
| Volume | No | 0 | - | Decimal (m³) |
| Notes | No | - | 500 chars | Text |

### Business Rules

1. **At least one measurement** must be provided
2. **Recording time** cannot be in the future
3. **No duplicate readings** for same pipeline at same timestamp
4. **Structure authorization** enforced on both frontend and backend
5. **Validator cannot approve own readings**
6. **Threshold breaches** automatically generate alerts

## 🚨 Error Handling

### Frontend Error Types

```typescript
// Validation errors (400)
if (error.response?.status === 400) {
  notification.error({
    message: 'Validation Error',
    description: error.response.data.message
  });
}

// Authorization errors (403)
if (error.response?.status === 403) {
  notification.error({
    message: 'Authorization Error',
    description: 'You are not authorized for this action'
  });
}

// Duplicate reading (409)
if (error.response?.status === 409) {
  notification.error({
    message: 'Duplicate Reading',
    description: 'A reading already exists at this time'
  });
}
```

### User Feedback

- **Success notifications**: Green checkmark with message
- **Warning notifications**: Yellow icon for near-threshold values
- **Error notifications**: Red icon with detailed message
- **Loading states**: Spinners during async operations
- **Unsaved changes**: Browser confirmation before leaving

## 📊 Usage Examples

### Creating a New Reading

```tsx
// Navigate to create page
navigate('/flow/readings/new');

// Or with link
<Link to="/flow/readings/new">
  <Button type="primary" icon={<PlusOutlined />}>
    New Reading
  </Button>
</Link>
```

### Editing an Existing Reading

```tsx
// Navigate to edit page
navigate(`/flow/readings/${readingId}/edit`);

// Or with link
<Link to={`/flow/readings/${reading.id}/edit`}>
  <Button icon={<EditOutlined />}>Edit</Button>
</Link>
```

### Validating a Reading (Validators Only)

```tsx
// Navigate to validate page
navigate(`/flow/readings/${readingId}/validate`);

// Or with link (show only to validators)
{hasRole('ROLE_VALIDATOR') && (
  <Link to={`/flow/readings/${reading.id}/validate`}>
    <Button type="primary" icon={<CheckOutlined />}>
      Validate
    </Button>
  </Link>
)}
```

## 🔧 Customization

### Adding Custom Validation

```tsx
// In MeasurementForm.tsx
<Controller
  name="pressure"
  control={control}
  rules={{
    validate: (value) => {
      // Custom validation logic
      if (value && value > 400) {
        return 'Unusually high pressure detected';
      }
      return true;
    }
  }}
  render={({ field }) => <InputNumber {...field} />}
/>
```

### Customizing Threshold Colors

```tsx
// In ThresholdIndicator.tsx
const getStatus = (): StatusInfo => {
  if (value < min || value > max) {
    return {
      status: 'breach',
      color: '#ff4d4f', // Customize color
      // ...
    };
  }
  // ...
};
```

### Adding Custom Fields

1. Update `ReadingFormData` interface
2. Add form field in `MeasurementForm`
3. Update `ValidationReview` display
4. Update backend DTO and validation

## 🐞 Troubleshooting

### Common Issues

**Issue**: Pipelines not loading
- **Check**: User authentication status
- **Check**: User has assigned structure
- **Check**: Backend endpoint `/network/core/pipeline/structure/{id}`

**Issue**: Threshold not displaying
- **Check**: Pipeline has active threshold configured
- **Check**: Backend endpoint `/flow/core/flowThreshold/pipeline/{id}/active`

**Issue**: Cannot submit reading
- **Check**: At least one measurement is entered
- **Check**: All validation errors are resolved
- **Check**: User has `READING_CREATE` permission

**Issue**: Validator actions not showing
- **Check**: Reading status is `PENDING`
- **Check**: User has `ROLE_VALIDATOR` role
- **Check**: Validator is not the reading recorder

### Debug Mode

Enable console logging:

```tsx
// In ReadingEdit.tsx
useEffect(() => {
  console.log('Form state:', watch());
  console.log('Errors:', errors);
  console.log('Current user:', currentUser);
}, [watch(), errors, currentUser]);
```

## 📝 Testing Checklist

### Unit Tests
- [ ] ThresholdIndicator status calculations
- [ ] Validation utility functions
- [ ] Formatting utility functions
- [ ] Form validation rules

### Integration Tests
- [ ] Pipeline selection loads correctly
- [ ] Threshold comparison works
- [ ] Form submission creates reading
- [ ] Validation workflow completes

### E2E Tests
- [ ] Complete reading creation flow
- [ ] Edit existing reading
- [ ] Validator approval flow
- [ ] Validator rejection flow
- [ ] Unsaved changes warning

## 🚀 Performance Optimization

### Implemented Optimizations

1. **Debounced threshold checks**: Prevents excessive calculations
2. **Cached user data**: Reduces API calls
3. **Conditional rendering**: Components load only when needed
4. **Memoized calculations**: Threshold status cached
5. **Lazy loading**: Components split by route

### Future Improvements

- [ ] Add virtual scrolling for large pipeline lists
- [ ] Implement reading caching with React Query
- [ ] Add optimistic UI updates
- [ ] Compress API payloads

## 📚 Additional Resources

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Ant Design Components](https://ant.design/components/overview/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Form Validation Patterns](https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux/)

## 👥 Contributors

- **CHOUABBIA Amine** - Frontend Implementation
- **MEDJERAB Abir** - Backend Implementation

## 📝 License

This documentation is part of the HyFloWEB project.

---

**Last Updated**: January 25, 2026
**Version**: 1.0.0
