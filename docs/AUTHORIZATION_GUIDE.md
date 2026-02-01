# Authorization & Permissions Guide

## Overview

HyFloWEB implements a comprehensive permission-based authorization system that integrates with the backend security model. This guide explains how to use permissions to control access to features, routes, and UI elements.

---

## Architecture

### Backend Integration

The frontend authorization system syncs with the backend security model:

- **Users** have **Roles** (e.g., ROLE_ADMIN, ROLE_OPERATOR, ROLE_VALIDATOR)
- **Roles** have **Permissions** (e.g., READING:VALIDATE, OPERATION:CREATE)
- **Users** can also belong to **Groups** with additional permissions
- **Permissions** are sent to frontend after login via `/auth/login` and `/auth/me`

### Frontend Components

```
src/
├── services/
│   ├── AuthService.ts              # Authentication (login, logout, tokens)
│   └── AuthorizationService.ts     # Permission checks
├── shared/
│   ├── hooks/
│   │   └── usePermission.ts        # React hook for permissions
│   └── components/
│       ├── PermissionGuard.tsx     # Conditional rendering
│       └── ProtectedRoute.tsx      # Route protection
└── types/
    └── auth.ts                      # TypeScript types
```

---

## User Profile Structure

After login, the user profile contains:

```typescript
interface UserProfile {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  accountNonLocked: boolean;
  
  // Employee details
  employee: EmployeeDTO | null;
  
  // Authorization - Arrays of permission codes
  roles: string[];              // e.g., ['ROLE_VALIDATOR', 'ROLE_OPERATOR']
  permissions: string[];        // e.g., ['READING:VALIDATE', 'READING:CREATE']
  groups: string[];            // e.g., ['GROUP_VALIDATORS']
  
  // Organizational structure
  organizationalStructureId: number | null;
  organizationalStructureCode: string | null;
  organizationalStructureName: string | null;
}
```

---

## Permission Naming Convention

**Format**: `RESOURCE:ACTION`

Examples:
- `READING:READ` - View readings
- `READING:CREATE` - Create new readings
- `READING:UPDATE` - Edit readings
- `READING:DELETE` - Delete readings
- `READING:VALIDATE` - Validate pending readings
- `OPERATION:READ` - View operations
- `OPERATION:CREATE` - Create operations
- `PARAMETER:WRITE` - Modify system parameters

---

## Using AuthorizationService

### Basic Permission Checks

```typescript
import { AuthorizationService } from '@/services/AuthorizationService';

// Check single permission
if (AuthorizationService.hasPermission('READING:VALIDATE')) {
  // User can validate readings
}

// Check if user has ANY of the permissions
if (AuthorizationService.hasAnyPermission('READING:CREATE', 'READING:UPDATE')) {
  // User can create OR update
}

// Check if user has ALL permissions
if (AuthorizationService.hasAllPermissions('READING:CREATE', 'READING:VALIDATE')) {
  // User can both create AND validate
}

// Check role
if (AuthorizationService.hasRole('ROLE_VALIDATOR')) {
  // User has validator role
}

// Get current user
const user = AuthorizationService.getUser();
```

### Organizational Structure Checks

```typescript
// Check if user belongs to specific structure
if (AuthorizationService.belongsToStructure(validatorStructureId)) {
  // User is in validator organizational structure
}

// Get user's structure ID
const structureId = AuthorizationService.getOrganizationalStructureId();
```

---

## Using usePermission Hook

For React components, use the `usePermission` hook:

```typescript
import { usePermission } from '@/shared/hooks/usePermission';

const MyComponent = () => {
  const { 
    hasPermission, 
    hasAnyPermission,
    hasRole,
    user,
    isLoading 
  } = usePermission();

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <h1>Welcome, {user?.username}</h1>
      
      {hasPermission('READING:VALIDATE') && (
        <Button>Validate Readings</Button>
      )}
      
      {hasAnyPermission('READING:CREATE', 'READING:UPDATE') && (
        <Button>Edit Reading</Button>
      )}
    </div>
  );
};
```

