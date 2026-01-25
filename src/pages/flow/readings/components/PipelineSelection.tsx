/**
 * PipelineSelection Component
 * 
 * Allows users to select a pipeline based on their organizational structure.
 * Displays latest reading as reference and loads threshold configuration.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

import React, { useState, useEffect } from 'react';
import { Controller, Control } from 'react-hook-form';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

import { PipelineService } from '@/modules/network/core/services/PipelineService';
import { FlowReadingService } from '@/modules/flow/core/services/FlowReadingService';
import { FlowThresholdService } from '@/modules/flow/core/services/FlowThresholdService';

import type { PipelineDTO } from '@/modules/network/core/dto/PipelineDTO';
import type { FlowReadingDTO } from '@/modules/flow/core/dto/FlowReadingDTO';
import type { FlowThresholdDTO } from '@/modules/flow/core/dto/FlowThresholdDTO';
import type { EmployeeDTO } from '@/modules/general/organization/dto/EmployeeDTO';

interface PipelineSelectionProps {
  control: Control<any>;
  currentUser: EmployeeDTO;
  selectedPipelineId?: number;
  onThresholdLoad: (threshold: FlowThresholdDTO | undefined) => void;
}

export const PipelineSelection: React.FC<PipelineSelectionProps> = ({
  control,
  currentUser,
  selectedPipelineId,
  onThresholdLoad,
}) => {
  const [pipelines, setPipelines] = useState<PipelineDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestReading, setLatestReading] = useState<FlowReadingDTO | null>(null);
  const [loadingReading, setLoadingReading] = useState(false);

  useEffect(() => {
    loadPipelines();
  }, [currentUser]);

  useEffect(() => {
    if (selectedPipelineId) {
      loadLatestReading(selectedPipelineId);
      loadThreshold(selectedPipelineId);
    } else {
      setLatestReading(null);
      onThresholdLoad(undefined);
    }
  }, [selectedPipelineId]);

  const loadPipelines = async () => {
    try {
      setLoading(true);
      // Get pipelines for user's structure
      const userPipelines = await PipelineService.getByStructure(currentUser.structureId);
      // Filter only active pipelines
      const activePipelines = userPipelines.filter(p => p.active);
      setPipelines(activePipelines);
    } catch (error) {
      console.error('Error loading pipelines:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLatestReading = async (pipelineId: number) => {
    try {
      setLoadingReading(true);
      const reading = await FlowReadingService.getLatestByPipeline(pipelineId);
      setLatestReading(reading);
    } catch (error) {
      // No previous readings - not an error
      setLatestReading(null);
    } finally {
      setLoadingReading(false);
    }
  };

  const loadThreshold = async (pipelineId: number) => {
    try {
      const thresholds = await FlowThresholdService.getActiveByPipeline(pipelineId);
      if (thresholds.length > 0) {
        onThresholdLoad(thresholds[0]);
      } else {
        onThresholdLoad(undefined);
      }
    } catch (error) {
      console.error('Error loading threshold:', error);
      onThresholdLoad(undefined);
    }
  };

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatValue = (value?: number, unit?: string): string => {
    if (value === undefined || value === null) return 'N/A';
    return `${value.toFixed(2)} ${unit || ''}`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Pipeline
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose the pipeline where the reading was taken. Only pipelines from your organizational structure are shown.
      </Typography>

      <Controller
        name="pipelineId"
        control={control}
        rules={{ required: 'Pipeline selection is required' }}
        render={({ field, fieldState: { error } }) => (
          <FormControl fullWidth error={!!error} disabled={loading}>
            <InputLabel>Pipeline *</InputLabel>
            <Select
              {...field}
              label="Pipeline *"
              value={field.value || ''}
            >
              {loading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading pipelines...
                </MenuItem>
              ) : pipelines.length === 0 ? (
                <MenuItem disabled>
                  No pipelines available for your structure
                </MenuItem>
              ) : (
                pipelines.map((pipeline) => (
                  <MenuItem key={pipeline.id} value={pipeline.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography variant="body1" sx={{ flex: 1 }}>
                        {pipeline.code} - {pipeline.designation}
                      </Typography>
                      {pipeline.product && (
                        <Chip 
                          label={pipeline.product.designation} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
            {error && <FormHelperText>{error.message}</FormHelperText>}
          </FormControl>
        )}
      />

      {selectedPipelineId && loadingReading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2">Loading latest reading...</Typography>
        </Box>
      )}

      {selectedPipelineId && !loadingReading && latestReading && (
        <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 3 }}>
          <AlertTitle>Latest Reading Reference</AlertTitle>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Recorded At</Typography>
              <Typography variant="body2">{formatDateTime(latestReading.recordedAt)}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Pressure</Typography>
              <Typography variant="body2">{formatValue(latestReading.pressure, 'bar')}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Temperature</Typography>
              <Typography variant="body2">{formatValue(latestReading.temperature, '°C')}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Flow Rate</Typography>
              <Typography variant="body2">{formatValue(latestReading.flowRate, 'm³/h')}</Typography>
            </Grid>
          </Grid>
        </Alert>
      )}

      {selectedPipelineId && !loadingReading && !latestReading && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <AlertTitle>No Previous Readings</AlertTitle>
          This is the first reading for this pipeline.
        </Alert>
      )}
    </Box>
  );
};
