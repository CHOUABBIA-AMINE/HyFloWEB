/**
 * Coordinate Display Component
 * Shows cursor coordinates as floating overlay on map
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-06-2026
 */

import React, { useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import { Box, Paper, Typography } from '@mui/material';
import { LocationOn } from '@mui/icons-material';

export const CoordinateDisplay: React.FC = () => {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useMapEvents({
    mousemove: (event) => {
      const { lat, lng } = event.latlng;
      setCoordinates({ lat, lng });
      
      // Get mouse position relative to the map container
      const mapContainer = event.target.getContainer();
      const rect = mapContainer.getBoundingClientRect();
      setMousePosition({
        x: event.originalEvent.clientX - rect.left,
        y: event.originalEvent.clientY - rect.top
      });
    },
    mouseout: () => {
      setCoordinates(null);
    }
  });

  if (!coordinates) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        left: mousePosition.x + 15,
        top: mousePosition.y + 15,
        pointerEvents: 'none',
        zIndex: 1000,
        px: 1.5,
        py: 0.75,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        transition: 'opacity 0.2s',
        minWidth: '200px'
      }}
    >
      <LocationOn fontSize="small" color="primary" />
      <Box>
        <Typography variant="caption" component="div" sx={{ lineHeight: 1.2, fontWeight: 500 }}>
          {coordinates.lat.toFixed(6)}°N
        </Typography>
        <Typography variant="caption" component="div" sx={{ lineHeight: 1.2, fontWeight: 500 }}>
          {coordinates.lng.toFixed(6)}°E
        </Typography>
      </Box>
    </Paper>
  );
};
