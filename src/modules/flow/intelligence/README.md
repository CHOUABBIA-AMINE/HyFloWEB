# Flow Intelligence Module

## Overview

The Flow Intelligence module provides real-time operational intelligence and monitoring for pipeline infrastructure. It delivers comprehensive dashboard views with typed data access using KeyMetricsDTO.

---

## 📁 Module Structure

```
src/modules/flow/intelligence/
├── components/
│   └── PipelineDashboardExample.tsx    # Example implementation
├── dto/
│   ├── KeyMetricsDTO.ts                # Typed metrics interface
│   ├── PipelineHealthDTO.ts            # Health status types
│   ├── PipelineDynamicDashboardDTO.ts  # Main dashboard interface
│   └── index.ts                        # DTO exports
├── hooks/
│   ├── usePipelineDashboard.ts         # React Query hook
│   └── index.ts                        # Hook exports
├── pages/
│   ├── PipelineDashboardPage.tsx       # Full dashboard page
│   └── index.ts                        # Page exports
├── services/
│   ├── PipelineIntelligenceService.ts  # API client
│   └── index.ts                        # Service exports
├── index.ts                            # Module exports
└── README.md                           # This file
```

---

## 📍 Routes

### Dashboard Route

**URL Pattern:** `/flow/intelligence/pipeline/:pipelineId/dashboard`

**Example URLs:**
- `/flow/intelligence/pipeline/1/dashboard`
- `/flow/intelligence/pipeline/42/dashboard`

**Access:**
- Protected route (requires authentication)
- Accessible from pipeline map
- Direct URL navigation supported

---

## 🗺️ Navigation from Map

### Method 1: Programmatic Navigation (Recommended)

```typescript
import { useNavigate } from 'react-router-dom';

// In your map component
const navigate = useNavigate();

const handlePipelineClick = (pipelineId: number) => {
  navigate(`/flow/intelligence/pipeline/${pipelineId}/dashboard`);
};

// Usage in map event handler
<PipelineFeature onClick={() => handlePipelineClick(pipeline.id)} />
```

### Method 2: Link Component

```typescript
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

<Button
  component={Link}
  to={`/flow/intelligence/pipeline/${pipelineId}/dashboard`}
  variant="contained"
>
  View Dashboard
</Button>
```

### Method 3: Popup/Modal Navigation

```typescript
import { IconButton } from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';

// In map popup/tooltip
<Popup>
  <h3>{pipeline.name}</h3>
  <IconButton
    onClick={() => navigate(`/flow/intelligence/pipeline/${pipeline.id}/dashboard`)}
  >
    <DashboardIcon />
  </IconButton>
</Popup>
```

---

## 👨‍💻 Usage Examples

### Basic Page Usage

```typescript
import { PipelineDashboardPage } from '@/modules/flow/intelligence/pages';

// In App.tsx or routing configuration
<Route
  path="/flow/intelligence/pipeline/:pipelineId/dashboard"
  element={
    <ProtectedRoute>
      <PipelineDashboardPage />
    </ProtectedRoute>
  }
/>
```

### Hook Usage in Custom Component

```typescript
import { usePipelineDashboard } from '@/modules/flow/intelligence/hooks';

function MyDashboard({ pipelineId }: { pipelineId: number }) {
  const { dashboard, isLoading, error, refresh, hasMetrics } = 
    usePipelineDashboard(pipelineId, {
      autoRefresh: true,
      refreshInterval: 30000, // 30 seconds
    });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorAlert error={error} />;
  if (!dashboard) return <NoData />;

  // ✅ Type-safe metric access
  const { keyMetrics } = dashboard;

  return (
    <div>
      <h2>{dashboard.pipelineName}</h2>
      <MetricDisplay
        pressure={keyMetrics?.pressure}
        temperature={keyMetrics?.temperature}
        flowRate={keyMetrics?.flowRate}
      />
    </div>
  );
}
```

