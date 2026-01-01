/**
 * Export Utilities
 * Functions to export user data to CSV, Excel, and PDF formats
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 */

import { UserDTO } from '../dto';

/**
 * Export users to CSV
 */
export const exportToCSV = (users: UserDTO[], filename: string = 'users') => {
  // Transform users to CSV-friendly format
  const headers = ['ID', 'Username', 'Email', 'First Name', 'Last Name', 'Status', 'Roles', 'Created At'];
  
  const csvContent = [
    headers.join(','),
    ...users.map((user) => [
      user.id,
      `"${user.username}"`,
      `"${user.email || ''}"`,
      `"${user.firstName || ''}"`,
      `"${user.lastName || ''}"`,
      user.enabled ? 'Enabled' : 'Disabled',
      `"${user.roles?.map(r => r.name).join(', ') || ''}"`,
      user.createdAt || '',
    ].join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export users to Excel (XLSX)
 */
export const exportToExcel = async (users: UserDTO[], filename: string = 'users') => {
  try {
    // Dynamically import xlsx to avoid bundling if not used
    const XLSX = await import('xlsx');
    
    // Transform users to Excel-friendly format
    const data = users.map((user) => ({
      ID: user.id,
      Username: user.username,
      Email: user.email || '',
      'First Name': user.firstName || '',
      'Last Name': user.lastName || '',
      Status: user.enabled ? 'Enabled' : 'Disabled',
      Roles: user.roles?.map(r => r.name).join(', ') || '',
      'Created At': user.createdAt || '',
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    const columnWidths = [
      { wch: 10 },  // ID
      { wch: 20 },  // Username
      { wch: 30 },  // Email
      { wch: 20 },  // First Name
      { wch: 20 },  // Last Name
      { wch: 12 },  // Status
      { wch: 30 },  // Roles
      { wch: 20 },  // Created At
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // Download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error('Failed to export to Excel:', error);
    alert('Failed to export to Excel. Please make sure the xlsx library is installed.');
  }
};

/**
 * Export users to PDF
 */
export const exportToPDF = async (users: UserDTO[], filename: string = 'users', t: any) => {
  try {
    // Dynamically import jspdf and autotable
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Users Report', 14, 20);

    // Add metadata
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Users: ${users.length}`, 14, 34);

    // Prepare table data
    const tableData = users.map((user) => [
      user.id.toString(),
      user.username,
      user.email || '',
      user.firstName || '',
      user.lastName || '',
      user.enabled ? 'Enabled' : 'Disabled',
      user.roles?.map(r => r.name).join(', ') || '',
    ]);

    // Generate table
    (doc as any).autoTable({
      startY: 40,
      head: [[
        'ID',
        t('user.username'),
        t('user.email'),
        t('user.firstName'),
        t('user.lastName'),
        t('user.status'),
        t('user.roles'),
      ]],
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
      columnStyles: {
        0: { cellWidth: 15 },  // ID
        1: { cellWidth: 30 },  // Username
        2: { cellWidth: 40 },  // Email
        3: { cellWidth: 25 },  // First Name
        4: { cellWidth: 25 },  // Last Name
        5: { cellWidth: 20 },  // Status
        6: { cellWidth: 35 },  // Roles
      },
      margin: { top: 40 },
    });

    // Save PDF
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Failed to export to PDF:', error);
    alert('Failed to export to PDF. Please make sure jspdf and jspdf-autotable libraries are installed.');
  }
};
