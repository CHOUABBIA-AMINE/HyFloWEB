/**
 * Pipeline Map Page
 * Dedicated page for pipeline visualization with advanced filtering
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 */

import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { PipelineMapView } from '../components';

export const PipelineMapPage: React.FC = () => {
  return (
    <Container maxWidth={false} disableGutters>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            borderRadius: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h4" component="h1">
            Pipeline Network Map
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
            Visualize pipelines by product type with advanced filtering
          </Typography>
        </Paper>

        {/* Map */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <PipelineMapView />
        </Box>
      </Box>
    </Container>
  );
};
