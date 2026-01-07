# Network Flow DTOs - Update January 7, 2026 (1:25 PM)
## 2 New DTOs Added: FlowConsumedDTO & FlowProducedDTO

## Update Summary

The backend has been updated with **2 new Flow DTOs**:

### **New DTOs Added:**

| # | DTO | Purpose | Entity | Status |
|---|-----|---------|--------|--------|
| 8 | **FlowConsumedDTO** | Daily consumption tracking | Terminal | ✅ **NEW** |
| 9 | **FlowProducedDTO** | Daily production tracking | HydrocarbonField | ✅ **NEW** |

### **Total Flow DTOs: 9 (was 7, now 9)**

These new DTOs complete the flow tracking system by adding:
- **Production tracking** at hydrocarbon fields
- **Consumption tracking** at terminals
- Complements **transportation tracking** at pipelines

---

## Updated DTO Categories

### **1. Lookup/Reference:**
- MeasurementHourDTO

### **2. Measurement DTOs (Entity-based):**
- FlowVolumeDTO - Hourly volume (pipelines)
- FlowPressureDTO - Hourly pressure (pipelines)
- **FlowProducedDTO** - Daily production (fields) **NEW**
- FlowTransportedDTO - Daily transportation (pipelines)
- **FlowConsumedDTO** - Daily consumption (terminals) **NEW**

### **3. Dashboard/Summary DTOs:**
- DailyTrendDTO
- PipelineStatusDTO
- DashboardSummaryDTO

---

## Complete Flow Tracking System

```
HydrocarbonField (Production)
  ↓
  FlowProducedDTO (volumeProduced vs volumeEstimated)
  ↓
Pipeline (Transportation)
  ↓
  FlowTransportedDTO (volumeTransported vs volumeEstimated)
  ↓
Terminal (Consumption)
  ↓
  FlowConsumedDTO (volumeConsumed vs volumeEstimated)
```

---

## FlowProducedDTO (NEW)

### **Purpose:**
Tracks daily production at hydrocarbon fields. Compares actual produced volume vs estimated production.

### **Structure:**

```typescript
export interface FlowProducedDTO {
  id?: number;
  
  // Volume data
  volumeEstimated: number;     // m³ (required) - daily production target
  volumeProduced?: number;     // m³ - actual produced
  
  // Date
  measurementDate?: string;    // YYYY-MM-DD
  
  // Required relationships
  hydrocarbonFieldId: number;  // required
  
  // Nested objects
  hydrocarbonField?: HydrocarbonFieldDTO;
}
```

### **Key Features:**
- One record per field per day
- Tracks production performance
- Same structure as FlowTransportedDTO but for fields

### **Validation:**
- `volumeEstimated` is required
- `hydrocarbonFieldId` is required
- `volumeProduced` is optional (populated as production occurs)

### **Example:**

```typescript
const flowProduced: FlowProducedDTO = {
  volumeEstimated: 120000.0,   // Daily target: 120,000 m³
  volumeProduced: 118500.0,    // Actually produced: 118,500 m³
  measurementDate: "2026-01-07",
  hydrocarbonFieldId: 5
};

// Calculate variance
const variance = flowProduced.volumeProduced! - flowProduced.volumeEstimated;
// = -1,500 m³ (1.25% below target)

const variancePercent = (variance / flowProduced.volumeEstimated) * 100;
// = -1.25%
```

### **Use Cases:**
- Daily production monitoring
- Field performance tracking
- Production vs target analysis
- Source tracking for transported volumes

---

## FlowConsumedDTO (NEW)

### **Purpose:**
Tracks daily consumption at terminals. Compares actual consumed volume vs estimated consumption.

### **Structure:**

```typescript
export interface FlowConsumedDTO {
  id?: number;
  
  // Volume data
  volumeEstimated: number;     // m³ (required) - daily consumption target
  volumeConsumed?: number;     // m³ - actual consumed
  
  // Date
  measurementDate?: string;    // YYYY-MM-DD
  
  // Required relationships
  terminalId: number;          // required
  
  // Nested objects
  terminal?: TerminalDTO;
}
```

