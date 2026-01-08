/**
 * StructureType List Page
 * 
 * @author CHOUABBIA Amine
 * @created 01-02-2026
 * @updated 01-08-2026 - Fixed service import
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { StructureTypeService } from '../services';
import { StructureTypeDTO } from '../dto';
import { Page } from '@/types/pagination';
import { getLocalizedName } from '@/shared/utils';
import { useLanguage } from '@/shared/hooks';

const StructureTypeList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();

  const [structureTypes, setStructureTypes] = useState<StructureTypeDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [totalElements, setTotalElements] = useState(0);

  const loadStructureTypes = useCallback(async () => {
    try {
      setLoading(true);
      const response: Page<StructureTypeDTO> = await StructureTypeService.getAll({
        page: paginationModel.page,
        size: paginationModel.pageSize,
      });
      setStructureTypes(response.content);
      setTotalElements(response.totalElements);
      setError('');
    } catch (err: any) {
      console.error('Failed to load structure types:', err);
      setError(err.message || 'Failed to load structure types');
    } finally {
      setLoading(false);
    }
  }, [paginationModel]);

  useEffect(() => {
    loadStructureTypes();
  }, [loadStructureTypes]);

  const handleCreate = () => {
    navigate('/general/type/structure-types/create');
  };

  const handleEdit = (id: number) => {
    navigate(`/general/type/structure-types/${id}/edit`);
  };

  const columns: GridColDef<StructureTypeDTO>[] = [
    {
      field: 'code',
      headerName: 'Code',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'designation',
      headerName: 'Designation',
      flex: 2,
      minWidth: 200,
      valueGetter: (params) => {
        return getLocalizedName(params.row, currentLanguage);
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleEdit(params.row.id!)}
        >
          {t('common.edit')}
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Structure Types
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage structure type classifications
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          size="large"
        >
          {t('common.create')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={structureTypes}
          columns={columns}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          rowCount={totalElements}
          paginationMode="server"
          disableRowSelectionOnClick
          sx={{
            border: 1,
            borderColor: 'divider',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default StructureTypeList;
