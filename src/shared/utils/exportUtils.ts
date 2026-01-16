/**
 * Shared Export Utilities
 * Generic functions to export data to CSV, Excel, and PDF formats
 * Used across all list pages in the application
 * 
 * @author CHOUABBIA Amine
 * @created 01-16-2026
 * @description Provides reusable export functionality with dynamic column mapping
 */

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  transform?: (value: any) => string;
}

export interface ExportConfig {
  filename: string;
  title?: string;
  columns: ExportColumn[];
}

/**
 * Export data to CSV
 * @param data - Array of objects to export
 * @param config - Export configuration with columns and filename
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  config: ExportConfig
) => {
  const headers = config.columns.map(col => col.header);
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      config.columns.map(col => {
        let value = row[col.key];
        if (col.transform) {
          value = col.transform(value);
        }
        // Escape quotes and wrap in quotes if contains comma or quote
        const stringValue = String(value ?? '');
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${config.filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export data to Excel (XLSX)
 * @param data - Array of objects to export
 * @param config - Export configuration with columns and filename
 */
export const exportToExcel = async <T extends Record<string, any>>(
  data: T[],
  config: ExportConfig
) => {
  try {
    const XLSX = await import('xlsx');
    
    // Transform data to Excel-friendly format
    const excelData = data.map(row => {
      const transformedRow: Record<string, any> = {};
      config.columns.forEach(col => {
        let value = row[col.key];
        if (col.transform) {
          value = col.transform(value);
        }
        transformedRow[col.header] = value ?? '';
      });
      return transformedRow;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const columnWidths = config.columns.map(col => ({
      wch: col.width || 20
    }));
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, config.title || 'Data');

    // Download
    XLSX.writeFile(workbook, `${config.filename}.xlsx`);
  } catch (error) {
    console.error('Failed to export to Excel:', error);
    alert('Failed to export to Excel. The xlsx library may not be installed.');
  }
};

/**
 * Export data to PDF
 * @param data - Array of objects to export
 * @param config - Export configuration with columns and filename
 * @param t - Translation function for i18n support
 */
export const exportToPDF = async <T extends Record<string, any>>(
  data: T[],
  config: ExportConfig,
  t: (key: string) => string
) => {
  try {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text(config.title || 'Export Report', 14, 20);

    // Add metadata
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Records: ${data.length}`, 14, 34);

    // Prepare table data
    const tableData = data.map(row =>
      config.columns.map(col => {
        let value = row[col.key];
        if (col.transform) {
          value = col.transform(value);
        }
        return String(value ?? '');
      })
    );

    // Generate table
    (doc as any).autoTable({
      startY: 40,
      head: [config.columns.map(col => col.header)],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: config.columns.reduce((acc, col, index) => {
        acc[index] = { cellWidth: col.width || 'auto' };
        return acc;
      }, {} as Record<number, any>),
      margin: { top: 40 },
    });

    // Save PDF
    doc.save(`${config.filename}.pdf`);
  } catch (error) {
    console.error('Failed to export to PDF:', error);
    alert('Failed to export to PDF. The jspdf and jspdf-autotable libraries may not be installed.');
  }
};

/**
 * Helper function to get multi-language designation
 * @param item - Object with designationFr, designationEn, designationAr
 * @param lang - Current language code
 * @returns Designation in the preferred language
 */
export const getMultiLangDesignation = (
  item: any,
  lang: string = 'fr'
): string => {
  if (!item) return '';
  
  const langCode = lang.split('-')[0].toLowerCase();
  
  if (langCode === 'ar') {
    return item.designationAr || item.designationFr || item.designationEn || item.name || '';
  }
  if (langCode === 'en') {
    return item.designationEn || item.designationFr || item.designationAr || item.name || '';
  }
  // Default to French
  return item.designationFr || item.designationEn || item.designationAr || item.name || '';
};
