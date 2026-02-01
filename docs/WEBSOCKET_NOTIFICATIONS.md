# WebSocket Real-Time Notifications - Implementation Guide

## Overview

This document describes the complete WebSocket notification system implemented in HyFloWEB, integrated with the HyFloAPI backend.

**Implementation Date**: February 1, 2026  
**Author**: CHOUABBIA Amine

---

## Architecture

### Backend (HyFloAPI)

#### WebSocket Configuration
- **Endpoint**: `/ws` (SockJS enabled)
- **Protocol**: STOMP over SockJS
- **Authentication**: JWT via `Authorization: Bearer <token>` in STOMP CONNECT headers
- **Broker Configuration**:
  - Simple broker: `/topic`, `/queue`
  - Application prefix: `/app`
  - User destination prefix: `/user`
- **Allowed Origins**: Configured via `notification.websocket.allowed-origins` property

#### Notification Destinations

1. **User-specific notifications**:  
   `/user/{username}/queue/notifications` → `NotificationDTO`

2. **User-specific unread count**:  
   `/user/{username}/queue/notifications/count` → `Long`

3. **Broadcast (all users)**:  
   `/topic/notifications` → `NotificationDTO`

4. **Role-based**:  
   `/topic/notifications/{role}` → `NotificationDTO`

#### NotificationDTO Structure

```java
public class NotificationDTO {
    private String id;
    private String title;              // @NotBlank, @Size(max = 200)
    private String message;            // @NotBlank, @Size(max = 1000)
    private NotificationTypeDTO type;
    private String recipientUsername;
    private String relatedEntityId;     // E.g., Reading ID
    private String relatedEntityType;   // E.g., "READING", "OPERATION"
    private Boolean isRead;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime readAt;
}
```

### Frontend (HyFloWEB)

#### File Structure

```
src/
├── types/
│   └── notification.types.ts          # TypeScript interfaces
├── services/
│   └── WebSocketService.ts            # STOMP client wrapper
├── shared/
│   ├── context/
│   │   ├── NotificationContext.tsx    # State management
│   │   └── index.ts                   # Re-exports
│   └── components/
│       └── Layout/
│           ├── NotificationBadge.tsx  # UI component
│           └── Navbar.tsx             # Integration point
└── App.tsx                            # Provider setup
```

---

## Implementation Details

### 1. Dependencies

Added to `package.json`:

```json
{
  "dependencies": {
    "@stomp/stompjs": "^7.0.0",
    "sockjs-client": "^1.6.1"
  },
  "devDependencies": {
    "@types/sockjs-client": "^1.5.4"
  }
}
```

### 2. WebSocket Service

**File**: `src/services/WebSocketService.ts`

**Key Features**:
- Singleton pattern
- JWT authentication via STOMP connect headers
- Automatic reconnection with exponential backoff
- Subscribes to `/user/queue/notifications` and `/user/queue/notifications/count`
- SockJS transport for compatibility

**Connection Flow**:
1. Reads JWT from `localStorage.getItem('access_token')`
2. Constructs WebSocket URL from `VITE_API_BASE_URL`
3. Creates STOMP client with SockJS factory
4. Sends JWT in `Authorization` header on CONNECT
5. Backend `WebSocketAuthInterceptor` validates JWT
6. Subscribes to notification channels
7. Handles reconnection on disconnect

### 3. Notification Context

**File**: `src/shared/context/NotificationContext.tsx`

**Responsibilities**:
- Manages notification state (list, count, WS status)
- Connects/disconnects WebSocket based on auth + role
- Only connects for users with `ROLE_VALIDATOR` or `VALIDATOR` role
- Provides actions: `markAsRead`, `markAllAsRead`, `clear`
- Requests browser notification permission
- Shows browser notifications when WebSocket message arrives

**Hook Usage**:
```tsx
import { useNotifications } from '@/shared/context';

const { notifications, unreadCount, wsStatus, markAsRead } = useNotifications();
```

### 4. Notification Badge Component

**File**: `src/shared/components/Layout/NotificationBadge.tsx`

