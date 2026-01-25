# Flow Module Utilities - Implementation Summary

**Date**: 2026-01-25  
**Template**: network/common and network/core utils patterns  
**Status**: ✅ All Utils Complete for 3 Submodules

---

## ✅ Overview

Utility functions have been created for all three Flow submodules:
- **flow/type** - 2 utility files
- **flow/common** - 3 utility files  
- **flow/core** - 4 utility files

**Total**: 9 utility files across 3 modules

---

## 📚 Flow Type Utils

### **1. constants.ts** ✅
**Path**: `src/modules/flow/type/utils/constants.ts`

#### Exported Constants
- `API_ENDPOINTS` - API endpoint paths
- `OPERATION_TYPE_CODES` - Valid operation type codes (PRODUCED, TRANSPORTED, CONSUMED)
- `EVENT_TYPE_CODES` - Common event type codes (EMERGENCY_SHUTDOWN, MAINTENANCE, LEAK, etc.)
- `PAGINATION_DEFAULTS` - Default pagination settings
- `VALIDATION_CONSTRAINTS` - Field length and pattern constraints
- `ERROR_MESSAGES` - Standard error messages
- `SUCCESS_MESSAGES` - Standard success messages
- `STATUS_CODES` - HTTP status codes

#### Usage
```typescript
import { OPERATION_TYPE_CODES, VALIDATION_CONSTRAINTS } from '@/modules/flow/type/utils';

const producedCode = OPERATION_TYPE_CODES.PRODUCED; // 'PRODUCED'
const maxLength = VALIDATION_CONSTRAINTS.CODE_MAX_LENGTH; // 20
```

---

### **2. localizationUtils.ts** ✅
**Path**: `src/modules/flow/type/utils/localizationUtils.ts`

#### Functions
- `getLocalizedOperationTypeName(operationType, language)` - Get localized name
- `getLocalizedEventTypeDesignation(eventType, language)` - Get localized designation
- `hasAllOperationTypeTranslations(operationType)` - Check completeness
- `hasAllEventTypeTranslations(eventType)` - Check completeness
- `getMissingOperationTypeTranslations(operationType)` - Get missing languages
- `getMissingEventTypeTranslations(eventType)` - Get missing languages

#### Usage
```typescript
import { getLocalizedOperationTypeName } from '@/modules/flow/type/utils';

const name = getLocalizedOperationTypeName(operationType, 'fr');
// Returns: nameFr || nameEn || nameAr || ''
```

---

## 📚 Flow Common Utils

### **1. constants.ts** ✅
**Path**: `src/modules/flow/common/utils/constants.ts`

#### Exported Constants
- `API_ENDPOINTS` - API paths for all 6 common entities
- `VALIDATION_STATUS_CODES` - DRAFT, PENDING, VALIDATED, REJECTED, ARCHIVED
- `ALERT_STATUS_CODES` - ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED
- `EVENT_STATUS_CODES` - PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
- `SEVERITY_CODES` - LOW, MEDIUM, HIGH, CRITICAL
- `QUALITY_FLAG_CODES` - GOOD, ESTIMATED, SUSPECT, MISSING, OUT_OF_RANGE
- `DATA_SOURCE_CODES` - MANUAL_ENTRY, EXCEL_IMPORT, SCADA_EXPORT, etc.
- `SEVERITY_PRIORITY` - Numeric priority mapping
- `SEVERITY_COLORS` - Color codes for UI
- `ALERT_STATUS_COLORS` - Color codes for UI
- `EVENT_STATUS_COLORS` - Color codes for UI
- `QUALITY_FLAG_COLORS` - Color codes for UI

#### Usage
```typescript
import { SEVERITY_CODES, SEVERITY_COLORS } from '@/modules/flow/common/utils';

const criticalCode = SEVERITY_CODES.CRITICAL; // 'CRITICAL'
const criticalColor = SEVERITY_COLORS.CRITICAL; // '#f5222d' (red)
```

---

### **2. localizationUtils.ts** ✅
**Path**: `src/modules/flow/common/utils/localizationUtils.ts`

#### Generic Functions
- `getLocalizedDesignation(entity, language)` - Get localized designation
- `getLocalizedDescription(entity, language)` - Get localized description
- `hasAllTranslations(entity)` - Check translation completeness
- `getMissingTranslations(entity)` - Get missing languages

#### Entity-Specific Helpers
- `ValidationStatusUtils` - Helpers for ValidationStatusDTO
- `AlertStatusUtils` - Helpers for AlertStatusDTO
- `EventStatusUtils` - Helpers for EventStatusDTO
- `SeverityUtils` - Helpers for SeverityDTO
- `QualityFlagUtils` - Helpers for QualityFlagDTO
- `DataSourceUtils` - Helpers for DataSourceDTO

