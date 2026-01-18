/**
 * Main Application Component
 * Handles routing, authentication, and i18n with RTL support
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 12-28-2025
 * @updated 12-30-2025 - Added Employee routes
 * @updated 01-01-2026 - Added Product routes
 * @updated 01-01-2026 - Added Partner/Vendor routes
 * @updated 01-06-2026 - Added Pipeline Map route
 * @updated 01-07-2026 - Removed non-existent Region routes
 * @updated 01-08-2026 - Added type assertion for stylis plugins
 * @updated 01-08-2026 - Fixed Product edit route to include /edit suffix
 * @updated 01-15-2026 - Replaced HydrocarbonField with ProductionField
 * @updated 01-19-2026 - Added Location routes
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
  ProductionFieldList,
  ProductionFieldEdit,
  ProcessingPlantList,
  ProcessingPlantEdit,
  PipelineList,
  PipelineEdit,
  PipelineSystemList,
  PipelineSystemEdit
} from './modules/network/core/pages';
import { NetworkMapPage, GeoDebugPage, PipelineMapPage } from './modules/network/geo/pages';
import { StructureList, StructureEdit, EmployeeList, EmployeeEdit } from './modules/general/organization';
import { LocationList, LocationEdit } from './modules/general/localization/pages';

// Network Common
import ProductList from './modules/network/common/pages/ProductList';
import ProductEdit from './modules/network/common/pages/ProductEdit';
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
      createCache({        key: isRtl ? 'muirtl' : 'muiltr',
        // Type assertion needed due to recursive type incompatibility between
        // our StylisElement definition and emotion's internal types.
        // The plugins are structurally compatible and work correctly at runtime.
        stylisPlugins: (isRtl ? [prefixer, rtlPlugin] : [prefixer]) as any,
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

                {/* General Module - Protected */}
                <Route path="general">
                  {/* Localization */}
                  <Route path="localization">
                    {/* Locations */}
                    <Route
                      path="locations"
                      element={
                        <ProtectedRoute>
                          <LocationList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="locations/create"
                      element={
                        <ProtectedRoute>
                          <LocationEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="locations/:locationId/edit"
                      element={
                        <ProtectedRoute>
                          <LocationEdit />
                        </ProtectedRoute>
                      }
                    />
                  </Route>
                </Route>

                {/* Network Module - Protected */}
                <Route path="network">
                  {/* Geovisualization Maps */}
                  <Route
                    path="map"
                    element={
                      <ProtectedRoute>
                        <NetworkMapPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Pipeline Map - Product-based visualization */}
                  <Route
                    path="map/pipelines"
                    element={
                      <ProtectedRoute>
                        <PipelineMapPage />
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
                      path="products/create"
                      element={
                        <ProtectedRoute>
                          <ProductEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="products/:productId/edit"
                      element={
                        <ProtectedRoute>
                          <ProductEdit />
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

                    {/* Production Fields (formerly Hydrocarbon Fields) */}
                    <Route
                      path="production-fields"
                      element={
                        <ProtectedRoute>
                          <ProductionFieldList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="production-fields/create"
                      element={
                        <ProtectedRoute>
                          <ProductionFieldEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="production-fields/:fieldId/edit"
                      element={
                        <ProtectedRoute>
                          <ProductionFieldEdit />
                        </ProtectedRoute>
                      }
                    />

                    {/* Backward compatibility redirect */}
                    <Route path="hydrocarbon-fields" element={<Navigate to="/network/core/production-fields" replace />} />
                    <Route path="hydrocarbon-fields/create" element={<Navigate to="/network/core/production-fields/create" replace />} />
                    <Route path="hydrocarbon-fields/:fieldId/edit" element={<Navigate to="/network/core/production-fields/:fieldId/edit" replace />} />

                    {/* Processing Plants */}
                    <Route
                      path="processing-plants"
                      element={
                        <ProtectedRoute>
                          <ProcessingPlantList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="processing-plants/create"
                      element={
                        <ProtectedRoute>
                          <ProcessingPlantEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="processing-plants/:plantId/edit"
                      element={
                        <ProtectedRoute>
                          <ProcessingPlantEdit />
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
