/**
 * Main Application Component
 * Handles routing, authentication, and i18n with RTL support
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 12-28-2025
 * @updated 12-30-2025 - Added Employee routes
 * @updated 01-01-2026 - Added Product routes
 * @updated 01-01-2026 - Added Region/Partner/Vendor routes
 */

import { useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import CssBaseline from '@mui/material/CssBaseline';
import { useTranslation } from 'react-i18next';
import getTheme from './theme';
import { AuthProvider } from './shared/context/AuthContext';
import ProtectedRoute from './shared/components/ProtectedRoute';
import PublicRoute from './shared/components/PublicRoute';
import { Layout } from './shared/components/Layout';
import { Dashboard } from './shared/components/Dashboard';
import { Profile } from './shared/pages';
import { Login } from './modules/system/auth/pages';
import { UserList, UserEdit, RoleList, RoleEdit, GroupList, GroupEdit } from './modules/system/security/pages';
import { 
  StationList, 
  StationEdit, 
  TerminalList, 
  TerminalEdit,
  HydrocarbonFieldList,
  HydrocarbonFieldEdit,
  PipelineList,
  PipelineEdit,
  PipelineSystemList,
  PipelineSystemEdit
} from './modules/network/core/pages';
import { NetworkMapPage, GeoDebugPage } from './modules/network/geo/pages';
import { 
  ArchiveBoxList, 
  ArchiveBoxEdit, 
  BlocList, 
  BlocEdit,
  FolderList,
  FolderEdit,
  RoomList,
  RoomEdit,
  ShelfList,
  ShelfEdit
} from './modules/common/environment/pages';
import { MailList, MailEdit } from './modules/common/communication/pages';
import { StructureList, StructureEdit, EmployeeList, EmployeeEdit } from './modules/common/administration';

// Network Common
import ProductList from './modules/network/common/pages/ProductList';
import ProductEdit from './modules/network/common/pages/ProductEdit';
import RegionList from './modules/network/common/pages/RegionList';
import RegionEdit from './modules/network/common/pages/RegionEdit';
import PartnerList from './modules/network/common/pages/PartnerList';
import PartnerEdit from './modules/network/common/pages/PartnerEdit';
import VendorList from './modules/network/common/pages/VendorList';
import VendorEdit from './modules/network/common/pages/VendorEdit';

// Flow Dashboard Module
import { DashboardPage as FlowDashboardPage } from './modules/dashboard';

function App() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  // Update document direction
  useEffect(() => {
    document.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRtl]);

  // Create emotion cache for RTL support
  const cacheRtl = useMemo(
    () =>
      createCache({
        key: isRtl ? 'muirtl' : 'muiltr',
        stylisPlugins: isRtl ? [prefixer, rtlPlugin] : [prefixer],
      }),
    [isRtl]
  );

  // Create theme with RTL support
  const theme = useMemo(() => getTheme(isRtl ? 'rtl' : 'ltr'), [isRtl]);

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes - Outside Layout */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              {/* Protected Routes - Inside Layout */}
              <Route path="/" element={<Layout />}>
                {/* Root redirect */}
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard */}
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Profile */}
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Security Module - Protected */}
                <Route path="security">
                  {/* Users */}
                  <Route
                    path="users"
                    element={
                      <ProtectedRoute>
                        <UserList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="users/create"
                    element={
                      <ProtectedRoute>
                        <UserEdit />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="users/:userId/edit"
                    element={
                      <ProtectedRoute>
                        <UserEdit />
                      </ProtectedRoute>
                    }
                  />

                  {/* Roles */}
                  <Route
                    path="roles"
                    element={
                      <ProtectedRoute>
                        <RoleList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="roles/create"
                    element={
                      <ProtectedRoute>
                        <RoleEdit />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="roles/:roleId/edit"
                    element={
                      <ProtectedRoute>
                        <RoleEdit />
                      </ProtectedRoute>
                    }
                  />

                  {/* Groups */}
                  <Route
                    path="groups"
                    element={
                      <ProtectedRoute>
                        <GroupList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="groups/create"
                    element={
                      <ProtectedRoute>
                        <GroupEdit />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="groups/:groupId/edit"
                    element={
                      <ProtectedRoute>
                        <GroupEdit />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Administration Module - Protected */}
                <Route path="administration">
                  {/* Structures */}
                  <Route
                    path="structures"
                    element={
                      <ProtectedRoute>
                        <StructureList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="structures/create"
                    element={
                      <ProtectedRoute>
                        <StructureEdit />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="structures/:id/edit"
                    element={
                      <ProtectedRoute>
                        <StructureEdit />
                      </ProtectedRoute>
                    }
                  />

                  {/* Employees */}
                  <Route
                    path="employees"
                    element={
                      <ProtectedRoute>
                        <EmployeeList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="employees/create"
                    element={
                      <ProtectedRoute>
                        <EmployeeEdit />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="employees/:id/edit"
                    element={
                      <ProtectedRoute>
                        <EmployeeEdit />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Communication Module - Protected */}
                <Route path="communication">
                  {/* Mails */}
                  <Route
                    path="mails"
                    element={
                      <ProtectedRoute>
                        <MailList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="mails/create"
                    element={
                      <ProtectedRoute>
                        <MailEdit />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="mails/:id/edit"
                    element={
                      <ProtectedRoute>
                        <MailEdit />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Environment Module - Protected */}
                <Route path="environment">
                  {/* Archive Boxes */}
                  <Route
                    path="archive-boxes"
                    element={
                      <ProtectedRoute>
                        <ArchiveBoxList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="archive-boxes/create"
                    element={
                      <ProtectedRoute>
                        <ArchiveBoxEdit />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="archive-boxes/:boxId/edit"
                    element={
                      <ProtectedRoute>
                        <ArchiveBoxEdit />
                      </ProtectedRoute>
                    }
                  />

                  {/* Blocs */}
                  <Route
                    path="blocs"
                    element={
                      <ProtectedRoute>
                        <BlocList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="blocs/create"
                    element={
                      <ProtectedRoute>
                        <BlocEdit />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="blocs/:blocId/edit"
                    element={
                      <ProtectedRoute>
                        <BlocEdit />
                      </ProtectedRoute>
                    }
                  />

                  {/* Folders */}
                  <Route
                    path="folders"
                    element={
                      <ProtectedRoute>
                        <FolderList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="folders/create"
                    element={
                      <ProtectedRoute>
                        <FolderEdit />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="folders/:folderId/edit"
                    element={
                      <ProtectedRoute>
                        <FolderEdit />
                      </ProtectedRoute>
                    }
                  />

                  {/* Rooms */}
                  <Route
                    path="rooms"
                    element={
                      <ProtectedRoute>
                        <RoomList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="rooms/create"
                    element={
                      <ProtectedRoute>
                        <RoomEdit />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="rooms/:roomId/edit"
                    element={
                      <ProtectedRoute>
                        <RoomEdit />
                      </ProtectedRoute>
                    }
                  />

                  {/* Shelves */}
                  <Route
                    path="shelves"
                    element={
                      <ProtectedRoute>
                        <ShelfList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="shelves/create"
                    element={
                      <ProtectedRoute>
                        <ShelfEdit />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="shelves/:shelfId/edit"
                    element={
                      <ProtectedRoute>
                        <ShelfEdit />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Network Module - Protected */}
                <Route path="network">
                  {/* Geovisualization Map */}
                  <Route
                    path="map"
                    element={
                      <ProtectedRoute>
                        <NetworkMapPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Geo Debug Page */}
                  <Route
                    path="map/debug"
                    element={
                      <ProtectedRoute>
                        <GeoDebugPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Flow Monitoring Dashboard */}
                  <Route
                    path="flow/dashboard"
                    element={
                      <ProtectedRoute>
                        <FlowDashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Common */}
                  <Route path="common">
                    {/* Products */}
                    <Route
                      path="products"
                      element={
                        <ProtectedRoute>
                          <ProductList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="products/:productId"
                      element={
                        <ProtectedRoute>
                          <ProductEdit />
                        </ProtectedRoute>
                      }
                    />

                    {/* Regions */}
                    <Route
                      path="regions"
                      element={
                        <ProtectedRoute>
                          <RegionList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="regions/create"
                      element={
                        <ProtectedRoute>
                          <RegionEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="regions/:regionId/edit"
                      element={
                        <ProtectedRoute>
                          <RegionEdit />
                        </ProtectedRoute>
                      }
                    />

                    {/* Partners */}
                    <Route
                      path="partners"
                      element={
                        <ProtectedRoute>
                          <PartnerList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="partners/create"
                      element={
                        <ProtectedRoute>
                          <PartnerEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="partners/:partnerId/edit"
                      element={
                        <ProtectedRoute>
                          <PartnerEdit />
                        </ProtectedRoute>
                      }
                    />

                    {/* Vendors */}
                    <Route
                      path="vendors"
                      element={
                        <ProtectedRoute>
                          <VendorList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="vendors/create"
                      element={
                        <ProtectedRoute>
                          <VendorEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="vendors/:vendorId/edit"
                      element={
                        <ProtectedRoute>
                          <VendorEdit />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Core Infrastructure */}
                  <Route path="core">
                    {/* Stations */}
                    <Route
                      path="stations"
                      element={
                        <ProtectedRoute>
                          <StationList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="stations/create"
                      element={
                        <ProtectedRoute>
                          <StationEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="stations/:stationId/edit"
                      element={
                        <ProtectedRoute>
                          <StationEdit />
                        </ProtectedRoute>
                      }
                    />

                    {/* Terminals */}
                    <Route
                      path="terminals"
                      element={
                        <ProtectedRoute>
                          <TerminalList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="terminals/create"
                      element={
                        <ProtectedRoute>
                          <TerminalEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="terminals/:terminalId/edit"
                      element={
                        <ProtectedRoute>
                          <TerminalEdit />
                        </ProtectedRoute>
                      }
                    />

                    {/* Hydrocarbon Fields */}
                    <Route
                      path="hydrocarbon-fields"
                      element={
                        <ProtectedRoute>
                          <HydrocarbonFieldList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="hydrocarbon-fields/create"
                      element={
                        <ProtectedRoute>
                          <HydrocarbonFieldEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="hydrocarbon-fields/:fieldId/edit"
                      element={
                        <ProtectedRoute>
                          <HydrocarbonFieldEdit />
                        </ProtectedRoute>
                      }
                    />

                    {/* Pipelines */}
                    <Route
                      path="pipelines"
                      element={
                        <ProtectedRoute>
                          <PipelineList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="pipelines/create"
                      element={
                        <ProtectedRoute>
                          <PipelineEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="pipelines/:pipelineId/edit"
                      element={
                        <ProtectedRoute>
                          <PipelineEdit />
                        </ProtectedRoute>
                      }
                    />

                    {/* Pipeline Systems */}
                    <Route
                      path="pipeline-systems"
                      element={
                        <ProtectedRoute>
                          <PipelineSystemList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="pipeline-systems/create"
                      element={
                        <ProtectedRoute>
                          <PipelineSystemEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="pipeline-systems/:pipelineSystemId/edit"
                      element={
                        <ProtectedRoute>
                          <PipelineSystemEdit />
                        </ProtectedRoute>
                      }
                    />
                  </Route>
                </Route>

                {/* Unauthorized page */}
                <Route
                  path="unauthorized"
                  element={
                    <div style={{ padding: 24 }}>
                      <h1>403 - Unauthorized</h1>
                      <p>You don't have permission to access this resource.</p>
                    </div>
                  }
                />

                {/* 404 - Not Found */}
                <Route
                  path="*"
                  element={
                    <div style={{ padding: 24 }}>
                      <h1>404 - Page Not Found</h1>
                      <p>The page you're looking for doesn't exist.</p>
                    </div>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
