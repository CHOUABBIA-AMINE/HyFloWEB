/**
 * Sidebar Component
 * Side navigation menu with collapsible icon-only mode and i18n support
 *
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 01-29-2026 - Added Flow Forecasts and Operations menus
 * @updated 01-28-2026 - Added Flow Thresholds menu
 * @updated 01-25-2026 - Added Flow Readings menu with List, Create, Validate submenus
 * @updated 01-20-2026 - Reorganized: Maps (Infrastructure Map, Pipeline Map), Statistics (Dashboard), Reading under Workspace
 * @updated 12-28-2025
 * @updated 12-30-2025 - Added Employee entry
 * @updated 01-01-2026 - Reordered and simplified menus (view)
 * @updated 01-01-2026 - Restored Common children (Administration/Communication/Environment)
 * @updated 01-01-2026 - Added Workspace + Home translations
 * @updated 01-01-2026 - Moved Dashboard/Map under Workspace
 * @updated 01-06-2026 - Added Pipeline Map entry under Workspace
 * @updated 01-09-2026 - Restructured menu: Created General section, moved Organization & Localization from Network
 * @updated 01-09-2026 - Removed Regions menu item (entity no longer exists)
 * @updated 01-16-2026 - Replaced HydrocarbonFields with ProcessingPlants (matches data model: ProcessingPlant contains ProductionFields)
 * @updated 01-17-2026 - Updated processingPlants menu entry to use 'processingPlant.title' translation key
 * @updated 01-19-2026 - Added Locations menu item under General > Localization
 */

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Collapse,
  Tooltip,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import BusinessIcon from '@mui/icons-material/Business';
import SettingsIcon from '@mui/icons-material/Settings';
import PublicIcon from '@mui/icons-material/Public';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FactoryIcon from '@mui/icons-material/Factory';
import OilBarrelIcon from '@mui/icons-material/OilBarrel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PlaceIcon from '@mui/icons-material/Place';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import BadgeIcon from '@mui/icons-material/Badge';
import HomeIcon from '@mui/icons-material/Home';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MapIcon from '@mui/icons-material/Map';
import TimelineIcon from '@mui/icons-material/Timeline';
import AppsIcon from '@mui/icons-material/Apps';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import BarChartIcon from '@mui/icons-material/BarChart';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const DRAWER_WIDTH_EXPANDED = 260;
const DRAWER_WIDTH_COLLAPSED = 64;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface MenuItem {
  titleKey: string;
  icon: React.ReactElement;
  path?: string;
  children?: MenuItem[];
  parent?: string;
}