### Direct API Service Usage

```typescript
import { PipelineIntelligenceService } from '@/modules/flow/intelligence/services';

// Fetch dashboard data
const dashboard = await PipelineIntelligenceService.getDashboard(pipelineId);

// Get health only
const health = await PipelineIntelligenceService.getPipelineHealth(pipelineId);

// Force refresh (bypass cache)
const fresh = await PipelineIntelligenceService.refreshDashboard(pipelineId);

// Check if metrics available
const hasMetrics = PipelineIntelligenceService.hasKeyMetrics(dashboard);

// Get UI color for status
const color = PipelineIntelligenceService.getHealthStatusColor('HEALTHY');
```

---

## 📦 Type Definitions

### KeyMetricsDTO

```typescript
interface KeyMetricsDTO {
  pressure?: number;          // bar
  temperature?: number;       // °C
  flowRate?: number;          // m³/h
  containedVolume?: number;   // m³
}
```

### PipelineDynamicDashboardDTO

```typescript
interface PipelineDynamicDashboardDTO {
  // Identification
  pipelineId: number;
  pipelineName: string;

  // Current Reading
  latestReading?: FlowReadingDTO;
  keyMetrics?: KeyMetricsDTO;  // ✅ Typed metrics

  // Health Indicators
  overallHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
  healthScore: number; // 0-100
  activeAlertsCount: number;
  criticalAlertsCount: number;
  warningAlertsCount: number;

  // 24-Hour Statistics
  avgPressureLast24h?: number;
  avgTemperatureLast24h?: number;
  avgFlowRateLast24h?: number;
  throughputLast24h?: number;

  // Recent Activity
  eventsLast7Days: number;
  operationsLast7Days: number;

  // Status Indicators
  pressureStatus: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL';
  temperatureStatus: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL';
  flowRateStatus: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL';

  // Sensor Coverage
  sensorOnlinePercent: number;
  onlineSensors: number;
  totalSensors: number;

  // Data Quality
  dataCompletenessPercent: number;
  validatedReadingsToday: number;
  pendingReadingsToday: number;
}
```

---

## ⚙️ Configuration

### Auto-Refresh Settings

```typescript
// Default: 30 seconds (matches backend cache)
const { dashboard } = usePipelineDashboard(pipelineId, {
  autoRefresh: true,
  refreshInterval: 30000,
  enabled: true,
});

// Disable auto-refresh
const { dashboard } = usePipelineDashboard(pipelineId, {
  autoRefresh: false,
});

// Custom interval
const { dashboard } = usePipelineDashboard(pipelineId, {
  autoRefresh: true,
  refreshInterval: 60000, // 1 minute
});
```

### Backend Endpoint

```typescript
// Configured in PipelineIntelligenceService
const BASE_URL = '/flow/intelligence/pipeline';

// Full endpoint:
// GET /flow/intelligence/pipeline/{pipelineId}/dashboard
```

---

## 🔍 Best Practices

### 1. Always Use Hooks

✅ **GOOD:**
```typescript
const { dashboard, isLoading, error } = usePipelineDashboard(pipelineId);
```

❌ **BAD:**
```typescript
// Don't fetch directly in components
const [dashboard, setDashboard] = useState();
useEffect(() => {
  fetch(`/api/...`).then(...);
}, []);
```

### 2. Type-Safe Metric Access

✅ **GOOD:**
```typescript
const metrics: KeyMetricsDTO | undefined = dashboard?.keyMetrics;
const pressure = metrics?.pressure; // number | undefined
```

❌ **BAD:**
```typescript
const pressure = dashboard?.keyMetrics?.["pressure"]; // any type
```

### 3. Handle Loading States

✅ **GOOD:**
```typescript
if (isLoading) return <Skeleton />;
if (error) return <ErrorAlert error={error} />;
if (!dashboard) return <NoData />;

return <DashboardView data={dashboard} />;
```

### 4. Use Helper Functions

