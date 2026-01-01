/**
 * Pressure Trend Chart Component
 * 
 * Line chart showing pressure trends over time
 */

import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { DailyTrend } from '../types/dashboard.types';
import { formatDate } from '../utils/formatters';

interface PressureTrendChartProps {
  data: DailyTrend[];
}

const PressureTrendChart: React.FC<PressureTrendChartProps> = ({ data }) => {
  const chartData = data.map((trend) => ({
    date: formatDate(trend.date),
    Pressure: Number(trend.averagePressure.toFixed(1)),
  }));

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Pressure Trend (Last 7 Days)
      </Typography>
      
      <Box sx={{ width: '100%', height: 300, mt: 2 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              domain={[50, 80]}
              label={{ value: 'Pressure (bar)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <ReferenceLine y={55} stroke="#2196f3" strokeDasharray="3 3" label="Min" />
            <ReferenceLine y={75} stroke="#f44336" strokeDasharray="3 3" label="Max" />
            <Line 
              type="monotone" 
              dataKey="Pressure" 
              stroke="#4caf50" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default PressureTrendChart;
