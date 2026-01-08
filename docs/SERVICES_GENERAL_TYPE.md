# General Type Services & Utils Documentation
## January 7, 2026 - Complete Service Layer

## Overview

This document covers the **General Type Services and Utilities** - the service layer for type/classification entities. These services manage lookup types used throughout the application for organizational structure classifications.

---

## Backend Source

**Repository:** [HyFloAPI](https://github.com/CHOUABBIA-AMINE/HyFloAPI)  
**Package:** `dz.sh.trc.hyflo.general.type.service`  
**Author:** MEDJERAB Abir  
**Created:** 06-26-2025  
**Updated:** 01-02-2026

---

## Services Summary (1 Total)

All General Type Services have been created from backend:

| # | Service | DTO | Purpose | Status |
|---|---------|-----|---------|--------|
| 1 | **[StructureTypeService](#structuretypeservice)** | StructureTypeDTO | Organizational structure classifications | ✅ Created |

---

## Utils Summary (4 Categories)

Utility functions created for the General Type module:

| # | Util | Purpose | Functions | Status |
|---|------|---------|-----------|--------|
| 1 | **[validation.ts](#validationts)** | Type validations | 4 functions | ✅ Created |
| 2 | **[formatters.ts](#formattersts)** | Type formatting | 4 functions | ✅ Created |
| 3 | **[helpers.ts](#helpersts)** | Type helpers | 8 functions | ✅ Created |
| 4 | **[constants.ts](#constantsts)** | Type constants | 6 constant groups | ✅ Created |

---

## Service Architecture

### **Standard Service Pattern:**

The StructureTypeService follows the standard GenericService pattern:

1. **CRUD Operations:**
   - `getAll(pageable)` - Get all with pagination
   - `getAllNoPagination()` - Get all without pagination
   - `getById(id)` - Get single entity
   - `create(dto)` - Create new entity
   - `update(id, dto)` - Update existing entity
   - `delete(id)` - Delete entity

2. **Search Operations:**
   - `globalSearch(searchTerm, pageable)` - Search across all fields

---

## Detailed Service Documentation

---

## StructureTypeService

### **Purpose:**
Manages structure types - organizational structure classifications used to categorize different types of organizational entities.

### **Base URL:**
```typescript
/api/general/type/structure-types
```

### **Entity Fields:**
- `id` - Unique identifier
- `code` - Type code (uppercase)
- `designationFr` - French designation
- `designationEn` - English designation
- `description` - Optional description
- `isActive` - Active status

### **Methods:**

#### **1. getAll(pageable)**
Get all structure types with pagination.

```typescript
const page = await StructureTypeService.getAll({
  page: 0,
  size: 20,
  sort: 'designationFr,asc'
});
```

#### **2. getAllNoPagination()**
Get all structure types without pagination (for dropdowns/selects).

```typescript
const types = await StructureTypeService.getAllNoPagination();
```

#### **3. getById(id)**
Get a specific structure type by ID.

```typescript
const type = await StructureTypeService.getById(1);
```

#### **4. create(dto)**
Create a new structure type.

```typescript
const newType = await StructureTypeService.create({
  code: 'DEPT',
  designationFr: 'Département',
  designationEn: 'Department',
  description: 'Organizational department',
  isActive: true
});
```

**Backend Logging:**
- Logs: "Creating structure type: designationFr={designationFr}"

#### **5. update(id, dto)**
Update an existing structure type.

```typescript
const updated = await StructureTypeService.update(1, {
  code: 'DEPT',
  designationFr: 'Département',
  designationEn: 'Department',
  description: 'Updated description',
  isActive: true
});
```

**Backend Logging:**
- Logs: "Updating structure type with ID: {id}"

#### **6. delete(id)**
Delete a structure type by ID.

```typescript
await StructureTypeService.delete(1);
```

#### **7. globalSearch(searchTerm, pageable)**
Search structure types across all fields.

```typescript
const results = await StructureTypeService.globalSearch('department', {
  page: 0,
  size: 20,
  sort: 'designationFr,asc'
});
```

### **Usage Example:**

```typescript
import { StructureTypeService } from '@/modules/general/type/services';
import { useState, useEffect } from 'react';

function StructureTypeManagement() {
  const [types, setTypes] = useState<StructureTypeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadTypes();
  }, []);
  
  const loadTypes = async () => {
    try {
      setLoading(true);
      const data = await StructureTypeService.getAllNoPagination();
      setTypes(data);
    } catch (error) {
      console.error('Failed to load structure types:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreate = async (type: StructureTypeDTO) => {
    try {
      await StructureTypeService.create(type);
      loadTypes(); // Reload list
    } catch (error) {
      console.error('Failed to create structure type:', error);
    }
  };
  
  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {types.map(type => (
            <li key={type.id}>
              {type.code} - {type.designationFr}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Utility Functions

---

## validation.ts

### **Purpose:**
Validation functions for structure type entities.

### **Functions:**

1. **isValidDesignationFr(designation)** - Validate French designation (required)
2. **isValidDesignationEn(designation)** - Validate English designation (required)
3. **isValidTypeCode(code)** - Validate type code (uppercase letters/numbers)
4. **isValidDescription(description, maxLength)** - Validate description length

### **Usage Example:**

```typescript
import {
  isValidDesignationFr,
  isValidDesignationEn,
  isValidTypeCode,
  isValidDescription
} from '@/modules/general/type/utils';

const validateStructureType = (dto: StructureTypeDTO): string[] => {
  const errors: string[] = [];
  
  if (!isValidTypeCode(dto.code)) {
    errors.push('Code must be uppercase letters and numbers');
  }
  
  if (!isValidDesignationFr(dto.designationFr)) {
    errors.push('French designation is required');
  }
  
  if (!isValidDesignationEn(dto.designationEn)) {
    errors.push('English designation is required');
  }
  
  if (!isValidDescription(dto.description, 500)) {
    errors.push('Description is too long (max 500 characters)');
  }
  
  return errors;
};
```

---

## formatters.ts

### **Purpose:**
Formatting functions for structure type entities.

### **Functions:**

1. **formatDesignation(designationFr, designationEn, locale)** - Format designation by locale
2. **formatTypeCode(code)** - Format code (uppercase)
3. **formatDescription(description, maxLength)** - Format description with truncation
4. **formatStructureTypeLabel(code, designation)** - Format label (code + designation)

### **Usage Example:**

```typescript
import {
  formatDesignation,
  formatTypeCode,
  formatDescription,
  formatStructureTypeLabel
} from '@/modules/general/type/utils';

// Display structure type
const StructureTypeCard = ({ type, locale }) => (
  <div>
    <h3>{formatStructureTypeLabel(type.code, type.designationFr)}</h3>
    <p>Code: {formatTypeCode(type.code)}</p>
    <p>Designation: {formatDesignation(type.designationFr, type.designationEn, locale)}</p>
    <p>Description: {formatDescription(type.description, 100)}</p>
  </div>
);
```

---

## helpers.ts

### **Purpose:**
Helper functions for structure type data manipulation.

### **Functions:**

1. **sortByDesignation(types, locale, order)** - Sort by designation
2. **sortByCode(types, order)** - Sort by code
3. **getActiveTypes(types)** - Filter active types only
4. **findByCode(types, code)** - Find type by code
5. **findByDesignation(types, designation, locale)** - Find type by designation
6. **groupByCategory(types)** - Group types by category
7. **createTypeOptions(types, locale)** - Create dropdown options
8. **filterBySearchTerm(types, searchTerm, locale)** - Filter by search

### **Usage Example:**

```typescript
import {
  sortByDesignation,
  getActiveTypes,
  findByCode,
  createTypeOptions,
  filterBySearchTerm
} from '@/modules/general/type/utils';

// Get all types
const allTypes = await StructureTypeService.getAllNoPagination();

// Filter active only
const activeTypes = getActiveTypes(allTypes);

// Sort by French designation
const sortedTypes = sortByDesignation(activeTypes, 'fr', 'asc');

// Find specific type
const deptType = findByCode(allTypes, 'DEPT');

// Create dropdown options
const options = createTypeOptions(activeTypes, 'fr');

// Filter by search
const filtered = filterBySearchTerm(allTypes, 'department', 'en');
```

---

## constants.ts

### **Purpose:**
Constants for the General Type module.

### **Constant Groups:**

1. **API_ENDPOINTS** - API URLs
2. **VALIDATION_CONSTRAINTS** - Field length limits
3. **DEFAULTS** - Default values
4. **LOCALES** - Locale codes
5. **SORT_OPTIONS** - Sorting options for UI
6. **ERROR_MESSAGES** - Standard error messages
7. **SUCCESS_MESSAGES** - Standard success messages

### **Usage Example:**

```typescript
import {
  API_ENDPOINTS,
  VALIDATION_CONSTRAINTS,
  DEFAULTS,
  LOCALES,
  SORT_OPTIONS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from '@/modules/general/type/utils';

// Use API endpoints
const url = API_ENDPOINTS.STRUCTURE_TYPES;

// Use validation constraints
if (code.length > VALIDATION_CONSTRAINTS.CODE_MAX_LENGTH) {
  alert(ERROR_MESSAGES.CODE_INVALID);
}

// Use defaults
const locale = DEFAULTS.LOCALE;  // 'fr'

// Use sort options in dropdown
<select>
  {SORT_OPTIONS.map(opt => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ))}
</select>

// Show success message
alert(SUCCESS_MESSAGES.CREATED);
```

---

## Complete Usage Example

### **Full Structure Type Management Implementation:**

```typescript
import { useState, useEffect } from 'react';
import { StructureTypeService } from '@/modules/general/type/services';
import {
  formatStructureTypeLabel,
  formatDesignation,
  sortByDesignation,
  getActiveTypes,
  createTypeOptions,
  filterBySearchTerm,
  isValidTypeCode,
  isValidDesignationFr,
  VALIDATION_CONSTRAINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from '@/modules/general/type/utils';
import type { StructureTypeDTO } from '@/modules/general/type/dto';

function StructureTypeManagement() {
  const [types, setTypes] = useState<StructureTypeDTO[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<StructureTypeDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locale, setLocale] = useState<'fr' | 'en'>('fr');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  
  // Load all types
  const loadTypes = async () => {
    setLoading(true);
    try {
      const data = await StructureTypeService.getAllNoPagination();
      setTypes(data);
      applyFilters(data);
    } catch (error) {
      console.error('Failed to load structure types:', error);
      alert('Failed to load structure types');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters
  const applyFilters = (data: StructureTypeDTO[] = types) => {
    let filtered = data;
    
    // Filter active only
    if (showActiveOnly) {
      filtered = getActiveTypes(filtered);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filterBySearchTerm(filtered, searchTerm, locale);
    }
    
    // Sort by designation
    filtered = sortByDesignation(filtered, locale, 'asc');
    
    setFilteredTypes(filtered);
  };
  
  // Validate structure type
  const validate = (dto: StructureTypeDTO): string[] => {
    const errors: string[] = [];
    
    if (!isValidTypeCode(dto.code)) {
      errors.push(ERROR_MESSAGES.CODE_INVALID);
    }
    
    if (!isValidDesignationFr(dto.designationFr)) {
      errors.push(ERROR_MESSAGES.DESIGNATION_FR_REQUIRED);
    }
    
    if (dto.description && dto.description.length > VALIDATION_CONSTRAINTS.DESCRIPTION_MAX_LENGTH) {
      errors.push(ERROR_MESSAGES.DESCRIPTION_TOO_LONG);
    }
    
    return errors;
  };
  
  // Create structure type
  const handleCreate = async (dto: StructureTypeDTO) => {
    const errors = validate(dto);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    try {
      await StructureTypeService.create(dto);
      alert(SUCCESS_MESSAGES.CREATED);
      loadTypes();
    } catch (error) {
      console.error('Failed to create:', error);
      alert('Failed to create structure type');
    }
  };
  
  // Update structure type
  const handleUpdate = async (id: number, dto: StructureTypeDTO) => {
    const errors = validate(dto);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    try {
      await StructureTypeService.update(id, dto);
      alert(SUCCESS_MESSAGES.UPDATED);
      loadTypes();
    } catch (error) {
      console.error('Failed to update:', error);
      alert('Failed to update structure type');
    }
  };
  
  // Delete structure type
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this structure type?')) {
      return;
    }
    
    try {
      await StructureTypeService.delete(id);
      alert(SUCCESS_MESSAGES.DELETED);
      loadTypes();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete structure type');
    }
  };
  
  // Handle search change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    applyFilters();
  };
  
  // Handle active filter change
  const handleActiveFilterChange = (active: boolean) => {
    setShowActiveOnly(active);
    applyFilters();
  };
  
  // Initial load
  useEffect(() => {
    loadTypes();
  }, []);
  
  // Reapply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, showActiveOnly, locale]);
  
  // Create dropdown options
  const typeOptions = createTypeOptions(filteredTypes, locale);
  
  return (
    <div className="structure-type-management">
      <h1>Structure Type Management</h1>
      
      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        
        <label>
          <input
            type="checkbox"
            checked={showActiveOnly}
            onChange={(e) => handleActiveFilterChange(e.target.checked)}
          />
          Show active only
        </label>
        
        <select value={locale} onChange={(e) => setLocale(e.target.value as 'fr' | 'en')}>
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>
      
      {/* List */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Designation</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTypes.map((type) => (
              <tr key={type.id}>
                <td>{type.code}</td>
                <td>{formatDesignation(type.designationFr, type.designationEn, locale)}</td>
                <td>{type.description || '-'}</td>
                <td>{type.isActive ? '✅ Active' : '❌ Inactive'}</td>
                <td>
                  <button onClick={() => handleUpdate(type.id!, type)}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(type.id!)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {/* Summary */}
      <div className="summary">
        <p>Total: {types.length}</p>
        <p>Filtered: {filteredTypes.length}</p>
      </div>
    </div>
  );
}
```

---

## Frontend Files

All services and utils are located in: `src/modules/general/type/`

### **Services (2 files):**

1. **[StructureTypeService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/type/services/StructureTypeService.ts)**
2. **[index.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/type/services/index.ts)** - Barrel export

### **Utils (5 files):**

1. **[validation.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/type/utils/validation.ts)** - Validations (4 functions)
2. **[formatters.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/type/utils/formatters.ts)** - Formatting (4 functions)
3. **[helpers.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/type/utils/helpers.ts)** - Helpers (8 functions)
4. **[constants.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/type/utils/constants.ts)** - Constants (6 groups)
5. **[index.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/general/type/utils/index.ts)** - Barrel export

**Latest Commit:**
- [41c6cf9](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/41c6cf93521b6844c077172771d2357908201c84) - feat: create General Type services and utils

---

## Backend Alignment

### **Alignment Status:** ✅ 100%

Service is fully aligned with backend:
- ✅ All methods present
- ✅ All standard CRUD operations
- ✅ Global search functionality
- ✅ Logging matches backend
- ✅ Complete service layer

---

## Summary

### **General Type Services & Utils: Complete ✅**

**Services: 1/1 Created**
- StructureTypeService (7 methods)

**Utils: 4 categories**
- validation.ts (4 functions)
- formatters.ts (4 functions)
- helpers.ts (8 functions)
- constants.ts (6 groups)

**Features:**
- ✅ **Complete CRUD operations**
- ✅ **Global search functionality**
- ✅ **Pagination support**
- ✅ **Bilingual support** (French/English)
- ✅ **Dropdown/Select helpers**
- ✅ **Filtering and sorting utilities**
- ✅ **Comprehensive validations**
- ✅ **Type-safe TypeScript**
- ✅ **100% backend alignment**

---

**Created:** January 7, 2026, 2:30 PM CET  
**Backend Package:** `dz.sh.trc.hyflo.general.type.service`  
**Frontend Location:** `src/modules/general/type/`  
**Status:** ✅ Service & Utils Created  
**Alignment:** 100% - Complete type classification service layer