const Sidebar = ({ open }: SidebarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  // Top-level order: Home, Workspace (Reading, Thresholds, Forecasts, Operations, Maps, Statistics), General, Network, System
  const menuItems: MenuItem[] = [
    {
      titleKey: 'nav.home',
      icon: <HomeIcon />,
      path: '/',
    },
    {
      titleKey: 'nav.workspace',
      icon: <WorkspacesIcon />,
      children: [
        {
          titleKey: 'nav.reading',
          icon: <MenuBookIcon />,
          children: [
            {
              titleKey: 'nav.readings.list',
              icon: <ListAltIcon />,
              path: '/flow/readings',
            },
            {
              titleKey: 'nav.readings.create',
              icon: <AddCircleIcon />,
              path: '/flow/readings/new',
            },
            {
              titleKey: 'nav.readings.validate',
              icon: <CheckCircleIcon />,
              path: '/flow/readings/pending',
            },
          ],
        },
        {
          titleKey: 'nav.thresholds',
          icon: <SpeedIcon />,
          children: [
            {
              titleKey: 'nav.thresholds.list',
              icon: <ListAltIcon />,
              path: '/flow/thresholds',
            },
            {
              titleKey: 'nav.thresholds.create',
              icon: <AddCircleIcon />,
              path: '/flow/thresholds/new',
            },
          ],
        },
        {
          titleKey: 'nav.forecasts',
          icon: <TrendingUpIcon />,
          children: [
            {
              titleKey: 'nav.forecasts.list',
              icon: <ListAltIcon />,
              path: '/flow/forecasts',
            },
            {
              titleKey: 'nav.forecasts.create',
              icon: <AddCircleIcon />,
              path: '/flow/forecasts/new',
            },
          ],
        },
        {
          titleKey: 'nav.operations',
          icon: <LocalShippingIcon />,
          children: [
            {
              titleKey: 'nav.operations.list',
              icon: <ListAltIcon />,
              path: '/flow/operations',
            },
            {
              titleKey: 'nav.operations.create',
              icon: <AddCircleIcon />,
              path: '/flow/operations/new',
            },
          ],
        },
        {
          titleKey: 'nav.maps',
          icon: <MapIcon />,
          children: [
            {
              titleKey: 'nav.infrastructureMap',
              icon: <MapIcon />,
              path: '/network/map',
            },
            {
              titleKey: 'nav.pipelineMap',
              icon: <TimelineIcon />,
              path: '/network/map/pipelines',
            },
          ],
        },
        {
          titleKey: 'nav.statistics',
          icon: <BarChartIcon />,
          children: [
            {
              titleKey: 'nav.dashboard',
              icon: <DashboardIcon />,
              path: '/network/flow/dashboard',
            },
          ],
        },
      ],
    },
    {
      titleKey: 'nav.general',
      icon: <AppsIcon />,
      children: [
        {
          titleKey: 'nav.organization',
          icon: <AdminPanelSettingsIcon />,
          children: [
            {
              titleKey: 'nav.structures',
              icon: <CorporateFareIcon />,
              path: '/administration/structures',
            },
            {
              titleKey: 'nav.employees',
              icon: <BadgeIcon />,
              path: '/administration/employees',
            },
          ],
        },
        {
          titleKey: 'nav.localization',
          icon: <LocationOnIcon />,
          children: [
            {
              titleKey: 'nav.locations',
              icon: <PlaceIcon />,
              path: '/general/localization/locations',
            },
          ],
        },
      ],
    },
    {
      titleKey: 'nav.network',
      icon: <NetworkCheckIcon />,
      children: [
        {
          titleKey: 'nav.common',
          icon: <PublicIcon />,
          children: [
            {
              titleKey: 'nav.products',
              icon: <OilBarrelIcon />,
              path: '/network/common/products',
            },
            {
              titleKey: 'nav.partners',
              icon: <BusinessCenterIcon />,
              path: '/network/common/partners',
            },
            {
              titleKey: 'nav.vendors',
              icon: <BusinessIcon />,
              path: '/network/common/vendors',
            },
          ],
        },
        {
          titleKey: 'nav.core',
          icon: <AccountTreeIcon />,
          children: [
            {
              titleKey: 'nav.productionFields',
              icon: <OilBarrelIcon />,
              path: '/network/core/production-fields',
            },
            {
              titleKey: 'nav.processingPlants',
              icon: <PrecisionManufacturingIcon />,
              path: '/network/core/processing-plants',
            },
            {
              titleKey: 'nav.pipelineSystems',
              icon: <AccountTreeIcon />,
              path: '/network/core/pipeline-systems',
            },
            {
              titleKey: 'nav.pipelines',
              icon: <AccountTreeIcon />,
              path: '/network/core/pipelines',
            },
            {
              titleKey: 'nav.stations',
              icon: <FactoryIcon />,
              path: '/network/core/stations',
            },
            {
              titleKey: 'nav.terminals',
              icon: <FactoryIcon />,
              path: '/network/core/terminals',
            },
          ],
        },
      ],
    },
    {
      titleKey: 'nav.system',
      icon: <SettingsIcon />,
      children: [
        {
          titleKey: 'nav.security',
          icon: <SecurityIcon />,
          children: [
            {
              titleKey: 'nav.users',
              icon: <PeopleIcon />,
              path: '/security/users',
            },
            {
              titleKey: 'nav.roles',
              icon: <VpnKeyIcon />,
              path: '/security/roles',
            },
            {
              titleKey: 'nav.groups',
              icon: <GroupIcon />,
              path: '/security/groups',
            },
          ],
        },
        {
          titleKey: 'nav.auth',
          icon: <AdminPanelSettingsIcon />,
          children: [
            {
              titleKey: 'nav.sessions',
              icon: <AssignmentIcon />,
              path: '/auth/sessions',
            },
          ],
        },
        {
          titleKey: 'nav.audit',
          icon: <AssignmentIcon />,
          children: [
            {
              titleKey: 'nav.logs',
              icon: <AssignmentIcon />,
              path: '/audit/logs',
            },
          ],
        },
      ],
    },
  ];

  const isExpanded = open || isHovered;
  const drawerWidth = isExpanded ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COLLAPSED;

  const getItemDepth = (itemTitle: string, items: MenuItem[] = menuItems, depth = 0): number => {
    for (const item of items) {
      if (t(item.titleKey) === itemTitle) {
        return depth;
      }
      if (item.children) {
        const childDepth = getItemDepth(itemTitle, item.children, depth + 1);
        if (childDepth !== -1) return childDepth;
      }
    }
    return -1;
  };

  const handleItemClick = (item: MenuItem) => {
    const title = t(item.titleKey);

    if (item.children) {
      const clickedDepth = getItemDepth(title);

      setExpandedItems((prev) => {
        const isCurrentlyExpanded = prev.includes(title);

        if (isCurrentlyExpanded) {
          return prev.filter((expandedTitle) => {
            const expandedDepth = getItemDepth(expandedTitle);
            return expandedDepth < clickedDepth || expandedTitle !== title;
          });
        } else {
          const filtered = prev.filter((expandedTitle) => {
            const expandedDepth = getItemDepth(expandedTitle);
            return expandedDepth < clickedDepth;
          });
          return [...filtered, title];
        }
      });
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const renderMenuItem = (item: MenuItem, depth = 0, index = 0) => {
    const title = t(item.titleKey);
    const isExpandedItem = expandedItems.includes(title);
    const isActive = item.path === location.pathname;
    const hasChildren = Boolean(item.children);

    const listItemButton = (
      <ListItemButton
        onClick={() => handleItemClick(item)}
        sx={{
          pl: 2 + depth * 2,
          py: 1.25,
          minHeight: 48,
          justifyContent: isExpanded ? 'initial' : 'center',
          bgcolor: isActive ? 'primary.main' : 'transparent',
          color: isActive ? 'primary.contrastText' : 'text.primary',
          '&:hover': {
            bgcolor: isActive ? 'primary.dark' : 'action.hover',
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: isExpanded ? 2 : 'auto',
            justifyContent: 'center',
            color: isActive ? 'primary.contrastText' : 'text.secondary',
          }}
        >
          {item.icon}
        </ListItemIcon>
        {isExpanded && (
          <>
            <ListItemText
              primary={title}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
              }}
            />
            {hasChildren && (isExpandedItem ? <ExpandLess /> : <ExpandMore />)}
          </>
        )}
      </ListItemButton>
    );

    return (
      <Box key={`${item.titleKey}-${depth}-${index}`}>
        <ListItem disablePadding>
          {!isExpanded ? (
            <Tooltip title={title} placement="right">
              {listItemButton}
            </Tooltip>
          ) : (
            listItemButton
          )}
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpandedItem && isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child, childIndex) => renderMenuItem(child, depth + 1, childIndex))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Drawer
      variant="permanent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        transition: 'width 0.2s ease-in-out',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: 64,
          height: 'calc(100% - 64px - 40px)',
          overflowX: 'hidden',
          overflowY: 'auto',
          transition: 'width 0.2s ease-in-out',
          '&::-webkit-scrollbar': {
            width: '6px',
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
        },
      }}
    >
      <List sx={{ pt: 2, px: 1 }}>{menuItems.map((item, index) => renderMenuItem(item, 0, index))}</List>
    </Drawer>
  );
};

export default Sidebar;
