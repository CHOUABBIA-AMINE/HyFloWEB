/**
 * Pipeline Polylines Component
 * Renders pipeline routes on the map as polylines
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-06-2026
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Polyline, Popup, Tooltip } from 'react-leaflet';
import { PipelineGeoData, PipelineDisplayOptions } from '../types';
import { getPipelineStyle, formatPipelineInfo, getPipelineCenter } from '../utils/pipelineHelpers';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Chip, Divider } from '@mui/material';

interface PipelinePolylinesProps {
  pipelines: PipelineGeoData[];
  displayOptions?: Partial<PipelineDisplayOptions>;
  onPipelineClick?: (pipelineId: number) => void;
}

const defaultDisplayOptions: PipelineDisplayOptions = {
  color: '#2196F3',
  weight: 3,
  opacity: 0.8,
  showLabels: true,
  showDirection: true,
  highlightOnHover: true,
};

export const PipelinePolylines: React.FC<PipelinePolylinesProps> = ({
  pipelines,
  displayOptions = {},
  onPipelineClick,
}) => {
  const navigate = useNavigate();
  const [hoveredPipeline, setHoveredPipeline] = useState<number | null>(null);
  
  const options = { ...defaultDisplayOptions, ...displayOptions };
  
  // Debug logging on mount and when pipelines change
  useEffect(() => {
    console.log('PipelinePolylines - Component mounted/updated');
    console.log('PipelinePolylines - Received pipelines:', pipelines);
    console.log('PipelinePolylines - Pipeline count:', pipelines.length);
    
    pipelines.forEach((pipelineData, index) => {
      console.log(`PipelinePolylines - Pipeline ${index}:`, {
        id: pipelineData.pipeline.id,
        code: pipelineData.pipeline.code,
        name: pipelineData.pipeline.name,
        coordinatesCount: pipelineData.coordinates?.length || 0,
        coordinates: pipelineData.coordinates
      });
    });
  }, [pipelines]);
  
  const pipelineElements = useMemo(() => {
    console.log('PipelinePolylines - Rendering pipeline elements, count:', pipelines.length);
    
    const elements = pipelines.map((pipelineData, index) => {
      const { pipeline, coordinates } = pipelineData;
      
      console.log(`PipelinePolylines - Processing pipeline ${index} (${pipeline.code}):`, {
        hasCoordinates: !!coordinates,
        coordinatesLength: coordinates?.length || 0,
        firstCoordinate: coordinates?.[0],
        lastCoordinate: coordinates?.[coordinates.length - 1]
      });
      
      if (!coordinates || coordinates.length < 2) {
        console.warn(`PipelinePolylines - SKIPPING Pipeline ${pipeline.code}: insufficient coordinates (${coordinates?.length || 0})`);
        return null;
      }
      
      // Get dynamic style based on pipeline properties
      const pipelineStyle = getPipelineStyle(pipeline);
      console.log(`PipelinePolylines - Pipeline ${pipeline.code} style:`, pipelineStyle);
      
      const isHovered = hoveredPipeline === pipeline.id;
      
      // Apply hover effect
      const effectiveStyle = {
        ...pipelineStyle,
        weight: isHovered ? pipelineStyle.weight + 2 : pipelineStyle.weight,
        opacity: isHovered ? 1 : pipelineStyle.opacity,
      };
      
      console.log(`PipelinePolylines - Creating Polyline for ${pipeline.code} with ${coordinates.length} positions`);
      
      const handleClick = () => {
        if (onPipelineClick) {
          onPipelineClick(pipeline.id);
        } else {
          navigate(`/network/core/pipelines/${pipeline.id}`);
        }
      };
      
      return (
        <Polyline
          key={`pipeline-${pipeline.id}`}
          positions={coordinates}
          pathOptions={effectiveStyle}
          eventHandlers={{
            mouseover: () => {
              if (options.highlightOnHover) {
                setHoveredPipeline(pipeline.id);
              }
            },
            mouseout: () => {
              if (options.highlightOnHover) {
                setHoveredPipeline(null);
              }
            },
            click: handleClick,
          }}
        >
          {/* Tooltip for quick info on hover */}
          {options.showLabels && (
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              <Box sx={{ p: 0.5 }}>
                <Typography variant="body2" fontWeight="bold">
                  {pipeline.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {pipeline.code}
                </Typography>
              </Box>
            </Tooltip>
          )}
          
          {/* Detailed popup on click */}
          <Popup maxWidth={300}>
            <Box sx={{ p: 1 }}>
              <Typography variant="h6" gutterBottom>
                {pipeline.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Code: {pipeline.code}
              </Typography>
              
              <Divider sx={{ my: 1 }} />
              
              {pipeline.operationalStatus && (
                <Box sx={{ mb: 1 }}>
                  <Chip
                    label={pipeline.operationalStatus.name || pipeline.operationalStatus.code}
                    size="small"
                    color={getStatusColor(pipeline.operationalStatus.code)}
                  />
                </Box>
              )}
              
              <Box sx={{ display: 'grid', gap: 0.5 }}>
                {pipeline.nominalDiameter && (
                  <Typography variant="body2">
                    <strong>Diameter:</strong> {pipeline.nominalDiameter}"
                  </Typography>
                )}
                
                {pipeline.length && (
                  <Typography variant="body2">
                    <strong>Length:</strong> {pipeline.length.toFixed(2)} km
                  </Typography>
                )}
                
                {pipeline.designCapacity && (
                  <Typography variant="body2">
                    <strong>Capacity:</strong> {pipeline.designCapacity.toLocaleString()} m³/day
                  </Typography>
                )}
                
                {pipeline.pipelineSystem && (
                  <Typography variant="body2">
                    <strong>System:</strong> {pipeline.pipelineSystem.name}
                  </Typography>
                )}
                
                {pipeline.departureFacility && (
                  <Typography variant="body2">
                    <strong>From:</strong> {pipeline.departureFacility.name}
                  </Typography>
                )}
                
                {pipeline.arrivalFacility && (
                  <Typography variant="body2">
                    <strong>To:</strong> {pipeline.arrivalFacility.name}
                  </Typography>
                )}
              </Box>
              
              <Button
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleClick}
              >
                View Details
              </Button>
            </Box>
          </Popup>
        </Polyline>
      );
    });
    
    const validElements = elements.filter(el => el !== null);
    console.log(`PipelinePolylines - Created ${validElements.length} valid pipeline elements out of ${elements.length} total`);
    
    return validElements;
  }, [pipelines, hoveredPipeline, options, onPipelineClick, navigate]);
  
  console.log('PipelinePolylines - Returning', pipelineElements.length, 'elements');
  
  return <>{pipelineElements}</>;
};

// Helper function to get color based on status
const getStatusColor = (statusCode?: string): 'success' | 'warning' | 'error' | 'default' => {
  if (!statusCode) return 'default';
  
  const code = statusCode.toLowerCase();
  
  if (code.includes('operational') || code.includes('active')) {
    return 'success';
  } else if (code.includes('maintenance')) {
    return 'warning';
  } else if (code.includes('inactive') || code.includes('decommissioned')) {
    return 'error';
  }
  
  return 'default';
};
