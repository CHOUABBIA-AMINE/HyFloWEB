# Flow Type Services - Implementation Summary

**Date**: 2026-01-25  
**Template**: PipelineSystemService pattern from network/core/services  
**Status**: ✅ All 2 Type Services Complete

---

## ✅ Services Implemented: 2/2

### **1. OperationTypeService** ✅

**Path**: `src/modules/flow/type/services/OperationTypeService.ts`  
**Backend Endpoint**: `/flow/type/operationType`  
**DTO**: [OperationTypeDTO](./dto/OperationTypeDTO.ts)

#### Methods

| Method | Endpoint | Description | Returns |
|--------|----------|-------------|----------|
| `getAll(pageable)` | `GET /flow/type/operationType` | Get paginated list | `Page<OperationTypeDTO>` |
| `getAllNoPagination()` | `GET /flow/type/operationType/all` | Get all without pagination | `OperationTypeDTO[]` |
| `getById(id)` | `GET /flow/type/operationType/{id}` | Get by ID | `OperationTypeDTO` |
| `getByCode(code)` | `GET /flow/type/operationType/code/{code}` | Get by code | `OperationTypeDTO` |
| `create(dto)` | `POST /flow/type/operationType` | Create new | `OperationTypeDTO` |
| `update(id, dto)` | `PUT /flow/type/operationType/{id}` | Update existing | `OperationTypeDTO` |
| `delete(id)` | `DELETE /flow/type/operationType/{id}` | Delete | `void` |
| `globalSearch(term, pageable)` | `GET /flow/type/operationType/search` | Search all fields | `Page<OperationTypeDTO>` |
| `codeExists(code, excludeId?)` | `GET /flow/type/operationType/exists` | Check code uniqueness | `boolean` |

#### Valid Codes
- `PRODUCED` - Production operations
- `TRANSPORTED` - Transportation operations  
- `CONSUMED` - Consumption operations

#### Usage Example
```typescript
import { OperationTypeService } from '@/modules/flow/type';

// Get all operation types for dropdown
const types = await OperationTypeService.getAllNoPagination();

// Get specific type by code
const producedType = await OperationTypeService.getByCode('PRODUCED');

// Create new operation type
const newType: OperationTypeDTO = {
  code: 'PRODUCED',
  nameFr: 'Produit',
  nameEn: 'Produced',
  nameAr: 'منتج',
};
const created = await OperationTypeService.create(newType);

// Search operation types
const results = await OperationTypeService.globalSearch('prod', {
  page: 0,
  size: 10,
  sort: 'code,asc',
});

// Check if code exists before creating
const exists = await OperationTypeService.codeExists('PRODUCED');
```

---

### **2. EventTypeService** ✅

**Path**: `src/modules/flow/type/services/EventTypeService.ts`  
**Backend Endpoint**: `/flow/type/eventType`  
**DTO**: [EventTypeDTO](./dto/EventTypeDTO.ts)

#### Methods

| Method | Endpoint | Description | Returns |
|--------|----------|-------------|----------|
| `getAll(pageable)` | `GET /flow/type/eventType` | Get paginated list | `Page<EventTypeDTO>` |
| `getAllNoPagination()` | `GET /flow/type/eventType/all` | Get all without pagination | `EventTypeDTO[]` |
| `getById(id)` | `GET /flow/type/eventType/{id}` | Get by ID | `EventTypeDTO` |
| `getByCode(code)` | `GET /flow/type/eventType/code/{code}` | Get by code | `EventTypeDTO` |
| `create(dto)` | `POST /flow/type/eventType` | Create new | `EventTypeDTO` |
| `update(id, dto)` | `PUT /flow/type/eventType/{id}` | Update existing | `EventTypeDTO` |
| `delete(id)` | `DELETE /flow/type/eventType/{id}` | Delete | `void` |
| `globalSearch(term, pageable)` | `GET /flow/type/eventType/search` | Search all fields | `Page<EventTypeDTO>` |
| `codeExists(code, excludeId?)` | `GET /flow/type/eventType/exists` | Check code uniqueness | `boolean` |
| `getBySeverity(severityId)` | `GET /flow/type/eventType/severity/{severityId}` | Get types by severity | `EventTypeDTO[]` |

#### Common Event Type Codes
- `EMERGENCY_SHUTDOWN` - Emergency shutdown events
- `MAINTENANCE` - Planned maintenance activities
- `SHUTDOWN` - Regular shutdown operations
- `LEAK` - Leak detection events
- `PRESSURE_DROP` - Pressure anomaly events
- `EQUIPMENT_FAILURE` - Equipment malfunction
- `INSPECTION` - Inspection activities

