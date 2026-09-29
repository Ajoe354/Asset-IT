import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Key,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  Edit3,
  Trash2,
  X,
  UserPlus,
  Building
} from 'lucide-react';
import { formatCurrency, formatDate, getDaysRemaining } from '../../utils/formatters';
import { SoftwareLicense, LicenseType } from '../../types';

export const LicensesView: React.FC = () => {
  const {
    licenses,
    employees,
    addLicense,
    updateLicense,
    deleteLicense,
    assignLicenseSeat,
    revokeLicenseSeat,
    permissions
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<SoftwareLicense | null>(null);
  const [assignSeatModalLic, setAssignSeatModalLic] = useState<SoftwareLicense | null>(null);
  const [selectedEmployeeToAssign, setSelectedEmployeeToAssign] = useState('');

  // Form State
  const [softwareName, setSoftwareName] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseType, setLicenseType] = useState<LicenseType>('subscription_annual');
  const [totalLicenses, setTotalLicenses] = useState(10);
  const [vendor, setVendor] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [expirationDate, setExpirationDate] = useState('');
  const [licenseCost, setLicenseCost] = useState(5000000);
  const [category, setCategory] = useState('Productivity');
  const [notes, setNotes] = useState('');

  // Aggregated Stats
  const totalSeats = licenses.reduce((sum, l) => sum + l.totalLicenses, 0);
  const usedSeats = licenses.reduce((sum, l) => sum + (l.assignedEmployeeIds?.length || 0), 0);
  const totalLicenseCost = licenses.reduce((sum, l) => sum + (l.licenseCost || 0), 0);

  const filteredLicenses = licenses.filter((l) => {
    const term = searchTerm.toLowerCase();
    const matchText =
      !term ||
      l.softwareName.toLowerCase().includes(term) ||
      l.licenseKey.toLowerCase().includes(term) ||
      l.vendor.toLowerCase().includes(term);

    const matchType = selectedType === 'all' || l.licenseType === selectedType;

    return matchText && matchType;
  });

  const handleOpenModal = (lic?: SoftwareLicense) => {
    if (lic) {
      setEditingLicense(lic);
      setSoftwareName(lic.softwareName);
      setLicenseKey(lic.licenseKey);
      setLicenseType(lic.licenseType);
      setTotalLicenses(lic.totalLicenses);
      setVendor(lic.vendor);
      setPurchaseDate(lic.purchaseDate);
      setExpirationDate(lic.expirationDate || '');
      setLicenseCost(lic.licenseCost);
      setCategory(lic.category || 'Productivity');
      setNotes(lic.notes || '');
    } else {
      setEditingLicense(null);
      setSoftwareName('');
      setLicenseKey(`XXXX-XXXX-XXXX-${Date.now().toString().slice(-4)}`);
      setLicenseType('subscription_annual');
      setTotalLicenses(10);
      setVendor('Software Vendor Inc.');
      setPurchaseDate(new Date().toISOString().slice(0, 10));
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      setExpirationDate(future.toISOString().slice(0, 10));
      setLicenseCost(12000000);
      setCategory('Productivity');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!softwareName.trim()) return;

    if (editingLicense) {
      updateLicense(editingLicense.id, {
        softwareName,
        licenseKey,
        licenseType,
        totalLicenses: Number(totalLicenses),
        vendor,
        purchaseDate,
        expirationDate,
        licenseCost: Number(licenseCost),
        category,
        notes
      });
    } else {
      addLicense({
        softwareName,
        licenseKey,
        licenseType,
        totalLicenses: Number(totalLicenses),
        assignedEmployeeIds: [],
        vendor,
        purchaseDate,
        expirationDate,
        licenseCost: Number(licenseCost),
        category,
        status: 'active',
        notes
      });
    }

    setIsModalOpen(false);
  };

  const handleAssignSeatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignSeatModalLic || !selectedEmployeeToAssign) return;

    assignLicenseSeat(assignSeatModalLic.id, selectedEmployeeToAssign);
    setAssignSeatModalLic(null);
    setSelectedEmployeeToAssign('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Manajemen Lisensi Software IT</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              {licenses.length} Lisensi
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola langganan software, kepemilikan lisensi SaaS/perpetual, alokasi kursi (seat allocation), dan batas kedaluwarsa
          </p>
        </div>

        {permissions.canManageLicenses && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Lisensi Baru</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-xl">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Kursi (Seats)</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {usedSeats} / {totalSeats} <span className="text-xs font-normal text-slate-400">Digunakan</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Nilai Investasi Lisensi</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(totalLicenseCost)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Expiring Soon (30 Hari)</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {licenses.filter((l) => {
                  const rem = getDaysRemaining(l.expirationDate);
                  return !rem.isExpired && rem.days <= 30;
                }).length} Paket
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari software, nomor lisensi, vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="all">Semua Tipe Lisensi</option>
            <option value="subscription_annual">Subscription Annual</option>
            <option value="subscription_monthly">Subscription Monthly</option>
            <option value="perpetual">Perpetual (Seumur Hidup)</option>
            <option value="per_user">Per User</option>
            <option value="volume">Volume Licensing</option>
          </select>
        </div>
      </div>

      {/* License Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredLicenses.map((lic) => {
          const used = lic.assignedEmployeeIds?.length || 0;
          const total = lic.totalLicenses || 1;
          const usagePercent = Math.min(100, Math.round((used / total) * 100));
          const daysRem = getDaysRemaining(lic.expirationDate);

          return (
            <div
              key={lic.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {lic.softwareName}
                      </h3>
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                        <span>{lic.category}</span>
                        <span>•</span>
                        <span>{lic.vendor}</span>
                      </div>
                    </div>
                  </div>

                  {permissions.canManageLicenses && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(lic)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus lisensi ${lic.softwareName}?`)) {
                            deleteLicense(lic.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Key snippet */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between mb-4 border border-slate-100 dark:border-slate-700">
                  <span className="truncate">Key: {lic.licenseKey}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                    {lic.licenseType.replace('_', ' ')}
                  </span>
                </div>

                {/* Seat Capacity Progress */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">Kapasitas Kursi (Seats):</span>
                    <span className="text-slate-900 dark:text-white">
                      {used} / {total} Seat ({usagePercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        usagePercent >= 90
                          ? 'bg-rose-500'
                          : usagePercent >= 70
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 block text-[10px]">BIAYA LANGGANAN:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(lic.licenseCost)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">KEDALUWARSA:</span>
                    <span
                      className={`font-semibold ${
                        daysRem.isExpired
                          ? 'text-rose-600'
                          : daysRem.days <= 30
                          ? 'text-amber-600 font-bold'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {formatDate(lic.expirationDate)} ({daysRem.text})
                    </span>
                  </div>
                </div>

                {/* Assigned Users list */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
                    <span>PENGGUNA TERDAFTAR ({lic.assignedEmployeeIds?.length || 0}):</span>
                    {permissions.canManageLicenses && used < total && (
                      <button
                        onClick={() => setAssignSeatModalLic(lic)}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Alokasikan Seat</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    {lic.assignedEmployeeIds?.length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic">Belum ada user yang ditugaskan</div>
                    ) : (
                      lic.assignedEmployeeIds?.map((empId) => {
                        const emp = employees.find((e) => e.id === empId);
                        return (
                          <div
                            key={empId}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] flex items-center justify-between"
                          >
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {emp ? emp.fullName : empId}
                            </span>
                            {permissions.canManageLicenses && (
                              <button
                                onClick={() => revokeLicenseSeat(lic.id, empId)}
                                className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold"
                              >
                                Cabut
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: ADD/EDIT LICENSE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingLicense ? 'Edit Lisensi Software' : 'Tambah Lisensi Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nama Software <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Microsoft 365 Business"
                    value={softwareName}
                    onChange={(e) => setSoftwareName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kategori
                  </label>
                  <input
                    type="text"
                    placeholder="Productivity, Security..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  License Key / Serial
                </label>
                <input
                  type="text"
                  placeholder="XXXX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tipe Lisensi
                  </label>
                  <select
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value as LicenseType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  >
                    <option value="subscription_annual">Subscription (Tahunan)</option>
                    <option value="subscription_monthly">Subscription (Bulanan)</option>
                    <option value="perpetual">Perpetual (Sekali Beli)</option>
                    <option value="per_user">Per User</option>
                    <option value="volume">Volume Licensing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Total Kuota Kursi (Seats)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalLicenses}
                    onChange={(e) => setTotalLicenses(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Vendor / Penerbit
                  </label>
                  <input
                    type="text"
                    placeholder="Microsoft, Adobe, JetBrains..."
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Biaya Lisensi (IDR)
                  </label>
                  <input
                    type="number"
                    value={licenseCost}
                    onChange={(e) => setLicenseCost(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tanggal Pembelian
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tanggal Kedaluwarsa
                  </label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
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
                  Simpan Lisensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN SEAT TO EMPLOYEE */}
      {assignSeatModalLic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Alokasikan Seat Lisensi</h3>
                <div className="text-xs text-purple-600 font-semibold">{assignSeatModalLic.softwareName}</div>
              </div>
              <button onClick={() => setAssignSeatModalLic(null)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSeatSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Karyawan Penerima Seat
                </label>
                <select
                  required
                  value={selectedEmployeeToAssign}
                  onChange={(e) => setSelectedEmployeeToAssign(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                >
                  <option value="">-- Pilih Karyawan --</option>
                  {employees
                    .filter((emp) => !assignSeatModalLic.assignedEmployeeIds?.includes(emp.id))
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.department} - {emp.employeeId})
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignSeatModalLic(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Tugaskan Seat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
