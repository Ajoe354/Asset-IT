import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings as SettingsIcon,
  Building,
  Tag,
  Bell,
  Database,
  Save,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  ShieldAlert
} from 'lucide-react';
import { CompanySettings } from '../../types';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, permissions } = useApp();

  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Backup Full State JSON
  const handleExportBackup = () => {
    const rawData = localStorage.getItem('IT_ASSET_MGMT_DATA_V1');
    if (!rawData) return;

    const blob = new Blob([rawData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IT_Asset_System_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Restore JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = evt.target?.result as string;
        JSON.parse(json); // Validate JSON
        localStorage.setItem('IT_ASSET_MGMT_DATA_V1', json);
        alert('Data berhasil dipulihkan! Halaman akan dimuat ulang.');
        window.location.reload();
      } catch (err) {
        alert('File backup JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  // Reset to Factory Demo Data
  const handleResetData = () => {
    if (confirm('PERINGATAN: Seluruh data perubahan Anda akan direset kembali ke data awal demo. Lanjutkan?')) {
      localStorage.removeItem('IT_ASSET_MGMT_DATA_V1');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Pengaturan Sistem IT</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi profil perusahaan, format penomoran barcode tag, preferensi notifikasi, dan cadangan data (backup)
          </p>
        </div>

        {saveSuccess && (
          <div className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            <span>Pengaturan berhasil disimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Company Profile */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Informasi Instansi & Perusahaan</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Perusahaan / Organisasi
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Kontak IT
              </label>
              <input
                type="email"
                value={formData.companyEmail}
                onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Alamat Kantor Pusat
              </label>
              <input
                type="text"
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nomor Telepon / Hotline IT
              </label>
              <input
                type="text"
                value={formData.companyPhone}
                onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Asset Tag & Regional Preferences */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>Format Tag Aset & Preferensi Format</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Prefix Tag Barcode Aset
              </label>
              <input
                type="text"
                value={formData.assetTagPrefix}
                onChange={(e) => setFormData({ ...formData, assetTagPrefix: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Contoh: AST-2024-001</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mata Uang Utama
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
              >
                <option value="IDR">IDR - Rupiah Indonesia (Rp)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="SGD">SGD - Singapore Dollar (S$)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Format Tanggal
              </label>
              <select
                value={formData.dateFormat}
                onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (Contoh: 31/12/2024)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Notification Preferences */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-600" />
            <span>Pemberitahuan Otomatis (Alert Settings)</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableWarrantyAlerts}
                onChange={(e) => setFormData({ ...formData, enableWarrantyAlerts: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Peringatan Masa Garansi Aset
                </div>
                <div className="text-[11px] text-slate-500">
                  Tampilkan notifikasi jika garansi perangkat akan berakhir dalam 30-60 hari ke depan
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableMaintenanceReminders}
                onChange={(e) => setFormData({ ...formData, enableMaintenanceReminders: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Pengingat Jadwal Maintenance Berkala
                </div>
                <div className="text-[11px] text-slate-500">
                  Kirim peringatan untuk jadwal servis preventif dan pengecekan fisik perangkat
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        {permissions.canManageSettings && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Pengaturan</span>
            </button>
          </div>
        )}
      </form>

      {/* Section 4: Data Management & Backup */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-500" />
          <span>Cadangan Data (Backup & Restore)</span>
        </h3>
        <p className="text-xs text-slate-500">
          Ekspor seluruh data aset, riwayat peminjaman, tiket maintenance, dan pengguna ke dalam file cadangan JSON terenkripsi.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Unduh Cadangan JSON</span>
          </button>

          <label className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Pulihkan dari File JSON</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset ke Demo Data Awal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
