# 🔐 HyFlo Authorization System

## Overview

HyFlo now features a complete **permission-based authorization system** that integrates seamlessly with the backend security model. This allows fine-grained control over what users can see and do in the application.

---

## 🎯 Key Features

✅ **Permission-Based Access Control** - Check individual permissions (`READING:VALIDATE`, `OPERATION:CREATE`, etc.)  
✅ **Role-Based Access Control** - Check user roles (`ROLE_ADMIN`, `ROLE_VALIDATOR`, etc.)  
✅ **React Integration** - Hooks and components for easy permission checks  
✅ **Route Protection** - Secure pages based on permissions  
✅ **Conditional Rendering** - Show/hide UI elements based on permissions  
✅ **Backend Sync** - Permissions loaded from backend on login  
✅ **Type Safety** - Full TypeScript support  
✅ **Organizational Structure** - Filter by user's organizational unit  

---

## 🚀 Quick Start

### 1. Check User Permission in Component

```typescript
import { usePermission } from '@/shared/hooks/usePermission';

const MyComponent = () => {
  const { hasPermission } = usePermission();

  return (
    <div>
      {hasPermission('READING:VALIDATE') && (
        <Button>Validate Reading</Button>
      )}
    </div>
  );
};
```

### 2. Conditional Rendering with PermissionGuard

```typescript
import { PermissionGuard } from '@/shared/components/PermissionGuard';

<PermissionGuard permission="READING:VALIDATE">
  <Button>Validate</Button>
</PermissionGuard>
```

### 3. Protect Routes

```typescript
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';

<Route 
  path="/flow/readings/pending" 
  element={
    <ProtectedRoute permission="READING:VALIDATE">
      <PendingReadingsList />
    </ProtectedRoute>
  } 
/>
```

### 4. Permission Check in Service/Utility

```typescript
import { AuthorizationService } from '@/services/AuthorizationService';

if (AuthorizationService.hasPermission('READING:VALIDATE')) {
  // Proceed with validation
}
```

---

## 📚 Documentation

### Complete Guides

- **[Authorization Guide](./docs/AUTHORIZATION_GUIDE.md)** - Complete reference for the authorization system
- **[Permission Examples](./docs/PERMISSION_EXAMPLES.md)** - Real-world usage examples

### Architecture

```
src/
├── services/
│   ├── AuthService.ts              # Login, logout, token management
│   └── AuthorizationService.ts     # Permission checking
├── shared/
│   ├── hooks/
│   │   └── usePermission.ts        # React hook for permissions
│   └── components/
│       ├── PermissionGuard.tsx     # Conditional rendering component
│       └── ProtectedRoute.tsx      # Route protection component
└── types/
    └── auth.ts                      # TypeScript types
```

---

## 🛠️ Available Tools

### AuthorizationService (Service Layer)

```typescript
import { AuthorizationService } from '@/services/AuthorizationService';

// Single permission
AuthorizationService.hasPermission('READING:VALIDATE');

// Multiple permissions (OR)
AuthorizationService.hasAnyPermission('READING:CREATE', 'READING:UPDATE');

// Multiple permissions (AND)
AuthorizationService.hasAllPermissions('READING:CREATE', 'READING:VALIDATE');

// Role check
AuthorizationService.hasRole('ROLE_VALIDATOR');

// Organizational structure
AuthorizationService.belongsToStructure(structureId);

// Get current user
const user = AuthorizationService.getUser();
```

### usePermission Hook (Component Layer)

```typescript
const { 
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  can,
  user,
  isLoading 
} = usePermission();
```

### PermissionGuard Component

```typescript
// Single permission
<PermissionGuard permission="READING:VALIDATE">
  <ValidateButton />
</PermissionGuard>

// Multiple permissions (OR)
<PermissionGuard anyPermission={['READING:CREATE', 'READING:UPDATE']}>
  <EditForm />
</PermissionGuard>

// With fallback
<PermissionGuard 
  permission="READING:VALIDATE"
  fallback={<Text>No permission</Text>}
>
  <ValidateButton />
</PermissionGuard>
```

### ProtectedRoute Component

```typescript
<Route 
  path="/admin" 
  element={
    <ProtectedRoute role="ROLE_ADMIN" redirectTo="/unauthorized">
      <AdminPanel />
    </ProtectedRoute>
  } 
/>
```

---

## 📝 Permission Naming Convention

