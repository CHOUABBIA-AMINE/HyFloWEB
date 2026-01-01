# Environment Module - ArchiveBox Management

## Overview

This module implements archive box management functionality following the same patterns used in the system/security module (User, Role, Group management).

**Author:** CHOUABBIA Amine  
**Created:** December 28, 2025  
**Updated:** December 28, 2025  
**Backend Model:** `dz.mdn.iaas.common.environment.model.ArchiveBox`

---

## 📁 Module Structure

```
src/modules/common/environment/
├── dto/
│   ├── ArchiveBoxDTO.ts          # ArchiveBox data transfer object
│   ├── ShelfDTO.ts                # Shelf reference DTO
│   ├── ShelfFloorDTO.ts           # ShelfFloor reference DTO
│   └── index.ts                   # DTOs export
├── services/
│   ├── ArchiveBoxService.ts       # ArchiveBox API service
│   ├── ShelfService.ts            # Shelf API service
│   ├── ShelfFloorService.ts       # ShelfFloor API service
│   └── index.ts                   # Services export
├── pages/
│   ├── ArchiveBoxList.tsx         # List view with DataGrid
│   ├── ArchiveBoxEdit.tsx         # Create/Edit form
│   └── index.ts                   # Pages export
└── README.md                      # This file
```

---

## 🎯 Features Implemented

### ArchiveBoxList Page

**Route:** `/environment/archive-boxes`

#### Features:
- ✅ **DataGrid Display** - MUI X DataGrid with pagination
- ✅ **Search** - Filter by code or description
- ✅ **Filter by Shelf** - Dropdown filter for shelf location
- ✅ **CRUD Actions** - Create, Edit, Delete buttons
- ✅ **Export Menu** - CSV, Excel, PDF export options (placeholders)
- ✅ **Refresh** - Manual data refresh button
- ✅ **Success/Error Alerts** - User feedback for operations
- ✅ **Responsive Design** - Mobile-friendly layout
- ✅ **Professional UI** - Consistent with User management styling

#### Columns:
- ID
- Code (with box icon)
- Description
- Shelf (chip display)
- Shelf Floor (chip display)
- Actions (Edit, Delete)

### ArchiveBoxEdit Page

**Routes:** 
- Create: `/environment/archive-boxes/create`
- Edit: `/environment/archive-boxes/:boxId/edit`

#### Features:
- ✅ **Dual Mode** - Create and Edit functionality
- ✅ **Form Validation** - Client-side validation for required fields
- ✅ **Cascading Selectors** - Shelf selection triggers ShelfFloor loading
- ✅ **Autocomplete** - Material-UI Autocomplete for related entities
- ✅ **Back Navigation** - Breadcrumb-style back button
- ✅ **Loading States** - Spinners during data fetch/save
- ✅ **Error Handling** - Display API errors to user

#### Form Fields:

**Basic Information:**
- Code (required, min 2 chars, unique)
- Description (optional, multiline)

**Location:**
- Shelf (required, autocomplete selector)
- Shelf Floor (required, cascading selector based on shelf)

---

## 🔌 API Integration

### ArchiveBoxService

**Base URL:** `/common/environment/archiveBox` *(camelCase)*

#### Endpoints:

```typescript
// List all archive boxes
GET /common/environment/archiveBox
→ ArchiveBoxDTO[]

// Get by ID
GET /common/environment/archiveBox/{id}
→ ArchiveBoxDTO

// Get by code
GET /common/environment/archiveBox/code/{code}
→ ArchiveBoxDTO

// Create new
POST /common/environment/archiveBox
Body: ArchiveBoxDTO
→ ArchiveBoxDTO

// Update existing
PUT /common/environment/archiveBox/{id}
Body: ArchiveBoxDTO
→ ArchiveBoxDTO

// Delete
DELETE /common/environment/archiveBox/{id}
→ void

// Get by shelf
GET /common/environment/archiveBox/shelf/{shelfId}
→ ArchiveBoxDTO[]

// Get by shelf floor (camelCase)
GET /common/environment/archiveBox/shelfFloor/{shelfFloorId}
→ ArchiveBoxDTO[]
```

### ShelfService

**Base URL:** `/common/environment/shelf`

```typescript
GET /common/environment/shelf          → ShelfDTO[]
GET /common/environment/shelf/{id}     → ShelfDTO
```

### ShelfFloorService

**Base URL:** `/common/environment/shelfFloor` *(camelCase)*

```typescript
GET /common/environment/shelfFloor                  → ShelfFloorDTO[]
GET /common/environment/shelfFloor/{id}             → ShelfFloorDTO
GET /common/environment/shelfFloor/shelf/{shelfId}  → ShelfFloorDTO[]
```

---

## 📦 Data Transfer Objects

### ArchiveBoxDTO

```typescript
interface ArchiveBoxDTO {
  id?: number;
  code: string;                    // Unique identifier
  description?: string;            // Optional description
  shelfId?: number;                // Foreign key to Shelf
  shelf?: ShelfDTO;                // Populated shelf object
  shelfFloorId?: number;           // Foreign key to ShelfFloor
  shelfFloor?: ShelfFloorDTO;      // Populated shelf floor object
  createdAt?: string;              // ISO timestamp
  updatedAt?: string;              // ISO timestamp
}
```

### ShelfDTO

```typescript
interface ShelfDTO {
  id?: number;
  code: string;
  designationLt?: string;          // French designation
  designationAr?: string;          // Arabic designation
  roomId?: number;
  createdAt?: string;
  updatedAt?: string;
}
```

### ShelfFloorDTO

