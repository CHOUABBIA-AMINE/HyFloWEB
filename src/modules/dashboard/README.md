# Flow Monitoring Dashboard - Frontend Module

## Overview

Complete React TypeScript dashboard module for flow monitoring with real-time pipeline data visualization.

## Directory Structure

```
src/modules/dashboard/
├── components/           # React components
│   ├── InfrastructureKPIs.tsx
│   ├── TodaysSummary.tsx
│   ├── VarianceAnalysis.tsx
│   ├── PipelineStatusTable.tsx
│   ├── VolumeComparisonChart.tsx
│   ├── PressureTrendChart.tsx
│   └── MonthlyOverview.tsx
├── hooks/               # Custom React hooks
│   ├── useDashboardData.ts
│   ├── usePipelineStatuses.ts
│   └── useTrendData.ts
├── pages/               # Page components
│   └── DashboardPage.tsx
├── services/            # API services
│   └── dashboardService.ts
├── types/               # TypeScript types
│   └── dashboard.types.ts
├── utils/               # Utility functions
│   └── formatters.ts
├── index.ts             # Module exports
└── README.md            # This file
```

## Features

### 📊 Components

1. **InfrastructureKPIs** - Top-level count cards
   - Stations, Terminals, Fields, Pipelines
   - Icon-based visual representation

2. **TodaysSummary** - Current day metrics
   - Total volume and pressure
   - Active pipelines count
   - Reading completion status
   - Transported vs Estimated comparison

3. **VarianceAnalysis** - Status breakdown
   - On Target (±5%)
   - Below Target (< -5%)
   - Above Target (> +5%)
   - Offline (no data)

4. **PipelineStatusTable** - Interactive data table
   - Sortable columns
   - Search functionality
   - Color-coded status chips
   - Real-time pipeline metrics

5. **VolumeComparisonChart** - Bar chart
   - 7-day transported vs estimated
   - Interactive tooltips
   - Responsive design

6. **PressureTrendChart** - Line chart
   - 7-day pressure trends
   - Min/max reference lines
   - Normal range indicators

7. **MonthlyOverview** - MTD summary
   - Month-to-date totals
   - Variance analysis
   - Days on target percentage

### 🪠 Custom Hooks

**useDashboardData**
```typescript
const { data, loading, error, refetch } = useDashboardData();
```
- Auto-refreshes every 5 minutes
- Returns dashboard summary

**usePipelineStatuses**
```typescript
const { data, loading, error, refetch } = usePipelineStatuses({ 
  date: '2025-12-27',
  autoRefresh: true 
});
```
- Fetches all pipeline statuses
- Optional date parameter
- Auto-refresh configurable

**useTrendData**
```typescript
const { data, loading, error, refetch } = useTrendData({ 
  days: 7,
  startDate: '2025-12-20',
  endDate: '2025-12-27'
});
```
- Fetches daily trends
- Default: last 7 days
- Date range configurable

### 🔧 Utilities

**Formatters**
- `formatNumber(num, decimals)` - Format numbers with localization
- `formatVolume(volume)` - Format as "X,XXX m³"
- `formatPressure(pressure)` - Format as "XX.X bar"
- `formatPercentage(percent)` - Format as "XX.XX%"
- `formatDate(dateString)` - Format ISO date to readable
- `formatTime(timeString)` - Format time string
- `getVolumeStatusColor(status)` - Get color for volume status
- `getPressureStatusColor(status)` - Get color for pressure status
- `getStatusLabel(status)` - Get human-readable status label

## Installation

### Prerequisites

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install recharts
npm install axios
```

### Configuration

Update `src/config/axios.ts` with your backend URL:

```typescript
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/iaas/api',
  timeout: 10000,
});
```

## Usage

### Basic Usage

```typescript
import { DashboardPage } from './modules/dashboard';

function App() {
  return <DashboardPage />;
}
```

### Using Individual Components

```typescript
import { 
  InfrastructureKPIs,
  TodaysSummary,
  PipelineStatusTable,
  useDashboardData,
  usePipelineStatuses
} from './modules/dashboard';

function CustomDashboard() {
  const { data: summary } = useDashboardData();
  const { data: pipelines } = usePipelineStatuses();

  return (
    <div>
      {summary && <InfrastructureKPIs data={summary} />}
      {summary && <TodaysSummary data={summary} />}
      {pipelines && <PipelineStatusTable data={pipelines} />}
    </div>
  );
}
```

### Using Services Directly

```typescript
import { dashboardService } from './modules/dashboard';

// Fetch dashboard summary
const summary = await dashboardService.getSummary();

// Fetch pipeline statuses for specific date
const statuses = await dashboardService.getPipelineStatuses('2025-12-27');

// Fetch trends
const trends = await dashboardService.getTrends('2025-12-20', '2025-12-27');
```

## API Endpoints

The dashboard connects to these backend endpoints:

```
GET /network/flow/dashboard/summary
GET /network/flow/dashboard/pipelines?date=yyyy-MM-dd
GET /network/flow/dashboard/pipeline/{id}?date=yyyy-MM-dd
GET /network/flow/dashboard/trends?startDate=yyyy-MM-dd&endDate=yyyy-MM-dd
```

## Routing

Add to your router configuration:

```typescript
import { DashboardPage } from './modules/dashboard';

const routes = [
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
];
```

## Styling

The dashboard uses Material-UI (MUI) components with custom styling:

- **Theme**: Material-UI default theme
- **Colors**: 
  - On Target: `#4caf50` (green)
  - Below Target: `#f44336` (red)
  - Above Target: `#ff9800` (orange)
  - Offline: `#9e9e9e` (gray)
  - Normal Pressure: `#4caf50` (green)
  - Low Pressure: `#2196f3` (blue)
  - High Pressure: `#f44336` (red)

## Performance

- **Auto-refresh**: 5-minute intervals
- **Debounced search**: Table search optimized
- **Memoized sorting**: Table sorting cached
- **Lazy loading**: Charts loaded on demand

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### CORS Issues

Ensure backend has CORS enabled:
```java
@CrossOrigin(origins = "*")
```

### Data Not Loading

1. Check backend is running on `http://localhost:8080`
2. Verify API endpoints are accessible
3. Check browser console for errors
4. Verify axios baseURL in `src/config/axios.ts`

### Charts Not Rendering

Ensure recharts is installed:
```bash
npm install recharts
```

## Development

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

### Development Server

```bash
npm run dev
```

## Future Enhancements

- [ ] Export to PDF/Excel
- [ ] Custom date range picker
- [ ] Real-time WebSocket updates
- [ ] Advanced filtering options
- [ ] Pipeline drill-down view
- [ ] Alert notifications
- [ ] Dark mode support
- [ ] Mobile-responsive improvements

## License

Private - IAAS Project

## Author

CHOUABBIA Amine

---

**Last Updated**: December 27, 2025