**Format**: `RESOURCE:ACTION`

### Examples:

- `READING:READ` - View readings
- `READING:CREATE` - Create new readings
- `READING:UPDATE` - Edit readings
- `READING:DELETE` - Delete readings
- `READING:VALIDATE` - Validate pending readings 👈 **Validator-only**
- `OPERATION:READ` - View operations
- `OPERATION:CREATE` - Create operations
- `PARAMETER:WRITE` - Modify system parameters
- `DASHBOARD:VIEW` - Access dashboard

---

## 🔗 Backend Integration

### Login Response

The backend `/auth/login` endpoint must return user profile with permissions:

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "dGhpc2lz...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "username": "john.doe",
    "email": "john@example.com",
    "roles": ["ROLE_VALIDATOR"],
    "permissions": ["READING:READ", "READING:VALIDATE"],
    "employee": { /* EmployeeDTO */ },
    "organizationalStructureId": 3
  }
}
```

### /auth/me Endpoint

Returns current user profile with permissions (used for refresh).

---

## ⚙️ Configuration

### App Initialization

Ensure authentication is initialized on app startup:

```typescript
// In App.tsx
import { useEffect, useState } from 'react';
import { AuthService } from '@/services/AuthService';

function App() {
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    AuthService.initialize().then(() => setAuthInitialized(true));
  }, []);

  if (!authInitialized) return <Loading />;

  return <YourApp />;
}
```

---

## 👨‍💻 Use Cases

### 1. Validation Workflow

**Problem**: Only validators should see the "Pending Validations" menu and access the validation page.

**Solution**:

```typescript
// Sidebar
<PermissionGuard permission="READING:VALIDATE">
  <MenuItem path="/flow/readings/pending">
    Pending Validations
  </MenuItem>
</PermissionGuard>

// Route
<Route 
  path="/flow/readings/pending" 
  element={
    <ProtectedRoute permission="READING:VALIDATE">
      <PendingReadingsList />
    </ProtectedRoute>
  } 
/>

// Validate button
<PermissionGuard permission="READING:VALIDATE">
  <Button onClick={handleValidate}>Validate</Button>
</PermissionGuard>
```

### 2. Admin Panel

**Problem**: Only admins should access system settings.

**Solution**:

```typescript
<PermissionGuard role="ROLE_ADMIN">
  <MenuItem path="/admin">System Settings</MenuItem>
</PermissionGuard>

<Route 
  path="/admin/*" 
  element={
    <ProtectedRoute role="ROLE_ADMIN">
      <AdminPanel />
    </ProtectedRoute>
  } 
/>
```

### 3. Edit Own Data Only

**Problem**: Users should only edit their own readings (unless admin).

**Solution**:

```typescript
const canEdit = (reading: FlowReadingDTO): boolean => {
  const { user, hasRole } = usePermission();
  
  if (hasRole('ROLE_ADMIN')) return true;
  
  return reading.recordedBy?.id === user?.employee?.id;
};
```

---

## 🛡️ Security Notes

⚠️ **Frontend permissions are for UX only**  
✅ **Always validate permissions on the backend**  
✅ **Backend is the source of truth for security**  
✅ **Frontend permissions improve user experience by hiding unavailable options**  

---

## 🐞 Troubleshooting

### Permissions Not Working?

1. Check user is logged in: `AuthService.isAuthenticated()`
2. Check user profile loaded: `console.log(AuthorizationService.getUser())`
3. Verify backend returns permissions in login response
4. Check `/auth/me` endpoint exists
5. Clear localStorage and re-login

### Menu Item Not Showing?

1. Check permission code matches exactly (case-sensitive)
2. Verify user has the permission: Check browser console
3. Ensure `PermissionGuard` wraps the menu item

---

## 📌 Next Steps

1. Read the [Authorization Guide](./docs/AUTHORIZATION_GUIDE.md)
2. Review [Permission Examples](./docs/PERMISSION_EXAMPLES.md)
3. Implement backend `/auth/me` endpoint (if not done)
4. Update `LoginResponse` to include `user` field
5. Define permissions in database
6. Assign permissions to roles
7. Test with different user roles

---

## 💬 Support

For questions or issues:

- Check documentation in `/docs` folder
- Review examples in `PERMISSION_EXAMPLES.md`
- Contact development team

---

**Last Updated**: February 1, 2026  
**Version**: 1.0.0  
**Author**: CHOUABBIA Amine
