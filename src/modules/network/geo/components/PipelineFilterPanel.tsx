/**
 * Pipeline Filter Panel Component
 * Advanced filtering panel for pipeline map
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  Divider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { PipelineFilterState } from '../types/pipeline-filters.types';
import { DEFAULT_PRODUCT_COLORS, DEFAULT_STATUS_COLORS } from '../types/pipeline-filters.types';

interface PipelineFilterPanelProps {
  filterState: PipelineFilterState;
  onToggleProduct: (product: string) => void;
  onToggleStatus: (status: string) => void;
  onSearchChange: (code: string) => void;
  onToggleLabels: () => void;
  onToggleDirection: () => void;
  onReset: () => void;
  onToggleAllProducts: () => void;
  onToggleAllStatuses: () => void;
  totalPipelines: number;
  filteredCount: number;
  onClose?: () => void;
}

export const PipelineFilterPanel: React.FC<PipelineFilterPanelProps> = ({
  filterState,
  onToggleProduct,
  onToggleStatus,
  onSearchChange,
  onToggleLabels,
  onToggleDirection,
  onReset,
  onToggleAllProducts,
  onToggleAllStatuses,
  totalPipelines,
  filteredCount,
  onClose,
}) => {
  const { availableProducts, availableStatuses, filters } = filterState;

  const activeFilterCount =
    filters.products.length + filters.statuses.length + (filters.searchCode ? 1 : 0);

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 80,
        right: 16,
        width: 320,
        maxHeight: 'calc(100vh - 120px)',
        overflow: 'auto',
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon color="primary" />
          <Typography variant="h6">Pipeline Filters</Typography>
          {activeFilterCount > 0 && (
            <Chip label={activeFilterCount} size="small" color="primary" />
          )}
        </Box>
        {onClose && (
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Results Count */}
      <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
        <Typography variant="body2" color="text.secondary">
          Showing <strong>{filteredCount}</strong> of <strong>{totalPipelines}</strong> pipelines
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Search by Code */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search by code or name..."
          value={filters.searchCode}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: filters.searchCode && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onSearchChange('')}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Product Filter */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <Typography variant="subtitle2">Product Type</Typography>
              {filters.products.length > 0 && (
                <Chip label={filters.products.length} size="small" color="primary" />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 1 }}>
              <Button size="small" onClick={onToggleAllProducts}>
                {filters.products.length === availableProducts.length ? 'Deselect All' : 'Select All'}
              </Button>
            </Box>
            <FormGroup>
              {availableProducts.map((product) => (
                <FormControlLabel
                  key={product}
                  control={
                    <Checkbox
                      checked={filters.products.includes(product)}
                      onChange={() => onToggleProduct(product)}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 3,
                          bgcolor: DEFAULT_PRODUCT_COLORS[product] || '#95A5A6',
                          borderRadius: 1,
                        }}
                      />
                      <Typography variant="body2">
                        {product.replace('_', ' ')}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        {/* Status Filter */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <Typography variant="subtitle2">Operational Status</Typography>
              {filters.statuses.length > 0 && (
                <Chip label={filters.statuses.length} size="small" color="primary" />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 1 }}>
              <Button size="small" onClick={onToggleAllStatuses}>
                {filters.statuses.length === availableStatuses.length ? 'Deselect All' : 'Select All'}
              </Button>
            </Box>
            <FormGroup>
              {availableStatuses.map((status) => (
                <FormControlLabel
                  key={status}
                  control={
                    <Checkbox
                      checked={filters.statuses.includes(status)}
                      onChange={() => onToggleStatus(status)}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: DEFAULT_STATUS_COLORS[status] || '#95A5A6',
                          borderRadius: '50%',
                        }}
                      />
                      <Typography variant="body2">
                        {status.replace('_', ' ')}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        {/* Display Options */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Display Options</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.showLabels}
                    onChange={onToggleLabels}
                    size="small"
                  />
                }
                label="Show Labels"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.showDirection}
                    onChange={onToggleDirection}
                    size="small"
                  />
                }
                label="Show Flow Direction"
              />
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 2 }} />

        {/* Reset Button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onReset}
          disabled={activeFilterCount === 0}
        >
          Reset Filters
        </Button>
      </Box>
    </Paper>
  );
};
