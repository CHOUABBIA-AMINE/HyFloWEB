/**
 * Dashboard Component
 * Main dashboard page with welcome message
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 */

import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const stats = [
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: t('nav.users'),
      value: '-',
      color: '#2563eb',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: t('nav.roles'),
      value: '-',
      color: '#059669',
    },
    {
      icon: <NetworkCheckIcon sx={{ fontSize: 40 }} />,
      title: t('nav.network'),
      value: '-',
      color: '#dc2626',
    },
    {
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      title: t('nav.system'),
      value: '-',
      color: '#7c3aed',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
        {t('nav.dashboard')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome back, {user?.firstName || user?.username}!
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: `${stat.color}15`,
                      color: stat.color,
                      display: 'flex',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Getting Started
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Welcome to the IAAS Platform. This is your central management dashboard where you
            can monitor and control your infrastructure as a service.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the sidebar navigation to access different modules and features.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
