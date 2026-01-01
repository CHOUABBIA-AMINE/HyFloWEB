/**
 * Export Utilities
 * Functions for exporting data to CSV, Excel, and PDF
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 */

import { TFunction } from 'i18next';

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export const exportToExcel = (data: any[], filename: string) => {
  console.log('Export to Excel:', filename, data.length, 'rows');
  alert('Excel export will be implemented with xlsx library');
};

export const exportToPDF = (data: any[], filename: string, t: TFunction) => {
  console.log('Export to PDF:', filename, data.length, 'rows');
  alert('PDF export will be implemented with jsPDF library');
};
