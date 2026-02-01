# Permission System - Practical Examples

This document provides real-world examples of implementing the permission system in HyFlo.

---

## Example 1: Sidebar with Permission-Based Menu Items

```typescript
// In your App.tsx or Layout component
import { PermissionGuard } from '@/shared/components/PermissionGuard';
import { usePermission } from '@/shared/hooks/usePermission';
import { 
  Dashboard as DashboardIcon, 
  Assessment as AssessmentIcon,
  PendingActions as PendingActionsIcon,
  Build as BuildIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const AppSidebar = () => {
  const { user } = usePermission();

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
      permission: 'DASHBOARD:VIEW'
    },
    {
      title: 'Flow Readings',
      path: '/flow/readings',
      icon: <AssessmentIcon />,
      permission: 'READING:READ'
    },
    {
      title: 'Pending Validations',
      path: '/flow/readings/pending',
      icon: <PendingActionsIcon />,
      permission: 'READING:VALIDATE', // 👈 Only validators see this
      badge: pendingCount
    },
    {
      title: 'Operations',
      path: '/flow/operations',
      icon: <BuildIcon />,
      permission: 'OPERATION:READ'
    },
    {
      title: 'System Settings',
      path: '/settings',
      icon: <SettingsIcon />,
      role: 'ROLE_ADMIN' // Can also use roles
    }
  ];

  return (
    <Drawer>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Welcome, {user?.username}</Typography>
      </Box>
      
      <List>
        {menuItems.map(item => (
          <PermissionGuard 
            key={item.path} 
            permission={item.permission}
            role={item.role}
          >
            <ListItem button component={Link} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.title} />
              {item.badge && (
                <Badge badgeContent={item.badge} color="error" />
              )}
            </ListItem>
          </PermissionGuard>
        ))}
      </List>
    </Drawer>
  );
};
```

---

## Example 2: Protected Routes Configuration

```typescript
// In your router configuration
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';

// Pages
import { Dashboard } from '@/modules/dashboard';
import { ReadingList, ReadingEdit, PendingReadingsList } from '@/modules/flow/core/pages';
import { OperationList, OperationEdit } from '@/modules/flow/core/pages';
import { AdminPanel } from '@/modules/system';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute permission="DASHBOARD:VIEW">
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Flow Module - Readings */}
      <Route 
        path="/flow/readings" 
        element={
          <ProtectedRoute permission="READING:READ">
            <ReadingList />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/flow/readings/new" 
        element={
          <ProtectedRoute permission="READING:CREATE">
            <ReadingEdit />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/flow/readings/:id/edit" 
        element={
          <ProtectedRoute permission="READING:UPDATE">
            <ReadingEdit />
          </ProtectedRoute>
        } 
      />
      
      {/* 👇 VALIDATOR-ONLY ROUTE */}
      <Route 
        path="/flow/readings/pending" 
        element={
          <ProtectedRoute permission="READING:VALIDATE">
            <PendingReadingsList />
          </ProtectedRoute>
        } 
      />
      
      {/* Flow Module - Operations */}
      <Route 
        path="/flow/operations" 
        element={
          <ProtectedRoute permission="OPERATION:READ">
            <OperationList />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/flow/operations/new" 
        element={
          <ProtectedRoute anyPermission={['OPERATION:CREATE', 'OPERATION:UPDATE']}>
            <OperationEdit />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute role="ROLE_ADMIN">
            <AdminPanel />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};
```

---

## Example 3: Conditional Buttons in Components

```typescript
// In ReadingList.tsx
import { PermissionGuard } from '@/shared/components/PermissionGuard';
import { usePermission } from '@/shared/hooks/usePermission';

const ReadingList = () => {
  const { hasPermission } = usePermission();
  const [readings, setReadings] = useState<FlowReadingDTO[]>([]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Flow Readings</Typography>
        
        {/* Create button - only for users who can create */}
        <PermissionGuard permission="READING:CREATE">
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/flow/readings/new')}
          >
            New Reading
          </Button>
        </PermissionGuard>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Pipeline</TableCell>
            <TableCell>Recorded At</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {readings.map(reading => (
            <TableRow key={reading.id}>
              <TableCell>{reading.id}</TableCell>
              <TableCell>{reading.pipeline?.name}</TableCell>
              <TableCell>{formatDateTime(reading.recordedAt)}</TableCell>
              <TableCell>
                <Chip label={reading.validationStatus?.nameLt} />
              </TableCell>
              <TableCell>
                {/* View - everyone can view */}
                <IconButton onClick={() => handleView(reading.id)}>
                  <VisibilityIcon />
                </IconButton>
                
                {/* Edit - only for users who can update */}
                <PermissionGuard permission="READING:UPDATE">
                  <IconButton onClick={() => handleEdit(reading.id)}>
                    <EditIcon />
                  </IconButton>
                </PermissionGuard>
                
                {/* Delete - only for users who can delete */}
                <PermissionGuard permission="READING:DELETE">
                  <IconButton onClick={() => handleDelete(reading.id)}>
                    <DeleteIcon />
                  </IconButton>
                </PermissionGuard>
                
                {/* Validate - only for validators on pending readings */}
                {reading.validationStatus?.code === 'PENDING' && (
                  <PermissionGuard permission="READING:VALIDATE">
                    <IconButton 
                      color="success"
                      onClick={() => handleValidate(reading.id)}
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  </PermissionGuard>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};
```

