/**
 * API Client - Barrel Export
 * 
 * Re-exports the configured axios instance as 'apiClient'
 * to support @/lib/api-client import path used across services.
 * 
 * @author CHOUABBIA Amine
 * @created 01-07-2026
 */

import axiosInstance from '../shared/config/axios';

// Export as named export 'apiClient' to match service imports
export const apiClient = axiosInstance;

// Also export as default for flexibility
export default axiosInstance;
