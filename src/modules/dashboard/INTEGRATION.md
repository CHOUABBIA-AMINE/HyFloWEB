# Dashboard Integration Guide

## Backend-Frontend Integration

This guide explains how the frontend dashboard connects to the Spring Boot backend.

## API Endpoints Mapping

### 1. Dashboard Summary

**Backend**
```java
@GetMapping("/summary")
public ResponseEntity<DashboardSummaryDTO> getDashboardSummary()
```

**Frontend**
```typescript
await dashboardService.getSummary();
// Returns: DashboardSummary
```

**Data Flow**:
```
Backend DTO (DashboardSummaryDTO) 
  → JSON Response 
  → Axios 
  → TypeScript Interface (DashboardSummary)
  → React Components
```

### 2. Pipeline Statuses

**Backend**
```java
@GetMapping("/pipelines")
public ResponseEntity<List<PipelineStatusDTO>> getPipelineStatuses(
    @RequestParam(required = false) LocalDate date)
```

**Frontend**
```typescript
await dashboardService.getPipelineStatuses('2025-12-27');
// Returns: PipelineStatus[]
```

### 3. Daily Trends

**Backend**
```java
@GetMapping("/trends")
public ResponseEntity<List<DailyTrendDTO>> getDailyTrends(
    @RequestParam(required = false) LocalDate startDate,
    @RequestParam(required = false) LocalDate endDate)
```

**Frontend**
```typescript
await dashboardService.getTrends('2025-12-20', '2025-12-27');
// Returns: DailyTrend[]
```

## Type Matching

### DashboardSummary ↔ DashboardSummaryDTO

**Backend (Java)**
```java
public class DashboardSummaryDTO {
    private Long totalStations;
    private Long totalTerminals;
    private Double totalVolumeToday;
    // ...
}
```

**Frontend (TypeScript)**
```typescript
interface DashboardSummary {
  totalStations: number;
  totalTerminals: number;
  totalVolumeToday: number;
  // ...
}
```

### PipelineStatus ↔ PipelineStatusDTO

**Backend (Java)**
```java
public class PipelineStatusDTO {
    private Long pipelineId;
    private String pipelineName;
    private Double dailyVolumeTransported;
    private String volumeStatus; // "ON_TARGET", "BELOW_TARGET", etc.
    // ...
}
```

**Frontend (TypeScript)**
```typescript
interface PipelineStatus {
  pipelineId: number;
  pipelineName: string;
  dailyVolumeTransported: number;
  volumeStatus: 'ON_TARGET' | 'BELOW_TARGET' | 'ABOVE_TARGET' | 'OFFLINE';
  // ...
}
```

## Data Flow Architecture

```
┌─────────────────────────────┐
│  React Component (UI)      │
│  - DashboardPage           │
└─────────┬────────────────────┘
         │
         ↓
┌─────────┴────────────────────┐
│  Custom Hook                │
│  - useDashboardData()       │
└─────────┬────────────────────┘
         │
         ↓
┌─────────┴────────────────────┐
│  Service Layer              │
│  - dashboardService         │
└─────────┬────────────────────┘
         │
         ↓
┌─────────┴────────────────────┐
│  Axios Instance             │
│  - HTTP Client              │
└─────────┬────────────────────┘
         │
         ↓ HTTP Request
┌─────────┴────────────────────┐
│  Spring Boot Backend        │
│  - DashboardController      │
│  - DashboardService         │
│  - Repositories             │
└──────────────────────────────┘
```

## Request/Response Examples

### Example 1: Get Dashboard Summary

**Request**
```http
GET http://localhost:8080/iaas/api/network/flow/dashboard/summary
Content-Type: application/json
```