#### Usage Example
```typescript
import { EventTypeService } from '@/modules/flow/type';

// Get all event types for dropdown
const types = await EventTypeService.getAllNoPagination();

// Get specific type by code
const leakType = await EventTypeService.getByCode('LEAK');

// Create new event type
const newType: EventTypeDTO = {
  code: 'EMERGENCY_SHUTDOWN',
  designationFr: "Arrêt d'Urgence",
  designationEn: 'Emergency Shutdown',
  designationAr: 'إيقاف طارئ',
};
const created = await EventTypeService.create(newType);

// Get event types by severity
const criticalEvents = await EventTypeService.getBySeverity(4); // Critical severity ID

// Search event types
const results = await EventTypeService.globalSearch('leak', {
  page: 0,
  size: 10,
  sort: 'code,asc',
});

// Validate code before update
const exists = await EventTypeService.codeExists('LEAK', 5); // Exclude ID 5
```

---

## 📋 Service Pattern Template

All services follow the **PipelineSystemService template pattern**:

### 1. **Class Structure**
```typescript
export class <EntityName>Service {
  // Static methods only (no instance required)
}
```

### 2. **Base URL Configuration**
```typescript
const BASE_URL = '/flow/type/<entityName>';
```

### 3. **Standard CRUD Methods**
- `getAll(pageable)` - Paginated list
- `getAllNoPagination()` - Complete list
- `getById(id)` - Single entity
- `create(dto)` - Create new
- `update(id, dto)` - Update existing
- `delete(id)` - Delete entity

### 4. **Search Methods**
- `globalSearch(term, pageable)` - Full-text search
- `codeExists(code, excludeId?)` - Code uniqueness check

### 5. **Entity-Specific Methods**
- `getByCode(code)` - Retrieve by unique code
- Additional domain-specific queries

---

## 🔧 Technical Details

### Axios Instance
All services use the centralized `axiosInstance` from `@/shared/config/axios`:
- Pre-configured base URL
- Request/response interceptors
- Authentication token handling
- Error handling middleware

### TypeScript Types
```typescript
import type { Page, Pageable } from '@/types/pagination';

// Pageable input
interface Pageable {
  page: number;    // 0-indexed
  size: number;    // Items per page
  sort?: string;   // Format: 'field,direction' e.g., 'code,asc'
}

// Page output
interface Page<T> {
  content: T[];           // Items for current page
  totalElements: number;  // Total items across all pages
  totalPages: number;     // Total number of pages
  size: number;           // Items per page
  number: number;         // Current page (0-indexed)
  first: boolean;         // Is first page
  last: boolean;          // Is last page
  empty: boolean;         // Is content empty
}
```

### Error Handling
Services throw errors that should be caught by the calling component:
```typescript
try {
  const result = await OperationTypeService.getById(id);
} catch (error) {
  // Handle 404, 400, 500 errors
  console.error('Failed to fetch operation type:', error);
}
```

---

## 📦 Module Structure

```
src/modules/flow/type/
├── dto/
│   ├── OperationTypeDTO.ts    ✅ Complete
│   ├── EventTypeDTO.ts        ✅ Complete
│   └── index.ts               ✅ Complete
├── services/
│   ├── OperationTypeService.ts ✅ Complete
│   ├── EventTypeService.ts     ✅ Complete
│   └── index.ts                ✅ Complete
└── index.ts                     ✅ Complete (centralized export)
```

---

## 🚀 Import Patterns

### Direct Import
```typescript
import { OperationTypeService } from '@/modules/flow/type/services';
import { EventTypeService } from '@/modules/flow/type/services';
```

### Module-Level Import
```typescript
import { 
  OperationTypeService, 
  EventTypeService,
  OperationTypeDTO,
  EventTypeDTO 
} from '@/modules/flow/type';
```

---

## ✅ Quality Checklist

- [x] PipelineSystemService template pattern applied
- [x] All standard CRUD methods implemented
- [x] Search functionality included
- [x] Code uniqueness validation method
- [x] Entity-specific methods (getByCode, getBySeverity)
- [x] Proper TypeScript typing with generics
- [x] JSDoc comments for all methods
- [x] Backend endpoint alignment verified
- [x] Centralized exports (index.ts)
- [x] Consistent naming conventions

---

**✅ Flow Type Services are production-ready and 100% aligned with backend!**