#### Usage
```typescript
import { SeverityUtils, getLocalizedDesignation } from '@/modules/flow/common/utils';

// Using generic function
const designation = getLocalizedDesignation(severity, 'fr');

// Using entity-specific helper
const designation2 = SeverityUtils.getDesignation(severity, 'fr');
const missing = SeverityUtils.getMissingTranslations(severity); // ['ar']
```

---

### **3. validationUtils.ts** ✅
**Path**: `src/modules/flow/common/utils/validationUtils.ts`

#### Functions
- `isValidCode(code)` - Validate code format
- `isValidDesignation(designation)` - Validate designation length
- `isValidDescription(description)` - Validate description length
- `getCodeValidationError(code)` - Get code error message
- `getDesignationValidationError(designation)` - Get designation error
- `getDescriptionValidationError(description)` - Get description error

#### Usage
```typescript
import { isValidCode, getCodeValidationError } from '@/modules/flow/common/utils';

const isValid = isValidCode('CRITICAL'); // true
const isValid2 = isValidCode('invalid-code'); // false
const error = getCodeValidationError('a'); // 'Code must be at least 2 characters'
```

---

## 📚 Flow Core Utils

### **1. constants.ts** ✅
**Path**: `src/modules/flow/core/utils/constants.ts`

#### Exported Constants
- `API_ENDPOINTS` - API paths for all 6 core entities
- `MEASUREMENT_CONSTRAINTS` - Min/max values for pressure, temperature, flow rate, volume
- `MEASUREMENT_UNITS` - Unit symbols (bar, °C, m³/h, m³)
- `DATE_RANGE_PRESETS` - Common date ranges in days
- `ALERT_PRIORITY` - Priority levels
- `EVENT_DURATION_LIMITS` - Min/max event duration
- `FORECAST_HORIZON` - Forecast range limits
- `THRESHOLD_TYPES` - Types of thresholds
- `EXPORT_FORMATS` - Supported export formats
- `CHART_TYPES` - Chart types for visualization
- `ERROR_MESSAGES` - Error messages
- `SUCCESS_MESSAGES` - Success messages
- `WARNING_MESSAGES` - Warning messages

#### Usage
```typescript
import { MEASUREMENT_CONSTRAINTS, MEASUREMENT_UNITS } from '@/modules/flow/core/utils';

const maxPressure = MEASUREMENT_CONSTRAINTS.PRESSURE_MAX; // 200
const unit = MEASUREMENT_UNITS.PRESSURE; // 'bar'
```

---

### **2. validationUtils.ts** ✅
**Path**: `src/modules/flow/core/utils/validationUtils.ts`

#### Functions
- `isValidPressure(pressure)` - Validate pressure range
- `isValidTemperature(temperature)` - Validate temperature range
- `isValidFlowRate(flowRate)` - Validate flow rate range
- `isValidVolume(volume)` - Validate volume range
- `validateFlowReading(reading)` - Validate entire reading DTO
- `validateFlowThreshold(threshold)` - Validate threshold DTO
- `isValidDateRange(startDate, endDate)` - Validate date range
- `isValidNotes(notes)` - Validate notes length
- `isThresholdBreach(value, threshold)` - Check if value breaches threshold
- `getBreachType(value, threshold)` - Get breach type (BELOW_MIN | ABOVE_MAX)

#### Usage
```typescript
import { isValidPressure, validateFlowReading, isThresholdBreach } from '@/modules/flow/core/utils';

const valid = isValidPressure(150); // true
const valid2 = isValidPressure(250); // false (exceeds max 200)

const errors = validateFlowReading({
  readingDate: new Date(),
  pressure: 250, // Invalid!
});
// Returns: ['Pressure must be between 0 and 200 bar']

const isBreach = isThresholdBreach(185, { minValue: 0, maxValue: 180 });
// Returns: true (185 > 180)
```

---

### **3. formattingUtils.ts** ✅
**Path**: `src/modules/flow/core/utils/formattingUtils.ts`

#### Functions
- `formatPressure(pressure, decimals)` - Format with unit
- `formatTemperature(temperature, decimals)` - Format with unit
- `formatFlowRate(flowRate, decimals)` - Format with unit
- `formatVolume(volume, decimals)` - Format with unit
- `formatLargeVolume(volume)` - Format with thousands separator
- `formatDate(date)` - Format date for display
- `formatDateTime(date)` - Format datetime for display
- `formatDuration(hours)` - Convert hours to human-readable
- `formatPercentage(value, decimals)` - Format percentage
- `formatThresholdRange(min, max, unit)` - Format threshold range

#### Usage
```typescript
import { formatPressure, formatDuration, formatThresholdRange } from '@/modules/flow/core/utils';

const formatted = formatPressure(150.5); // '150.50 bar'
const duration = formatDuration(36); // '1 j 12 h'
const range = formatThresholdRange(100, 180, 'bar'); // '100 - 180 bar'
```

---

### **4. exportUtils.ts** ✅
**Path**: `src/modules/flow/core/utils/exportUtils.ts`

