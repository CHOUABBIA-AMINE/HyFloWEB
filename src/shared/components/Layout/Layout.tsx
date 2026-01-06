/**
 * Layout Component
 * Main layout wrapper with navbar, sidebar, footer, and content area
 * Uses AuthContext for authentication state
 *
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 01-06-2026 - Fixed margin calculation, 5px on all sides
 */

import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const NAVBAR_HEIGHT = 64;
const FOOTER_HEIGHT = 40;
const DRAWER_WIDTH_COLLAPSED = 64;
const DRAWER_WIDTH_EXPANDED = 260;
const CONTENT_MARGIN = 5; // 5px margin on all sides

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Check if current route is login page
  const isLoginPage = location.pathname === '/login';

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Navbar */}
      <Navbar onMenuClick={handleMenuClick} isAuthenticated={isAuthenticated} />

      {/* Sidebar - Only show when authenticated */}
      {isAuthenticated && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      {/* Main Content Area - Already positioned next to sidebar by flex layout */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          height: '100vh',
          overflow: 'hidden',
          // Critical: allow children (DataGrid) to shrink within flex containers
          minWidth: 0,
          minHeight: 0,
        }}
      >
        {/* Content with 5px margin on all sides */}
        <Box
          sx={{
            flexGrow: 1,
            mt: `${NAVBAR_HEIGHT + CONTENT_MARGIN}px`,
            mb: `${FOOTER_HEIGHT + CONTENT_MARGIN}px`,
            ml: `${CONTENT_MARGIN}px`,  // Just 5px - sidebar already handled by flex
            mr: `${CONTENT_MARGIN}px`,
            // Allow horizontal + vertical scrolling when needed (DataGrid wide columns)
            overflowX: 'auto',
            overflowY: 'auto',
            bgcolor: 'background.default',
            // Critical: allow children (DataGrid) to shrink within flex containers
            minWidth: 0,
            minHeight: 0,
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#e2e8f0',
              borderRadius: '4px',
              '&:hover': {
                background: '#cbd5e1',
              },
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Layout;
