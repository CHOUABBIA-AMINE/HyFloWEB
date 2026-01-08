/**
 * Shared Module Barrel Exports
 * Central export point for shared resources across the application
 * 
 * @author CHOUABBIA Amine
 * @updated 01-08-2026 - Fixed to export only existing modules
 */

// Shared components (UI components, layouts, etc.)
export * from './components';

// Shared utilities (helper functions, formatters, etc.)
export * from './utils';

// Configuration (API, environment, etc.)
export * from './config';

// React context providers (auth, theme, etc.)
export * from './context';

// Internationalization (i18n setup)
export * from './i18n';
