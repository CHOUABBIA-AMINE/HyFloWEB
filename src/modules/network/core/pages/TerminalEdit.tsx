/**
 * Terminal Edit/Create Page - Aligned with Backend
 * Uses locationId relationship only (no embedded location fields)
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 * @updated 01-16-2026 - Removed legacy location fields, uses locationId only
 * @updated 01-16-2026 - Added complete location details display (Locality, District, State)
 * @updated 01-16-2026 - Made location details more compact
 * @updated 01-16-2026 - Reorganized to single row: Place, Locality, District, State, Coordinates
 * @updated 01-16-2026 - Moved Structure field before Location section
 * @updated 01-18-2026 - Optimized to use common translation keys (40% less duplication)
 * @updated 01-19-2026 - Fixed i18n for location references and converted to Autocomplete
 * @updated 02-13-2026 - UI: Containerized header and updated buttons to IconButton style
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, TextField, CircularProgress, Alert,
  Grid, Paper, Divider, Stack, MenuItem, Chip, Autocomplete,
  IconButton, Tooltip
} from '@mui/material';
import {
  Save as SaveIcon, Close as CloseIcon,
  LocationOn as LocationIcon, Storage as TerminalIcon,
} from '@mui/icons-material';
import { TerminalService } from '../services';
import { VendorService, OperationalStatusService } from '../../common/services';
import { TerminalTypeService } from '../../type/services';
import { LocationService } from '../../../general/localization/services';
import { StructureService } from '../../../general/organization/services';
import { LocationDTO } from '../../../general/localization/dto';
import { TerminalDTO } from '../dto';
import { getLocalizedName } from '../utils/localizationUtils';

const TerminalEdit = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { terminalId } = useParams<{ terminalId: string }>();
  const isEditMode = !!terminalId;

  const currentLanguage = i18n.language || 'en';

  // Utility function to get localized designation based on current language
  const getLocalizedDesignation = (entity: any): string => {
    if (!entity) return '';
    
    const designationKey = currentLanguage === 'ar' ? 'designationAr' 
      : currentLanguage === 'fr' ? 'designationFr' 
      : 'designationEn';
    
    // Return selected language designation or fallback to designationFr, then code
    return entity[designationKey] || entity.designationFr || entity.code || '';
  };

  const [terminal, setTerminal] = useState<Partial<TerminalDTO>>({
    name: '',
    code: '',
    installationDate: undefined,
    commissioningDate: undefined,
    decommissioningDate: undefined,
    operationalStatusId: undefined,
    structureId: undefined,
    vendorId: undefined,
    locationId: undefined,
    terminalTypeId: undefined,
    pipelineIds: [],
  });

  const [selectedLocation, setSelectedLocation] = useState<LocationDTO | null>(null);
  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [operationalStatuses, setOperationalStatuses] = useState<any[]>([]);
  const [terminalTypes, setTerminalTypes] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => { loadData(); }, [terminalId]);

  const sortedTerminalTypes = useMemo(() => sortByLocalizedName(terminalTypes, currentLanguage), [terminalTypes, currentLanguage]);
  const sortedOperationalStatuses = useMemo(() => sortByLocalizedName(operationalStatuses, currentLanguage), [operationalStatuses, currentLanguage]);
  const sortedStructures = useMemo(() => sortByLocalizedName(structures, currentLanguage), [structures, currentLanguage]);

  function sortByLocalizedName(items: any[], language: string) {
    return [...items].sort((a, b) => {
      const nameA = getLocalizedName(a, language);
      const nameB = getLocalizedName(b, language);
      return nameA.localeCompare(nameB);
    });
  }

  const loadData = async () => {
    try {
      setLoading(true);
      
      let terminalData: TerminalDTO | null = null;
      if (isEditMode) {
        terminalData = await TerminalService.getById(Number(terminalId));
      }
      
      const [
        locationsData,
        structuresData,
        vendorsData,
        terminalTypesData,
        operationalStatusesData,
      ] = await Promise.allSettled([
        LocationService.getAllNoPagination(),
        StructureService.getAllNoPagination(),
        VendorService.getAllNoPagination(),
        TerminalTypeService.getAllNoPagination(),
        OperationalStatusService.getAllNoPagination(),
      ]);

      if (locationsData.status === 'fulfilled') {
        setLocations(Array.isArray(locationsData.value) ? locationsData.value : []);
      }
      if (structuresData.status === 'fulfilled') {
        setStructures(Array.isArray(structuresData.value) ? structuresData.value : []);
      }
      if (vendorsData.status === 'fulfilled') {
        setVendors(Array.isArray(vendorsData.value) ? vendorsData.value : []);
      }
      if (terminalTypesData.status === 'fulfilled') {
        setTerminalTypes(Array.isArray(terminalTypesData.value) ? terminalTypesData.value : []);
      }
      if (operationalStatusesData.status === 'fulfilled') {
        setOperationalStatuses(Array.isArray(operationalStatusesData.value) ? operationalStatusesData.value : []);
      }

      if (terminalData) {
        setTerminal(terminalData);
        if (terminalData.location) {
          setSelectedLocation(terminalData.location);
        } else if (terminalData.locationId) {
          try {
            const loc = await LocationService.getById(terminalData.locationId);
            setSelectedLocation(loc);
          } catch (err) {
            console.error('Failed to load location details:', err);
          }
        }
      }
      setError('');
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || t('common.errors.loadingDataFailed'));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!terminal.name || terminal.name.trim().length < 3) {
      errors.name = t('common.validation.minLength', { field: t('common.fields.name'), min: 3 });
    }
    if (!terminal.code || terminal.code.trim().length < 2) {
      errors.code = t('common.validation.codeRequired');
    }
    if (!terminal.operationalStatusId) {
      errors.operationalStatusId = t('common.validation.required', { field: t('common.fields.operationalStatus') });
    }
    if (!terminal.structureId) {
      errors.structureId = t('common.validation.required', { field: t('common.fields.structure') });
    }
    if (!terminal.vendorId) {
      errors.vendorId = t('common.validation.required', { field: t('common.fields.vendor') });
    }
    if (!terminal.locationId) {
      errors.locationId = t('common.validation.required', { field: t('common.fields.location') });
    }
    if (!terminal.terminalTypeId) {
      errors.terminalTypeId = t('common.validation.required', { field: t('terminal.fields.terminalType') });
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof TerminalDTO) => (e: any) => {
    const value = e.target.value;
    setTerminal({ ...terminal, [field]: value });
    
    if (field === 'locationId') {
      const loc = locations.find(l => l.id === Number(value));
      setSelectedLocation(loc || null);
    }
    
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  const handleLocationChange = (_event: any, newValue: LocationDTO | null) => {
    setSelectedLocation(newValue);
    setTerminal({ ...terminal, locationId: newValue?.id || 0 });
    
    if (validationErrors.locationId) {
      setValidationErrors({ ...validationErrors, locationId: '' });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError('');

      const payload: TerminalDTO = {
        id: isEditMode ? Number(terminalId) : undefined,
        code: String(terminal.code || ''),
        name: String(terminal.name || ''),
        installationDate: terminal.installationDate,
        commissioningDate: terminal.commissioningDate,
        decommissioningDate: terminal.decommissioningDate,
        operationalStatusId: Number(terminal.operationalStatusId),
        structureId: Number(terminal.structureId),
        vendorId: Number(terminal.vendorId),
        locationId: Number(terminal.locationId),
        terminalTypeId: Number(terminal.terminalTypeId),
        pipelineIds: terminal.pipelineIds || [],
        facilityIds: terminal.facilityIds || [],
      };

      if (isEditMode) {
        await TerminalService.update(Number(terminalId), payload);
      } else {
        await TerminalService.create(payload);
      }

      navigate('/network/core/terminals');
    } catch (err: any) {
      console.error('Failed to save terminal:', err);
      setError(err.response?.data?.message || err.message || t('common.errors.savingFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/network/core/terminals');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER SECTION - Containerized */}
      <Paper elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TerminalIcon color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {isEditMode 
                    ? t('common.page.editTitle', { entity: t('terminal.title') })
                    : t('common.page.createTitle', { entity: t('terminal.title') })
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {isEditMode 
                    ? t('common.page.editSubtitle', { entity: t('terminal.title') })
                    : t('common.page.createSubtitle', { entity: t('terminal.title') })
                  }
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Tooltip title={t('common.cancel')}>
                <IconButton 
                  onClick={handleCancel} 
                  disabled={saving}
                  size="medium"
                  color="default"
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('common.save')}>
                <IconButton 
                  onClick={() => handleSubmit()} 
                  disabled={saving || locations.length === 0}
                  size="medium"
                  color="primary"
                >
                  {saving ? <CircularProgress size={24} /> : <SaveIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {locations.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('terminal.warnings.noLocations')}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('common.sections.basicInformation')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth label={t('common.fields.code')}
                    value={terminal.code || ''}
                    onChange={handleChange('code')} required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code || t('common.fields.codeHelper')}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth label={t('common.fields.name')}
                    value={terminal.name || ''}
                    onChange={handleChange('name')} required
                    error={!!validationErrors.name}
                    helperText={validationErrors.name || t('common.fields.nameHelper')}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth select label={t('common.fields.structure')}
                    value={terminal.structureId || ''}
                    onChange={handleChange('structureId')} required
                    error={!!validationErrors.structureId}
                    helperText={validationErrors.structureId}
                  >
                    {sortedStructures.length > 0 ? (
                      sortedStructures.map((structure) => (
                        <MenuItem key={structure.id} value={structure.id}>
                          {getLocalizedName(structure, currentLanguage)}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>{t('common.loading')}</MenuItem>
                    )}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('common.sections.locationInformation')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Autocomplete
                    value={selectedLocation}
                    onChange={handleLocationChange}
                    options={locations}
                    getOptionLabel={(option) => getLocalizedDesignation(option)}
                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                    loading={loading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('common.fields.location')}
                        required
                        error={!!validationErrors.locationId}
                        helperText={validationErrors.locationId || t('common.fields.locationHelper')}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <LocationIcon fontSize="small" color="action" sx={{ ml: 1, mr: 0.5 }} />
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} key={option.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <LocationIcon fontSize="small" color="action" />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {getLocalizedDesignation(option)}
                            </Typography>
                            {option.locality && (
                              <Typography variant="caption" color="text.secondary">
                                {getLocalizedDesignation(option.locality)}
                                {option.locality.district && ` • ${getLocalizedDesignation(option.locality.district)}`}
                                {option.locality.district?.state && ` • ${getLocalizedDesignation(option.locality.district.state)}`}
                              </Typography>
                            )}
                          </Box>
                          {option.locality && (
                            <Chip 
                              label={getLocalizedDesignation(option.locality)} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                    noOptionsText={t('list.noData')}
                    loadingText={t('common.loading')}
                  />
                </Grid>

                {selectedLocation && (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'grey.50', borderStyle: 'dashed' }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 600 }}>
                        📍 {t('terminal.selectedLocation')}
                      </Typography>
                      
                      <Grid container spacing={1.5} alignItems="flex-end">
                        <Grid item xs={6} sm={3} md={2}>
                          <Typography variant="caption" color="text.secondary">{t('common.fields.place')}</Typography>
                          <Typography variant="body2" fontWeight={500} fontSize="0.875rem">
                            {getLocalizedDesignation(selectedLocation)}
                          </Typography>
                        </Grid>

                        {selectedLocation.locality && (
                          <Grid item xs={6} sm={3} md={2}>
                            <Typography variant="caption" color="text.secondary">{t('common.fields.locality')}</Typography>
                            <Typography variant="body2" fontSize="0.875rem" fontWeight={500}>
                              {getLocalizedDesignation(selectedLocation.locality)}
                            </Typography>
                          </Grid>
                        )}

                        {selectedLocation.locality?.district && (
                          <Grid item xs={6} sm={3} md={2}>
                            <Typography variant="caption" color="text.secondary">{t('common.fields.district')}</Typography>
                            <Typography variant="body2" fontSize="0.875rem" fontWeight={500}>
                              {getLocalizedDesignation(selectedLocation.locality.district)}
                            </Typography>
                          </Grid>
                        )}

                        {selectedLocation.locality?.district?.state && (
                          <Grid item xs={6} sm={3} md={2}>
                            <Typography variant="caption" color="text.secondary">{t('common.fields.state')}</Typography>
                            <Typography variant="body2" fontSize="0.875rem" fontWeight={500}>
                              {getLocalizedDesignation(selectedLocation.locality.district.state)}
                            </Typography>
                          </Grid>
                        )}

                        <Grid item xs={4} sm={3} md={1.5}>
                          <Typography variant="caption" color="text.secondary">{t('common.fields.latitude')}</Typography>
                          <Typography variant="body2" fontSize="0.875rem">{selectedLocation.latitude.toFixed(6)}°</Typography>
                        </Grid>
                        <Grid item xs={4} sm={3} md={1.5}>
                          <Typography variant="caption" color="text.secondary">{t('common.fields.longitude')}</Typography>
                          <Typography variant="body2" fontSize="0.875rem">{selectedLocation.longitude.toFixed(6)}°</Typography>
                        </Grid>
                        <Grid item xs={4} sm={3} md={1}>
                          <Typography variant="caption" color="text.secondary">{t('common.fields.elevation')}</Typography>
                          <Typography variant="body2" fontSize="0.875rem">
                            {selectedLocation.elevation ? `${selectedLocation.elevation}m` : 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('common.sections.technicalDetails')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth select label={t('terminal.fields.terminalType')}
                    value={terminal.terminalTypeId || ''}
                    onChange={handleChange('terminalTypeId')} required
                    error={!!validationErrors.terminalTypeId}
                    helperText={validationErrors.terminalTypeId}
                  >
                    {sortedTerminalTypes.length > 0 ? (
                      sortedTerminalTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {getLocalizedName(type, currentLanguage)}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>{t('common.loading')}</MenuItem>
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth select label={t('common.fields.operationalStatus')}
                    value={terminal.operationalStatusId || ''}
                    onChange={handleChange('operationalStatusId')} required
                    error={!!validationErrors.operationalStatusId}
                    helperText={validationErrors.operationalStatusId}
                  >
                    {sortedOperationalStatuses.length > 0 ? (
                      sortedOperationalStatuses.map((status) => (
                        <MenuItem key={status.id} value={status.id}>
                          {getLocalizedName(status, currentLanguage)}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>{t('common.loading')}</MenuItem>
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth select label={t('common.fields.vendor')}
                    value={terminal.vendorId || ''}
                    onChange={handleChange('vendorId')} required
                    error={!!validationErrors.vendorId}
                    helperText={validationErrors.vendorId}
                  >
                    {vendors.length > 0 ? (
                      vendors.map((vendor) => (
                        <MenuItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>{t('common.loading')}</MenuItem>
                    )}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('common.sections.importantDates')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth label={t('common.fields.installationDate')}
                    type="date" value={terminal.installationDate || ''}
                    onChange={handleChange('installationDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth label={t('common.fields.commissioningDate')}
                    type="date" value={terminal.commissioningDate || ''}
                    onChange={handleChange('commissioningDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth label={t('common.fields.decommissioningDate')}
                    type="date" value={terminal.decommissioningDate || ''}
                    onChange={handleChange('decommissioningDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Stack>
      </form>
    </Box>
  );
};

export default TerminalEdit;