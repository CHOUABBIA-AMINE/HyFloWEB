/**
 * Notification Badge Component
 * Displays unread notification count with popover for notification list
 * Only visible for VALIDATOR users with active WebSocket connection
 * 
 * @author CHOUABBIA Amine
 * @created 02-01-2026
 */

import { useState } from 'react';
import {
  IconButton,
  Badge,
  Tooltip,
  Popover,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNotifications } from '@/shared/context';
import { useNavigate } from 'react-router-dom';
import type { NotificationDTO } from '@/types/notification.types';

/**
 * Notification Badge with Popover
 * Shows:
 * - Badge with unread count
 * - Connection status indicator
 * - Notification list in popover
 * - Mark as read / Clear actions
 */
const NotificationBadge = () => {
  const { notifications, unreadCount, wsStatus, markAsRead, markAllAsRead, clear } =
    useNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();

  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  /**
   * Handle notification click
   * Marks as read and navigates to related entity if applicable
   */
  const handleClickNotification = (n: NotificationDTO) => {
    if (n.id) {
      markAsRead(n.id);
    }

    // Navigate based on related entity type
    if (n.relatedEntityType && n.relatedEntityId) {
      switch (n.relatedEntityType.toUpperCase()) {
        case 'READING':
          navigate(`/flow/readings/${n.relatedEntityId}/validate`);
          break;
        case 'OPERATION':
          navigate(`/flow/operations/${n.relatedEntityId}`);
          break;
        case 'INCIDENT':
          navigate(`/flow/incidents/${n.relatedEntityId}`);
          break;
        default:
          console.log('Unknown entity type:', n.relatedEntityType);
      }
      handleClose();
    }
  };

  /**
   * Get severity color for chip
   */
  const getSeverityColor = (severity?: string): 'default' | 'error' | 'warning' | 'info' => {
    switch (severity?.toUpperCase()) {
      case 'URGENT':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'NORMAL':
        return 'info';
      default:
        return 'default';
    }
  };

  /**
   * Format date relative to now
   */
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  /**
   * Get tooltip text based on connection status
   */
  const getTooltipText = (): string => {
    if (wsStatus.connected) {
      return unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications';
    }
    if (wsStatus.reconnecting) {
      return 'Reconnecting to notification server...';
    }
    return 'Notifications (disconnected)';
  };

  return (
    <>
      <Tooltip title={getTooltipText()}>
        <IconButton color="inherit" onClick={handleOpen} sx={{ ml: 1 }}>
          <Badge color="error" badgeContent={unreadCount} max={99}>
            {wsStatus.connected ? (
              <NotificationsIcon />
            ) : (
              <NotificationsOffIcon color="disabled" />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
            mt: 1.5,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">Notifications</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {wsStatus.reconnecting && (
              <Tooltip title="Reconnecting...">
                <CircularProgress size={16} />
              </Tooltip>
            )}
            {wsStatus.error && !wsStatus.reconnecting && (
              <Chip size="small" color="warning" label={wsStatus.error} />
            )}
          </Box>
        </Box>
        
        <Divider />

        {/* Actions */}
        {notifications.length > 0 && (
          <>
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {unreadCount > 0 && (
                <Button size="small" startIcon={<CheckIcon />} onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  clear();
                  handleClose();
                }}
              >
                Clear
              </Button>
            </Box>
            <Divider />
          </>
        )}

        {/* Notification List */}
        <List dense sx={{ maxHeight: 380, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((n, index) => (
              <ListItemButton
                key={String(n.id ?? `notif-${index}`)}
                onClick={() => handleClickNotification(n)}
                sx={{
                  alignItems: 'flex-start',
                  bgcolor: n.isRead ? 'transparent' : 'action.hover',
                  '&:hover': {
                    bgcolor: n.isRead ? 'action.hover' : 'action.selected',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: n.isRead ? 400 : 600,
                          flex: 1,
                        }}
                      >
                        {n.title}
                      </Typography>
                      {n.type?.severity && (
                        <Chip
                          label={n.type.severity}
                          color={getSeverityColor(n.type.severity)}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {n.message}
                      </Typography>
                      {n.createdAt && (
                        <Typography variant="caption" color="text.disabled">
                          {formatDate(n.createdAt)}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationBadge;
