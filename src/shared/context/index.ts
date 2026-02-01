/**
 * Shared Context Barrel Export
 * 
 * @author CHOUABBIA Amine
 * @created 01-08-2026
 * @updated 02-01-2026
 */

// Authentication context
export { AuthProvider, useAuth } from './AuthContext';

// Notification context for real-time WebSocket notifications
export { NotificationProvider, useNotifications } from './NotificationContext';