### **Key Features:**
- One record per terminal per day
- Tracks consumption/delivery performance
- Same structure as FlowTransportedDTO but for terminals

### **Validation:**
- `volumeEstimated` is required
- `terminalId` is required
- `volumeConsumed` is optional (populated as consumption occurs)

### **Example:**

```typescript
const flowConsumed: FlowConsumedDTO = {
  volumeEstimated: 45000.0,    // Daily target: 45,000 m³
  volumeConsumed: 46200.0,     // Actually consumed: 46,200 m³
  measurementDate: "2026-01-07",
  terminalId: 3
};

// Calculate variance
const variance = flowConsumed.volumeConsumed! - flowConsumed.volumeEstimated;
// = +1,200 m³ (2.67% above target)

const variancePercent = (variance / flowConsumed.volumeEstimated) * 100;
// = +2.67%
```

### **Use Cases:**
- Daily consumption monitoring
- Terminal delivery tracking
- Demand vs supply analysis
- Destination tracking for transported volumes

---

## Pattern Comparison: 3 Flow DTOs

All three daily flow DTOs follow the same pattern:

| DTO | Entity | Volume Field | Use Case |
|-----|--------|--------------|----------|
| **FlowProducedDTO** | HydrocarbonField | volumeProduced | Production tracking |
| **FlowTransportedDTO** | Pipeline | volumeTransported | Transportation tracking |
| **FlowConsumedDTO** | Terminal | volumeConsumed | Consumption tracking |

### **Common Pattern:**

```typescript
interface DailyFlowDTO {
  id?: number;
  volumeEstimated: number;     // Required target
  volume[Type]?: number;       // Optional actual (produced/transported/consumed)
  measurementDate?: string;    // YYYY-MM-DD
  [entity]Id: number;          // Required entity ID
  [entity]?: EntityDTO;        // Nested entity
}
```

---

## Complete Flow Balance

### **Daily Balance Equation:**

```typescript
// Production (from fields)
const totalProduced = fields.reduce(
  (sum, field) => sum + field.volumeProduced, 0
);

// Transportation (through pipelines)
const totalTransported = pipelines.reduce(
  (sum, pipeline) => sum + pipeline.volumeTransported, 0
);

// Consumption (at terminals)
const totalConsumed = terminals.reduce(
  (sum, terminal) => sum + terminal.volumeConsumed, 0
);

// Balance check
const balance = totalProduced - totalTransported - totalConsumed;
// Should be close to 0 (accounting for storage changes)
```

### **Flow Balance Dashboard:**

```typescript
interface FlowBalanceDTO {
  date: string;
  
  // Production
  totalProduced: number;
  totalProducedEstimated: number;
  productionVariance: number;
  
  // Transportation
  totalTransported: number;
  totalTransportedEstimated: number;
  transportationVariance: number;
  
  // Consumption
  totalConsumed: number;
  totalConsumedEstimated: number;
  consumptionVariance: number;
  
  // Balance
  netBalance: number;  // Produced - Transported - Consumed
  storageChange: number;  // Net balance (positive = accumulation)
}
```

---

## Usage Examples

### **Recording Production:**

```typescript
import { FlowProducedDTO } from '@/modules/network/flow/dto';

const recordProduction = async (fieldId: number, produced: number, estimated: number) => {
  const flowProduced: FlowProducedDTO = {
    volumeEstimated: estimated,
    volumeProduced: produced,
    measurementDate: new Date().toISOString().split('T')[0],
    hydrocarbonFieldId: fieldId
  };
  
  await FlowService.recordProduced(flowProduced);
};
```

### **Recording Consumption:**

```typescript
import { FlowConsumedDTO } from '@/modules/network/flow/dto';

const recordConsumption = async (terminalId: number, consumed: number, estimated: number) => {
  const flowConsumed: FlowConsumedDTO = {
    volumeEstimated: estimated,
    volumeConsumed: consumed,
    measurementDate: new Date().toISOString().split('T')[0],
    terminalId
  };
  
  await FlowService.recordConsumed(flowConsumed);
};
```

