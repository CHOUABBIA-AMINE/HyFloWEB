/**
 * Dashboard Module - Main Export
 * 
 * Centralized exports for dashboard module
 */

// Types
export * from './types/dashboard.types';

// Services
export { default as dashboardService } from './services/dashboardService';

// Hooks
export { useDashboardData } from './hooks/useDashboardData';
export { usePipelineStatuses } from './hooks/usePipelineStatuses';
export { useTrendData } from './hooks/useTrendData';

// Components
export { default as InfrastructureKPIs } from './components/InfrastructureKPIs';
export { default as TodaysSummary } from './components/TodaysSummary';
export { default as VarianceAnalysis } from './components/VarianceAnalysis';
export { default as PipelineStatusTable } from './components/PipelineStatusTable';
export { default as VolumeComparisonChart } from './components/VolumeComparisonChart';
export { default as PressureTrendChart } from './components/PressureTrendChart';
export { default as MonthlyOverview } from './components/MonthlyOverview';

// Pages
export { default as DashboardPage } from './pages/DashboardPage';

// Utils
export * from './utils/formatters';
