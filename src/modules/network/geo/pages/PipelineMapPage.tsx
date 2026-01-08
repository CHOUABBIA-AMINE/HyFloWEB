/**
 * Pipeline Map Page
 * Dedicated page for pipeline visualization with advanced filtering
 * Full-screen map without header for maximum viewing area
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-08-2026 - Added data fetching and loading states
 */

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { PipelineMapView } from '../components';
import geoService from '../services/geoService';
import { PipelineGeoData } from '../types';

export const PipelineMapPage: React.FC = () => {
  const [pipelines, setPipelines] = useState<PipelineGeoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await geoService.getAllInfrastructure();
        setPipelines(data.pipelines || []);
      } catch (err) {
        console.error('Error fetching pipeline data:', err);
        setError('Failed to load pipeline data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading pipeline data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <PipelineMapView pipelines={pipelines} />
    </Box>
  );
};
