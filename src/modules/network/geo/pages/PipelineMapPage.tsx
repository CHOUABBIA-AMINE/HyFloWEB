/**
 * Pipeline Map Page
 * Dedicated page for pipeline visualization with advanced filtering
 * Full-screen map without header for maximum viewing area
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-06-2026 - Removed header for full-screen experience
 */

import React from 'react';
import { Box } from '@mui/material';
import { PipelineMapView } from '../components';

export const PipelineMapPage: React.FC = () => {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <PipelineMapView />
    </Box>
  );
};