---

## Example 4: Form Field Permissions

```typescript
// In ReadingEdit.tsx
import { usePermission } from '@/shared/hooks/usePermission';

const ReadingEdit = () => {
  const { hasPermission } = usePermission();
  const [reading, setReading] = useState<FlowReadingDTO>({});
  
  // Determine if form is editable
  const canEdit = hasPermission('READING:UPDATE') || hasPermission('READING:CREATE');
  const canDelete = hasPermission('READING:DELETE');

  return (
    <Box component="form">
      <TextField
        label="Pressure"
        value={reading.pressure}
        onChange={(e) => setReading({...reading, pressure: parseFloat(e.target.value)})}
        disabled={!canEdit} // 👈 Disable if no permission
      />
      
      <TextField
        label="Temperature"
        value={reading.temperature}
        onChange={(e) => setReading({...reading, temperature: parseFloat(e.target.value)})}
        disabled={!canEdit}
      />
      
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        {canEdit && (
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        )}
        
        {canDelete && reading.id && (
          <Button variant="outlined" color="error" onClick={handleDelete}>
            Delete
          </Button>
        )}
        
        <Button variant="outlined" onClick={() => navigate('/flow/readings')}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};
```

---

## Example 5: API Call with Permission Check

```typescript
// Validate reading with permission check
const handleValidate = async (readingId: number) => {
  // Check permission before API call
  if (!AuthorizationService.hasPermission('READING:VALIDATE')) {
    toast.error('You do not have permission to validate readings');
    return;
  }
  
  try {
    const user = AuthorizationService.getUser();
    await FlowReadingService.validate(readingId, user!.employee!.id);
    
    toast.success('Reading validated successfully');
    await loadReadings(); // Refresh list
  } catch (error) {
    toast.error('Failed to validate reading');
  }
};

// Reject reading with permission check
const handleReject = async (readingId: number, reason: string) => {
  if (!AuthorizationService.hasPermission('READING:VALIDATE')) {
    toast.error('You do not have permission to reject readings');
    return;
  }
  
  try {
    const user = AuthorizationService.getUser();
    await FlowReadingService.reject(readingId, user!.employee!.id, reason);
    
    toast.success('Reading rejected');
    await loadReadings();
  } catch (error) {
    toast.error('Failed to reject reading');
  }
};
```

---

## Example 6: App Initialization

```typescript
// In App.tsx
import { useEffect, useState } from 'react';
import { AuthService } from '@/services/AuthService';
import { CircularProgress, Box } from '@mui/material';

function App() {
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize authentication and load user permissions
        await AuthService.initialize();
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setAuthInitialized(true);
      }
    };
    
    initializeAuth();
  }, []);

  if (!authInitialized) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRoutes />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## Example 7: Login Flow with Permissions

```typescript
// In Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';
import { AuthorizationService } from '@/services/AuthorizationService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Login and get user profile with permissions
      const response = await AuthService.login({ username, password });
      
      console.log('User logged in:', response.user);
      console.log('Permissions:', response.user.permissions);
      console.log('Roles:', response.user.roles);
      
      // Redirect based on permissions
      if (AuthorizationService.hasRole('ROLE_ADMIN')) {
        navigate('/admin');
      } else if (AuthorizationService.hasPermission('READING:VALIDATE')) {
        navigate('/flow/readings/pending');
      } else if (AuthorizationService.hasPermission('READING:READ')) {
        navigate('/flow/readings');
      } else {
        navigate('/dashboard');
      }
      
      toast.success(`Welcome back, ${response.user.username}!`);
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleLogin}>
      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </Box>
  );
};
```

---

## Example 8: Complex Permission Logic

```typescript
// Multiple conditions
const canEditReading = (reading: FlowReadingDTO): boolean => {
  const { hasPermission, user } = usePermission();
  
  // Can update if has permission
  if (!hasPermission('READING:UPDATE')) {
    return false;
  }
  
  // Can only edit own readings (unless admin)
  if (!hasRole('ROLE_ADMIN')) {
    if (reading.recordedBy?.id !== user?.employee?.id) {
      return false;
    }
  }
  
  // Can't edit validated readings (unless admin)
  if (reading.validationStatus?.code === 'VALIDATED' && !hasRole('ROLE_ADMIN')) {
    return false;
  }
  
  return true;
};

// Usage
<PermissionGuard permission="READING:UPDATE">
  <IconButton 
    disabled={!canEditReading(reading)}
    onClick={() => handleEdit(reading.id)}
  >
    <EditIcon />
  </IconButton>
</PermissionGuard>
```

---

## Summary

These examples demonstrate:

✅ Sidebar menu with permission-based items  
✅ Protected routes configuration  
✅ Conditional button rendering  
✅ Form field permissions  
✅ API calls with permission checks  
✅ App initialization  
✅ Login flow with redirects  
✅ Complex permission logic  

For more details, see [AUTHORIZATION_GUIDE.md](./AUTHORIZATION_GUIDE.md)
