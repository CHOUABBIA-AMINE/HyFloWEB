/**
 * Pipeline Filter Panel Component
 * Compact icon-based filtering panel that expands on hover
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-08-2026 - Fixed type errors for color lookups
 */

import React, { useState } from 'react';
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
  Chip,
  IconButton,
  InputAdornment,
  Collapse,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Label as LabelIcon,
  Navigation as NavigationIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
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
  const [isHovered, setIsHovered] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'products' | 'status' | null>(null);

  const activeFilterCount =
    filters.products.length + filters.statuses.length + (filters.searchCode ? 1 : 0);

  const isExpanded = isHovered;

  // Helper function to get color with type safety
  const getStatusColor = (status: string): string => {
    return (DEFAULT_STATUS_COLORS as Record<string, string>)[status] || '#95A5A6';
  };

  const getProductColor = (product: string): string => {
    return (DEFAULT_PRODUCT_COLORS as Record<string, string>)[product] || '#95A5A6';
  };

  return (
    <Paper
      elevation={3}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setExpandedSection(null);
      }}
      sx={{
        position: 'absolute',
        top: 80,
        right: 16,
        width: isExpanded ? 320 : 56,
        maxHeight: 'calc(100vh - 120px)',
        overflow: 'hidden',
        zIndex: 1000,
        transition: 'width 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Compact Icon View */}
      {!isExpanded && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 1,
            gap: 1,
          }}
        >
          {/* Filter Icon with Badge */}
          <Box sx={{ position: 'relative' }}>
            <SearchIcon color="primary" sx={{ fontSize: 28 }} />
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                color="error"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  height: 20,
                  minWidth: 20,
                  '& .MuiChip-label': {
                    px: 0.5,
                    fontSize: '0.7rem',
                  },
                }}
              />
            )}
          </Box>

          {/* Results Count */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: '0.65rem', textAlign: 'center', lineHeight: 1.2 }}
          >
            {filteredCount}/{totalPipelines}
          </Typography>
        </Box>
      )}

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <Box sx={{ overflow: 'auto', height: '100%' }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SearchIcon />
              <Typography variant="subtitle2" fontWeight="bold">
                Filters
              </Typography>
              {activeFilterCount > 0 && (
                <Chip
                  label={activeFilterCount}
                  size="small"
                  sx={{
                    bgcolor: 'error.main',
                    color: 'white',
                    height: 20,
                  }}
                />
              )}
            </Box>
            {onClose && (
              <IconButton size="small" onClick={onClose} sx={{ color: 'inherit' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Results Count */}
          <Box sx={{ p: 1.5, bgcolor: 'action.hover' }}>
            <Typography variant="caption" color="text.secondary">
              Showing <strong>{filteredCount}</strong> of <strong>{totalPipelines}</strong>
            </Typography>
          </Box>

          <Box sx={{ p: 2 }}>
            {/* Search by Code */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search code..."
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
            <Box sx={{ mb: 2 }}>
              <Box
                onClick={() => setExpandedSection(expandedSection === 'products' ? null : 'products')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Products
                  </Typography>
                  {filters.products.length > 0 && (
                    <Chip label={filters.products.length} size="small" color="primary" />
                  )}
                </Box>
                {expandedSection === 'products' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>

              <Collapse in={expandedSection === 'products'}>
                <Box sx={{ mt: 1, pl: 1 }}>
                  <Button size="small" onClick={onToggleAllProducts} sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                    {filters.products.length === availableProducts.length ? 'Clear' : 'All'}
                  </Button>
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box
                              sx={{
                                width: 16,
                                height: 3,
                                bgcolor: getProductColor(product),
                                borderRadius: 1,
                              }}
                            />
                            <Typography variant="caption">
                              {product.replace('_', ' ')}
                            </Typography>
                          </Box>
                        }
                        sx={{ mb: 0, '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                      />
                    ))}
                  </FormGroup>
                </Box>
              </Collapse>
            </Box>

            {/* Status Filter */}
            <Box sx={{ mb: 2 }}>
              <Box
                onClick={() => setExpandedSection(expandedSection === 'status' ? null : 'status')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Status
                  </Typography>
                  {filters.statuses.length > 0 && (
                    <Chip label={filters.statuses.length} size="small" color="primary" />
                  )}
                </Box>
                {expandedSection === 'status' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>

              <Collapse in={expandedSection === 'status'}>
                <Box sx={{ mt: 1, pl: 1 }}>
                  <Button size="small" onClick={onToggleAllStatuses} sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                    {filters.statuses.length === availableStatuses.length ? 'Clear' : 'All'}
                  </Button>
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                bgcolor: getStatusColor(status),
                                borderRadius: '50%',
                              }}
                            />
                            <Typography variant="caption">
                              {status.replace('_', ' ')}
                            </Typography>
                          </Box>
                        }
                        sx={{ mb: 0, '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                      />
                    ))}
                  </FormGroup>
                </Box>
              </Collapse>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Display Options */}
            <Box sx={{ mb: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.showLabels}
                      onChange={onToggleLabels}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LabelIcon fontSize="small" />
                      <Typography variant="caption">Labels</Typography>
                    </Box>
                  }
                  sx={{ mb: 0 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.showDirection}
                      onChange={onToggleDirection}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <NavigationIcon fontSize="small" />
                      <Typography variant="caption">Direction</Typography>
                    </Box>
                  }
                  sx={{ mb: 0 }}
                />
              </FormGroup>
            </Box>

            {/* Reset Button */}
            <Button
              fullWidth
              size="small"
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onReset}
              disabled={activeFilterCount === 0}
            >
              Reset
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};