**Features**:
- Material UI Badge with unread count
- Connection status indicator (connected/disconnected/reconnecting)
- Popover with notification list
- Mark as read / Mark all read / Clear actions
- Relative time display ("2m ago", "1h ago")
- Severity chips (URGENT, HIGH, NORMAL, LOW)
- Navigation to related entities on click
- RTL support via Material UI theme

**Navigation Logic**:
- `READING` → `/flow/readings/{id}/validate`
- `OPERATION` → `/flow/operations/{id}`
- `INCIDENT` → `/flow/incidents/{id}`

### 5. Navbar Integration

**File**: `src/shared/components/Layout/Navbar.tsx`

**Changes**:
- Imported `NotificationBadge` component
- Added `isValidator` check using `user.roles`
- Conditionally renders badge:
  ```tsx
  {isAuthenticated && isValidator && <NotificationBadge />}
  ```
- Badge positioned before user avatar

### 6. App Integration

**File**: `src/App.tsx`

**Provider Hierarchy**:
```tsx
<AuthProvider>
  <NotificationProvider>
    <Router>
      {/* routes */}
    </Router>
  </NotificationProvider>
</AuthProvider>
```

**Why this order?**
- `NotificationProvider` needs access to `useAuth()` from `AuthProvider`
- `Router` needs notification context for navigation

---

## Security

### Authentication
- JWT sent in STOMP `CONNECT` headers (not query params)
- Backend `WebSocketAuthInterceptor` validates token
- Invalid/expired tokens reject connection

### Authorization
- Backend sends notifications only to authorized users
- Frontend shows badge only to `VALIDATOR` role
- Double-layer enforcement (UI + backend)

### CORS
- WebSocket origins restricted via backend config
- Default: `http://localhost:3000,http://localhost:4200`
- Update for Vite dev server: add `http://localhost:5173`

---

## Testing

### Prerequisites
1. Backend running on `http://localhost:8080`
2. Frontend running on `http://localhost:5173` (or configured port)
3. User account with `ROLE_VALIDATOR` role
4. Another user account for triggering events (e.g., Reader)

### Test Procedure

1. **Login as VALIDATOR**
   - Navigate to `/login`
   - Enter credentials
   - Verify badge appears in Navbar

2. **Check WebSocket Connection**
   - Open browser DevTools → Network → WS
   - Verify connection to `ws://localhost:8080/iaas/api/ws`
   - Check STOMP CONNECT frame with `Authorization` header
   - Verify CONNECTED response

3. **Trigger Notification**
   - Login as Reader in different browser/incognito
   - Submit a new Reading
   - Backend publishes `ReadingSubmittedEvent`
   - Listener sends notification to VALIDATOR users

4. **Verify Frontend**
   - Badge count increments
   - Browser notification appears (if permission granted)
   - Click badge → popover shows notification
   - Click notification → navigates to validation page
   - Mark as read → count decrements, notification grays out

5. **Test Reconnection**
   - Stop backend
   - Badge icon changes to `NotificationsOff`
   - Status shows "Reconnecting"
   - Restart backend
   - Connection re-establishes automatically
   - Badge returns to normal

6. **Test Role Restriction**
   - Logout VALIDATOR
   - Login as non-VALIDATOR user
   - Verify badge is not visible
   - Verify no WebSocket connection in DevTools

---

## Configuration

### Backend (application.properties)

```properties
# WebSocket Configuration
notification.websocket.allowed-origins=http://localhost:3000,http://localhost:4200,http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8080/iaas/api
```

WebSocket URL is automatically derived: `ws://localhost:8080/iaas/api/ws`

---

## Troubleshooting

### Badge Not Appearing
- **Check**: User has `ROLE_VALIDATOR` role
- **Verify**: `user.roles` in AuthContext includes "ROLE_VALIDATOR" or "VALIDATOR"
- **Fix**: Assign role in backend or login with correct user

### WebSocket Not Connecting
- **Check**: JWT token in `localStorage['access_token']`
- **Verify**: Token not expired
- **Check**: CORS allowed origins include frontend URL
- **Check**: Backend WebSocketConfig is active
- **Fix**: Re-login to get fresh token, update backend config

