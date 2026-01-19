# Required Translation Keys for EmployeeEdit Component

This document lists all the translation keys that need to be added to your translation files for the EmployeeEdit component to work correctly.

## Location
Add these keys to your translation files (e.g., `en.json`, `fr.json`, `ar.json`)

## Employee-Specific Keys

### Personal Information
```json
"employee": {
  "title": "Employee",
  "lastNameAr": "Last Name (Arabic)",
  "firstNameAr": "First Name (Arabic)",
  "lastNameLt": "Last Name (Latin)",
  "firstNameLt": "First Name (Latin)",
  
  "birthDate": "Birth Date",
  "birthLocality": "Birth Locality",
  "birthPlaceAr": "Birth Place (Arabic)",
  "birthPlaceLt": "Birth Place (Latin)",
  
  "addressLocality": "Address Locality",
  "addressAr": "Address (Arabic)",
  "addressLt": "Address (Latin)",
  
  "registrationNumber": "Registration Number",
  "job": "Job"
}
```

### French Translation Example
```json
"employee": {
  "title": "Employé",
  "lastNameAr": "Nom (Arabe)",
  "firstNameAr": "Prénom (Arabe)",
  "lastNameLt": "Nom (Latin)",
  "firstNameLt": "Prénom (Latin)",
  
  "birthDate": "Date de naissance",
  "birthLocality": "Localité de naissance",
  "birthPlaceAr": "Lieu de naissance (Arabe)",
  "birthPlaceLt": "Lieu de naissance (Latin)",
  
  "addressLocality": "Localité d'adresse",
  "addressAr": "Adresse (Arabe)",
  "addressLt": "Adresse (Latin)",
  
  "registrationNumber": "Numéro d'enregistrement",
  "job": "Poste"
}
```

### Arabic Translation Example
```json
"employee": {
  "title": "موظف",
  "lastNameAr": "اللقب (عربي)",
  "firstNameAr": "الاسم (عربي)",
  "lastNameLt": "اللقب (لاتيني)",
  "firstNameLt": "الاسم (لاتيني)",
  
  "birthDate": "تاريخ الميلاد",
  "birthLocality": "محلية الميلاد",
  "birthPlaceAr": "مكان الميلاد (عربي)",
  "birthPlaceLt": "مكان الميلاد (لاتيني)",
  
  "addressLocality": "محلية العنوان",
  "addressAr": "العنوان (عربي)",
  "addressLt": "العنوان (لاتيني)",
  
  "registrationNumber": "رقم التسجيل",
  "job": "الوظيفة"
}
```

## Common Fields Already Used

These keys should already exist in your `common` translation namespace:

```json
"common": {
  "fields": {
    "country": "Country",
    "state": "State",
    "district": "District",
    "structure": "Structure"
  },
  "sections": {
    "personalInformation": "Personal Information",
    "birthInformation": "Birth Information",
    "addressInformation": "Address Information",
    "employmentInformation": "Employment Information"
  },
  "actions": {
    "selectNone": "None"
  },
  "page": {
    "editTitle": "Edit {{entity}}",
    "createTitle": "Create {{entity}}"
  },
  "messages": {
    "updateSuccess": "Updated successfully",
    "createSuccess": "Created successfully"
  },
  "errors": {
    "loadingDataFailed": "Failed to load data",
    "loadingFailed": "Loading failed",
    "savingFailed": "Saving failed",
    "validationFailed": "Validation failed"
  },
  "validation": {
    "required": "{{field}} is required"
  },
  "back": "Back",
  "cancel": "Cancel",
  "save": "Save",
  "saving": "Saving..."
}
```

## Implementation Notes

1. The component uses the pattern `t('employee.fieldName')` for employee-specific fields
2. Common UI elements use `t('common.category.key')` pattern
3. All location-related dropdowns (State, District, Locality) use multilingual designations from the DTOs
4. The form supports both Arabic and Latin character sets with appropriate RTL directionality

## File Structure Recommendation

Organize your translation files as:
```
public/locales/
  ├── en/
  │   └── translation.json
  ├── fr/
  │   └── translation.json
  └── ar/
      └── translation.json
```

Each `translation.json` should contain both `common` and `employee` namespaces.
