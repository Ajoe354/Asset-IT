import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  Building,
  Wrench,
  Key,
  ShieldCheck,
  TrendingDown,
  Printer,
  DollarSign
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  calculateDepreciation,
  getDaysRemaining
} from '../../utils/formatters';
import { exportToExcel, exportToCsv } from '../../utils/excelExport';

type ReportType =
  | 'overview'
  | 'category'
  | 'department'
  | 'maintenance'
  | 'licenses'
  | 'warranty'
  | 'depreciation';

export const ReportsView: React.FC = () => {
  const {
    assets,
    categories,
    employees,
    locations,
    maintenanceList,
    licenses,
    settings
  } = useApp();

  const [activeReport, setActiveReport] = useState<ReportType>('overview');

  // Summary Metrics
  const totalAssets = assets.length;
  const totalPurchaseValue = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);
  const totalCurrentValue = assets.reduce((sum, a) => {
    const dep = calculateDepreciation(a.purchasePrice, a.purchaseDate, a.lifespanYears, a.salvageValue);
    return sum + dep.currentBookValue;
  }, 0);
  const totalMaintenanceCost = maintenanceList.reduce((sum, m) => sum + (m.maintenanceCost || 0), 0);
  const totalLicenseCost = licenses.reduce((sum, l) => sum + (l.cost || 0), 0);

  // Export handler
  const handleExport = (format: 'xlsx' | 'csv') => {
    let filename = `IT_Asset_Report_${activeReport}_${new Date().toISOString().slice(0, 10)}`;
    let data: any[] = [];

    if (activeReport === 'overview' || activeReport === 'depreciation') {
      data = assets.map((a) => {
        const cat = categories.find((c) => c.id === a.categoryId)?.name || '';
        const loc = locations.find((l) => l.id === a.locationId)?.name || '';
        const emp = employees.find((e) => e.id === a.assignedToEmployeeId)?.fullName || 'Tidak Ditugaskan';
        const dep = calculateDepreciation(a.purchasePrice, a.purchaseDate, a.lifespanYears, a.salvageValue);

        return {
          'Asset Tag': a.assetTag,
          'Nama Aset': a.name,
          'Kategori': cat,
          'Brand': a.brand,
          'Model': a.model,
          'Serial Number': a.serialNumber,
          'Status': a.status,
          'Kondisi': a.condition,
          'Lokasi': loc,
          'Pengguna': emp,
          'Departemen': a.department || '',
          'Tanggal Beli': a.purchaseDate,
          'Harga Beli (IDR)': a.purchasePrice,
          'Nilai Buku Saat Ini (IDR)': dep.currentBookValue,
          'Akumulasi Depresiasi (IDR)': dep.accumulatedDepreciation,
          'Expired Garansi': a.warrantyExpiryDate || '-'
        };
      });
    } else if (activeReport === 'category') {
      data = categories.map((cat) => {
        const catAssets = assets.filter((a) => a.categoryId === cat.id);
        const val = catAssets.reduce((s, a) => s + (a.purchasePrice || 0), 0);
        return {
          'Kode': cat.code,
          'Kategori': cat.name,
          'Jumlah Unit': catAssets.length,
          'Total Nilai Pengadaan (IDR)': val,
          'Umur Manfaat (Tahun)': cat.defaultLifespanYears
        };
      });
    } else if (activeReport === 'maintenance') {
      data = maintenanceList.map((m) => {
        const asset = assets.find((a) => a.id === m.assetId);
        return {
          'ID Tiket': m.maintenanceId,
          'Asset Tag': asset?.assetTag || '',
          'Nama Aset': asset?.name || '',
          'Tipe Servis': m.maintenanceType,
          'Tanggal Mulai': m.maintenanceDate,
          'Tanggal Selesai': m.completionDate || '-',
          'Teknisi': m.technician,
          'Vendor': m.vendor || '-',
          'Biaya (IDR)': m.maintenanceCost,
          'Deskripsi Masalah': m.problemDescription,
          'Solusi': m.resolutionDetails || '-',
          'Status': m.status
        };
      });
    } else if (activeReport === 'licenses') {
      data = licenses.map((l) => ({
        'Software': l.softwareName,
        'Versi': l.version,
        'Product Key': l.licenseKey,
        'Tipe Lisensi': l.licenseType,
        'Seats Terpakai': l.seatsUsed,
        'Seats Total': l.seatsTotal,
        'Vendor': l.supplier,
        'Tanggal Beli': l.purchaseDate,
        'Tanggal Kedaluwarsa': l.expirationDate || 'Lifetime',
        'Biaya (IDR)': l.cost,
        'Status': l.status
      }));
    } else if (activeReport === 'warranty') {
      data = assets.map((a) => {
        const rem = getDaysRemaining(a.warrantyExpiryDate);
        return {
          'Asset Tag': a.assetTag,
          'Nama Aset': a.name,
          'Brand': a.brand,
          'Serial Number': a.serialNumber,
          'Vendor / Supplier': a.supplier || '-',
          'Tanggal Pembelian': a.purchaseDate,
          'Masa Garansi Berakhir': a.warrantyExpiryDate || '-',
          'Status Garansi': rem.text
        };
      });
    }

    if (format === 'xlsx') {
      exportToExcel(data, filename, 'Laporan');
    } else {
      exportToCsv(data, filename);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Laporan & Analitik Inventaris IT</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Enterprise Reporting
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan valuasi aset, depresiasi buku akuntansi, log pemeliharaan, dan kepatuhan lisensi
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => handleExport('xlsx')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Aset Terdata</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalAssets} Unit</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Perangkat keras & inventaris</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Nilai Pengadaan</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {formatCurrency(totalPurchaseValue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Harga perolehan awal aset</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai Buku Saat Ini (Book Value)</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalCurrentValue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Setelah amortisasi depresiasi</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Biaya Servis & Lisensi</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {formatCurrency(totalMaintenanceCost + totalLicenseCost)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Pengeluaran operasional IT</div>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'overview', label: 'Daftar Valuasi & Inventaris', icon: BarChart3 },
          { id: 'category', label: 'Rekap Kategori', icon: Layers },
          { id: 'depreciation', label: 'Jadwal Depresiasi', icon: TrendingDown },
          { id: 'maintenance', label: 'Biaya Maintenance', icon: Wrench },
          { id: 'licenses', label: 'Lisensi Software', icon: Key },
          { id: 'warranty', label: 'Garansi & Vendor', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as ReportType)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Table Content based on activeReport */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          {/* 1. OVERVIEW & DEPRECIATION TABLE */}
          {(activeReport === 'overview' || activeReport === 'depreciation') && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 pl-5">Asset Tag & Nama</th>
                  <th className="p-3.5">Kategori & Brand</th>
                  <th className="p-3.5">Tgl Pengadaan</th>
                  <th className="p-3.5">Harga Perolehan</th>
                  <th className="p-3.5">Nilai Buku Saat Ini</th>
                  <th className="p-3.5">Akumulasi Depresiasi</th>
                  <th className="p-3.5 pr-5">Sisa Masa Pakai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {assets.map((a) => {
                  const cat = categories.find((c) => c.id === a.categoryId);
                  const dep = calculateDepreciation(a.purchasePrice, a.purchaseDate, a.lifespanYears, a.salvageValue);

                  return (
                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 pl-5">
                        <div className="font-bold text-slate-900 dark:text-white">{a.name}</div>
                        <div className="font-mono text-[11px] text-blue-600">{a.assetTag}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{cat?.name}</div>
                        <div className="text-[11px] text-slate-400">{a.brand} {a.model}</div>
                      </td>

                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        {formatDate(a.purchaseDate)}
                      </td>

                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(a.purchasePrice)}
                      </td>

                      <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(dep.currentBookValue)}
                      </td>

                      <td className="p-3.5 text-rose-500 font-medium">
                        -{formatCurrency(dep.accumulatedDepreciation)}
                      </td>

                      <td className="p-3.5 pr-5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, 100 - dep.percentDepreciated))}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-slate-500">{dep.yearsRemaining.toFixed(1)} Th</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* 2. CATEGORY RECAP */}
          {activeReport === 'category' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 pl-5">Kode & Kategori</th>
                  <th className="p-3.5">Total Unit</th>
                  <th className="p-3.5">Aset Digunakan</th>
                  <th className="p-3.5">Aset Tersedia (Stock)</th>
                  <th className="p-3.5">Dalam Servis</th>
                  <th className="p-3.5 pr-5 text-right">Total Valuasi Pengadaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {categories.map((cat) => {
                  const catAssets = assets.filter((a) => a.categoryId === cat.id);
                  const inUse = catAssets.filter((a) => a.status === 'in_use').length;
                  const available = catAssets.filter((a) => a.status === 'available').length;
                  const maintenance = catAssets.filter((a) => a.status === 'maintenance').length;
                  const totalVal = catAssets.reduce((s, a) => s + (a.purchasePrice || 0), 0);

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 pl-5">
                        <div className="font-bold text-slate-900 dark:text-white">{cat.name}</div>
                        <div className="font-mono text-[10px] text-slate-400">Kode: {cat.code}</div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{catAssets.length} Unit</td>
                      <td className="p-3.5 text-blue-600 font-semibold">{inUse} Unit</td>
                      <td className="p-3.5 text-emerald-600 font-semibold">{available} Unit</td>
                      <td className="p-3.5 text-amber-600 font-semibold">{maintenance} Unit</td>
                      <td className="p-3.5 pr-5 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(totalVal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* 3. MAINTENANCE REPORT */}
          {activeReport === 'maintenance' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 pl-5">No Tiket</th>
                  <th className="p-3.5">Perangkat</th>
                  <th className="p-3.5">Tipe & Masalah</th>
                  <th className="p-3.5">Teknisi / Vendor</th>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Biaya Servis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {maintenanceList.map((m) => {
                  const asset = assets.find((a) => a.id === m.assetId);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 pl-5 font-mono font-bold text-blue-600">{m.maintenanceId}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{asset?.name}</div>
                        <div className="font-mono text-[10px] text-slate-400">{asset?.assetTag}</div>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="font-semibold uppercase text-[10px] text-slate-700 dark:text-slate-300">
                          {m.maintenanceType}
                        </div>
                        <div className="line-clamp-1 text-slate-500">{m.problemDescription}</div>
                      </td>
                      <td className="p-3.5">{m.technician} {m.vendor ? `(${m.vendor})` : ''}</td>
                      <td className="p-3.5">{formatDate(m.maintenanceDate)}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                          {m.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(m.maintenanceCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* 4. LICENSES REPORT */}
          {activeReport === 'licenses' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 pl-5">Software & Versi</th>
                  <th className="p-3.5">Tipe</th>
                  <th className="p-3.5">Kunci Lisensi</th>
                  <th className="p-3.5">Seat Terpakai</th>
                  <th className="p-3.5">Kedaluwarsa</th>
                  <th className="p-3.5 pr-5 text-right">Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {licenses.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 pl-5 font-bold text-slate-900 dark:text-white">{l.softwareName} v{l.version}</td>
                    <td className="p-3.5 uppercase text-[10px] font-semibold">{l.licenseType}</td>
                    <td className="p-3.5 font-mono text-[11px]">{l.licenseKey}</td>
                    <td className="p-3.5 font-bold">{l.seatsUsed} / {l.seatsTotal}</td>
                    <td className="p-3.5">{l.expirationDate ? formatDate(l.expirationDate) : 'Lifetime'}</td>
                    <td className="p-3.5 pr-5 text-right font-bold">{formatCurrency(l.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 5. WARRANTY REPORT */}
          {activeReport === 'warranty' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 pl-5">Asset Tag & Perangkat</th>
                  <th className="p-3.5">Serial Number</th>
                  <th className="p-3.5">Supplier / Vendor</th>
                  <th className="p-3.5">Tgl Pembelian</th>
                  <th className="p-3.5">Garansi Berakhir</th>
                  <th className="p-3.5 pr-5">Status Garansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {assets.map((a) => {
                  const rem = getDaysRemaining(a.warrantyExpiryDate);
                  return (
                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 pl-5">
                        <div className="font-bold text-slate-900 dark:text-white">{a.name}</div>
                        <div className="font-mono text-[11px] text-blue-600">{a.assetTag}</div>
                      </td>
                      <td className="p-3.5 font-mono">{a.serialNumber}</td>
                      <td className="p-3.5">{a.supplier || '-'}</td>
                      <td className="p-3.5">{formatDate(a.purchaseDate)}</td>
                      <td className="p-3.5 font-medium">{a.warrantyExpiryDate ? formatDate(a.warrantyExpiryDate) : '-'}</td>
                      <td className="p-3.5 pr-5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          rem.isExpired ? 'bg-rose-100 text-rose-800' : rem.days <= 60 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {rem.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
