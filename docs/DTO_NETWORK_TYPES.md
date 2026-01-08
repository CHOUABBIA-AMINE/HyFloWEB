# Network Type DTOs - Complete Implementation
## January 7, 2026 - All 8 Type DTOs Created

## Overview

This document covers the **Network Type DTOs** - classification entities used throughout the Network module. All Type DTOs follow the same structure with multilingual support (Arabic, English, French).

---

## Backend Source

**Repository:** [HyFloAPI](https://github.com/CHOUABBIA-AMINE/HyFloAPI)  
**Package:** `dz.sh.trc.hyflo.network.type.dto`  
**Author:** MEDJERAB Abir  
**Created:** 06-26-2025  
**Updated:** 01-02-2026

---

## Type DTOs Created (8 Total)

All Type DTOs share the same structure and validation rules:

### **Complete List:**

1. **StationTypeDTO** - Classifies Station entities
2. **TerminalTypeDTO** - Classifies Terminal entities
3. **HydrocarbonFieldTypeDTO** - Classifies HydrocarbonField entities
4. **FacilityTypeDTO** - Classifies Facility entities
5. **CompanyTypeDTO** - Classifies Company entities
6. **EquipmentTypeDTO** - Classifies Equipment entities
7. **PartnerTypeDTO** - Classifies Partner entities
8. **VendorTypeDTO** - Classifies Vendor entities

---

## Common Structure

All Type DTOs follow this exact structure:

### **TypeScript Interface:**

```typescript
export interface [Type]TypeDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core fields
  code: string;                // @NotBlank, max 20 chars (required)
  designationAr?: string;      // Optional, max 100 chars (Arabic)
  designationEn?: string;      // Optional, max 100 chars (English)
  designationFr: string;       // @NotBlank, max 100 chars (required - French)
}
```

### **Field Details:**

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `id` | number | No | - | Primary key (auto-generated) |
| `code` | string | **Yes** | 20 | Unique identifier code |
| `designationAr` | string | No | 100 | Arabic designation (optional) |
| `designationEn` | string | No | 100 | English designation (optional) |
| `designationFr` | string | **Yes** | 100 | French designation (required) |

---

## Validation Rules

All Type DTOs share the same validation logic:

### **Required Fields:**
- ✅ `code` - Must be provided and non-empty
- ✅ `designationFr` - Must be provided and non-empty

### **Length Constraints:**
- `code`: Maximum 20 characters
- `designationAr`: Maximum 100 characters (if provided)
- `designationEn`: Maximum 100 characters (if provided)
- `designationFr`: Maximum 100 characters

### **Validation Function:**

```typescript
export const validate[Type]TypeDTO = (data: Partial<[Type]TypeDTO>): string[] => {
  const errors: string[] = [];
  
  // Code validation
  if (!data.code) {
    errors.push("Code is required");
  } else if (data.code.length > 20) {
    errors.push("Code must not exceed 20 characters");
  }
  
  // French designation validation (required)
  if (!data.designationFr) {
    errors.push("French designation is required");
  } else if (data.designationFr.length > 100) {
    errors.push("French designation must not exceed 100 characters");
  }
  
  // Optional designations validation
  if (data.designationAr && data.designationAr.length > 100) {
    errors.push("Arabic designation must not exceed 100 characters");
  }
  
  if (data.designationEn && data.designationEn.length > 100) {
    errors.push("English designation must not exceed 100 characters");
  }
  
  return errors;
};
```

---

## Backend Alignment

### **Java Structure (Backend):**

```java
@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class [Type]TypeDTO extends GenericDTO<[Type]Type> {

    @NotBlank(message = "Code is required")
    @Size(max = 20, message = "Code must not exceed 20 characters")
    private String code;

    @Size(max = 100, message = "Designation must not exceed 100 characters")
    private String designationAr;

    @Size(max = 100, message = "Designation must not exceed 100 characters")
    private String designationEn;

    @NotBlank(message = "Designation is required")
    @Size(max = 100, message = "Designation must not exceed 100 characters")
    private String designationFr;
}
```

**Frontend alignment:** ✅ 100% - All fields, types, and validations match

---

## Frontend Files Created

All Type DTOs are located in: `src/modules/network/type/dto/`

### **Files Created:**

1. **[StationTypeDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/type/dto/StationTypeDTO.ts)**
   - SHA: Latest
   - Commit: [f282517](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/f2825177e8e146232224ed9e772faf5edf9d4f91)

2. **[TerminalTypeDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/type/dto/TerminalTypeDTO.ts)**
   - SHA: Latest
   - Commit: [f282517](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/f2825177e8e146232224ed9e772faf5edf9d4f91)

3. **[HydrocarbonFieldTypeDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/type/dto/HydrocarbonFieldTypeDTO.ts)**
   - SHA: Latest
   - Commit: [f282517](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/f2825177e8e146232224ed9e772faf5edf9d4f91)

4. **[FacilityTypeDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/type/dto/FacilityTypeDTO.ts)**
   - SHA: Latest
   - Commit: [f282517](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/f2825177e8e146232224ed9e772faf5edf9d4f91)

5. **[CompanyTypeDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/type/dto/CompanyTypeDTO.ts)**
   - SHA: Latest
   - Commit: [f282517](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/f2825177e8e146232224ed9e772faf5edf9d4f91)

6. **[EquipmentTypeDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/type/dto/EquipmentTypeDTO.ts)**
   - SHA: Latest
   - Commit: [f282517](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/f2825177e8e146232224ed9e772faf5edf9d4f91)

7. **[PartnerTypeDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/type/dto/PartnerTypeDTO.ts)**
   - SHA: Latest
   - Commit: [f282517](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/f2825177e8e146232224ed9e772faf5edf9d4f91)

8. **[VendorTypeDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/type/dto/VendorTypeDTO.ts)**
   - SHA: Latest
   - Commit: [f282517](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/f2825177e8e146232224ed9e772faf5edf9d4f91)

---

## Usage Examples

### **Creating a StationType:**

```typescript
import { StationTypeDTO, validateStationTypeDTO } from '@/modules/network/type/dto/StationTypeDTO';

// Create a station type
const stationType: StationTypeDTO = {
  code: "PUMP",
  designationFr: "Station de pompage",
  designationEn: "Pumping Station",
  designationAr: "محطة الضخ"
};

// Validate before submission
const errors = validateStationTypeDTO(stationType);
if (errors.length > 0) {
  console.error("Validation errors:", errors);
} else {
  // Submit to API
  await StationTypeService.create(stationType);
}
```

### **Minimal Valid Type (French only):**

```typescript
const minimalType: TerminalTypeDTO = {
  code: "EXPORT",
  designationFr: "Terminal d'exportation"
  // designationEn and designationAr are optional
};

// ✅ Valid - only French is required
await TerminalTypeService.create(minimalType);
```

### **API Response Example:**

```json
{
  "id": 1,
  "code": "PUMP",
  "designationFr": "Station de pompage",
  "designationEn": "Pumping Station",
  "designationAr": "محطة الضخ"
}
```

---

## Multilingual Support

### **Language Priority:**

1. **French (designationFr)** - Required, primary language
2. **English (designationEn)** - Optional, for international users
3. **Arabic (designationAr)** - Optional, for Arabic-speaking users

### **Display Logic:**

```typescript
/**
 * Get designation in preferred language with fallback
 */
function getDesignation(
  type: StationTypeDTO,
  language: 'ar' | 'en' | 'fr' = 'fr'
): string {
  switch (language) {
    case 'ar':
      return type.designationAr || type.designationFr;
    case 'en':
      return type.designationEn || type.designationFr;
    case 'fr':
    default:
      return type.designationFr; // Always available
  }
}

// Usage
const station = { 
  code: "PUMP", 
  designationFr: "Station de pompage",
  designationEn: "Pumping Station" 
};

getDesignation(station, 'en'); // "Pumping Station"
getDesignation(station, 'ar'); // "Station de pompage" (fallback to French)
getDesignation(station, 'fr'); // "Station de pompage"
```

---

## Form Implementation

### **Type Form Component:**

```tsx
import { useState } from 'react';
import { StationTypeDTO, validateStationTypeDTO } from '@/modules/network/type/dto/StationTypeDTO';

function StationTypeForm() {
  const [formData, setFormData] = useState<Partial<StationTypeDTO>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const validationErrors = validateStationTypeDTO(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Submit
    try {
      await StationTypeService.create(formData as StationTypeDTO);
      // Success handling
    } catch (error) {
      // Error handling
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Code field - Required */}
      <input
        type="text"
        name="code"
        placeholder="Code (max 20 chars)"
        maxLength={20}
        required
        value={formData.code || ''}
        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
      />

      {/* French designation - Required */}
      <input
        type="text"
        name="designationFr"
        placeholder="Designation (French) *"
        maxLength={100}
        required
        value={formData.designationFr || ''}
        onChange={(e) => setFormData({ ...formData, designationFr: e.target.value })}
      />

      {/* English designation - Optional */}
      <input
        type="text"
        name="designationEn"
        placeholder="Designation (English)"
        maxLength={100}
        value={formData.designationEn || ''}
        onChange={(e) => setFormData({ ...formData, designationEn: e.target.value })}
      />

      {/* Arabic designation - Optional */}
      <input
        type="text"
        name="designationAr"
        placeholder="Designation (Arabic)"
        maxLength={100}
        dir="rtl"
        value={formData.designationAr || ''}
        onChange={(e) => setFormData({ ...formData, designationAr: e.target.value })}
      />

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="errors">
          {errors.map((error, idx) => (
            <p key={idx}>{error}</p>
          ))}
        </div>
      )}

      <button type="submit">Create Station Type</button>
    </form>
  );
}
```

---

## Selector Components

### **Type Selector for Forms:**

```tsx
import { useEffect, useState } from 'react';
import { StationTypeDTO } from '@/modules/network/type/dto/StationTypeDTO';

interface TypeSelectorProps {
  value?: number;
  onChange: (typeId: number) => void;
  language?: 'ar' | 'en' | 'fr';
}

function StationTypeSelector({ value, onChange, language = 'fr' }: TypeSelectorProps) {
  const [types, setTypes] = useState<StationTypeDTO[]>([]);

  useEffect(() => {
    // Fetch station types
    StationTypeService.getAll().then(setTypes);
  }, []);

  const getDesignation = (type: StationTypeDTO) => {
    switch (language) {
      case 'ar': return type.designationAr || type.designationFr;
      case 'en': return type.designationEn || type.designationFr;
      default: return type.designationFr;
    }
  };

  return (
    <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
      <option value="">Select a station type</option>
      {types.map((type) => (
        <option key={type.id} value={type.id}>
          {type.code} - {getDesignation(type)}
        </option>
      ))}
    </select>
  );
}
```

---

## Testing Examples

### **Unit Tests:**

```typescript
import { validateStationTypeDTO } from '@/modules/network/type/dto/StationTypeDTO';

describe('StationTypeDTO Validation', () => {
  test('should accept valid data with all fields', () => {
    const data = {
      code: "PUMP",
      designationFr: "Station de pompage",
      designationEn: "Pumping Station",
      designationAr: "محطة الضخ"
    };
    
    const errors = validateStationTypeDTO(data);
    expect(errors).toHaveLength(0);
  });

  test('should accept minimal valid data (French only)', () => {
    const data = {
      code: "PUMP",
      designationFr: "Station de pompage"
    };
    
    const errors = validateStationTypeDTO(data);
    expect(errors).toHaveLength(0);
  });

  test('should reject missing code', () => {
    const data = {
      designationFr: "Station de pompage"
    };
    
    const errors = validateStationTypeDTO(data);
    expect(errors).toContain("Code is required");
  });

  test('should reject missing French designation', () => {
    const data = {
      code: "PUMP"
    };
    
    const errors = validateStationTypeDTO(data);
    expect(errors).toContain("French designation is required");
  });

  test('should reject code exceeding 20 characters', () => {
    const data = {
      code: "A".repeat(21),
      designationFr: "Test"
    };
    
    const errors = validateStationTypeDTO(data);
    expect(errors).toContain("Code must not exceed 20 characters");
  });

  test('should reject designations exceeding 100 characters', () => {
    const data = {
      code: "PUMP",
      designationFr: "A".repeat(101)
    };
    
    const errors = validateStationTypeDTO(data);
    expect(errors).toContain("French designation must not exceed 100 characters");
  });
});
```

---

## Summary

### **Type DTOs Created: 8 ✅**

| DTO | Purpose | Status |
|-----|---------|--------|
| StationTypeDTO | Classify Stations | ✅ Created |
| TerminalTypeDTO | Classify Terminals | ✅ Created |
| HydrocarbonFieldTypeDTO | Classify Hydrocarbon Fields | ✅ Created |
| FacilityTypeDTO | Classify Facilities | ✅ Created |
| CompanyTypeDTO | Classify Companies | ✅ Created |
| EquipmentTypeDTO | Classify Equipment | ✅ Created |
| PartnerTypeDTO | Classify Partners | ✅ Created |
| VendorTypeDTO | Classify Vendors | ✅ Created |

### **Common Features:**

✅ **Multilingual Support** - Arabic, English, French  
✅ **Validation** - All Type DTOs include validation functions  
✅ **Backend Alignment** - 100% aligned with Java DTOs  
✅ **Documentation** - Complete JSDoc comments  
✅ **Type Safety** - Full TypeScript interfaces

### **Structure:**

- **Required:** `code` (max 20), `designationFr` (max 100)
- **Optional:** `designationEn` (max 100), `designationAr` (max 100)
- **Auto-generated:** `id`

### **Usage:**

- Import from `@/modules/network/type/dto/[Type]TypeDTO`
- Use in forms, selectors, and API calls
- Validate before submission using `validate[Type]TypeDTO()`
- Display with language fallback logic

---

**Sync Date:** January 7, 2026, 12:50 PM CET  
**Backend Package:** `dz.sh.trc.hyflo.network.type.dto`  
**Frontend Location:** `src/modules/network/type/dto/`  
**Status:** ✅ All 8 Type DTOs Synchronized  
**Alignment:** 100% - All fields, validations, and types match
