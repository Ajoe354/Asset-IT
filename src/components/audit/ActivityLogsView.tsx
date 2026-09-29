import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  User as UserIcon,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import { exportToExcel, exportToCsv } from '../../utils/excelExport';

export const ActivityLogsView: React.FC = () => {
  const { activityLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');

  const filteredLogs = activityLogs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchText =
      !term ||
      log.details.toLowerCase().includes(term) ||
      log.userName.toLowerCase().includes(term) ||
      log.entityName.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term);

    const matchAction = selectedAction === 'all' || log.action === selectedAction;

    return matchText && matchAction;
  });

  const handleExport = (format: 'xlsx' | 'csv') => {
    const data = filteredLogs.map((l) => ({
      'Waktu Log': formatDateTime(l.timestamp),
      'Pengguna': l.userName,
      'Aksi': l.action.toUpperCase(),
      'Entitas Target': l.entityType.toUpperCase(),
      'Nama Entitas': l.entityName,
      'Rincian Aktivitas': l.details
    }));

    const filename = `IT_Audit_Trail_${new Date().toISOString().slice(0, 10)}`;
    if (format === 'xlsx') {
      exportToExcel(data, filename, 'Audit Log');
    } else {
      exportToCsv(data, filename);
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'create':
      case 'import':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'delete':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      case 'assign':
      case 'transfer':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      case 'return':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300';
      case 'maintenance':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Audit Trail & Log Aktivitas Sistem</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {activityLogs.length} Catatan Log
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekam jejak seluruh perubahan data aset, peminjaman, perbaikan, lisensi, dan penghapusan untuk transparansi audit IT
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => handleExport('xlsx')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Log Excel</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari rincian aktivitas, nama user, entitas aset..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="all">Semua Tipe Aksi</option>
            <option value="create">Create (Tambah)</option>
            <option value="update">Update (Ubah)</option>
            <option value="delete">Delete (Hapus)</option>
            <option value="assign">Assign (Penugasan)</option>
            <option value="return">Return (Pengembalian)</option>
            <option value="transfer">Transfer (Alih Tugas)</option>
            <option value="maintenance">Maintenance</option>
            <option value="import">Bulk Import</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 pl-5">Waktu & Tanggal</th>
                <th className="p-3.5">Pengguna (User)</th>
                <th className="p-3.5">Aksi</th>
                <th className="p-3.5">Entitas / Modul</th>
                <th className="p-3.5 pr-5">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    Tidak ada catatan aktivitas yang sesuai dengan kriteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 pl-5 font-mono text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.userName}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getActionBadgeColor(log.action)}`}>
                        {log.action.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{log.entityName}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">{log.entityType}</div>
                    </td>

                    <td className="p-3.5 pr-5 text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
