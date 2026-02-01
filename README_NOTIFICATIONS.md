# Real-Time Notifications - Quick Start

✅ **Status**: Fully implemented and pushed to `main` branch

## What Was Implemented

A complete WebSocket-based real-time notification system connecting HyFloWEB (React) to HyFloAPI (Spring Boot).

### Key Features

- ✅ JWT-authenticated WebSocket connection (STOMP over SockJS)
- ✅ Real-time notifications for VALIDATOR users
- ✅ Material UI badge with unread count
- ✅ Notification popover with mark-as-read functionality
- ✅ Automatic reconnection with exponential backoff
- ✅ Role-based visibility (VALIDATOR only)
- ✅ Navigation to related entities on click
- ✅ Browser notifications (with permission)
- ✅ Connection status indicators
- ✅ RTL support

## Files Added/Modified

### New Files (8)

1. `src/types/notification.types.ts` - TypeScript interfaces
2. `src/services/WebSocketService.ts` - STOMP client wrapper  
3. `src/shared/context/NotificationContext.tsx` - State management
4. `src/shared/components/Layout/NotificationBadge.tsx` - UI component
5. `docs/WEBSOCKET_NOTIFICATIONS.md` - Full documentation
6. `README_NOTIFICATIONS.md` - This file

### Modified Files (4)

1. `package.json` - Added @stomp/stompjs, sockjs-client
2. `src/shared/context/index.ts` - Exported NotificationProvider
3. `src/App.tsx` - Integrated NotificationProvider
4. `src/shared/components/Layout/Navbar.tsx` - Added NotificationBadge

## Installation

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

**New dependencies installed:**
- `@stomp/stompjs` - STOMP protocol client
- `sockjs-client` - WebSocket fallback transport
- `@types/sockjs-client` - TypeScript definitions

## Configuration

### Backend

Update `application.properties` to allow frontend origin:

```properties
notification.websocket.allowed-origins=http://localhost:3000,http://localhost:4200,http://localhost:5173
```

### Frontend

No configuration changes needed. Uses existing `VITE_API_BASE_URL` from `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/iaas/api
```

## How It Works

### Architecture Flow

1. **User Login** (VALIDATOR role)
2. **NotificationContext** connects WebSocket using JWT
3. **Backend** authenticates via `WebSocketAuthInterceptor`
4. **Subscription** to `/user/queue/notifications`
5. **Event Trigger** (e.g., Reader submits reading)
6. **Backend** sends `NotificationDTO` via WebSocket
7. **Frontend** receives notification, updates badge
8. **User** clicks badge, sees popover, navigates to entity

### Backend Integration

The backend sends notifications using `NotificationWebSocketService`:

```java
@Service
public class NotificationWebSocketService {
    public void sendToUser(String username, NotificationDTO notification) {
        messagingTemplate.convertAndSendToUser(
            username,
            "/queue/notifications",
            notification
        );
    }
}
```

Example notification:

```json
{
  "id": "123",
  "title": "New Reading Submitted",
  "message": "Reading REF-001 awaits validation at Station ABC",
  "type": {
    "code": "READING_SUBMITTED",
    "severity": "NORMAL"
  },
  "relatedEntityId": "456",
  "relatedEntityType": "READING",
  "isRead": false,
  "createdAt": "2026-02-01T13:45:00"
}
```

## Usage

### For VALIDATOR Users

1. Login with VALIDATOR role
2. Badge appears in top navbar (next to language switcher)
3. Unread count shows on badge
4. Click badge to open notification popover
5. Click notification to navigate to related page
6. Use "Mark all read" or "Clear" buttons

### Accessing Notification State Programmatically

```tsx
import { useNotifications } from '@/shared/context';

function MyComponent() {
  const { 
    notifications,      // Array of NotificationDTO
    unreadCount,        // Number
    wsStatus,          // { connected, reconnecting, error }
    markAsRead,        // (id) => void
    markAllAsRead,     // () => void
    clear              // () => void
  } = useNotifications();

  return (
    <div>
      {unreadCount > 0 && `You have ${unreadCount} unread notifications`}
    </div>
  );
}
```

## Testing

### Quick Test

1. **Start Backend**: `mvn spring-boot:run` (HyFloAPI)
2. **Start Frontend**: `npm run dev` (HyFloWEB)
3. **Login as VALIDATOR**
4. **Verify**: Badge appears in navbar
5. **Check DevTools**: Network → WS → Connection established
6. **Trigger Event**: Submit reading as another user
7. **Verify**: Badge count increments, notification appears

### Connection Status

- 🔔 **Connected**: Green badge icon, notifications working
- 🔕 **Disconnected**: Gray badge icon, no notifications
- 🔄 **Reconnecting**: Spinning indicator in popover

## Troubleshooting

### Badge Not Visible

**Cause**: User doesn't have VALIDATOR role  
**Fix**: Assign role in backend or use VALIDATOR account

### WebSocket Connection Failed

**Cause**: Backend not running or CORS issue  
**Fix**:
1. Verify backend is running
2. Check `notification.websocket.allowed-origins` includes `http://localhost:5173`
3. Check browser console for errors

### Token Authentication Failed

**Cause**: Expired or invalid JWT  
**Fix**: Re-login to get fresh token

### Notifications Not Received

**Cause**: Backend event not triggering or wrong destination  
**Fix**:
1. Check backend logs for "Sending notification to user"
2. Verify `NotificationWebSocketService.sendToUser()` is called
3. Enable STOMP debug in `WebSocketService.ts`

## Next Steps

1. **Install dependencies**: `npm install`
2. **Run application**: `npm run dev`
3. **Test with VALIDATOR user**
4. **Review full documentation**: [docs/WEBSOCKET_NOTIFICATIONS.md](docs/WEBSOCKET_NOTIFICATIONS.md)

## Commits

All changes pushed to `main` branch:

1. ✅ `feat: add WebSocket dependencies`
2. ✅ `feat: add notification TypeScript types`
3. ✅ `feat: add WebSocket service with STOMP`
4. ✅ `feat: add NotificationContext`
5. ✅ `feat: export NotificationContext`
6. ✅ `feat: add NotificationBadge component`
7. ✅ `feat: integrate NotificationProvider in App`
8. ✅ `feat: integrate NotificationBadge in Navbar`
9. ✅ `docs: add comprehensive guide`

## Support

**Documentation**: [docs/WEBSOCKET_NOTIFICATIONS.md](docs/WEBSOCKET_NOTIFICATIONS.md)  
**Backend Repo**: [HyFloAPI](https://github.com/CHOUABBIA-AMINE/HyFloAPI)  
**Frontend Repo**: [HyFloWEB](https://github.com/CHOUABBIA-AMINE/HyFloWEB)

---

**Implementation Date**: February 1, 2026  
**Status**: ✅ Production Ready