### Notifications Not Received
- **Check**: WebSocket connection established (DevTools → WS)
- **Verify**: Subscribed to `/user/queue/notifications`
- **Check**: Backend sends to correct username
- **Check**: Backend event listener is active
- **Debug**: Enable STOMP debug in `WebSocketService.ts`:
  ```ts
  debug: (msg) => console.log('[STOMP]', msg)
  ```

### STOMP Error on Connect
- **Error**: `Authentication failed`
  - **Cause**: Invalid/expired JWT
  - **Fix**: Re-login, check token format

- **Error**: `Connection refused`
  - **Cause**: Backend not running or wrong URL
  - **Fix**: Verify `VITE_API_BASE_URL`, start backend

### Reconnection Loop
- **Cause**: Invalid token persists across reconnects
- **Fix**: Clear `localStorage`, re-login
- **Check**: Max reconnect attempts (default: 10)

---

## Future Enhancements

### Persistence
- [ ] Add REST API to fetch notification history
- [ ] Persist read status to backend
- [ ] Sync unread count on page load

### Features
- [ ] Notification sound/audio alerts
- [ ] Notification preferences (opt-in/opt-out by type)
- [ ] Filter notifications by type/severity
- [ ] Pagination for notification list
- [ ] Mark multiple notifications as read
- [ ] Notification actions (approve/reject inline)

### Performance
- [ ] Limit notifications retained in memory (e.g., last 50)
- [ ] Lazy load notification details
- [ ] Debounce count updates

### UX
- [ ] Notification grouping by type/date
- [ ] Snackbar notifications for high-priority items
- [ ] Animations for new notifications
- [ ] Keyboard shortcuts (mark all read, clear)

---

## Related Files

### Backend (HyFloAPI)
- `src/main/java/dz/sh/trc/hyflo/configuration/WebSocketConfig.java`
- `src/main/java/dz/sh/trc/hyflo/configuration/WebSocketSecurityConfig.java`
- `src/main/java/dz/sh/trc/hyflo/configuration/websocket/WebSocketAuthInterceptor.java`
- `src/main/java/dz/sh/trc/hyflo/configuration/websocket/NotificationWebSocketService.java`
- `src/main/java/dz/sh/trc/hyflo/configuration/websocket/WebSocketEventListener.java`
- `src/main/java/dz/sh/trc/hyflo/system/notification/core/dto/NotificationDTO.java`

### Frontend (HyFloWEB)
- `package.json`
- `src/types/notification.types.ts`
- `src/services/WebSocketService.ts`
- `src/shared/context/NotificationContext.tsx`
- `src/shared/context/index.ts`
- `src/shared/components/Layout/NotificationBadge.tsx`
- `src/shared/components/Layout/Navbar.tsx`
- `src/App.tsx`

---

## Commit History

1. `feat: add WebSocket dependencies for real-time notifications` - Added @stomp/stompjs, sockjs-client
2. `feat: add notification TypeScript types aligned with backend DTOs` - Created notification.types.ts
3. `feat: add WebSocket service with STOMP over SockJS and JWT authentication` - Created WebSocketService.ts
4. `feat: add NotificationContext for WebSocket state management` - Created NotificationContext.tsx
5. `feat: export NotificationContext from context barrel` - Updated context/index.ts
6. `feat: add NotificationBadge component with Material UI popover` - Created NotificationBadge.tsx
7. `feat: integrate NotificationProvider for real-time WebSocket notifications` - Updated App.tsx
8. `feat: integrate NotificationBadge in Navbar for VALIDATOR users` - Updated Navbar.tsx

---

## References

- [Spring WebSocket Documentation](https://docs.spring.io/spring-framework/reference/web/websocket.html)
- [STOMP Protocol](https://stomp.github.io/)
- [@stomp/stompjs](https://stomp-js.github.io/stomp-websocket/)
- [SockJS](https://github.com/sockjs/sockjs-client)
- [Material UI Badge](https://mui.com/material-ui/react-badge/)
- [Material UI Popover](https://mui.com/material-ui/react-popover/)

---

## Support

For questions or issues:
- Review backend logs for WebSocket connection details
- Check browser console for STOMP debug messages
- Verify JWT token validity
- Ensure user has correct role assignment

**Last Updated**: February 1, 2026
