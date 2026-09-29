import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  X,
  Edit3,
  Laptop
} from 'lucide-react';
import { formatCurrency, formatDate, getMaintenanceStatusMeta } from '../../utils/formatters';
import { AssetMaintenance, MaintenanceType, MaintenanceStatus } from '../../types';

export const MaintenanceView: React.FC = () => {
  const {
    maintenanceList,
    assets,
    createMaintenanceTicket,
    updateMaintenanceStatus,
    permissions
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AssetMaintenance | null>(null);

  // Form State
  const [assetId, setAssetId] = useState('');
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>('repair');
  const [maintenanceDate, setMaintenanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [completedDate, setCompletedDate] = useState('');
  const [technician, setTechnician] = useState('IT Internal Team');
  const [vendor, setVendor] = useState('');
  const [maintenanceCost, setMaintenanceCost] = useState<number>(0);
  const [problemDescription, setProblemDescription] = useState('');
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [status, setStatus] = useState<MaintenanceStatus>('scheduled');
  const [notes, setNotes] = useState('');

  // Stats
  const totalCost = maintenanceList.reduce((sum, m) => sum + (m.maintenanceCost || 0), 0);
  const activeCount = maintenanceList.filter((m) => m.status === 'in_progress' || m.status === 'scheduled').length;
  const completedCount = maintenanceList.filter((m) => m.status === 'completed').length;

  const filteredList = maintenanceList.filter((item) => {
    const asset = assets.find((a) => a.id === item.assetId);
    const term = searchTerm.toLowerCase();

    const matchText =
      !term ||
      item.maintenanceId.toLowerCase().includes(term) ||
      item.problemDescription.toLowerCase().includes(term) ||
      item.technician.toLowerCase().includes(term) ||
      (asset && (asset.name.toLowerCase().includes(term) || asset.assetTag.toLowerCase().includes(term)));

    const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchType = selectedType === 'all' || item.maintenanceType === selectedType;

    return matchText && matchStatus && matchType;
  });

  const handleOpenModal = (record?: AssetMaintenance) => {
    if (record) {
      setEditingRecord(record);
      setAssetId(record.assetId);
      setMaintenanceType(record.maintenanceType);
      setMaintenanceDate(record.maintenanceDate);
      setCompletedDate(record.completedDate || '');
      setTechnician(record.technician);
      setVendor(record.vendor || '');
      setMaintenanceCost(record.maintenanceCost);
      setProblemDescription(record.problemDescription);
      setResolutionDetails(record.resolutionDetails || '');
      setStatus(record.status);
      setNotes(record.notes || '');
    } else {
      setEditingRecord(null);
      setAssetId(assets[0]?.id || '');
      setMaintenanceType('preventive');
      setMaintenanceDate(new Date().toISOString().slice(0, 10));
      setCompletedDate('');
      setTechnician('IT Internal Team');
      setVendor('');
      setMaintenanceCost(0);
      setProblemDescription('');
      setResolutionDetails('');
      setStatus('scheduled');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !problemDescription.trim()) return;

    if (editingRecord) {
      updateMaintenanceStatus(
        editingRecord.id,
        status,
        Number(maintenanceCost),
        resolutionDetails
      );
    } else {
      createMaintenanceTicket({
        assetId,
        maintenanceType,
        problemDescription,
        maintenanceDate,
        completedDate: status === 'completed' ? completedDate || new Date().toISOString().slice(0, 10) : undefined,
        technician,
        vendor: vendor || undefined,
        maintenanceCost: Number(maintenanceCost),
        status,
        notes,
        resolutionDetails
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Pemeliharaan & Servis Aset (Maintenance)</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              {maintenanceList.length} Tiket
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan riwayat servis perbaikan, perawatan preventif, upgrade komponen, dan rekapitulasi biaya maintenance
          </p>
        </div>

        {permissions.canManageMaintenance && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Tiket Servis Baru</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Dalam Pengerjaan / Terjadwal</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {activeCount} Tiket
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Servis Selesai (Completed)</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {completedCount} Tiket
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Akumulasi Biaya</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(totalCost)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nomor tiket, deskripsi kerusakan, aset, teknisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="all">Semua Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="all">Semua Tipe Servis</option>
            <option value="preventive">Preventive</option>
            <option value="corrective">Corrective</option>
            <option value="repair">Repair</option>
            <option value="upgrade">Upgrade</option>
            <option value="inspection">Inspection</option>
          </select>
        </div>
      </div>

      {/* Table Records */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">No. Tiket</th>
                <th className="py-3.5 px-4">Perangkat Aset</th>
                <th className="py-3.5 px-4">Tipe & Masalah</th>
                <th className="py-3.5 px-4">Tanggal Mulai</th>
                <th className="py-3.5 px-4">Teknisi / Vendor</th>
                <th className="py-3.5 px-4">Biaya Servis</th>
                <th className="py-3.5 px-4">Status</th>
                {permissions.canManageMaintenance && <th className="py-3.5 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Tidak ada catatan tiket pemeliharaan yang sesuai filter
                  </td>
                </tr>
              ) : (
                filteredList.map((rec) => {
                  const asset = assets.find((a) => a.id === rec.assetId);
                  const statusMeta = getMaintenanceStatusMeta(rec.status);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {rec.maintenanceId}
                      </td>
                      <td className="py-3.5 px-4">
                        {asset ? (
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{asset.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {asset.assetTag}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Aset Tidak Ditemukan</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase block w-fit mb-1">
                          {rec.maintenanceType}
                        </span>
                        <div className="truncate text-slate-900 dark:text-white font-medium" title={rec.problemDescription}>
                          {rec.problemDescription}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {formatDate(rec.maintenanceDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{rec.technician}</div>
                        {rec.vendor && <div className="text-[11px] text-slate-400">{rec.vendor}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(rec.maintenanceCost)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusMeta.bg} ${statusMeta.text}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      {permissions.canManageMaintenance && (
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenModal(rec)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Status Servis"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit Ticket */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingRecord ? `Update Tiket ${editingRecord.maintenanceId}` : 'Buat Tiket Servis Pemeliharaan'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Perangkat Aset <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  disabled={!!editingRecord}
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm disabled:opacity-60"
                >
                  <option value="">-- Pilih Aset --</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.assetTag} - {a.serialNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tipe Pemeliharaan
                  </label>
                  <select
                    value={maintenanceType}
                    onChange={(e) => setMaintenanceType(e.target.value as MaintenanceType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  >
                    <option value="preventive">Preventive (Pencegahan)</option>
                    <option value="corrective">Corrective (Korektif)</option>
                    <option value="repair">Repair (Perbaikan Rusak)</option>
                    <option value="upgrade">Upgrade Komponen</option>
                    <option value="inspection">Inspection / Audit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Status Pengerjaan
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  >
                    <option value="scheduled">Scheduled (Terjadwal)</option>
                    <option value="in_progress">In Progress (Sedang Dikerjakan)</option>
                    <option value="completed">Completed (Selesai)</option>
                    <option value="cancelled">Cancelled (Dibatalkan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Deskripsi Kerusakan / Gejala <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jelaskan kendala, suara abnormal, mati total, overheat..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Teknisi / Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Vendor Luar (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Authorized Service Center"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tanggal Servis Mulai
                  </label>
                  <input
                    type="date"
                    value={maintenanceDate}
                    onChange={(e) => setMaintenanceDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Estimasi Biaya Servis (IDR)
                  </label>
                  <input
                    type="number"
                    value={maintenanceCost}
                    onChange={(e) => setMaintenanceCost(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tindakan & Solusi (Resolution Details)
                </label>
                <textarea
                  rows={2}
                  placeholder="Tindakan yang sudah dilakukan teknisi, penggantian suku cadang..."
                  value={resolutionDetails}
                  onChange={(e) => setResolutionDetails(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  {editingRecord ? 'Update Tiket' : 'Simpan Tiket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