```typescript
interface ShelfFloorDTO {
  id?: number;
  code: string;
  designationLt?: string;
  designationAr?: string;
  floorNumber?: number;
  shelfId?: number;
  createdAt?: string;
  updatedAt?: string;
}
```

---

## 🎨 UI Components Used

### Material-UI Components:
- `DataGrid` - Main table display
- `TextField` - Input fields
- `Autocomplete` - Cascading selectors
- `Button` - Actions
- `IconButton` - Inline actions
- `Chip` - Status/tag display
- `Alert` - Success/error messages
- `Menu` - Export options
- `Paper` - Container sections
- `Stack` - Layout management
- `Grid` - Responsive forms
- `CircularProgress` - Loading indicators
- `Tooltip` - Help text

### Icons:
- `Inventory` (BoxIcon) - Archive box representation
- `Add`, `Edit`, `Delete` - CRUD actions
- `Search`, `FilterList` - Data filtering
- `FileDownload` - Export
- `Refresh` - Data reload
- `Save`, `Cancel`, `ArrowBack` - Form actions

---

## 🧪 Testing Checklist

### List Page
- [ ] Load archive boxes from API
- [ ] Search by code
- [ ] Search by description
- [ ] Filter by shelf
- [ ] Clear filters
- [ ] Navigate to create page
- [ ] Navigate to edit page
- [ ] Delete archive box (with confirmation)
- [ ] Refresh data
- [ ] Export menu opens
- [ ] Pagination works
- [ ] Sorting works
- [ ] Error handling displays

### Edit Page
- [ ] Create mode: empty form loads
- [ ] Edit mode: loads existing data
- [ ] Code validation works
- [ ] Shelf dropdown loads
- [ ] Shelf selection triggers floor load
- [ ] Shelf floor selector becomes enabled
- [ ] Form submission creates/updates
- [ ] Cancel returns to list
- [ ] Back button works
- [ ] API errors display
- [ ] Loading states show

---

## 🚀 Usage

### Creating an Archive Box

1. Navigate to `/environment/archive-boxes`
2. Click "Create Archive Box" button
3. Fill in:
   - Code (required)
   - Description (optional)
   - Select Shelf (required)
   - Select Shelf Floor (required, based on shelf)
4. Click "Save"

### Editing an Archive Box

1. From list page, click Edit icon on row
2. Modify fields as needed
3. Click "Save"

### Deleting an Archive Box

1. From list page, click Delete icon on row
2. Confirm deletion in dialog

### Filtering Archive Boxes

1. Use search box for code/description
2. Use shelf dropdown to filter by location
3. Click "Clear Filters" to reset

---

## 🔄 Pattern Alignment

This implementation follows the **exact same patterns** as User management:

| Aspect | User Pattern | ArchiveBox Implementation |
|--------|--------------|---------------------------|
| **Folder Structure** | dto/ services/ pages/ | ✅ Same structure |
| **Service Pattern** | UserService with CRUD | ✅ ArchiveBoxService with CRUD |
| **List Page** | DataGrid with filters | ✅ DataGrid with filters |
| **Edit Page** | Create/Edit dual mode | ✅ Create/Edit dual mode |
| **Validation** | Client-side validation | ✅ Client-side validation |
| **Error Handling** | Try-catch with alerts | ✅ Try-catch with alerts |
| **Loading States** | CircularProgress | ✅ CircularProgress |
| **Navigation** | useNavigate hooks | ✅ useNavigate hooks |
| **Styling** | MUI theme consistency | ✅ MUI theme consistency |

---

## 📝 i18n Translation Keys

Add these keys to your translation files:

```json
{
  "archiveBox": {
    "title": "Archive Boxes",
    "create": "Create Archive Box",
    "edit": "Edit Archive Box",
    "code": "Code",
    "description": "Description",
    "shelf": "Shelf",
    "shelfFloor": "Shelf Floor",
    "filterByShelf": "Filter by Shelf",
    "searchPlaceholder": "Search by code or description...",
    "deleteConfirm": "Delete this archive box?"
  }
}
```

---

## 🛠️ Future Enhancements

- [ ] Implement actual CSV/Excel/PDF export
- [ ] Add bulk operations (multi-select delete)
- [ ] Add QR code generation for boxes
- [ ] Add folder/document associations
- [ ] Add location history tracking
- [ ] Add barcode scanning integration
- [ ] Add inventory capacity tracking
- [ ] Add advanced search with multiple filters
- [ ] Add box contents preview
- [ ] Add printing labels feature

---

## 🐛 Known Issues

None currently identified.

---

## 📞 Support

For questions or issues, contact: **CHOUABBIA Amine**

---

## 📚 Related Documentation

- [Backend ArchiveBox Model](https://github.com/CHOUABBIA-AMINE/iaas/blob/main/src/main/java/dz/mdn/iaas/common/environment/model/ArchiveBox.java)
- [User Management Implementation](../../system/security/pages/UserList.tsx)
- [Material-UI DataGrid Docs](https://mui.com/x/react-data-grid/)

---

## 🔗 API Naming Convention

**Important:** This module uses **camelCase** for multi-word endpoints:
- ✅ `/common/environment/archiveBox` (camelCase)
- ✅ `/common/environment/shelfFloor` (camelCase)
- ❌ NOT `/common/environment/archive-box` (kebab-case)
- ❌ NOT `/common/environment/shelf-floor` (kebab-case)

This follows the Java Spring Boot controller mapping convention where `@RequestMapping` paths use camelCase for entity names.

---

**Last Updated:** December 28, 2025
