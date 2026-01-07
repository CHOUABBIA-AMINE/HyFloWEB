# Backend Update Sync - Organization DTOs
## January 7, 2026

## Overview

This document tracks the synchronization of frontend Organization DTOs with backend changes from the HyFloAPI repository.

---

## Backend Update: U-002

**Date:** January 7, 2026, 10:10 AM  
**Commit:** [1d3005742b7e62b81fd64fa9f956db51b743e7c6](https://github.com/CHOUABBIA-AMINE/HyFloAPI/commit/1d3005742b7e62b81fd64fa9f956db51b743e7c6)  
**Title:** U-002 : Update Organization Entities (Model, DTO, Repository, Service, Controller)  
**Author:** Amine CHOUABBIA

### Files Changed in Backend:

1. `PersonDTO.java` - Validation and field clarifications
2. `EmployeeDTO.java` - Validation and field clarifications
3. `Person.java` (Model) - Updated entity
4. `Employee.java` (Model) - Updated entity

---

## Key Changes Summary

### 1. PersonDTO - Field Validation Clarified

#### Validation Rules:

**Arabic Names** - OPTIONAL:
- `lastNameAr`: Optional (max 100 chars)
- `firstNameAr`: Optional (max 100 chars)

**Latin Names** - REQUIRED:
- `lastNameLt`: Required `@NotBlank` (max 100 chars)
- `firstNameLt`: Required `@NotBlank` (max 100 chars)

**Key Insight:** Person entity allows Arabic names to be optional, only Latin names are mandatory.

### 2. EmployeeDTO - All Names Required

#### Validation Rules:

**Arabic Names** - REQUIRED:
- `lastNameAr`: Required `@NotBlank` (max 100 chars)
- `firstNameAr`: Required `@NotBlank` (max 100 chars)

**Latin Names** - REQUIRED:
- `lastNameLt`: Required `@NotBlank` (max 100 chars)
- `firstNameLt`: Required `@NotBlank` (max 100 chars)

**Key Insight:** Employee entity requires ALL names (both Arabic AND Latin), unlike Person which allows optional Arabic names.

### 3. Architectural Pattern

**Backend uses FLAT DTOs (No Inheritance):**

Backend does NOT use:
```java
class EmployeeDTO extends PersonDTO { ... }
```

Backend uses:
```java
class EmployeeDTO extends GenericDTO<Employee> {
    // All Person fields duplicated
    // + Employee-specific fields
}
```

**Reason:**
- Simplifies JSON serialization
- Avoids inheritance complexity in DTOs
- Each DTO is self-contained and independent
- Easier to maintain and evolve separately

---

## Complete Field Structure

### PersonDTO (Backend)

```typescript
interface PersonDTO {
  // Identifier
  id?: number;
  
  // Name Fields (Arabic) - OPTIONAL
  lastNameAr?: string;  // max 100 chars
  firstNameAr?: string; // max 100 chars
  
  // Name Fields (Latin) - REQUIRED
  lastNameLt: string;   // @NotBlank, max 100 chars
  firstNameLt: string;  // @NotBlank, max 100 chars
  
  // Birth Information
  birthDate?: Date | string;
  birthPlaceAr?: string; // max 200 chars
  birthPlaceLt?: string; // max 200 chars
  
  // Address Information
  addressAr?: string; // max 200 chars
  addressLt?: string; // max 200 chars
  
  // Relationship IDs
  birthStateId?: number;
  addressStateId?: number;
  countryId?: number;
  pictureId?: number;
  
  // Nested Objects (populated in responses)
  birthState?: StateDTO;
  addressState?: StateDTO;
  country?: CountryDTO;
  picture?: FileDTO;
}
```

### EmployeeDTO (Backend)

```typescript
interface EmployeeDTO {
  // Identifier
  id?: number;
  
  // Name Fields (Arabic) - REQUIRED (unlike Person!)
  lastNameAr: string;  // @NotBlank, max 100 chars
  firstNameAr: string; // @NotBlank, max 100 chars
  
  // Name Fields (Latin) - REQUIRED
  lastNameLt: string;  // @NotBlank, max 100 chars
  firstNameLt: string; // @NotBlank, max 100 chars
  
  // Birth Information
  birthDate?: Date | string;
  birthPlaceAr?: string; // max 200 chars
  birthPlaceLt?: string; // max 200 chars
  
  // Address Information
  addressAr?: string; // max 200 chars
  addressLt?: string; // max 200 chars
  
  // Employee-Specific
  registrationNumber?: string; // max 50 chars
  
  // Relationship IDs
  birthStateId?: number;
  addressStateId?: number;
  countryId?: number;
  pictureId?: number;
  jobId?: number; // Employee-specific
  
  // Nested Objects (populated in responses)
  birthState?: StateDTO;
  addressState?: StateDTO;
  country?: CountryDTO;
  picture?: FileDTO;
  job?: JobDTO; // Employee-specific
}
```

---

## Validation Comparison Table

| Field | PersonDTO | EmployeeDTO | Notes |
|-------|-----------|-------------|-------|
| **lastNameAr** | Optional | **Required** | Key difference! |
| **firstNameAr** | Optional | **Required** | Key difference! |
| **lastNameLt** | Required | Required | Same |
| **firstNameLt** | Required | Required | Same |
| birthDate | Optional | Optional | Same |
| birthPlaceAr | Optional | Optional | Same |
| birthPlaceLt | Optional | Optional | Same |
| addressAr | Optional | Optional | Same |
| addressLt | Optional | Optional | Same |
| registrationNumber | N/A | Optional | Employee only |
| jobId | N/A | Optional | Employee only |

---

## Frontend Synchronization

### Changes Applied to HyFloWEB:

#### 1. **PersonDTO.ts** - Updated Validation

**File:** `src/modules/general/organization/dto/PersonDTO.ts`

**Changes:**
```typescript
export interface PersonDTO {
  id?: number;
  
  // Arabic names are OPTIONAL
  lastNameAr?: string;
  firstNameAr?: string;
  
  // Latin names are REQUIRED
  lastNameLt: string;
  firstNameLt: string;
  
  // ... rest of fields
  
  // NEW: Nested objects support
  birthState?: StateDTO;
  addressState?: StateDTO;
  country?: CountryDTO;
  picture?: FileDTO;
}
```

**Validation Added:**
- Latin names: Required validation
- Arabic names: Optional with max length validation
- All place/address fields: Max length validation

#### 2. **EmployeeDTO.ts** - Updated Requirements

**File:** `src/modules/general/organization/dto/EmployeeDTO.ts`

**Changes:**
```typescript
export interface EmployeeDTO {
  id?: number;
  
  // ALL names are REQUIRED in Employee
  lastNameAr: string; // Required!
  firstNameAr: string; // Required!
  lastNameLt: string;
  firstNameLt: string;
  
  registrationNumber?: string;
  
  // ... rest of fields
  
  // NEW: Nested objects support
  birthState?: StateDTO;
  addressState?: StateDTO;
  country?: CountryDTO;
  picture?: FileDTO;
  job?: JobDTO; // Employee-specific
}
```

**Validation Updated:**
- ALL names (Arabic AND Latin): Required validation
- Registration number: Optional with max length validation

#### 3. **organizationMapper.ts** - Nested Objects Support

**File:** `src/modules/general/organization/utils/organizationMapper.ts`

**Changes:**
```typescript
static mapToPersonDTO(data: any): PersonDTO {
  return {
    id: data.id,
    // ... all fields
    
    // NEW: Map nested objects from backend
    birthState: data.birthState,
    addressState: data.addressState,
    country: data.country,
    picture: data.picture,
  };
}

static mapToEmployeeDTO(data: any): EmployeeDTO {
  return {
    id: data.id,
    // ... all fields
    
    // NEW: Map nested objects from backend
    birthState: data.birthState,
    addressState: data.addressState,
    country: data.country,
    picture: data.picture,
    job: data.job, // Employee-specific
  };
}
```

**Removed:**
- `createdAt` and `updatedAt` fields (not in backend DTOs)

---

## Breaking Changes

### ⚠️ **Impact on Existing Code:**

#### 1. **Person Forms - Arabic Names Now Optional**

**Before (incorrect):**
```typescript
const errors = [];
if (!person.lastNameAr) {
  errors.push("Arabic last name is required"); // WRONG!
}
```

**After (correct):**
```typescript
const errors = validatePersonDTO(person);
// Arabic names are optional for Person
// Only Latin names are required
```

#### 2. **Employee Forms - Arabic Names Are Required**

**Before (incomplete):**
```typescript
const newEmployee = {
  lastNameLt: "Smith",
  firstNameLt: "John",
  // Missing Arabic names - would fail!
};
```

**After (correct):**
```typescript
const newEmployee = {
  lastNameAr: "سميث",      // NOW REQUIRED!
  firstNameAr: "جون",       // NOW REQUIRED!
  lastNameLt: "Smith",
  firstNameLt: "John",
  registrationNumber: "EMP001"
};
```

#### 3. **Validation Differences**

**PersonDTO validation:**
```typescript
const person = { lastNameLt: "Doe", firstNameLt: "Jane" };
validatePersonDTO(person); // ✅ Valid (Arabic names optional)
```

**EmployeeDTO validation:**
```typescript
const employee = { lastNameLt: "Doe", firstNameLt: "Jane" };
validateEmployeeDTO(employee); 
// ❌ Invalid - Missing Arabic names!
// Returns: ["Arabic last name is required", "Arabic first name is required"]
```

---

## Nested Objects Pattern

### Backend Response Structure

Backend includes both IDs AND nested objects in responses:

```json
{
  "id": 42,
  "lastNameAr": "بن علي",
  "firstNameAr": "أحمد",
  "lastNameLt": "Ben Ali",
  "firstNameLt": "Ahmed",
  "birthStateId": 16,
  "birthState": {
    "id": 16,
    "code": "16",
    "designationFr": "Alger",
    "designationAr": "الجزائر"
  },
  "countryId": 1,
  "country": {
    "id": 1,
    "code": "DZ",
    "designationFr": "Algérie"
  },
  "pictureId": 123,
  "picture": {
    "id": 123,
    "filename": "ahmed.jpg",
    "path": "/uploads/pictures/ahmed.jpg"
  }
}
```

### Request Payload Structure

Requests only need IDs (not nested objects):

```json
{
  "lastNameAr": "بن علي",
  "firstNameAr": "أحمد",
  "lastNameLt": "Ben Ali",
  "firstNameLt": "Ahmed",
  "birthStateId": 16,
  "countryId": 1,
  "pictureId": 123
}
```

---

## Migration Guide

### Step 1: Update Person Forms

**Make Arabic names optional:**
```tsx
<Input
  name="lastNameAr"
  label="Arabic Last Name (Optional)"
  required={false}  // ← Changed from true
  value={formData.lastNameAr}
  onChange={handleChange}
/>

<Input
  name="firstNameAr"
  label="Arabic First Name (Optional)"
  required={false}  // ← Changed from true
  value={formData.firstNameAr}
  onChange={handleChange}
/>
```

### Step 2: Update Employee Forms

**Ensure Arabic names are required:**
```tsx
<Input
  name="lastNameAr"
  label="Arabic Last Name"
  required={true}  // ← Must be true for Employee
  value={formData.lastNameAr}
  onChange={handleChange}
/>

<Input
  name="firstNameAr"
  label="Arabic First Name"
  required={true}  // ← Must be true for Employee
  value={formData.firstNameAr}
  onChange={handleChange}
/>
```

### Step 3: Update Validation Calls

**For Person:**
```typescript
const createPerson = async (data: Partial<PersonDTO>) => {
  const errors = validatePersonDTO(data);
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
  
  return await PersonService.create(data);
};
```

**For Employee:**
```typescript
const createEmployee = async (data: Partial<EmployeeDTO>) => {
  const errors = validateEmployeeDTO(data);
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
  
  return await EmployeeService.create(data);
};
```

### Step 4: Handle Nested Objects

**Display nested data in UI:**
```tsx
// Show state name instead of just ID
{employee.birthState ? (
  <span>{employee.birthState.designationFr}</span>
) : (
  <span>State ID: {employee.birthStateId}</span>
)}

// Show job title
{employee.job && (
  <span>{employee.job.designationFr}</span>
)}
```

---

## Testing Checklist

### Person CRUD Operations:
- [ ] Create person with only Latin names (Arabic names omitted)
- [ ] Create person with all names (Arabic + Latin)
- [ ] Update person removing Arabic names (should work)
- [ ] Validate Arabic names are optional
- [ ] Verify nested objects in GET response

### Employee CRUD Operations:
- [ ] Create employee without Arabic names (should fail validation)
- [ ] Create employee with all names (should succeed)
- [ ] Update employee with all required fields
- [ ] Validate all names are required
- [ ] Verify nested objects (including job) in GET response

### Validation Testing:
- [ ] Test PersonDTO validation (Arabic optional)
- [ ] Test EmployeeDTO validation (Arabic required)
- [ ] Test max length validations (100 chars for names)
- [ ] Test max length validations (200 chars for places/addresses)
- [ ] Test registration number validation (50 chars)

### Mapper Testing:
- [ ] Test Person mapper with nested objects
- [ ] Test Employee mapper with nested objects
- [ ] Test mapper handles missing nested objects
- [ ] Verify createdAt/updatedAt removed
- [ ] Test arrays mapping

---

## API Response Examples

### GET /api/persons/1

```json
{
  "id": 1,
  "lastNameLt": "Dupont",
  "firstNameLt": "Marie",
  "birthDate": "1990-05-15",
  "birthStateId": 16,
  "birthState": {
    "id": 16,
    "code": "16",
    "designationFr": "Alger"
  },
  "countryId": 1,
  "country": {
    "id": 1,
    "code": "DZ",
    "designationFr": "Algérie"
  }
}
```

### GET /api/employees/42

```json
{
  "id": 42,
  "lastNameAr": "بن علي",
  "firstNameAr": "أحمد",
  "lastNameLt": "Ben Ali",
  "firstNameLt": "Ahmed",
  "registrationNumber": "EMP2024001",
  "birthDate": "1985-03-20",
  "birthStateId": 16,
  "birthState": {
    "id": 16,
    "code": "16",
    "designationFr": "Alger"
  },
  "jobId": 5,
  "job": {
    "id": 5,
    "code": "ENG001",
    "designationFr": "Ingénieur"
  }
}
```

---

## Commits

### HyFloWEB Repository:

1. **refactor: update PersonDTO to match backend U-002 - make Arabic names optional**
   - Commit: [03bd53530d64c0346b29fdde4c7ffbc5ee4e49e3](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/03bd53530d64c0346b29fdde4c7ffbc5ee4e49e3)
   - Made lastNameAr/firstNameAr optional
   - Added validation function
   - Fixed import paths

2. **refactor: update EmployeeDTO to match backend U-002 - make Arabic names required**
   - Commit: [344811fddc84c2c33278ffa47311e37cdaa52afc](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/344811fddc84c2c33278ffa47311e37cdaa52afc)
   - Made lastNameAr/firstNameAr required
   - Added comprehensive validation
   - Fixed import paths

3. **refactor: update organizationMapper with nested objects support - U-002 sync**
   - Commit: [b485b946bf3fa2904e213386f39c02c4bb5ae586](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/b485b946bf3fa2904e213386f39c02c4bb5ae586)
   - Added nested object mapping
   - Removed createdAt/updatedAt
   - Updated documentation

---

## Summary

### Changes Applied:

✅ **PersonDTO updated** - Arabic names now optional (only Latin required)  
✅ **EmployeeDTO updated** - All names required (Arabic AND Latin)  
✅ **Validation functions added** - Enforce backend constraints  
✅ **Mapper updated** - Support nested objects from backend  
✅ **Removed timestamps** - createdAt/updatedAt not in backend DTOs  
✅ **Import paths fixed** - Use correct localization module paths

### Alignment Status:

**PersonDTO: 100% aligned with backend ✅**  
**EmployeeDTO: 100% aligned with backend ✅**

### Key Differences:

| Aspect | PersonDTO | EmployeeDTO |
|--------|-----------|-------------|
| Arabic Names | Optional | **Required** |
| Latin Names | Required | Required |
| Job Relation | No | **Yes** |
| Use Case | General person | Company employee |

### Next Actions:

1. Update Person forms - make Arabic names optional
2. Update Employee forms - enforce Arabic names
3. Use validation functions in all forms
4. Display nested objects in UI
5. Test all CRUD operations
6. Verify validation rules work correctly

---

**Sync Date:** January 7, 2026, 11:21 AM CET  
**Backend Version:** U-002 (1d30057)  
**Frontend Version:** Latest (b485b94)  
**Status:** ✅ Synchronized
