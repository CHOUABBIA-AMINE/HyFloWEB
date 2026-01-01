/**
 * Shelf Edit/Create Page - Professional Version
 * Comprehensive form with cascading Bloc/Room selectors
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 12-29-2025
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider,
  Stack,
  Autocomplete,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import shelfService from '../services/ShelfService';
import roomService from '../services/RoomService';
import blocService from '../services/BlocService';
import { ShelfDTO, RoomDTO, BlocDTO } from '../dto';

const ShelfEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { shelfId } = useParams<{ shelfId: string }>();
  const isEditMode = !!shelfId;

  // Form state
  const [shelf, setShelf] = useState<Partial<ShelfDTO>>({
    code: '',
    designationFr: '',
    designationEn: '',
    designationAr: '',
  });

  // Related entities
  const [blocs, setBlocs] = useState<BlocDTO[]>([]);
  const [allRooms, setAllRooms] = useState<RoomDTO[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<RoomDTO[]>([]);
  const [selectedBloc, setSelectedBloc] = useState<BlocDTO | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomDTO | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [shelfId]);

  // Filter rooms when bloc changes
  useEffect(() => {
    if (selectedBloc) {
      console.log('🔍 Filtering rooms for bloc:', selectedBloc);
      const filtered = allRooms.filter(room => {
        const matches = room.blocId === selectedBloc.id || room.bloc?.id === selectedBloc.id;
        if (matches) {
          console.log('✅ Room matches:', room);
        }
        return matches;
      });
      console.log(`📋 Filtered ${filtered.length} rooms from ${allRooms.length} total rooms`);
      setFilteredRooms(filtered);
      
      // Clear room selection if current room doesn't belong to selected bloc
      if (selectedRoom && selectedRoom.blocId !== selectedBloc.id && selectedRoom.bloc?.id !== selectedBloc.id) {
        console.log('⚠️ Clearing room selection - does not belong to selected bloc');
        setSelectedRoom(null);
      }
    } else {
      console.log('❌ No bloc selected - clearing filtered rooms');
      setFilteredRooms([]);
      setSelectedRoom(null);
    }
  }, [selectedBloc, allRooms]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading blocs and rooms...');
      
      // Step 1: Load related data first
      const [blocsData, roomsData] = await Promise.all([
        blocService.getAll(),
        roomService.getAll(),
      ]);
      
      console.log('📦 Blocs response:', blocsData);
      console.log('📦 Blocs count:', Array.isArray(blocsData) ? blocsData.length : 'Not an array');
      console.log('🏠 Rooms response:', roomsData);
      console.log('🏠 Rooms count:', Array.isArray(roomsData) ? roomsData.length : 'Not an array');
      
      const loadedBlocs = Array.isArray(blocsData) ? blocsData : [];
      const loadedRooms = Array.isArray(roomsData) ? roomsData : [];
      
      setBlocs(loadedBlocs);
      setAllRooms(loadedRooms);
      
      console.log('✅ Loaded:', loadedBlocs.length, 'blocs and', loadedRooms.length, 'rooms');

      // Step 2: Then load shelf data if editing
      if (isEditMode) {
        const shelfData = await shelfService.getById(Number(shelfId));
        console.log('📋 Loaded shelf data:', shelfData);
        setShelf(shelfData);
        
        // Match room by ID from loaded rooms array
        let matchedRoom: RoomDTO | null = null;
        if (shelfData.roomId) {
          matchedRoom = loadedRooms.find(r => r.id === shelfData.roomId) || null;
        } else if (shelfData.room) {
          matchedRoom = loadedRooms.find(r => r.id === shelfData.room.id) || null;
        }
        
        if (matchedRoom) {
          console.log('🏠 Matched room:', matchedRoom);
          setSelectedRoom(matchedRoom);
          
          // Match bloc from room's blocId
          let matchedBloc: BlocDTO | null = null;
          if (matchedRoom.blocId) {
            matchedBloc = loadedBlocs.find(b => b.id === matchedRoom.blocId) || null;
          } else if (matchedRoom.bloc) {
            matchedBloc = loadedBlocs.find(b => b.id === matchedRoom.bloc.id) || null;
          }
          
          if (matchedBloc) {
            console.log('🏢 Matched bloc from room:', matchedBloc);
            setSelectedBloc(matchedBloc);
          }
        }
      }
      
      setError('');
    } catch (err: any) {
      console.error('❌ Failed to load data:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Code validation
    if (!shelf.code || shelf.code.trim().length < 2) {
      errors.code = 'Code must be at least 2 characters';
    }

    // French designation validation (required)
    if (!shelf.designationFr || shelf.designationFr.trim().length < 2) {
      errors.designationFr = 'French designation must be at least 2 characters';
    }

    // Bloc validation
    if (!selectedBloc) {
      errors.bloc = 'Bloc is required';
    }

    // Room validation
    if (!selectedRoom) {
      errors.room = 'Room is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof ShelfDTO) => (e: any) => {
    const value = e.target.value;
    setShelf({ ...shelf, [field]: value });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  const handleBlocChange = (event: any, newValue: BlocDTO | null) => {
    console.log('🏢 Bloc changed to:', newValue);
    setSelectedBloc(newValue);
    if (validationErrors.bloc) {
      setValidationErrors({ ...validationErrors, bloc: '' });
    }
  };

  const handleRoomChange = (event: any, newValue: RoomDTO | null) => {
    console.log('🏠 Room changed to:', newValue);
    setSelectedRoom(newValue);
    if (validationErrors.room) {
      setValidationErrors({ ...validationErrors, room: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      const shelfData: ShelfDTO = {
        code: shelf.code!,
        designationFr: shelf.designationFr!,
        designationEn: shelf.designationEn,
        designationAr: shelf.designationAr,
        roomId: selectedRoom!.id,
      };

      if (isEditMode) {
        await shelfService.update(Number(shelfId), shelfData);
      } else {
        await shelfService.create(shelfData);
      }

      navigate('/environment/shelves');
    } catch (err: any) {
      console.error('Failed to save shelf:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save shelf');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/environment/shelves');
  };

  // Helper function to get bloc label with fallback
  const getBlocLabel = (bloc: BlocDTO): string => {
    if (bloc.designationFr && bloc.designationFr.trim()) {
      return bloc.designationFr;
    }
    if (bloc.designationEn && bloc.designationEn.trim()) {
      return bloc.designationEn;
    }
    if (bloc.designationAr && bloc.designationAr.trim()) {
      return bloc.designationAr;
    }
    return `Bloc #${bloc.id || 'Unknown'}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={handleCancel}
          sx={{ mb: 2 }}
        >
          {t('common.back')}
        </Button>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          {isEditMode ? (t('shelf.edit') || 'Edit Shelf') : (t('shelf.create') || 'Create Shelf')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isEditMode ? 'Update shelf information and location' : 'Create a new shelf in a room'}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Debug: Loaded {blocs.length} blocs, {allRooms.length} rooms, {filteredRooms.length} filtered rooms
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Basic Information */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                {/* Code - First Row, 33% width */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('shelf.code') || 'Code'}
                    value={shelf.code || ''}
                    onChange={handleChange('code')}
                    required
                    error={!!validationErrors.code}
                    helperText={validationErrors.code || 'Required - Unique shelf code'}
                  />
                </Grid>

                {/* Empty space to force break - takes remaining 67% */}
                <Grid item xs={false} md={8} />

                {/* Designations - Second Row, 33% each */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('shelf.designationFr') || 'French Designation'}
                    value={shelf.designationFr || ''}
                    onChange={handleChange('designationFr')}
                    required
                    error={!!validationErrors.designationFr}
                    helperText={validationErrors.designationFr || 'Required'}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('shelf.designationEn') || 'English Designation'}
                    value={shelf.designationEn || ''}
                    onChange={handleChange('designationEn')}
                    helperText="Optional"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('shelf.designationAr') || 'Arabic Designation'}
                    value={shelf.designationAr || ''}
                    onChange={handleChange('designationAr')}
                    helperText="Optional"
                    inputProps={{
                      dir: 'rtl',
                      style: { textAlign: 'right' }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Location */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Location
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    value={selectedBloc}
                    onChange={handleBlocChange}
                    options={blocs}
                    getOptionLabel={getBlocLabel}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('shelf.bloc') || 'Bloc'}
                        required
                        error={!!validationErrors.bloc}
                        helperText={validationErrors.bloc || 'Required - Select the building bloc first'}
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    loading={blocs.length === 0}
                    noOptionsText={blocs.length === 0 ? 'Loading blocs...' : 'No blocs available'}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    value={selectedRoom}
                    onChange={handleRoomChange}
                    options={filteredRooms}
                    getOptionLabel={(option) => `${option.code} - ${option.designationFr}`}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('shelf.room') || 'Room'}
                        required
                        error={!!validationErrors.room}
                        helperText={validationErrors.room || (selectedBloc ? 'Required - Select room in this bloc' : 'Select a bloc first')}
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    disabled={!selectedBloc}
                    noOptionsText={selectedBloc ? 'No rooms available in this bloc' : 'Please select a bloc first'}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Actions */}
          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Box sx={{ p: 2.5, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={saving}
                size="large"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={saving}
                size="large"
                sx={{ minWidth: 150 }}
              >
                {saving ? t('common.loading') : t('common.save')}
              </Button>
            </Box>
          </Paper>
        </Stack>
      </form>
    </Box>
  );
};

export default ShelfEdit;