✅ **GOOD:**
```typescript
const color = PipelineIntelligenceService.getHealthStatusColor(status);
const hasData = PipelineIntelligenceService.hasKeyMetrics(dashboard);
```

---

## 🐞 Troubleshooting

### Issue: "Cannot read property of undefined"

**Solution:** Always use optional chaining
```typescript
dashboard?.keyMetrics?.pressure  // ✅
dashboard.keyMetrics.pressure    // ❌
```

### Issue: "Hook returns stale data"

**Solution:** Check auto-refresh configuration
```typescript
const { dashboard, isRefetching } = usePipelineDashboard(pipelineId, {
  autoRefresh: true,  // Enable auto-refresh
  refreshInterval: 30000,
});
```

### Issue: "Route not working"

**Solution:** Verify route configuration in App.tsx
```typescript
// Must be inside <Route path="flow"> block
<Route path="intelligence">
  <Route path="pipeline/:pipelineId/dashboard" element={<PipelineDashboardPage />} />
</Route>
```

### Issue: "TypeScript errors on metrics"

**Solution:** Import types correctly
```typescript
import type { KeyMetricsDTO, PipelineDynamicDashboardDTO } from '@/modules/flow/intelligence/dto';
```

---

## 📡 API Endpoints

### Get Dashboard

**Endpoint:** `GET /flow/intelligence/pipeline/{pipelineId}/dashboard`

**Response:**
```json
{
  "pipelineId": 1,
  "pipelineName": "GT-2023-A",
  "keyMetrics": {
    "pressure": 45.2,
    "temperature": 42.0,
    "flowRate": 1250.5,
    "containedVolume": 520.8
  },
  "overallHealth": "HEALTHY",
  "healthScore": 92.5,
  ...
}
```

**Cache:** 30 seconds (backend configured)

---

## 📄 Related Documentation

- [Backend API Documentation](../../../../../../../HyFloAPI/README.md)
- [KeyMetricsDTO Backend](../../../../../../../HyFloAPI/src/main/java/dz/sh/trc/hyflo/flow/intelligence/dto/KeyMetricsDTO.java)
- [PipelineIntelligenceService Backend](../../../../../../../HyFloAPI/src/main/java/dz/sh/trc/hyflo/flow/intelligence/service/PipelineIntelligenceService.java)

---

## 🚀 Quick Start

### 1. Navigate from Map

```typescript
// In your map component
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

const handlePipelineClick = (pipelineId: number) => {
  navigate(`/flow/intelligence/pipeline/${pipelineId}/dashboard`);
};
```

### 2. Use in Component

```typescript
import { usePipelineDashboard } from '@/modules/flow/intelligence/hooks';

function MyComponent({ pipelineId }) {
  const { dashboard, isLoading } = usePipelineDashboard(pipelineId);
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{dashboard?.pipelineName}</div>;
}
```

### 3. Access Typed Metrics

```typescript
const metrics = dashboard?.keyMetrics;

// TypeScript knows these are numbers
console.log(metrics?.pressure);      // number | undefined
console.log(metrics?.temperature);   // number | undefined
console.log(metrics?.flowRate);      // number | undefined
```

---

## ✨ Features

- ✅ **Type Safety:** Full TypeScript support with KeyMetricsDTO
- ✅ **Auto-Refresh:** 30-second polling (configurable)
- ✅ **React Query:** Automatic caching and background updates
- ✅ **Error Handling:** Built-in loading and error states
- ✅ **MUI Components:** Material-UI integration
- ✅ **Responsive:** Mobile-friendly layout
- ✅ **Real-time:** Live operational metrics
- ✅ **Navigation:** Seamless map integration

---

## 👥 Support

For issues or questions:
1. Check this README
2. Review example components
3. Check TypeScript errors
4. Verify route configuration
5. Test with direct URL

---

**Last Updated:** 02-14-2026  
**Author:** CHOUABBIA Amine
