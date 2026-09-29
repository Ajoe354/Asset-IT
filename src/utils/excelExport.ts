import * as XLSX from 'xlsx';
import { Asset, AssetCategory, Location, Employee } from '../types';

export function exportAssetsToExcel(
  assets: Asset[],
  categories: AssetCategory[],
  locations: Location[],
  employees: Employee[],
  filename: string = 'IT_Assets_Export'
) {
  const data = assets.map((asset, index) => {
    const category = categories.find((c) => c.id === asset.categoryId)?.name || asset.categoryId;
    const location = locations.find((l) => l.id === asset.locationId)?.name || asset.locationId;
    const employee = employees.find((e) => e.id === asset.assignedToEmployeeId);
    const assignedTo = employee ? `${employee.fullName} (${employee.employeeId})` : '-';

    return {
      'No': index + 1,
      'Asset Tag': asset.assetTag,
      'Nama Aset': asset.name,
      'Kategori': category,
      'Brand': asset.brand,
      'Model': asset.model,
      'Serial Number': asset.serialNumber,
      'Status': asset.status.toUpperCase(),
      'Kondisi': asset.condition.toUpperCase(),
      'Lokasi': location,
      'Departemen': asset.department,
      'Pengguna / Assigned To': assignedTo,
      'Tanggal Pembelian': asset.purchaseDate,
      'Harga Pembelian (IDR)': asset.purchasePrice,
      'Garansi Berakhir': asset.warrantyExpiryDate,
      'Vendor / Supplier': asset.supplier,
      'IP Address': asset.ipAddress || '-',
      'MAC Address': asset.macAddress || '-',
      'Sistem Operasi': asset.os || '-',
      'Processor': asset.processor || '-',
      'RAM': asset.ram || '-',
      'Penyimpanan (Storage)': asset.storage || '-',
      'Catatan': asset.notes || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Aset IT');

  // Auto column widths
  const maxProps = Object.keys(data[0] || {});
  const colWidths = maxProps.map((key) => ({ wch: Math.max(key.length + 4, 16) }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportAssetsToCsv(
  assets: Asset[],
  categories: AssetCategory[],
  locations: Location[],
  employees: Employee[],
  filename: string = 'IT_Assets_Export'
) {
  const data = assets.map((asset, index) => {
    const category = categories.find((c) => c.id === asset.categoryId)?.name || asset.categoryId;
    const location = locations.find((l) => l.id === asset.locationId)?.name || asset.locationId;
    const employee = employees.find((e) => e.id === asset.assignedToEmployeeId);
    const assignedTo = employee ? `${employee.fullName} (${employee.employeeId})` : '-';

    return {
      'No': index + 1,
      'Asset Tag': asset.assetTag,
      'Nama Aset': asset.name,
      'Kategori': category,
      'Brand': asset.brand,
      'Model': asset.model,
      'Serial Number': asset.serialNumber,
      'Status': asset.status,
      'Kondisi': asset.condition,
      'Lokasi': location,
      'Departemen': asset.department,
      'Pengguna': assignedTo,
      'Tanggal Pembelian': asset.purchaseDate,
      'Harga Pembelian': asset.purchasePrice,
      'Garansi Berakhir': asset.warrantyExpiryDate,
      'Supplier': asset.supplier,
      'IP Address': asset.ipAddress || '-',
      'MAC Address': asset.macAddress || '-',
      'OS': asset.os || '-',
      'Processor': asset.processor || '-',
      'RAM': asset.ram || '-',
      'Storage': asset.storage || '-',
      'Notes': asset.notes || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
  if (!data || data.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToCsv(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadAssetTemplate() {
  downloadSampleAssetTemplate();
}

export function downloadSampleAssetTemplate() {
  const sampleData = [
    {
      'Nama Aset': 'ThinkPad T14 Gen 4',
      'Kategori Code (LPT/DSK/MON/SRV/NET/PRN/MPH/TAB/CTV/OTH)': 'LPT',
      'Brand': 'Lenovo',
      'Model': 'ThinkPad T14 AMD Ryzen 7',
      'Serial Number': 'PF998271',
      'Tanggal Pembelian (YYYY-MM-DD)': '2024-03-10',
      'Harga Pembelian': 21000000,
      'Supplier': 'PT Multipolar Technology',
      'Garansi Berakhir (YYYY-MM-DD)': '2027-03-10',
      'Status (available/assigned/maintenance/reserved/retired)': 'available',
      'Kondisi (excellent/good/fair/poor/damaged)': 'excellent',
      'Lokasi ID (loc-1/loc-2/loc-3/loc-4/loc-5)': 'loc-1',
      'Departemen': 'Information Technology',
      'IP Address': '192.168.10.150',
      'MAC Address': '48:2A:E3:88:12:00',
      'Operating System': 'Windows 11 Pro',
      'Processor': 'Ryzen 7 PRO',
      'RAM': '32 GB',
      'Storage': '1 TB SSD',
      'Catatan': 'Unit baru stok IT warehouse'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Aset');
  XLSX.writeFile(workbook, 'Template_Import_Asset_IT.xlsx');
}

export async function parseAssetsExcel(file: File): Promise<any[]> {
  return parseExcelFile(file);
}

export async function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
