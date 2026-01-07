# Network Common Services & Utils Documentation
## January 7, 2026 - Complete Service Layer

## Overview

This document covers the **Network Common Services and Utilities** - service layer for API communication and utility functions for the Network Common module. These services provide CRUD operations and data management for lookup/reference entities.

---

## Backend Source

**Repository:** [HyFloAPI](https://github.com/CHOUABBIA-AMINE/HyFloAPI)  
**Package:** `dz.sh.trc.hyflo.network.common.service`  
**Author:** MEDJERAB Abir  
**Created:** 06-26-2025  
**Updated:** 01-02-2026

---

## Services Summary (5 Total)

All Network Common Services have been created from backend:

| # | Service | DTO | Purpose | Status |
|---|---------|-----|---------|--------|
| 1 | **[AlloyService](#alloyservice)** | AlloyDTO | Manage alloy materials | ✅ Created |
| 2 | **[OperationalStatusService](#operationalstatusservice)** | OperationalStatusDTO | Manage operational statuses | ✅ Created |
| 3 | **[PartnerService](#partnerservice)** | PartnerDTO | Manage partners | ✅ Created |
| 4 | **[ProductService](#productservice)** | ProductDTO | Manage products | ✅ Created |
| 5 | **[VendorService](#vendorservice)** | VendorDTO | Manage vendors | ✅ Created |

---

## Utils Summary (4 Categories)

Utility functions created for the Network Common module:

| # | Util | Purpose | Functions | Status |
|---|------|---------|-----------|--------|
| 1 | **[validation.ts](#validationts)** | Validation utilities | 10 functions | ✅ Created |
| 2 | **[formatters.ts](#formattersts)** | Data formatting | 13 functions | ✅ Created |
| 3 | **[helpers.ts](#helpersts)** | Helper utilities | 14 functions | ✅ Created |
| 4 | **[constants.ts](#constantsts)** | Constants | 9 constant groups | ✅ Created |

---

## Service Architecture

### **Common Service Pattern:**

All services extend from a base GenericService pattern and provide:

1. **CRUD Operations:**
   - `getAll(pageable)` - Get all with pagination
   - `getById(id)` - Get single entity
   - `create(dto)` - Create new entity
   - `update(id, dto)` - Update existing entity
   - `delete(id)` - Delete entity

2. **Search Operations:**
   - `globalSearch(searchTerm, pageable)` - Search across all fields

3. **Special Operations:**
   - `getAllNoPagination()` - Get all without pagination (for some services)

---

## Detailed Service Documentation

---

## AlloyService

### **Purpose:**
Manages alloy materials used in pipelines and infrastructure. Provides CRUD operations and search functionality.

### **Base URL:**
```typescript
/api/network/common/alloys
```

### **Methods:**

#### **1. getAll(pageable)**
Get all alloys with pagination.

```typescript
const page = await AlloyService.getAll({
  page: 0,
  size: 20,
  sort: 'code,asc'
});
```

#### **2. getAllNoPagination()**
Get all alloys without pagination (for dropdowns/selects).

```typescript
const alloys = await AlloyService.getAllNoPagination();
```

#### **3. getById(id)**
Get a specific alloy by ID.

```typescript
const alloy = await AlloyService.getById(1);
```

#### **4. create(dto)**
Create a new alloy. Validates that code doesn't already exist.

```typescript
const newAlloy = await AlloyService.create({
  code: 'X52',
  designation: 'API 5L X52 Pipeline Steel',
  description: 'Medium strength pipeline steel'
});
```

**Backend Validation:**
- Code uniqueness check
- Throws `BusinessValidationException` if code exists

#### **5. update(id, dto)**
Update an existing alloy. Validates that code doesn't exist for other records.

```typescript
const updated = await AlloyService.update(1, {
  code: 'X52',
  designation: 'API 5L X52 Pipeline Steel - Updated',
  description: 'Updated description'
});
```

#### **6. delete(id)**
Delete an alloy by ID.

```typescript
await AlloyService.delete(1);
```

#### **7. globalSearch(searchTerm, pageable)**
Search alloys across all fields.

```typescript
const results = await AlloyService.globalSearch('X52', {
  page: 0,
  size: 20,
  sort: 'code,asc'
});
```

### **Usage Example:**

```typescript
import { AlloyService } from '@/modules/network/common/services';
import { useState, useEffect } from 'react';

function AlloyManagement() {
  const [alloys, setAlloys] = useState<AlloyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadAlloys();
  }, []);
  
  const loadAlloys = async () => {
    try {
      setLoading(true);
      const data = await AlloyService.getAllNoPagination();
      setAlloys(data);
    } catch (error) {
      console.error('Failed to load alloys:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreate = async (alloy: AlloyDTO) => {
    try {
      await AlloyService.create(alloy);
      loadAlloys(); // Reload list
    } catch (error) {
      console.error('Failed to create alloy:', error);
    }
  };
  
  return (
    <div>
      {/* UI implementation */}
    </div>
  );
}
```

---

## OperationalStatusService

### **Purpose:**
Manages operational statuses for network infrastructure (Active, Inactive, Under Maintenance, etc.).

### **Base URL:**
```typescript
/api/network/common/operational-statuses
```

### **Special Features:**
- Validates both `code` and `designationFr` for uniqueness
- Provides all standard CRUD operations
- Includes global search

### **Methods:**
Same as AlloyService with additional validation for `designationFr`.

### **Create/Update Validation:**

```typescript
// Backend validates both fields
if (existsByCode(code)) {
  throw new BusinessValidationException("Code already exists");
}
if (existsByDesignationFr(designationFr)) {
  throw new BusinessValidationException("DesignationFr already exists");
}
```

### **Usage Example:**

```typescript
import { OperationalStatusService } from '@/modules/network/common/services';

// Create new status
const newStatus = await OperationalStatusService.create({
  code: 'ACTIVE',
  designationFr: 'Actif',
  designationEn: 'Active',
  description: 'Facility is operational'
});

// Search statuses
const results = await OperationalStatusService.globalSearch('Active', {
  page: 0,
  size: 20,
  sort: 'code,asc'
});
```

---

## PartnerService

### **Purpose:**
Manages partners (organizations/companies) involved in the hydrocarbon network.

### **Base URL:**
```typescript
/api/network/common/partners
```

### **Unique Field Validation:**
- `shortName` must be unique

### **Methods:**
Standard CRUD + global search (no `getAllNoPagination`).

### **Usage Example:**

```typescript
import { PartnerService } from '@/modules/network/common/services';

// Create new partner
const newPartner = await PartnerService.create({
  shortName: 'SONATRACH',
  fullName: 'Société Nationale pour la Recherche, la Production, le Transport, la Transformation, et la Commercialisation des Hydrocarbures',
  type: 'National Oil Company',
  contactEmail: 'contact@sonatrach.dz',
  contactPhone: '+213 21 12 34 56'
});

// Update partner
const updated = await PartnerService.update(1, {
  ...existingPartner,
  contactEmail: 'newemail@sonatrach.dz'
});
```

---

## ProductService

### **Purpose:**
Manages products (types of hydrocarbons transported: Natural Gas, Oil, Condensate, etc.).

### **Base URL:**
```typescript
/api/network/common/products
```

### **Unique Field Validation:**
- `code` must be unique

### **Special Methods:**
- Includes `getAllNoPagination()` for dropdown lists

### **Usage Example:**

```typescript
import { ProductService } from '@/modules/network/common/services';

// Get all products for dropdown
const products = await ProductService.getAllNoPagination();

// Create new product
const newProduct = await ProductService.create({
  code: 'NG',
  designation: 'Natural Gas',
  description: 'Natural gas transported through pipelines',
  unit: 'm³',
  density: 0.7
});

// Search products
const results = await ProductService.globalSearch('gas', {
  page: 0,
  size: 20,
  sort: 'code,asc'
});
```

---

## VendorService

### **Purpose:**
Manages vendors (suppliers and manufacturers of equipment and materials).

### **Base URL:**
```typescript
/api/network/common/vendors
```

### **Special Features:**
- No unique field validation (simple CRUD)
- Standard CRUD operations
- Global search

### **Usage Example:**

```typescript
import { VendorService } from '@/modules/network/common/services';

// Create new vendor
const newVendor = await VendorService.create({
  name: 'Baker Hughes',
  type: 'Equipment Manufacturer',
  country: 'USA',
  contactEmail: 'sales@bakerhughes.com',
  website: 'https://www.bakerhughes.com'
});

// Get paginated list
const page = await VendorService.getAll({
  page: 0,
  size: 20,
  sort: 'name,asc'
});
```

---

## Service Comparison

| Service | Unique Fields | Has getAllNoPagination | Special Validation |
|---------|---------------|------------------------|--------------------|
| AlloyService | code | ✅ Yes | Code uniqueness |
| OperationalStatusService | code, designationFr | ✅ Yes | Code + DesignationFr |
| PartnerService | shortName | ❌ No | ShortName uniqueness |
| ProductService | code | ✅ Yes | Code uniqueness |
| VendorService | none | ❌ No | None |

---

## Utility Functions

---

## validation.ts

### **Purpose:**
Common validation functions for DTOs and forms.

### **Functions:**

1. **isNotEmpty(value)** - Check if string is not empty
2. **isPositive(value)** - Check if number is positive
3. **isNonNegative(value)** - Check if number is non-negative
4. **matchesPattern(value, pattern)** - Check if string matches regex
5. **isInRange(value, min, max)** - Check if number is in range
6. **isLengthValid(value, min, max)** - Check string length
7. **isValidCode(code)** - Validate code format (alphanumeric + hyphens/underscores)
8. **isValidEmail(email)** - Validate email format
9. **isValidPhone(phone)** - Validate phone format
10. **isValidUrl(url)** - Validate URL format

### **Usage Example:**

```typescript
import { isNotEmpty, isValidCode, isValidEmail } from '@/modules/network/common/utils';

const validateAlloy = (dto: AlloyDTO): string[] => {
  const errors: string[] = [];
  
  if (!isNotEmpty(dto.code)) {
    errors.push('Code is required');
  } else if (!isValidCode(dto.code)) {
    errors.push('Code must be alphanumeric');
  }
  
  if (!isNotEmpty(dto.designation)) {
    errors.push('Designation is required');
  }
  
  return errors;
};
```

---

## formatters.ts

### **Purpose:**
Data formatting functions for consistent display.

### **Functions:**

1. **formatNumber(value, decimals)** - Format with thousand separators
2. **formatCurrency(value, currency)** - Format as currency
3. **formatPercentage(value, decimals)** - Format as percentage
4. **formatDate(date)** - Format to ISO (YYYY-MM-DD)
5. **formatDateLocal(date, locale)** - Format to local date
6. **formatDateTime(date, locale)** - Format to datetime
7. **toTitleCase(str)** - Convert to title case
8. **toUpperCase(str)** - Convert to uppercase
9. **toLowerCase(str)** - Convert to lowercase
10. **truncate(str, maxLength, suffix)** - Truncate string
11. **formatFileSize(bytes)** - Format bytes to human readable
12. **formatPhone(phone)** - Format phone number

### **Usage Example:**

```typescript
import { formatNumber, formatDate, truncate } from '@/modules/network/common/utils';

// Display formatted data
const DisplayProduct = ({ product }: { product: ProductDTO }) => (
  <div>
    <h3>{product.code} - {product.designation}</h3>
    <p>Density: {formatNumber(product.density, 2)} kg/m³</p>
    <p>Created: {formatDate(product.createdAt)}</p>
    <p>{truncate(product.description, 100)}</p>
  </div>
);
```

---

## helpers.ts

### **Purpose:**
Utility functions for data manipulation.

### **Functions:**

1. **isNullOrUndefined(value)** - Check null/undefined
2. **getOrDefault(value, defaultValue)** - Get value or default
3. **deepClone(obj)** - Deep clone object
4. **isEqual(a, b)** - Compare for equality
5. **unique(array)** - Extract unique values
6. **groupBy(array, key)** - Group array by key
7. **sortBy(array, key, order)** - Sort array by key
8. **filterBySearch(array, searchTerm, keys)** - Filter by search
9. **paginate(array, page, size)** - Paginate array
10. **createPage(content, page, size, totalElements)** - Create Page object
11. **debounce(func, wait)** - Debounce function
12. **throttle(func, limit)** - Throttle function
13. **generateId()** - Generate random ID
14. **sleep(ms)** - Sleep/delay
15. **retry(fn, maxRetries, delay)** - Retry with exponential backoff

### **Usage Example:**

```typescript
import { groupBy, sortBy, debounce } from '@/modules/network/common/utils';

// Group alloys by type
const alloysByType = groupBy(alloys, 'type');

// Sort products by code
const sortedProducts = sortBy(products, 'code', 'asc');

// Debounced search
const debouncedSearch = debounce((term: string) => {
  ProductService.globalSearch(term, { page: 0, size: 20 });
}, 300);
```

---

## constants.ts

### **Purpose:**
Centralized constants for the module.

### **Constant Groups:**

1. **API_ENDPOINTS** - API endpoint URLs
2. **PAGINATION_DEFAULTS** - Default pagination settings
3. **VALIDATION_CONSTRAINTS** - Field length constraints
4. **ERROR_MESSAGES** - Standard error messages
5. **SUCCESS_MESSAGES** - Standard success messages
6. **STATUS_CODES** - HTTP status codes
7. **HTTP_METHODS** - HTTP method names
8. **DATE_FORMATS** - Date format strings
9. **DEBOUNCE_DELAYS** - Debounce delay times

### **Usage Example:**

```typescript
import { 
  API_ENDPOINTS, 
  PAGINATION_DEFAULTS, 
  ERROR_MESSAGES 
} from '@/modules/network/common/utils';

// Use API endpoints
const url = API_ENDPOINTS.ALLOYS;

// Use pagination defaults
const pageable = {
  page: PAGINATION_DEFAULTS.PAGE,
  size: PAGINATION_DEFAULTS.SIZE,
  sort: PAGINATION_DEFAULTS.SORT
};

// Use error messages
const showError = (field: string) => {
  alert(`${field}: ${ERROR_MESSAGES.REQUIRED_FIELD}`);
};
```

---

## Frontend Files

All services and utils are located in: `src/modules/network/common/`

### **Services (6 files):**

1. **[AlloyService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/common/services/AlloyService.ts)**
2. **[OperationalStatusService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/common/services/OperationalStatusService.ts)**
3. **[PartnerService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/common/services/PartnerService.ts)**
4. **[ProductService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/common/services/ProductService.ts)**
5. **[VendorService.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/common/services/VendorService.ts)**
6. **[index.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/common/services/index.ts)** - Barrel export

### **Utils (5 files):**

1. **[validation.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/common/utils/validation.ts)** - Validation utilities
2. **[formatters.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/common/utils/formatters.ts)** - Formatting utilities
3. **[helpers.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/common/utils/helpers.ts)** - Helper utilities
4. **[constants.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/common/utils/constants.ts)** - Constants
5. **[index.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/common/utils/index.ts)** - Barrel export

**Latest Commits:**
- [744b656](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/744b656245575485dc6592c3ed07a5946f7f05e6) - Created services
- [0179909](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/017990944ea03d3c82911aaf47e5aea139dd19ba) - Created utils

---

## Backend Alignment

### **Alignment Status:** ✅ 100%

All services are fully aligned with backend:
- ✅ All methods present
- ✅ All validations match
- ✅ All endpoints correct
- ✅ Error handling consistent
- ✅ Complete service layer

---

## Complete Usage Example

### **Full CRUD Implementation:**

```typescript
import { useState, useEffect } from 'react';
import { AlloyService } from '@/modules/network/common/services';
import { 
  formatDate, 
  isNotEmpty, 
  debounce,
  PAGINATION_DEFAULTS 
} from '@/modules/network/common/utils';
import type { AlloyDTO } from '@/modules/network/common/dto';
import type { Page } from '@/types/pagination';

function AlloyManagementPage() {
  const [alloys, setAlloys] = useState<Page<AlloyDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  
  // Load alloys
  const loadAlloys = async (page: number = 0, search: string = '') => {
    try {
      setLoading(true);
      const pageable = {
        page,
        size: PAGINATION_DEFAULTS.SIZE,
        sort: 'code,asc'
      };
      
      const data = search
        ? await AlloyService.globalSearch(search, pageable)
        : await AlloyService.getAll(pageable);
      
      setAlloys(data);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load alloys:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Debounced search
  const debouncedSearch = debounce((term: string) => {
    loadAlloys(0, term);
  }, 300);
  
  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    debouncedSearch(term);
  };
  
  // Create alloy
  const handleCreate = async (dto: AlloyDTO) => {
    try {
      // Validate
      if (!isNotEmpty(dto.code)) {
        alert('Code is required');
        return;
      }
      
      await AlloyService.create(dto);
      loadAlloys(currentPage, searchTerm);
    } catch (error) {
      console.error('Failed to create alloy:', error);
    }
  };
  
  // Update alloy
  const handleUpdate = async (id: number, dto: AlloyDTO) => {
    try {
      await AlloyService.update(id, dto);
      loadAlloys(currentPage, searchTerm);
    } catch (error) {
      console.error('Failed to update alloy:', error);
    }
  };
  
  // Delete alloy
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this alloy?')) return;
    
    try {
      await AlloyService.delete(id);
      loadAlloys(currentPage, searchTerm);
    } catch (error) {
      console.error('Failed to delete alloy:', error);
    }
  };
  
  // Initial load
  useEffect(() => {
    loadAlloys();
  }, []);
  
  return (
    <div>
      <h1>Alloy Management</h1>
      
      {/* Search */}
      <input
        type="text"
        placeholder="Search alloys..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />
      
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
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {alloys?.content.map((alloy) => (
              <tr key={alloy.id}>
                <td>{alloy.code}</td>
                <td>{alloy.designation}</td>
                <td>{alloy.description}</td>
                <td>{formatDate(alloy.createdAt)}</td>
                <td>
                  <button onClick={() => handleUpdate(alloy.id!, alloy)}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(alloy.id!)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {/* Pagination */}
      <div>
        <button 
          disabled={alloys?.first}
          onClick={() => loadAlloys(currentPage - 1, searchTerm)}
        >
          Previous
        </button>
        <span>Page {(alloys?.number ?? 0) + 1} of {alloys?.totalPages}</span>
        <button 
          disabled={alloys?.last}
          onClick={() => loadAlloys(currentPage + 1, searchTerm)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

---

## Summary

### **Network Common Services & Utils: Complete ✅**

**Services: 5/5**
1. AlloyService
2. OperationalStatusService
3. PartnerService
4. ProductService
5. VendorService

**Utils: 4 categories**
1. validation.ts (10 functions)
2. formatters.ts (13 functions)
3. helpers.ts (15 functions)
4. constants.ts (9 constant groups)

**Features:**
- ✅ **Complete CRUD operations**
- ✅ **Global search functionality**
- ✅ **Pagination support**
- ✅ **Backend validation alignment**
- ✅ **Comprehensive utilities**
- ✅ **Type-safe TypeScript**
- ✅ **100% backend alignment**

---

**Created:** January 7, 2026, 1:30 PM CET  
**Backend Package:** `dz.sh.trc.hyflo.network.common.service`  
**Frontend Location:** `src/modules/network/common/`  
**Status:** ✅ All Services & Utils Created  
**Alignment:** 100% - Complete service layer
