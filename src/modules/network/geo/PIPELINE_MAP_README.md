# Pipeline Map Feature Documentation

## Overview

Dedicated pipeline visualization map with product-based color coding and advanced filtering capabilities.

## Features

### 🎨 **Product-Based Color Coding**

Pipelines are colored according to their product type:

| Product | Color | Hex Code |
|---------|-------|----------|
| Crude Oil | Dark Blue-Gray | `#2C3E50` |
| Natural Gas | Red | `#E74C3C` |
| Condensate | Orange | `#F39C12` |
| LPG | Purple | `#9B59B6` |
| Refined Products | Green | `#27AE60` |
| Mixed | Gray-Blue | `#34495E` |
| Other | Light Gray | `#95A5A6` |

### 🔍 **Advanced Filtering**

#### 1. **Product Type Filter**
- Select/deselect individual product types
- "Select All" / "Deselect All" toggle
- Visual color indicators for each product
- Active filter count badge

#### 2. **Operational Status Filter**
- Filter by operational status:
  - ✅ **Operational** (Green)
  - 🔧 **Maintenance** (Orange) - Dashed line
  - ⏸️ **Inactive** (Gray) - Semi-transparent, dashed
  - 🚧 **Under Construction** (Blue) - Long dashes

#### 3. **Search by Code**
- Real-time search by pipeline code or name
- Case-insensitive matching
- Clear button for quick reset

#### 4. **Display Options**
- Toggle pipeline labels (name/code on hover)
- Toggle flow direction arrows

### 📊 **Visual Styling**

#### Line Weight by Diameter
- **≥ 36"**: 6px weight
- **≥ 24"**: 5px weight  
- **≥ 12"**: 4px weight
- **< 12"**: 3px weight

#### Status Indicators
- **Operational**: Solid line
- **Maintenance**: Dashed (10px dash, 10px gap)
- **Inactive**: Semi-transparent, dashed (5px dash, 10px gap)
- **Construction**: Long dashes (15px dash, 5px gap)

#### Hover Effects
- Line weight increases by 2px
- Opacity set to 100%
- Tooltip displays key information

### 🗺️ **Interactive Features**

- **Hover**: Shows tooltip with pipeline name, code, and product
- **Click**: Opens detailed popup with full pipeline information
- **Click Popup "View Details"**: Navigates to pipeline detail page

## Components

### `PipelineMapView`

Main component for the dedicated pipeline map.

```tsx
import { PipelineMapView } from '@/modules/network/geo/components';

function MyPipelineMap() {
  return <PipelineMapView forceOffline={false} />;
}
```

**Props:**
- `forceOffline?: boolean` - Force offline tile mode
- `onOfflineAvailabilityChange?: (available: boolean) => void` - Callback for tile availability

### `PipelineFilterPanel`

Advanced filter panel component (automatically included in `PipelineMapView`).

**Features:**
- Accordion-based organization
- Filter count badges
- Select/deselect all options
- Reset filters button
- Active filter count in header

### `usePipelineFilters`

Hook for managing pipeline filter state.

```tsx
import { usePipelineFilters } from '@/modules/network/geo/hooks';

const {
  state,
  filteredPipelines,
  toggleProduct,
  toggleStatus,
  setSearchCode,
  resetFilters,
} = usePipelineFilters(pipelines);
```

**Returns:**
- `state: PipelineFilterState` - Current filter state
- `filteredPipelines: PipelineGeoData[]` - Filtered pipeline data
- `toggleProduct(product: string): void` - Toggle product filter
- `toggleStatus(status: string): void` - Toggle status filter
- `setSearchCode(code: string): void` - Set search query
- `toggleLabels(): void` - Toggle label display
- `toggleDirection(): void` - Toggle direction arrows
- `resetFilters(): void` - Reset all filters
- `toggleAllProducts(): void` - Select/deselect all products
- `toggleAllStatuses(): void` - Select/deselect all statuses

## Usage Example

### Basic Usage

```tsx
import { PipelineMapPage } from '@/modules/network/geo/pages/PipelineMapPage';

// Use in your routing
<Route path="/pipelines/map" element={<PipelineMapPage />} />
```

### Custom Implementation

```tsx
import { PipelineMapView } from '@/modules/network/geo/components';
import { Box, Typography } from '@mui/material';

function CustomPipelineMap() {
  return (
    <Box sx={{ height: '100vh' }}>
      <Typography variant="h4" sx={{ p: 2 }}>
        My Pipeline Network
      </Typography>
      <Box sx={{ height: 'calc(100vh - 80px)' }}>
        <PipelineMapView />
      </Box>
    </Box>
  );
}
```

## Product Code Mapping

Ensure your backend returns proper product codes:

```typescript
interface ProductDTO {
  code: 'CRUDE_OIL' | 'NATURAL_GAS' | 'CONDENSATE' | 'LPG' | 'REFINED' | 'MIXED' | 'OTHER';
  name: string;
}
```

## Status Code Mapping

```typescript
interface OperationalStatusDTO {
  code: 'OPERATIONAL' | 'MAINTENANCE' | 'INACTIVE' | 'CONSTRUCTION' | 'DECOMMISSIONED';
  name: string;
}
```

## Customization

### Custom Product Colors

```typescript
import { DEFAULT_PRODUCT_COLORS } from '@/modules/network/geo/types';

// Override in your component
const customColors = {
  ...DEFAULT_PRODUCT_COLORS,
  'CRUDE_OIL': '#1a1a2e',
  'NATURAL_GAS': '#ff6b6b',
};
```

### Custom Status Colors

```typescript
import { DEFAULT_STATUS_COLORS } from '@/modules/network/geo/types';

const customStatusColors = {
  ...DEFAULT_STATUS_COLORS,
  'OPERATIONAL': '#00d2ff',
};
```

## Accessibility

- Keyboard navigation supported
- ARIA labels on all interactive elements
- Color-blind friendly color palette
- Clear visual indicators beyond color

## Performance

- Filtered pipelines memoized
- Efficient re-rendering with React.memo
- Optimized filter algorithms
- Lazy loading of filter panel

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- `react-leaflet` - Map rendering
- `@mui/material` - UI components
- `leaflet` - Map library

## Related Documentation

- [MapView](./components/MapView.tsx) - Main infrastructure map
- [PipelinePolylines](./components/PipelinePolylines.tsx) - Basic pipeline rendering
- [geoService](./services/geoService.ts) - Data fetching service

---

**Author:** CHOUABBIA Amine  
**Created:** January 6, 2026  
**Version:** 1.0.0