**Response**
```json
{
  "totalStations": 5,
  "totalTerminals": 8,
  "totalFields": 12,
  "totalPipelines": 15,
  "currentDate": "2025-12-27",
  "totalVolumeToday": 125000.50,
  "averagePressureToday": 65.8,
  "activePipelines": 14,
  "totalReadingsToday": 84,
  "expectedReadingsToday": 90,
  "totalTransportedToday": 125000.50,
  "totalEstimatedToday": 120000.00,
  "varianceToday": 5000.50,
  "variancePercentToday": 4.17,
  "pipelinesOnTarget": 10,
  "pipelinesBelowTarget": 2,
  "pipelinesAboveTarget": 2,
  "pipelinesOffline": 1,
  "lastReadingTime": "20:00",
  "nextReadingTime": "00:00",
  "currentDayOfMonth": 27,
  "monthlyTotalTransported": 3375013.50,
  "monthlyTotalEstimated": 3240000.00,
  "monthlyVariance": 135013.50,
  "monthlyVariancePercent": 4.17,
  "daysOnTargetThisMonth": 22
}
```

### Example 2: Get Pipeline Statuses

**Request**
```http
GET http://localhost:8080/iaas/api/network/flow/dashboard/pipelines?date=2025-12-27
Content-Type: application/json
```

**Response**
```json
[
  {
    "pipelineId": 1,
    "pipelineCode": "PL-001",
    "pipelineName": "Main Supply Line A",
    "measurementDate": "2025-12-27",
    "lastReadingTime": "20:00",
    "lastVolume": 2500.75,
    "lastPressure": 65.5,
    "dailyVolumeTransported": 15000.50,
    "dailyVolumeEstimated": 14500.00,
    "dailyVariance": 500.50,
    "dailyVariancePercent": 3.45,
    "dailyProgress": 103.45,
    "averagePressureToday": 64.8,
    "minPressureToday": 62.0,
    "maxPressureToday": 67.5,
    "volumeStatus": "ON_TARGET",
    "pressureStatus": "NORMAL",
    "readingsCompletedToday": 6,
    "readingsExpectedToday": 6
  }
]
```

## Error Handling

### Backend Error Response

```java
@ExceptionHandler(RuntimeException.class)
public ResponseEntity<?> handleException(RuntimeException e) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new ErrorResponse(e.getMessage()));
}
```

### Frontend Error Handling

```typescript
try {
  const data = await dashboardService.getSummary();
  setData(data);
} catch (err) {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 404) {
      setError('Data not found');
    } else if (err.response?.status === 500) {
      setError('Server error');
    } else {
      setError('Network error');
    }
  }
}
```

## Testing Integration

### 1. Test Backend Endpoints

```bash
# Test summary endpoint
curl http://localhost:8080/iaas/api/network/flow/dashboard/summary

# Test pipelines endpoint
curl http://localhost:8080/iaas/api/network/flow/dashboard/pipelines

# Test trends endpoint
curl "http://localhost:8080/iaas/api/network/flow/dashboard/trends?startDate=2025-12-20&endDate=2025-12-27"
```

### 2. Test Frontend Service

```typescript
// In browser console
import dashboardService from './modules/dashboard/services/dashboardService';

// Test summary
const summary = await dashboardService.getSummary();
console.log(summary);

// Test pipelines
const pipelines = await dashboardService.getPipelineStatuses();
console.log(pipelines);
```

## CORS Configuration

### Backend (Spring Boot)

```java
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/network/flow/dashboard")
public class DashboardController {
    // ...
}
```

### Or Global CORS Config

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/iaas/api/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*");
    }
}
```

## Environment Configuration

### Development

```typescript
// .env.development
VITE_API_BASE_URL=http://localhost:8080/iaas/api
```

### Production

```typescript
// .env.production
VITE_API_BASE_URL=https://api.yourdomain.com/iaas/api
```

### Update axios.ts

```typescript
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});
```

## Monitoring Integration

### Add Request Logging

```typescript
axiosInstance.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[API] Response:`, response.status);
    return response;
  },
  (error) => {
    console.error(`[API] Error:`, error.response?.status, error.message);
    return Promise.reject(error);
  }
);
```

## Best Practices

1. **Type Safety**: Always match TypeScript interfaces with Java DTOs
2. **Error Handling**: Handle all HTTP error codes appropriately
3. **Loading States**: Show loading indicators during API calls
4. **Auto-Refresh**: Use reasonable intervals (5 minutes default)
5. **Caching**: Consider implementing response caching for static data
6. **Validation**: Validate data before rendering
7. **Security**: Never expose sensitive data in frontend code

---

**Integration Complete!** Frontend and backend are now fully connected. ✅
