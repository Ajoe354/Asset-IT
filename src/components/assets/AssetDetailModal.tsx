import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Laptop,
  QrCode,
  Printer,
  Calendar,
  DollarSign,
  ShieldCheck,
  Building,
  User as UserIcon,
  HardDrive,
  Cpu,
  Wifi,
  FileText,
  Clock,
  Wrench,
  UserCheck,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getAssetStatusMeta,
  getConditionMeta,
  getDaysRemaining
} from '../../utils/formatters';
import { generateQrCodeDataUrl, generateBarcodeSvg } from '../../utils/qrBarcode';

interface AssetDetailModalProps {
  onEditAsset: () => void;
  onAssignAsset: () => void;
  onMaintenanceAsset: () => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  onEditAsset,
  onAssignAsset,
  onMaintenanceAsset
}) => {
  const {
    selectedAssetForDetail,
    setSelectedAssetForDetail,
    categories,
    locations,
    employees,
    assignments,
    maintenanceList,
    activityLogs,
    settings,
    deleteAsset,
    permissions
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'maintenance' | 'label' | 'docs' | 'history'>('overview');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const asset = selectedAssetForDetail;

  useEffect(() => {
    if (asset) {
      generateQrCodeDataUrl(`ITAMS:${asset.assetTag}:${asset.serialNumber}`).then((url) => {
        setQrCodeUrl(url);
      });
    }
  }, [asset]);

  if (!asset) return null;

  const category = categories.find((c) => c.id === asset.categoryId);
  const location = locations.find((l) => l.id === asset.locationId);
  const assignedEmployee = employees.find((e) => e.id === asset.assignedToEmployeeId);
  const assetAssignments = assignments.filter((a) => a.assetId === asset.id);
  const assetMaintenance = maintenanceList.filter((m) => m.assetId === asset.id);
  const assetLogs = activityLogs.filter((l) => l.entityId === asset.id || l.entityName.includes(asset.assetTag));

  const statusMeta = getAssetStatusMeta(asset.status);
  const conditionMeta = getConditionMeta(asset.condition);
  const warrantyRemaining = getDaysRemaining(asset.warrantyExpiryDate);

  // Financial Depreciation calculation (Straight-line based on category lifespan)
  const lifespanYears = category?.defaultLifespanYears || 4;
  const purchaseYear = new Date(asset.purchaseDate).getFullYear();
  const currentYear = 2026;
  const ageYears = Math.max(0, currentYear - purchaseYear);
  const annualDepreciation = asset.purchasePrice / lifespanYears;
  const currentBookValue = Math.max(0, asset.purchasePrice - annualDepreciation * ageYears);

  const handlePrintLabel = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Asset Tag - ${asset.assetTag}</title>
          <style>
            @page { size: 80mm 50mm; margin: 0; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 8px; box-sizing: border-box; }
            .tag-container { border: 2px solid #000; border-radius: 6px; padding: 8px; width: 74mm; height: 44mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #000; padding-bottom: 4px; }
            .title { font-weight: 800; font-size: 11px; text-transform: uppercase; }
            .company { font-size: 9px; color: #444; }
            .content { display: flex; gap: 8px; align-items: center; margin-top: 4px; }
            .qr-img { width: 70px; height: 70px; }
            .info { flex: 1; font-size: 9px; line-height: 1.3; }
            .tag-id { font-family: monospace; font-weight: 800; font-size: 13px; margin-bottom: 2px; }
            .footer { border-top: 1px solid #ccc; font-size: 7px; color: #666; text-align: center; padding-top: 2px; }
          </style>
        </head>
        <body>
          <div class="tag-container">
            <div class="header">
              <div>
                <div class="title">PROPERTY OF IT DEPT</div>
                <div class="company">${settings.companyName}</div>
              </div>
              <div style="font-weight: bold; font-size: 10px;">${category?.code || 'IT'}</div>
            </div>
            <div class="content">
              <img src="${qrCodeUrl}" class="qr-img" />
              <div class="info">
                <div class="tag-id">${asset.assetTag}</div>
                <div><b>Nama:</b> ${asset.name}</div>
                <div><b>SN:</b> ${asset.serialNumber}</div>
                <div><b>Model:</b> ${asset.brand} ${asset.model}</div>
              </div>
            </div>
            <div class="footer">DO NOT REMOVE OR TAMPER WITH THIS SECURITY BARCODE</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        id="asset-detail-modal"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-2 shadow-xs shrink-0 overflow-hidden">
              {asset.photoUrl ? (
                <img src={asset.photoUrl} alt={asset.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Laptop className="w-7 h-7 text-blue-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  {asset.name}
                </h2>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {asset.assetTag}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                  {statusMeta.label}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                <span>Kategori: <b>{category?.name || 'Aset IT'}</b></span>
                <span>•</span>
                <span>Brand: <b>{asset.brand}</b></span>
                <span>•</span>
                <span>SN: <b className="font-mono">{asset.serialNumber}</b></span>
                <span>•</span>
                <span>Lokasi: <b>{location?.name || '-'}</b></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedAssetForDetail(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex gap-6 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Spesifikasi' },
            { id: 'assignments', label: `Riwayat Pengguna (${assetAssignments.length})` },
            { id: 'maintenance', label: `Maintenance (${assetMaintenance.length})` },
            { id: 'label', label: 'QR & Barcode Tag' },
            { id: 'docs', label: `Dokumen (${asset.documents?.length || 0})` },
            { id: 'history', label: `Audit Log (${assetLogs.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Current User Card */}
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50">
                  <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5" /> Pengguna Saat Ini
                  </div>
                  {assignedEmployee ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={assignedEmployee.avatarUrl}
                        alt={assignedEmployee.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-blue-200 dark:border-blue-800"
                      />
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {assignedEmployee.fullName}
                        </div>
                        <div className="text-xs text-slate-500">{assignedEmployee.department}</div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                          Ditugaskan: {formatDate(asset.assignedDate)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs py-1">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Tersedia di Gudang</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Belum ditugaskan ke karyawan manapun.</p>
                    </div>
                  )}
                </div>

                {/* Condition & Status */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Kondisi Fisik & Masa Garansi
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Kondisi:</span>
                      <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${conditionMeta.bg} ${conditionMeta.text}`}>
                        {conditionMeta.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Garansi:</span>
                      <span className={`font-semibold text-[11px] ${warrantyRemaining.isExpired ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        {formatDate(asset.warrantyExpiryDate)} ({warrantyRemaining.text})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Supplier:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 text-right truncate max-w-[120px]">
                        {asset.supplier}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Value & Depreciation */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Nilai Finansial & Depresiasi
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Harga Beli:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(asset.purchasePrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Nilai Buku Saat Ini:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(currentBookValue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Estimasi Umur:</span>
                      <span>{lifespanYears} Tahun ({ageYears} th terpakai)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hardware & Network Specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hardware Specs */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    Spesifikasi Perangkat Keras
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Processor (CPU):</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{asset.processor || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Kapasitas RAM:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{asset.ram || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Storage / Penyimpanan:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{asset.storage || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Operating System (OS):</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{asset.os || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Model Spesifik:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{asset.brand} {asset.model}</span>
                    </div>
                  </div>
                </div>

                {/* Network & Infrastructure Info */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-500" />
                    Informasi Jaringan & Alamat
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">IP Address:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-right">{asset.ipAddress || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">MAC Address:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-right">{asset.macAddress || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Lokasi / Gedung:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{location?.name} ({location?.floor})</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Departemen Pemilik:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{asset.department}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Tanggal Pembelian:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{formatDate(asset.purchaseDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {asset.notes && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan:</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{asset.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ASSIGNMENT HISTORY */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Riwayat Peminjaman & Penugasan Aset</h4>
                {permissions.canAssignAsset && (
                  <button
                    onClick={onAssignAsset}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Tugaskan / Transfer</span>
                  </button>
                )}
              </div>

              {assetAssignments.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Belum ada riwayat penugasan untuk aset ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {assetAssignments.map((asg) => {
                    const emp = employees.find((e) => e.id === asg.employeeId);
                    return (
                      <div
                        key={asg.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={emp?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt={emp?.fullName}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                              {emp?.fullName || 'Karyawan'}
                              <span className="font-mono text-[10px] text-slate-400">({asg.assignmentCode})</span>
                            </div>
                            <div className="text-xs text-slate-500">{asg.department}</div>
                            {asg.notes && <div className="text-[11px] text-slate-400 mt-1 italic">{asg.notes}</div>}
                          </div>
                        </div>

                        <div className="text-right text-xs shrink-0">
                          <div className="font-semibold text-slate-700 dark:text-slate-300">
                            Mulai: {formatDate(asg.assignedDate)}
                          </div>
                          {asg.expectedReturnDate && (
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Rencana Kembali: {formatDate(asg.expectedReturnDate)}
                            </div>
                          )}
                          <div className="mt-1">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              asg.status === 'active'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {asg.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MAINTENANCE HISTORY */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Riwayat Pemeliharaan & Perbaikan</h4>
                {permissions.canManageMaintenance && (
                  <button
                    onClick={onMaintenanceAsset}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Buat Tiket Maintenance</span>
                  </button>
                )}
              </div>

              {assetMaintenance.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Aset dalam kondisi prima, belum pernah dilakukan tindakan maintenance.
                </div>
              ) : (
                <div className="space-y-3">
                  {assetMaintenance.map((mnt) => (
                    <div
                      key={mnt.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{mnt.maintenanceId}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-mono">
                            {mnt.maintenanceType}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          mnt.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : mnt.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}>
                          {mnt.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{mnt.problemDescription}</p>
                      {mnt.resolutionDetails && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-lg">
                          <b>Solusi:</b> {mnt.resolutionDetails}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>Teknisi / Vendor: <b>{mnt.technician} {mnt.vendor ? `(${mnt.vendor})` : ''}</b></span>
                        <span>Biaya: <b>{formatCurrency(mnt.maintenanceCost)}</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: QR & BARCODE LABEL TAG */}
          {activeTab === 'label' && (
            <div className="space-y-6 text-center">
              <div className="max-w-md mx-auto p-6 rounded-2xl bg-white border-2 border-slate-900 shadow-md text-slate-900 text-left">
                {/* Enterprise Stamping Label */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
                  <div>
                    <div className="text-xs font-black tracking-wider uppercase text-blue-900">
                      PROPERTY OF IT DEPT
                    </div>
                    <div className="text-[11px] font-semibold text-slate-600">{settings.companyName}</div>
                  </div>
                  <div className="px-2 py-0.5 text-xs font-black bg-slate-900 text-white rounded">
                    {category?.code || 'IT'}
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24 shrink-0 rounded-md border border-slate-200" />
                  ) : (
                    <div className="w-24 h-24 bg-slate-100 flex items-center justify-center text-xs">Generating...</div>
                  )}

                  <div className="flex-1 text-xs space-y-1">
                    <div className="font-mono font-black text-base text-blue-700 tracking-tight">
                      {asset.assetTag}
                    </div>
                    <div className="font-bold text-slate-900 truncate">{asset.name}</div>
                    <div className="text-[11px] text-slate-600">
                      SN: <span className="font-mono font-semibold">{asset.serialNumber}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {asset.brand} {asset.model}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-300 text-[9px] text-center text-slate-500 font-semibold tracking-wider">
                  DO NOT REMOVE OR TAMPER WITH THIS SECURITY BARCODE
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handlePrintLabel}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Stiker Label Tag Aset (Thermal / PDF)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENTS */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Dokumen & Invoice Terlampir</h4>
              </div>

              {(!asset.documents || asset.documents.length === 0) ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Belum ada invoice atau kartu garansi yang diunggah untuk aset ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {asset.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                        <div className="truncate">
                          <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">{doc.name}</div>
                          <div className="text-[10px] text-slate-500">{doc.size} • {formatDate(doc.uploadDate)}</div>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
                      >
                        Buka
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: AUDIT TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Activity Log & Audit Trail</h4>
              {assetLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Belum ada rekaman audit log spesifik untuk aset ini.
                </div>
              ) : (
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-8">
                  {assetLogs.map((log) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-8 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                          <span className="text-[10px] text-slate-400">{formatDateTime(log.timestamp)}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">{log.details}</p>
                        <div className="text-[10px] text-slate-500 mt-1">Oleh: <b>{log.userName}</b> ({log.userRole})</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {permissions.canDeleteAsset && (
              <button
                onClick={() => {
                  if (confirm(`Apakah Anda yakin ingin menghapus aset ${asset.name} (${asset.assetTag})?`)) {
                    deleteAsset(asset.id);
                    setSelectedAssetForDetail(null);
                  }
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Aset</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {permissions.canEditAsset && (
              <button
                onClick={onEditAsset}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Aset</span>
              </button>
            )}

            <button
              onClick={() => setSelectedAssetForDetail(null)}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 text-xs font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
