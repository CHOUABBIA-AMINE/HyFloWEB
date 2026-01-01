/**
 * Geo Debug Page
 * Debug page to inspect infrastructure geo data from API
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { geoService } from '../services';
import { StationDTO, TerminalDTO, HydrocarbonFieldDTO } from '../../core/dto';

export const GeoDebugPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stations, setStations] = useState<StationDTO[]>([]);
  const [terminals, setTerminals] = useState<TerminalDTO[]>([]);
  const [fields, setFields] = useState<HydrocarbonFieldDTO[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('GeoDebug - Fetching data...');
      const data = await geoService.getAllInfrastructure();
      console.log('GeoDebug - Data received:', data);
      
      setStations(data.stations || []);
      setTerminals(data.terminals || []);
      setFields(data.hydrocarbonFields || []);
    } catch (err) {
      console.error('GeoDebug - Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hasValidCoordinates = (item: any) => {
    return item.latitude != null && 
           item.longitude != null && 
           typeof item.latitude === 'number' && 
           typeof item.longitude === 'number' &&
           !isNaN(item.latitude) &&
           !isNaN(item.longitude);
  };

  const renderDataTable = (
    title: string,
    data: any[],
    color: 'primary' | 'secondary' | 'success'
  ) => {
    const validCount = data.filter(hasValidCoordinates).length;
    const invalidCount = data.length - validCount;

    return (
      <Accordion defaultExpanded={data.length > 0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <Typography variant="h6">{title}</Typography>
            <Chip 
              label={`Total: ${data.length}`} 
              color={color} 
              size="small" 
            />
            {validCount > 0 && (
              <Chip 
                icon={<CheckCircleIcon />}
                label={`Valid: ${validCount}`} 
                color="success" 
                size="small" 
              />
            )}
            {invalidCount > 0 && (
              <Chip 
                icon={<ErrorIcon />}
                label={`Invalid: ${invalidCount}`} 
                color="error" 
                size="small" 
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {data.length === 0 ? (
            <Alert severity="warning">No data found in backend</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Latitude</TableCell>
                    <TableCell>Longitude</TableCell>
                    <TableCell>Place Name</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((item, index) => {
                    const valid = hasValidCoordinates(item);
                    return (
                      <TableRow 
                        key={item.id || index}
                        sx={{ 
                          bgcolor: valid ? 'success.light' : 'error.light',
                          opacity: valid ? 1 : 0.6
                        }}
                      >
                        <TableCell>{item.id || 'N/A'}</TableCell>
                        <TableCell>{item.code || 'N/A'}</TableCell>
                        <TableCell>{item.name || 'N/A'}</TableCell>
                        <TableCell>
                          {item.latitude != null ? item.latitude : '❌ NULL'}
                        </TableCell>
                        <TableCell>
                          {item.longitude != null ? item.longitude : '❌ NULL'}
                        </TableCell>
                        <TableCell>{item.placeName || 'N/A'}</TableCell>
                        <TableCell>
                          {valid ? (
                            <Chip label="Valid" color="success" size="small" />
                          ) : (
                            <Chip label="Invalid" color="error" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {data.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" component="div">
                Raw JSON (first item):
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.100', mt: 1 }}>
                <pre style={{ margin: 0, fontSize: '0.75rem', overflow: 'auto' }}>
                  {JSON.stringify(data[0], null, 2)}
                </pre>
              </Paper>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalRecords = stations.length + terminals.length + fields.length;
  const validStations = stations.filter(hasValidCoordinates).length;
  const validTerminals = terminals.filter(hasValidCoordinates).length;
  const validFields = fields.filter(hasValidCoordinates).length;
  const totalValid = validStations + validTerminals + validFields;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Geo Data Debug Panel</Typography>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />}
          onClick={fetchData}
        >
          Refresh Data
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error fetching data: {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Summary</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`Total Records: ${totalRecords}`} 
            color="primary" 
            size="medium"
          />
          <Chip 
            icon={<CheckCircleIcon />}
            label={`Valid for Map: ${totalValid}`} 
            color="success" 
            size="medium"
          />
          <Chip 
            icon={<ErrorIcon />}
            label={`Invalid: ${totalRecords - totalValid}`} 
            color="error" 
            size="medium"
          />
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            ✅ Valid records have non-null numeric latitude and longitude values
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ❌ Invalid records are missing coordinates or have null values
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {renderDataTable('Stations', stations, 'primary')}
        {renderDataTable('Terminals', terminals, 'secondary')}
        {renderDataTable('Hydrocarbon Fields', fields, 'success')}
      </Box>

      {totalRecords === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>No Data Found</Typography>
          <Typography variant="body2">
            The backend APIs returned empty arrays. This could mean:
          </Typography>
          <ul>
            <li>Database tables are empty</li>
            <li>No records have been created yet</li>
            <li>API endpoints are returning empty responses</li>
          </ul>
          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Next Steps:</strong>
          </Typography>
          <ol>
            <li>Check if data exists in your database</li>
            <li>Verify API endpoints: /network/core/station, /network/core/terminal, /network/core/hydrocarbonField</li>
            <li>Add test data to your database with valid coordinates</li>
          </ol>
        </Alert>
      )}

      {totalRecords > 0 && totalValid === 0 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>All Records Have Invalid Coordinates</Typography>
          <Typography variant="body2">
            Found {totalRecords} records, but none have valid latitude/longitude values.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Fix this by:</strong>
          </Typography>
          <ol>
            <li>Updating records in database to include latitude and longitude</li>
            <li>Ensuring coordinates are numeric (not strings)</li>
            <li>Ensuring coordinates are not null</li>
          </ol>
        </Alert>
      )}
    </Box>
  );
};