---

## Conditional Rendering with PermissionGuard

### Basic Usage

```typescript
import { PermissionGuard } from '@/shared/components/PermissionGuard';

// Single permission
<PermissionGuard permission="READING:VALIDATE">
  <ValidateButton />
</PermissionGuard>

// ANY permission (OR logic)
<PermissionGuard anyPermission={['READING:CREATE', 'READING:UPDATE']}>
  <EditForm />
</PermissionGuard>

// ALL permissions (AND logic)
<PermissionGuard allPermissions={['READING:CREATE', 'READING:VALIDATE']}>
  <AdminPanel />
</PermissionGuard>

// Role-based
<PermissionGuard role="ROLE_ADMIN">
  <AdminSettings />
</PermissionGuard>

// With fallback content
<PermissionGuard 
  permission="READING:VALIDATE"
  fallback={<p>You don't have permission to validate</p>}
>
  <ValidateButton />
</PermissionGuard>
```

### Sidebar Menu Example

```typescript
const menuItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
    permission: 'DASHBOARD:VIEW'
  },
  {
    title: 'Readings',
    path: '/flow/readings',
    icon: <AssessmentIcon />,
    permission: 'READING:READ'
  },
  {
    title: 'Pending Validations',
    path: '/flow/readings/pending',
    icon: <PendingActionsIcon />,
    permission: 'READING:VALIDATE' // Only validators see this
  }
];

return (
  <Sidebar>
    {menuItems.map(item => (
      <PermissionGuard key={item.path} permission={item.permission}>
        <MenuItem {...item} />
      </PermissionGuard>
    ))}
  </Sidebar>
);
```

---

## Route Protection with ProtectedRoute

### Basic Usage

```typescript
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { Routes, Route } from 'react-router-dom';

<Routes>
  {/* Public routes */}
  <Route path="/login" element={<Login />} />
  
  {/* Protected by permission */}
  <Route 
    path="/flow/readings/pending" 
    element={
      <ProtectedRoute permission="READING:VALIDATE">
        <PendingReadingsList />
      </ProtectedRoute>
    } 
  />
  
  {/* Protected by role */}
  <Route 
    path="/admin" 
    element={
      <ProtectedRoute role="ROLE_ADMIN">
        <AdminPanel />
      </ProtectedRoute>
    } 
  />
  
  {/* Multiple permissions (ANY) */}
  <Route 
    path="/flow/readings/edit" 
    element={
      <ProtectedRoute anyPermission={['READING:CREATE', 'READING:UPDATE']}>
        <ReadingEdit />
      </ProtectedRoute>
    } 
  />
  
  {/* Custom redirect */}
  <Route 
    path="/sensitive" 
    element={
      <ProtectedRoute 
        permission="SENSITIVE:ACCESS"
        redirectTo="/access-denied"
      >
        <SensitivePage />
      </ProtectedRoute>
    } 
  />
</Routes>
```

---

## App Initialization

Ensure authentication is initialized on app startup:

```typescript
// In App.tsx or main.tsx
import { useEffect, useState } from 'react';
import { AuthService } from '@/services/AuthService';

function App() {
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await AuthService.initialize();
      setAuthInitialized(true);
    };
    
    initAuth();
  }, []);

  if (!authInitialized) {
    return <LoadingScreen />;
  }

  return <YourApp />;
}
```

---

## Backend Setup

### 1. Ensure LoginResponse Includes User Profile

