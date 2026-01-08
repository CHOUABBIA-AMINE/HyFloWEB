/// <reference types="vite/client" />

/**
 * Vite Environment Variables Type Definitions
 * Defines types for import.meta.env to enable TypeScript support
 * 
 * @author CHOUABBIA Amine
 * @created 01-08-2026
 */

interface ImportMetaEnv {
  /** Base URL for API requests */
  readonly VITE_API_BASE_URL: string;
  
  /** Application environment (development, production, etc.) */
  readonly MODE: string;
  
  /** Whether the app is running in development mode */
  readonly DEV: boolean;
  
  /** Whether the app is running in production mode */
  readonly PROD: boolean;
  
  /** Whether the app is running in SSR mode */
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
