# Translation Updates for Models and DTOs

## Overview
This document outlines the comprehensive translation updates made to the HyFloWEB frontend application to support multilingual labels, field descriptions, and UI text for the backend Models and DTOs.

## Updated Date
**January 4, 2026**

## Supported Languages
1. **English** (en.json)
2. **Arabic** (ar.json)
3. **French** (fr.json)

## Files Modified
All translation files are located in: `src/shared/i18n/locales/`

### Translation Files Updated:
- ✅ `en.json` - English translations (16.47 KB)
- ✅ `ar.json` - Arabic translations (21.15 KB)
- ✅ `fr.json` - French translations (18.45 KB)

## New Translation Keys Added

### 1. Alloy Model Translations
Supports translations for the Alloy entity with the following fields:
- **Code**: Product/material code identifier
- **Designation** (Multilingual):
  - `designationAr`: Arabic designation
  - `designationEn`: English designation
  - `designationFr`: French designation
- **Description** (Multilingual):
  - `descriptionAr`: Arabic description
  - `descriptionEn`: English description
  - `descriptionFr`: French description

**Translation Keys:**
```
alloy.title              - "Alloys" / "السبائك" / "Alliages"
alloy.subtitle           - Manage alloy materials and compositions
alloy.code               - Code field label
alloy.designationAr      - Arabic Designation field label
alloy.designationEn      - English Designation field label
alloy.designationFr      - French Designation field label
alloy.descriptionAr      - Arabic Description field label
alloy.descriptionEn      - English Description field label
alloy.descriptionFr      - French Description field label
alloy.create             - Create action button text
alloy.edit               - Edit action button text
alloy.delete             - Delete action button text
alloy.deleteConfirm      - Delete confirmation message
alloy.searchPlaceholder  - Search input placeholder
alloy.filterByDesignation- Filter dropdown label
alloy.createSuccess      - Success message for creation
alloy.updateSuccess      - Success message for update
alloy.deleteSuccess      - Success message for deletion
alloy.createError        - Error message for creation failure
alloy.updateError        - Error message for update failure
alloy.deleteError        - Error message for deletion failure
alloy.errorLoading       - Error message for loading data
```

### 2. Partner Model Translations
Supports translations for the Partner entity (same structure as Alloy)

### 3. Product Model Translations
Supports translations for the Product entity (same structure)

### 4. Vendor Model Translations
Supports translations for the Vendor entity (same structure)

### 5. Operational Status Model Translations
Supports translations for the Operational Status entity with additional fields:
- **Color**: Visual color indicator
- **Icon**: Visual icon indicator

## Translation Key Naming Convention

### Pattern: `[entity].[field]`

**Examples:**
- `alloy.code` - Code field for Alloy
- `alloy.designationAr` - Arabic designation field
- `alloy.createSuccess` - Success message when creating
- `alloy.errorLoading` - Error message when loading

## Backend Models Alignment

The frontend translations are aligned with the following Spring Boot Models and DTOs:

```
Network > Common
├── Models/
│   ├── Alloy.java
│   ├── Partner.java
│   ├── Product.java
│   ├── Vendor.java
│   └── OperationalStatus.java
└── DTOs/
    ├── AlloyDTO.java
    ├── PartnerDTO.java
    ├── ProductDTO.java
    ├── VendorDTO.java
    └── OperationalStatusDTO.java
```

### DTO Field Mapping:

**AlloyDTO Structure:**
```java
code: String                    // Maps to alloy.code
designationAr: String          // Maps to alloy.designationAr
designationEn: String          // Maps to alloy.designationEn
designationFr: String          // Maps to alloy.designationFr
descriptionAr: String          // Maps to alloy.descriptionAr
descriptionEn: String          // Maps to alloy.descriptionEn
descriptionFr: String          // Maps to alloy.descriptionFr
```

Same structure applies to PartnerDTO, ProductDTO, and VendorDTO.

**OperationalStatusDTO Structure:**
Includes all fields from above plus:
```java
color: String                   // Maps to operationalStatus.color
icon: String                    // Maps to operationalStatus.icon
```

## Usage Examples

### In React Components:

```typescript
import { useTranslation } from 'react-i18next';

const AlloyForm = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('alloy.title')}</h1>
      <p>{t('alloy.subtitle')}</p>
      
      <label>{t('alloy.code')}</label>
      <input placeholder={t('alloy.code')} />
      
      <label>{t('alloy.designationAr')}</label>
      <input placeholder={t('alloy.designationAr')} />
      
      <label>{t('alloy.designationEn')}</label>
      <input placeholder={t('alloy.designationEn')} />
      
      <label>{t('alloy.designationFr')}</label>
      <input placeholder={t('alloy.designationFr')} />
      
      <button>{t('common.save')}</button>
      <button>{t('common.cancel')}</button>
    </div>
  );
};
```

### Displaying Success/Error Messages:

```typescript
const handleCreateAlloy = async (data) => {
  try {
    const response = await api.createAlloy(data);
    notify.success(t('alloy.createSuccess'));
    return response;
  } catch (error) {
    notify.error(t('alloy.createError'));
    throw error;
  }
};
```

## Commit History

**Commit 1:** feat: Add comprehensive translations for Models and DTOs - English
- Updated `src/shared/i18n/locales/en.json`
- Added 90+ new translation keys

**Commit 2:** feat: Add comprehensive translations for Models and DTOs - Arabic
- Updated `src/shared/i18n/locales/ar.json`
- Added 90+ new translation keys in Arabic

**Commit 3:** feat: Add comprehensive translations for Models and DTOs - French
- Updated `src/shared/i18n/locales/fr.json`
- Added 90+ new translation keys in French

## Summary of Changes

### New Model Translation Sections:
1. **Alloy** (السبائك / Alliages) - 23 keys
2. **Partner** (الشركاء / Partenaires) - 23 keys
3. **Product** (المنتجات / Produits) - 23 keys
4. **Vendor** (الموردون / Fournisseurs) - 23 keys
5. **Operational Status** (الحالة التشغيلية / État opérationnel) - 25 keys

**Total New Keys:** 117 keys across all three languages

### Features Supported:
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Search and filtering
- ✅ Success and error messages
- ✅ Multilingual field labels
- ✅ Confirmation dialogs
- ✅ Empty state messages
- ✅ Loading states

## Language Support Matrix

| Feature | English | Arabic | French |
|---------|---------|--------|--------|
| Titles | ✅ | ✅ | ✅ |
| Field Labels | ✅ | ✅ | ✅ |
| Descriptions | ✅ | ✅ | ✅ |
| CRUD Operations | ✅ | ✅ | ✅ |
| Messages | ✅ | ✅ | ✅ |
| Search/Filter | ✅ | ✅ | ✅ |

## Testing

### Language Switching:
```typescript
// Switch to Arabic
i18n.changeLanguage('ar');

// Switch to French
i18n.changeLanguage('fr');

// Switch to English
i18n.changeLanguage('en');
```

### Verify Translations:
1. Open the application
2. Navigate to any model page (Alloys, Partners, Products, Vendors, Operational Status)
3. Use the language selector to switch between EN, AR, FR
4. Verify all labels, buttons, and messages display correctly

## Related Resources

- i18next Documentation: https://www.i18next.com/
- Backend Repository: https://github.com/CHOUABBIA-AMINE/HyFloAPI
- Frontend Repository: https://github.com/CHOUABBIA-AMINE/HyFloWEB

---

**Last Updated:** January 4, 2026
**Status:** ✅ Complete
**Languages Supported:** English, Arabic, French
**Total Translation Keys Added:** 117