The backend `/auth/login` endpoint must return:

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
    "organizationalStructureId": 3
  }
}
```

### 2. Implement /auth/me Endpoint

```java
@GetMapping("/me")
public ResponseEntity<UserProfileDTO> getCurrentUser(Authentication authentication) {
    UserProfileDTO profile = authenticationService.getCurrentUserProfile(authentication.getName());
    return ResponseEntity.ok(profile);
}
```

### 3. Database Permissions

```sql
-- Insert permission
INSERT INTO T_03_01_03 (id, F_01, F_02, F_03) VALUES 
(NEXTVAL('SEQ_T_03_01_03'), 'READING:VALIDATE', 'Validate flow readings', 'Permission to validate submitted readings');

-- Assign to role
INSERT INTO T_03_01_05 (F_01, F_02) VALUES 
((SELECT id FROM T_03_01_02 WHERE F_01 = 'ROLE_VALIDATOR'), 
 (SELECT id FROM T_03_01_03 WHERE F_01 = 'READING:VALIDATE'));
```

---

## Common Patterns

### Button Visibility

```typescript
<PermissionGuard permission="READING:VALIDATE">
  <Button onClick={handleValidate}>Validate</Button>
</PermissionGuard>
```

### Form Fields

```typescript
const { hasPermission } = usePermission();

<TextField
  disabled={!hasPermission('READING:UPDATE')}
  value={reading.pressure}
/>
```

### API Calls

```typescript
const handleSubmit = async () => {
  if (!AuthorizationService.hasPermission('READING:CREATE')) {
    toast.error('You do not have permission to create readings');
    return;
  }
  
  await FlowReadingService.create(data);
};
```

---

## Debugging

### Check User Permissions

```typescript
const user = AuthorizationService.getUser();
console.log('Current user:', user);
console.log('Permissions:', user?.permissions);
console.log('Roles:', user?.roles);
```

### Check Specific Permission

```typescript
const canValidate = AuthorizationService.hasPermission('READING:VALIDATE');
console.log('Can validate?', canValidate);
```

---

## Best Practices

1. **Always check permissions on both frontend and backend** - Frontend is for UX, backend is for security
2. **Use granular permissions** - Prefer `READING:VALIDATE` over `ROLE_VALIDATOR`
3. **Cache user profile** - Already handled by AuthService
4. **Handle loading states** - Use `isLoading` from `usePermission`
5. **Provide feedback** - Show messages when actions are denied
6. **Test with different users** - Verify permission checks work correctly

---

## Troubleshooting

### Permissions not working?

1. Check if user is logged in: `AuthService.isAuthenticated()`
2. Verify user profile loaded: `AuthorizationService.getUser()`
3. Check backend returns permissions in login response
4. Verify `/auth/me` endpoint exists and returns user profile
5. Clear localStorage and re-login

### Sidebar item not showing?

1. Check permission matches exactly: `'READING:VALIDATE'` (case-sensitive)
2. Verify user has the permission: Check browser console
3. Ensure PermissionGuard wraps the menu item

---

## Example: Validation Workflow

```typescript
// 1. Sidebar shows validation menu only for validators
<PermissionGuard permission="READING:VALIDATE">
  <MenuItem path="/flow/readings/pending">Pending Validations</MenuItem>
</PermissionGuard>

// 2. Route is protected
<Route 
  path="/flow/readings/pending" 
  element={
    <ProtectedRoute permission="READING:VALIDATE">
      <PendingReadingsList />
    </ProtectedRoute>
  } 
/>

// 3. Validate button in component
const PendingReadingsList = () => {
  const { hasPermission } = usePermission();
  
  return (
    <div>
      {readings.map(reading => (
        <div key={reading.id}>
          {hasPermission('READING:VALIDATE') && (
            <Button onClick={() => validate(reading.id)}>
              Validate
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
```

---

## Summary

✅ **AuthorizationService** - Core permission checking  
✅ **usePermission** - React hook for components  
✅ **PermissionGuard** - Conditional rendering  
✅ **ProtectedRoute** - Route-level protection  
✅ **Backend Integration** - Synced with security model  
✅ **Type Safety** - Full TypeScript support  

For questions or issues, contact the development team.
