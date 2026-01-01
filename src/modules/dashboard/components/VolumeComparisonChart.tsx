/**
 * Volume Comparison Chart Component
 * 
 * Bar chart comparing transported vs estimated volumes
 */

import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DailyTrend } from '../types/dashboard.types';
import { formatDate } from '../utils/formatters';

interface VolumeComparisonChartProps {
  data: DailyTrend[];
}

const VolumeComparisonChart: React.FC<VolumeComparisonChartProps> = ({ data }) => {
  const chartData = data.map((trend) => ({
    date: formatDate(trend.date),
    Transported: Math.round(trend.totalVolumeTransported),
    Estimated: Math.round(trend.totalVolumeEstimated),
  }));

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Volume Comparison (Last 7 Days)
      </Typography>
      
      <Box sx={{ width: '100%', height: 300, mt: 2 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              label={{ value: 'Volume (m³)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="Transported" fill="#2196f3" />
            <Bar dataKey="Estimated" fill="#ff9800" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default VolumeComparisonChart;
