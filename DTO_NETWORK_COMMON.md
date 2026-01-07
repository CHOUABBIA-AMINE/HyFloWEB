# Network Common DTOs - Complete Synchronization
## January 7, 2026 - All 5 Common DTOs Aligned

## Overview

This document covers the **Network Common DTOs** - shared entity DTOs used across the entire Network module. These DTOs represent common resources like materials, products, operational statuses, and business entities.

---

## Backend Source

**Repository:** [HyFloAPI](https://github.com/CHOUABBIA-AMINE/HyFloAPI)  
**Package:** `dz.sh.trc.hyflo.network.common.dto`  
**Author:** MEDJERAB Abir  
**Created:** 06-26-2025  
**Updated:** 01-02-2026

---

## Common DTOs Summary (5 Total)

All Network Common DTOs are now synchronized between backend and frontend:

### **Backend DTOs (5):**

| # | DTO | Purpose | Status |
|---|-----|---------|--------|
| 1 | **[AlloyDTO](#alloydto)** | Materials for construction/coatings | ✅ Synchronized |
| 2 | **[OperationalStatusDTO](#operationalstatusdto)** | Status of entities | ✅ Synchronized |
| 3 | **[ProductDTO](#productdto)** | Petroleum products | ✅ Synchronized |
| 4 | **[PartnerDTO](#partnerdto)** | Business partners | ✅ Synchronized |
| 5 | **[VendorDTO](#vendordto)** | Equipment/material vendors | ✅ Synchronized |

### **Removed DTOs (4):**

These DTOs existed in frontend but NOT in backend - they have been removed:

| # | DTO | Status |
|---|-----|--------|
| 1 | ActivityDTO | ❌ Removed (not in backend) |
| 2 | LocationDTO | ❌ Removed (not in backend) |
| 3 | RegionDTO | ❌ Removed (not in backend) |
| 4 | ZoneDTO | ❌ Removed (not in backend) |

---

## DTO Categories

### **1. Materials & Status:**
- **AlloyDTO** - Construction materials and coatings
- **OperationalStatusDTO** - Operational states

### **2. Products:**
- **ProductDTO** - Petroleum products with chemical properties

### **3. Business Entities:**
- **PartnerDTO** - Business partners (operators, contractors)
- **VendorDTO** - Equipment/material vendors (manufacturers, suppliers)

---

## Detailed DTO Documentation

---

## AlloyDTO

### **Purpose:**
Represents alloy materials used in pipeline construction, exterior/interior coatings, and other infrastructure components.

### **Structure:**

```typescript
export interface AlloyDTO {
  id?: number;
  
  // Core fields
  code: string;                    // max 20 chars (required)
  
  // Multilingual designations
  designationAr?: string;          // max 100 chars (optional)
  designationEn?: string;          // max 100 chars (optional)
  designationFr: string;           // max 100 chars (required)
  
  // Multilingual descriptions
  descriptionAr?: string;          // max 100 chars (optional)
  descriptionEn?: string;          // max 100 chars (optional)
  descriptionFr: string;           // max 100 chars (required)
}
```

### **Key Features:**
- **Multilingual support:** Arabic, English, French (French required)
- **Designations:** Short names for display
- **Descriptions:** Detailed information about the alloy

### **Validation:**
- `code` is required (max 20 chars)
- `designationFr` is required (max 100 chars)
- `descriptionFr` is required (max 100 chars)
- Arabic and English fields are optional

### **Example:**

```typescript
const alloy: AlloyDTO = {
  code: "X70",
  designationFr: "Acier API 5L X70",
  designationEn: "API 5L X70 Steel",
  descriptionFr: "Acier haute résistance pour pipelines",
  descriptionEn: "High-strength steel for pipelines"
};
```

### **Common Uses:**
- **Pipeline construction material** (nominalConstructionMaterialId)
- **Exterior coating** (nominalExteriorCoatingId)
- **Interior coating** (nominalInteriorCoatingId)
- **Segment materials** (constructionMaterialId, exteriorCoatingId, interiorCoatingId)

---

## OperationalStatusDTO

### **Purpose:**
Represents the operational status of network entities (facilities, pipelines, equipment, etc.).

### **Structure:**

```typescript
export interface OperationalStatusDTO {
  id?: number;
  
  // Core fields
  code: string;                    // max 20 chars (required)
  
  // Multilingual designations
  designationAr?: string;          // max 100 chars (optional)
  designationEn?: string;          // max 100 chars (optional)
  designationFr: string;           // max 100 chars (required)
  
  // Multilingual descriptions
  descriptionAr?: string;          // max 100 chars (optional)
  descriptionEn?: string;          // max 100 chars (optional)
  descriptionFr: string;           // max 100 chars (required)
}
```

### **Key Features:**
- Same structure as AlloyDTO (consistent pattern)
- Multilingual support
- Used across all network entities

### **Validation:**
- Same as AlloyDTO (code, designationFr, descriptionFr required)

### **Example:**

```typescript
const status: OperationalStatusDTO = {
  code: "OP",
  designationFr: "Opérationnel",
  designationEn: "Operational",
  descriptionFr: "L'équipement fonctionne normalement",
  descriptionEn: "Equipment is operating normally"
};
```

### **Common Status Values:**
- **Operational** - Normal operation
- **Maintenance** - Under maintenance
- **Out of Service** - Not operational
- **Testing** - Testing phase
- **Decommissioned** - Permanently shut down

### **Common Uses:**
Used by nearly all network entities:
- Facilities, Stations, Terminals
- Pipelines, Pipeline Segments
- Equipment
- Infrastructure

---

## ProductDTO

### **Purpose:**
Represents petroleum products (crude oil, natural gas, refined products) transported through the network with detailed chemical and physical properties.

### **Structure:**

```typescript
export interface ProductDTO {
  id?: number;
  
  // Core fields
  code: string;                    // max 10 chars (required)
  
  // Multilingual designations
  designationAr?: string;          // max 100 chars (optional)
  designationEn?: string;          // max 100 chars (optional)
  designationFr: string;           // max 100 chars (required)
  
  // Physical/Chemical properties (all required)
  density: number;                 // kg/m³ or specific gravity
  viscosity: number;               // cP or cSt
  flashPoint: number;              // °C
  sulfurContent: number;           // percentage or ppm
  
  // Safety flag (required)
  isHazardous: boolean;            // true if hazardous material
}
```

### **Key Features:**
- **Chemical properties:** density, viscosity, flash point, sulfur content
- **Safety classification:** hazardous flag
- **Multilingual designations** (no descriptions)

### **Validation:**
- All fields are required except Arabic/English designations
- Code max 10 chars (shorter than other DTOs)
- All numeric properties must be provided

### **Example:**

```typescript
const product: ProductDTO = {
  code: "CRUDE-BRT",
  designationFr: "Pétrole brut",
  designationEn: "Crude Oil",
  
  // Physical/Chemical properties
  density: 850.0,              // kg/m³
  viscosity: 5.5,              // cSt at 40°C
  flashPoint: -20.0,           // °C
  sulfurContent: 0.15,         // percentage
  
  isHazardous: true
};
```

### **Common Uses:**
- **Pipeline systems** (productId) - product transported
- **Terminals** - products handled
- **Flow calculations** - using density/viscosity
- **Safety assessments** - using hazardous flag

---

## PartnerDTO

### **Purpose:**
Represents business partners such as operators, contractors, joint venture partners, and other companies involved in network operations.

### **Structure:**

```typescript
export interface PartnerDTO {
  id?: number;
  
  // Core fields
  name?: string;                   // max 100 chars (optional)
  shortName: string;               // 2-20 chars (required)
  
  // Required relationships (IDs)
  partnerTypeId: number;           // required
  countryId: number;               // required
  
  // Nested objects (in responses)
  partnerType?: PartnerTypeDTO;
  country?: CountryDTO;
}
```

### **Key Features:**
- **Short name required:** primary identifier (2-20 chars)
- **Full name optional:** detailed name (max 100 chars)
- **Type classification:** via PartnerTypeDTO
- **Country association:** via CountryDTO

### **Validation:**
- `shortName` is required (2-20 chars)
- `name` is optional (max 100 chars if provided)
- `partnerTypeId` and `countryId` are required

### **Example:**

```typescript
const partner: PartnerDTO = {
  name: "Sonatrach - Société Nationale pour la Recherche",
  shortName: "SONATRACH",
  partnerTypeId: 1,            // Operator
  countryId: 12                // Algeria
};
```

### **Common Partner Types:**
- **Operator** - Facility/pipeline operator
- **Contractor** - Service contractor
- **Joint Venture** - JV partner
- **Consultant** - Technical consultant

### **Common Uses:**
- HydrocarbonField operators
- Pipeline system operators
- Facility management
- Joint venture partnerships

---

## VendorDTO

### **Purpose:**
Represents equipment and material vendors (manufacturers, suppliers) who provide products and services to the network.

### **Structure:**

```typescript
export interface VendorDTO {
  id?: number;
  
  // Core fields
  name?: string;                   // max 100 chars (optional)
  shortName?: string;              // 2-20 chars (optional)
  
  // Required relationships (IDs)
  vendorTypeId: number;            // required
  countryId: number;               // required
  
  // Nested objects (in responses)
  vendorType?: VendorTypeDTO;
  country?: CountryDTO;
}
```

### **Key Features:**
- **Both name and shortName are optional** (unlike Partner)
- **Type classification:** via VendorTypeDTO
- **Country association:** via CountryDTO

### **Validation:**
- `name` is optional (max 100 chars if provided)
- `shortName` is optional (2-20 chars if provided)
- `vendorTypeId` and `countryId` are required

### **Example:**

```typescript
const vendor: VendorDTO = {
  name: "Caterpillar Inc.",
  shortName: "CAT",
  vendorTypeId: 2,             // Equipment Manufacturer
  countryId: 231               // USA
};
```

### **Common Vendor Types:**
- **Equipment Manufacturer** - Pumps, compressors, valves
- **Material Supplier** - Pipes, fittings, coatings
- **Service Provider** - Maintenance, inspection
- **Technology Provider** - SCADA, monitoring systems

### **Common Uses:**
- **Equipment** (manufacturerId) - equipment manufacturer
- **Pipeline** (vendorId) - pipeline vendor/supplier
- **Procurement** - vendor selection
- **Maintenance** - service providers

---

## Common Patterns

### **Multilingual Support (Alloy & OperationalStatus):**

Both DTOs follow the same pattern:

```typescript
interface MultilingualDTO {
  code: string;                    // required
  designationFr: string;           // required
  designationEn?: string;          // optional
  designationAr?: string;          // optional
  descriptionFr: string;           // required
  descriptionEn?: string;          // optional
  descriptionAr?: string;          // optional
}
```

**Display Logic:**

```typescript
function getDesignation(
  dto: AlloyDTO | OperationalStatusDTO,
  language: 'ar' | 'en' | 'fr' = 'fr'
): string {
  switch (language) {
    case 'ar': return dto.designationAr || dto.designationFr;
    case 'en': return dto.designationEn || dto.designationFr;
    default: return dto.designationFr; // Always available
  }
}

function getDescription(
  dto: AlloyDTO | OperationalStatusDTO,
  language: 'ar' | 'en' | 'fr' = 'fr'
): string {
  switch (language) {
    case 'ar': return dto.descriptionAr || dto.descriptionFr;
    case 'en': return dto.descriptionEn || dto.descriptionFr;
    default: return dto.descriptionFr; // Always available
  }
}
```

### **Business Entity Pattern (Partner & Vendor):**

Both follow a similar structure:

```typescript
interface BusinessEntityDTO {
  name?: string;                   // optional full name
  shortName: string | undefined;   // required or optional
  [type]Id: number;                // required type
  countryId: number;               // required country
}
```

**Key Difference:**
- **PartnerDTO:** `shortName` is **required**
- **VendorDTO:** `shortName` is **optional**

---

## Validation Functions

All DTOs include validation functions:

```typescript
// Example validation usage
const errors = validateProductDTO(productData);
if (errors.length > 0) {
  console.error("Validation errors:", errors);
  // Display errors to user
} else {
  // Submit to API
  await ProductService.create(productData);
}
```

---

## Frontend Files

All Common DTOs are located in: `src/modules/network/common/dto/`

### **Files Updated:**

1. **[AlloyDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/common/dto/AlloyDTO.ts)** - Latest: [9e9d233](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/9e9d23339ab88446e39141e534c404cfdd9b26f3)
2. **[OperationalStatusDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/common/dto/OperationalStatusDTO.ts)** - Latest: [9e9d233](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/9e9d23339ab88446e39141e534c404cfdd9b26f3)
3. **[ProductDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/common/dto/ProductDTO.ts)** - Latest: [9e9d233](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/9e9d23339ab88446e39141e534c404cfdd9b26f3)
4. **[PartnerDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/common/dto/PartnerDTO.ts)** - Latest: [9e9d233](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/9e9d23339ab88446e39141e534c404cfdd9b26f3)
5. **[VendorDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/common/dto/VendorDTO.ts)** - Latest: [9e9d233](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/9e9d23339ab88446e39141e534c404cfdd9b26f3)

### **Files Removed:**

1. ActivityDTO.ts - Removed in [a77f5e6](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/a77f5e675dbf3ee422a61d8620ef7e60c9a55600)
2. LocationDTO.ts - Removed in [3649946](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/36499462d82cff8b9422f1337252774d9ccf8d4f)
3. RegionDTO.ts - Removed in [c231ff6](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/c231ff6a3afcf7678e05bd4d69d18142cd53a6bd)
4. ZoneDTO.ts - Removed in [34a185a](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/34a185a2eeafb061666d4d633e7823fd9119fe2c)

---

## Backend Alignment

### **Alignment Status:** ✅ 100%

All frontend DTOs are fully aligned with backend Java DTOs:
- ✅ All fields present
- ✅ All validations match
- ✅ All relationships defined
- ✅ All types correct (String → string, Double → number, Boolean → boolean)
- ✅ All optional/required flags match
- ✅ Extra DTOs removed

---

## Usage Examples

### **Alloy Selection Form:**

```typescript
import { AlloyDTO, validateAlloyDTO } from '@/modules/network/common/dto/AlloyDTO';

function AlloySelector({ value, onChange }: Props) {
  const [alloys, setAlloys] = useState<AlloyDTO[]>([]);
  
  useEffect(() => {
    AlloyService.getAll().then(setAlloys);
  }, []);
  
  return (
    <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
      <option value="">Select alloy</option>
      {alloys.map((alloy) => (
        <option key={alloy.id} value={alloy.id}>
          {alloy.code} - {alloy.designationFr}
        </option>
      ))}
    </select>
  );
}
```

### **Product with Properties:**

```typescript
import { ProductDTO, validateProductDTO } from '@/modules/network/common/dto/ProductDTO';

function ProductForm() {
  const [product, setProduct] = useState<Partial<ProductDTO>>({});
  
  const handleSubmit = async () => {
    const errors = validateProductDTO(product);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    await ProductService.create(product as ProductDTO);
  };
  
  return (
    <form>
      <input
        placeholder="Code"
        value={product.code || ''}
        onChange={(e) => setProduct({ ...product, code: e.target.value })}
      />
      
      <input
        placeholder="Density (kg/m³)"
        type="number"
        value={product.density || ''}
        onChange={(e) => setProduct({ ...product, density: Number(e.target.value) })}
      />
      
      <label>
        <input
          type="checkbox"
          checked={product.isHazardous || false}
          onChange={(e) => setProduct({ ...product, isHazardous: e.target.checked })}
        />
        Hazardous Material
      </label>
      
      <button onClick={handleSubmit}>Create Product</button>
    </form>
  );
}
```

---

## Summary

### **Network Common DTOs: 5/5 ✅**

All Network Common DTOs have been successfully synchronized!

**Updated/Created: 5 DTOs**
1. AlloyDTO - Materials and coatings
2. OperationalStatusDTO - Entity status
3. ProductDTO - Petroleum products
4. PartnerDTO - Business partners
5. VendorDTO - Equipment/material vendors

**Removed: 4 DTOs**
1. ActivityDTO - Not in backend
2. LocationDTO - Not in backend
3. RegionDTO - Not in backend
4. ZoneDTO - Not in backend

**Common Features:**
- ✅ **Complete validation functions**
- ✅ **Backend alignment: 100%**
- ✅ **Documentation with examples**
- ✅ **Type safety with TypeScript**
- ✅ **Multilingual support (where applicable)**
- ✅ **Consistent naming conventions**

**Latest Updates:**
- January 7, 2026: Updated all 5 Common DTOs
- January 7, 2026: Removed 4 DTOs not in backend
- All Common DTOs now perfectly aligned

---

**Sync Date:** January 7, 2026, 1:05 PM CET  
**Backend Package:** `dz.sh.trc.hyflo.network.common.dto`  
**Frontend Location:** `src/modules/network/common/dto/`  
**Status:** ✅ All 5 Common DTOs Synchronized  
**Alignment:** 100% - Cleaned and aligned