#### Functions
- `exportReadingsToCSV(readings)` - Convert readings to CSV string
- `exportOperationsToCSV(operations)` - Convert operations to CSV string
- `exportAlertsToCSV(alerts)` - Convert alerts to CSV string
- `exportEventsToCSV(events)` - Convert events to CSV string
- `downloadCSV(csvContent, filename)` - Download CSV file
- `downloadReadingsCSV(readings, filename)` - Export and download readings
- `downloadOperationsCSV(operations, filename)` - Export and download operations
- `downloadAlertsCSV(alerts, filename)` - Export and download alerts
- `downloadEventsCSV(events, filename)` - Export and download events

#### Usage
```typescript
import { downloadReadingsCSV, exportAlertsToCSV } from '@/modules/flow/core/utils';

// Download readings as CSV
downloadReadingsCSV(readings, 'monthly_readings.csv');

// Get CSV string for custom processing
const csvString = exportAlertsToCSV(alerts);
```

---

## 📦 Module Structure

```
src/modules/flow/
├── type/
│   ├── utils/
│   │   ├── constants.ts           ✅
│   │   ├── localizationUtils.ts   ✅
│   │   └── index.ts               ✅
├── common/
│   ├── utils/
│   │   ├── constants.ts           ✅
│   │   ├── localizationUtils.ts   ✅
│   │   ├── validationUtils.ts     ✅
│   │   └── index.ts               ✅
├── core/
│   ├── utils/
│   │   ├── constants.ts           ✅
│   │   ├── validationUtils.ts     ✅
│   │   ├── formattingUtils.ts     ✅
│   │   ├── exportUtils.ts         ✅
│   │   └── index.ts               ✅
└── UTILS_SUMMARY.md                ✅
```

---

## 🚀 Import Patterns

### Direct Import
```typescript
import { SEVERITY_CODES, SEVERITY_COLORS } from '@/modules/flow/common/utils';
import { formatPressure, isValidPressure } from '@/modules/flow/core/utils';
```

### Named Imports
```typescript
import {
  MEASUREMENT_CONSTRAINTS,
  formatTemperature,
  validateFlowReading,
  downloadReadingsCSV,
} from '@/modules/flow/core/utils';
```

---

## 🎯 Practical Examples

### Example 1: Validate and Format Reading
```typescript
import { 
  validateFlowReading, 
  formatPressure, 
  formatTemperature 
} from '@/modules/flow/core/utils';

const reading = {
  readingDate: new Date(),
  pressure: 150.5,
  temperature: 45.2,
};

const errors = validateFlowReading(reading);
if (errors.length === 0) {
  console.log(`Pressure: ${formatPressure(reading.pressure)}`);
  console.log(`Temperature: ${formatTemperature(reading.temperature)}`);
}
```

### Example 2: Check Threshold Breach with Color
```typescript
import { isThresholdBreach, getBreachType } from '@/modules/flow/core/utils';
import { SEVERITY_COLORS, SEVERITY_CODES } from '@/modules/flow/common/utils';

const threshold = { minValue: 100, maxValue: 180 };
const value = 185;

if (isThresholdBreach(value, threshold)) {
  const breachType = getBreachType(value, threshold);
  const color = SEVERITY_COLORS[SEVERITY_CODES.CRITICAL];
  console.log(`BREACH: ${breachType} - Color: ${color}`);
}
```

### Example 3: Export Data with Localization
```typescript
import { downloadReadingsCSV } from '@/modules/flow/core/utils';
import { getLocalizedDesignation } from '@/modules/flow/common/utils';

// Get localized status
const status = getLocalizedDesignation(validationStatus, 'fr');

// Export readings
downloadReadingsCSV(readings, `readings_${status}.csv`);
```

### Example 4: Validate Before Creating
```typescript
import { isValidCode, getCodeValidationError } from '@/modules/flow/common/utils';

const code = userInput.toUpperCase();

if (!isValidCode(code)) {
  const error = getCodeValidationError(code);
  showError(error);
  return;
}

// Code is valid, proceed with creation
await SeverityService.create({ code, ... });
```

---

## ✅ Quality Checklist

- [x] Constants defined for all modules
- [x] Localization helpers for multilingual support
- [x] Validation functions for data integrity
- [x] Formatting utilities for display
- [x] Export utilities for data export
- [x] Type-safe TypeScript implementations
- [x] Comprehensive JSDoc comments
- [x] Consistent naming conventions
- [x] Centralized exports via index.ts
- [x] Color coding for UI elements
- [x] Measurement constraints aligned with backend

---

## 📊 Summary Statistics

| Module | Utils Files | Functions/Constants | Purpose |
|--------|-------------|---------------------|----------|
| flow/type | 2 | ~15 | Type codes, localization |
| flow/common | 3 | ~40 | Statuses, validation, colors |
| flow/core | 4 | ~50 | Measurements, export, formatting |
| **TOTAL** | **9** | **~105** | **Complete utility support** |

---

**✅ All Flow Module Utilities are production-ready and provide comprehensive support for DTOs and Services!**
