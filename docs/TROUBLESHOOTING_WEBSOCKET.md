# WebSocket Notifications - Troubleshooting Guide

## Common Errors and Solutions

### 1. ❌ `Uncaught ReferenceError: global is not defined`

**Error Message**:
```
Uncaught ReferenceError: global is not defined
    at browser-crypto.js:3
    at sockjs-client.js:3731
```

**Cause**: SockJS library expects Node.js `global` variable which doesn't exist in browser environments.

**Solution Applied** ✅:

#### Option A: HTML Polyfill (Quick Fix)
Added to `index.html` before script tags:
```html
<script>
  window.global = window;
</script>
```

#### Option B: Vite Config (Recommended)
Added to `vite.config.ts`:
```typescript
export default defineConfig({
  define: {
    global: 'globalThis',
    'process.env': {},
  },
});
```

**Status**: ✅ **Fixed in commits:**
- [32e3344](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/32e33440b2a1c39cd185cb42115755f66330aa44) - HTML polyfill
- [997ee84](https://github.com/CHOUABBIA-AMINE/HyFloWEB/commit/997ee8406a99f5f174ea3fbd8b0ebb5a750a51e4) - Vite config

**Action Required**:
1. Pull latest changes: `git pull origin main`
2. Restart dev server: `npm run dev`
3. Hard refresh browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

---

### 2. ❌ WebSocket Connection Failed

**Error Message**:
```
WebSocket connection to 'ws://localhost:8080/iaas/api/ws' failed
```

**Possible Causes**:

#### A. Backend Not Running
**Check**: Is HyFloAPI running?
```bash
# Terminal output should show:
Started HyfloApplication in X.XXX seconds
```

**Solution**:
```bash
cd HyFloAPI
mvn spring-boot:run
```

#### B. Wrong API URL
**Check**: `.env` file has correct backend URL
```env
VITE_API_BASE_URL=http://localhost:8080/iaas/api
```

**Solution**: Update `.env` and restart dev server

#### C. CORS Not Configured
**Check**: Backend `application.properties`
```properties
notification.websocket.allowed-origins=http://localhost:3000,http://localhost:4200,http://localhost:5173
```

**Solution**: Add your frontend URL (default Vite: `http://localhost:5173`)

---

### 3. ❌ Authentication Failed on WebSocket

**Error Message** (in browser console):
```
STOMP ERROR: Authentication failed
```

**Cause**: Invalid or expired JWT token

**Debug Steps**:

1. **Check token exists**:
```javascript
// In browser console
console.log(localStorage.getItem('access_token'));
// Should print a long JWT string like: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. **Check token expiry**:
```javascript
// In browser console
const token = localStorage.getItem('access_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expires:', new Date(payload.exp * 1000));
```

**Solutions**:
- **If no token**: Re-login to get fresh token
- **If expired**: Re-login (tokens expire after 24 hours by default)
- **If invalid format**: Clear storage and re-login
  ```javascript
  localStorage.clear();
  // Then navigate to /login
  ```

---

### 4. ❌ Badge Not Appearing

**Symptom**: Notification badge doesn't show in navbar

**Possible Causes**:

#### A. User Doesn't Have VALIDATOR Role
**Check**: User roles in AuthContext
```javascript
// In browser console (while logged in)
JSON.parse(localStorage.getItem('user'))?.roles
// Should include "ROLE_VALIDATOR" or "VALIDATOR"
```

**Solution**: 
- Assign VALIDATOR role in backend database
- Or login with a VALIDATOR user

#### B. NotificationProvider Not Loaded
**Check**: React DevTools → Components → Look for `NotificationProvider`

**Solution**: Verify `App.tsx` has:
```tsx
<AuthProvider>
  <NotificationProvider>  {/* Should be here */}
    <Router>
      {/* routes */}
    </Router>
  </NotificationProvider>
</AuthProvider>
```

---

### 5. ❌ Notifications Not Received

**Symptom**: WebSocket connected, but no notifications arrive

**Debug Steps**:

1. **Enable STOMP Debug**:

Edit `src/services/WebSocketService.ts`:
```typescript
this.stompClient = new Client({
  // ... existing config ...
  debug: (msg) => console.log('[STOMP]', msg),  // Add this line
});
```

2. **Check Subscription**:

Look for in browser console:
```
[STOMP] SUBSCRIBE
destination:/user/queue/notifications
```

3. **Check Backend Logs**:

Look for in HyFloAPI logs:
```
Sending notification to user: {username}
```

**Possible Issues**:

#### A. Event Not Published
Backend service not publishing events after creating readings.

**Solution**: Verify `FlowReadingService.create()` publishes `ReadingSubmittedEvent`

#### B. Event Listener Not Active
**Check**: `FlowReadingEventListener` exists and has `@Component` annotation

#### C. Wrong Username
Backend sending to wrong username.

**Check**: 
- Token username matches database username (case-sensitive)
- Backend logs show correct recipient

---

### 6. ❌ Connection Status Shows "Reconnecting" Forever

**Symptom**: Badge icon shows disconnected, status says "Reconnecting"

**Causes**:

1. **Backend stopped**: Start backend
2. **JWT expired**: Re-login to get fresh token
3. **Network issue**: Check network connectivity
4. **Max retries reached**: Default is 10 attempts

**Solution**:
1. Restart backend
2. Re-login (clears old token, gets new one)
3. Refresh page

**Check Reconnection Logic** (`WebSocketService.ts`):
```typescript
if (this.reconnectAttempts < this.maxReconnectAttempts) {
  // Will retry up to 10 times with exponential backoff
}
```

---

### 7. ❌ `process is not defined`

**Error Message**:
```
Uncaught ReferenceError: process is not defined
```

**Cause**: Similar to `global`, some libraries expect Node.js `process` variable.

**Solution**: Already included in `vite.config.ts`:
```typescript
define: {
  'process.env': {},
}
```

**If still occurring**: Restart dev server after pulling latest config

---

### 8. ❌ CORS Error on WebSocket Handshake

**Error Message**:
```
Access to XMLHttpRequest at 'http://localhost:8080/iaas/api/ws/info' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Cause**: Backend not allowing frontend origin

**Solution**:

1. **Update Backend Config** (`application.properties`):
```properties
notification.websocket.allowed-origins=http://localhost:5173,http://localhost:3000
```

2. **Restart Backend** after config change

3. **Verify WebSocketConfig.java**:
```java
@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
            .setAllowedOrigins(allowedOrigins.split(","))  // From properties
            .withSockJS();
}
```

---

### 9. ❌ Browser Notifications Not Showing

**Symptom**: WebSocket notifications arrive, but no browser popup

**Causes**:

1. **Permission Not Granted**

**Check**:
```javascript
// In browser console
Notification.permission
// Should be: "granted"
```

**Solution**: Click "Allow" when prompted, or:
- Chrome: Settings → Privacy → Site Settings → Notifications → Allow
- Firefox: Settings → Privacy & Security → Permissions → Notifications → Settings

2. **Browser Doesn't Support Notifications**

**Check**:
```javascript
'Notification' in window
// Should be: true
```

**Solution**: Update browser or use modern browser (Chrome, Firefox, Edge)

---

### 10. ❌ Navigation Not Working on Notification Click

**Symptom**: Click notification in popover, nothing happens

**Debug**:

1. **Check Console for Errors**

2. **Verify relatedEntityType**:
```javascript
// Should be one of: "READING", "OPERATION", "INCIDENT"
```

3. **Check Navigation Logic** (`NotificationBadge.tsx`):
```typescript
const handleNotificationClick = (notification: NotificationDTO) => {
  if (notification.relatedEntityType === 'READING') {
    navigate(`/flow/readings/${notification.relatedEntityId}/validate`);
  }
  // ...
};
```

**Solution**: Verify:
- `relatedEntityId` is valid reading ID
- Route exists in `App.tsx`
- User has permission to access route

---

## Diagnostic Checklist

Use this checklist to systematically debug issues:

### Frontend
- [ ] Dev server running on correct port
- [ ] No console errors on page load
- [ ] `.env` file has correct `VITE_API_BASE_URL`
- [ ] User logged in successfully
- [ ] User has `ROLE_VALIDATOR` role
- [ ] `access_token` exists in localStorage
- [ ] Token not expired
- [ ] Badge component visible in navbar
- [ ] WebSocket connection established (check Network → WS tab)

### Backend
- [ ] HyFloAPI running
- [ ] No errors in backend logs on startup
- [ ] `notification.websocket.allowed-origins` includes frontend URL
- [ ] WebSocket endpoint accessible: `http://localhost:8080/iaas/api/ws/info`
- [ ] JWT validation working (check `WebSocketAuthInterceptor` logs)
- [ ] Event publisher configured
- [ ] Event listener active
- [ ] `NotificationWebSocketService` bean created

### Network
- [ ] Backend accessible from frontend
- [ ] No firewall blocking WebSocket connections
- [ ] CORS headers present in responses

---

## Advanced Debugging

### Enable Full STOMP Debug Logging

**Frontend** (`WebSocketService.ts`):
```typescript
this.stompClient = new Client({
  brokerURL: this.wsUrl,
  connectHeaders: {
    Authorization: `Bearer ${token}`,
  },
  debug: (msg) => {
    console.log('[STOMP]', msg);
  },
  reconnectDelay: 5000,
  heartbeatIncoming: 10000,
  heartbeatOutgoing: 10000,
});
```

**Backend** (`application.properties`):
```properties
logging.level.org.springframework.web.socket=DEBUG
logging.level.org.springframework.messaging=DEBUG
```

### Monitor WebSocket Frames

1. **Chrome DevTools**:
   - Network tab → WS filter
   - Click WebSocket connection
   - View Messages tab
   - See all STOMP frames (CONNECT, SUBSCRIBE, MESSAGE, etc.)

2. **Look for**:
   - `CONNECTED` frame from server
   - `SUBSCRIBE` to `/user/queue/notifications`
   - `MESSAGE` frames when notifications sent

### Test WebSocket Endpoint Manually

Use a WebSocket client (e.g., Postman, wscat):

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost:8080/iaas/api/ws

# Send CONNECT frame
CONNECT
Authorization:Bearer YOUR_JWT_TOKEN
accept-version:1.2

^
```

Expect `CONNECTED` frame in response.

---

## Still Having Issues?

### Collect Debug Information

1. **Browser Console Logs**
   - Copy all errors and warnings

2. **Network Tab**
   - Check if WebSocket connection established
   - Copy WebSocket URL
   - Check Response headers

3. **Backend Logs**
   - Copy relevant error stack traces
   - Look for WebSocket connection logs

4. **Configuration**
   - Share `.env` (without sensitive data)
   - Share backend `application.properties` (WebSocket section)

5. **User Information**
   - Username
   - Roles assigned
   - JWT expiry time

### Reset Everything

If all else fails, complete reset:

```bash
# Frontend
rm -rf node_modules package-lock.json
npm install
localStorage.clear()  # In browser console

# Backend
mvn clean install

# Restart both
mvn spring-boot:run  # Backend
npm run dev          # Frontend

# Re-login
```

---

## Related Documentation

- [WebSocket Implementation Guide](./WEBSOCKET_NOTIFICATIONS.md)
- [Quick Start Guide](../README_NOTIFICATIONS.md)
- [Spring WebSocket Docs](https://docs.spring.io/spring-framework/reference/web/websocket.html)
- [STOMP Protocol](https://stomp.github.io/)

---

**Last Updated**: February 1, 2026