### **Flow Balance Report:**

```typescript
const FlowBalanceReport = () => {
  const [produced, setProduced] = useState<FlowProducedDTO[]>([]);
  const [transported, setTransported] = useState<FlowTransportedDTO[]>([]);
  const [consumed, setConsumed] = useState<FlowConsumedDTO[]>([]);
  
  useEffect(() => {
    const date = new Date().toISOString().split('T')[0];
    Promise.all([
      FlowService.getProducedByDate(date),
      FlowService.getTransportedByDate(date),
      FlowService.getConsumedByDate(date)
    ]).then(([p, t, c]) => {
      setProduced(p);
      setTransported(t);
      setConsumed(c);
    });
  }, []);
  
  const totalProduced = produced.reduce((sum, p) => sum + (p.volumeProduced || 0), 0);
  const totalTransported = transported.reduce((sum, t) => sum + (t.volumeTransported || 0), 0);
  const totalConsumed = consumed.reduce((sum, c) => sum + (c.volumeConsumed || 0), 0);
  const balance = totalProduced - totalTransported - totalConsumed;
  
  return (
    <div>
      <h2>Daily Flow Balance</h2>
      <div>Production: {totalProduced.toLocaleString()} m³</div>
      <div>Transportation: {totalTransported.toLocaleString()} m³</div>
      <div>Consumption: {totalConsumed.toLocaleString()} m³</div>
      <div style={{ fontWeight: 'bold' }}>
        Balance: {balance.toLocaleString()} m³
        {balance > 0 ? ' (Storage +)' : balance < 0 ? ' (Storage -)' : ' (Balanced)'}
      </div>
    </div>
  );
};
```

---

## Frontend Files

### **New Files Created:**

9. **[FlowProducedDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/flow/dto/FlowProducedDTO.ts)** - Production tracking
10. **[FlowConsumedDTO.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/flow/dto/FlowConsumedDTO.ts)** - Consumption tracking

### **Updated Files:**

- **[index.ts](https://github.com/CHOUABBIA-AMINE/HyFloWEB/blob/main/src/modules/network/flow/dto/index.ts)** - Updated barrel export

**Latest Commits:**
- [27624ee](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/27624eedd374eb0221c8dddbc490b6bcb5bb98ce) - Added FlowConsumedDTO and FlowProducedDTO
- [302e4e3](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/302e4e32dd9f422053aee31a033b5a82e353a498) - Updated index.ts barrel export

---

## Backend Alignment

### **Alignment Status:** ✅ 100%

All 9 Flow DTOs are now fully aligned with backend:
- ✅ All fields present
- ✅ All validations match
- ✅ All relationships defined
- ✅ All types correct
- ✅ All optional/required flags match
- ✅ Complete flow tracking system (Production → Transportation → Consumption)

---

## Summary

### **Network Flow DTOs: 9/9 Complete ✅**

**Total DTOs: 9**

**Measurement DTOs (5):**
1. MeasurementHourDTO - Time slots
2. FlowVolumeDTO - Hourly volume
3. FlowPressureDTO - Hourly pressure
4. **FlowProducedDTO** - Daily production (fields) **NEW**
5. FlowTransportedDTO - Daily transportation (pipelines)
6. **FlowConsumedDTO** - Daily consumption (terminals) **NEW**

**Dashboard DTOs (3):**
7. DailyTrendDTO - Historical trends
8. PipelineStatusDTO - Real-time status
9. DashboardSummaryDTO - System summary

**New Features:**
- ✅ **Complete flow tracking** - Production → Transportation → Consumption
- ✅ **Balance analysis** - Track flow through entire system
- ✅ **Field performance** - Production tracking
- ✅ **Terminal performance** - Consumption tracking
- ✅ **100% backend alignment** - All 9 DTOs synchronized

**Update Date:** January 7, 2026, 1:25 PM CET  
**Status:** ✅ 2 New DTOs Added (9 total)  
**Complete Flow System:** Production → Transportation → Consumption
