import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Laptop, User as UserIcon, Key, Wrench, ArrowRight, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../../utils/formatters';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    assets,
    employees,
    licenses,
    maintenanceList,
    categories,
    setSelectedAssetForDetail,
    setActiveTab,
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const cleanQ = query.trim().toLowerCase();

  const matchedAssets = cleanQ
    ? assets.filter(
        (a) =>
          a.name.toLowerCase().includes(cleanQ) ||
          a.assetTag.toLowerCase().includes(cleanQ) ||
          a.serialNumber.toLowerCase().includes(cleanQ) ||
          a.brand.toLowerCase().includes(cleanQ) ||
          a.model.toLowerCase().includes(cleanQ) ||
          (a.ipAddress && a.ipAddress.includes(cleanQ))
      ).slice(0, 5)
    : [];

  const matchedEmployees = cleanQ
    ? employees.filter(
        (e) =>
          e.fullName.toLowerCase().includes(cleanQ) ||
          e.employeeId.toLowerCase().includes(cleanQ) ||
          e.department.toLowerCase().includes(cleanQ) ||
          e.email.toLowerCase().includes(cleanQ)
      ).slice(0, 4)
    : [];

  const matchedLicenses = cleanQ
    ? licenses.filter(
        (l) =>
          l.softwareName.toLowerCase().includes(cleanQ) ||
          l.licenseKey.toLowerCase().includes(cleanQ) ||
          l.vendor.toLowerCase().includes(cleanQ)
      ).slice(0, 3)
    : [];

  const matchedMaintenance = cleanQ
    ? maintenanceList.filter(
        (m) =>
          m.maintenanceId.toLowerCase().includes(cleanQ) ||
          m.problemDescription.toLowerCase().includes(cleanQ) ||
          m.technician.toLowerCase().includes(cleanQ)
      ).slice(0, 3)
    : [];

  const totalResults =
    matchedAssets.length + matchedEmployees.length + matchedLicenses.length + matchedMaintenance.length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          id="global-search-modal"
        >
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Cari aset (Tag, Serial Number, Nama, IP), karyawan, lisensi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 text-base focus:outline-hidden"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
              ESC
            </kbd>
            <button
              onClick={() => setIsGlobalSearchOpen(false)}
              className="sm:hidden text-slate-500 p-1 text-xs"
            >
              Batal
            </button>
          </div>

          {/* Results container */}
          <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
            {!query && (
              <div className="py-8 text-center text-slate-500 text-sm">
                <Sparkles className="w-8 h-8 mx-auto text-blue-500 mb-2 opacity-70" />
                <p className="font-medium text-slate-700 dark:text-slate-300">Pencarian Cepat Enterprise</p>
                <p className="text-xs text-slate-400 mt-1">
                  Ketik nama laptop, nomor serial, MAC address, nama karyawan, atau software license.
                </p>
              </div>
            )}

            {query && totalResults === 0 && (
              <div className="py-8 text-center text-slate-500 text-sm">
                <p className="font-medium text-slate-700 dark:text-slate-300">Tidak ada hasil ditemukan untuk "{query}"</p>
                <p className="text-xs text-slate-400 mt-1">Coba periksa kembali ejaan atau gunakan kata kunci lain.</p>
              </div>
            )}

            {/* Matched Assets */}
            {matchedAssets.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5" /> Aset IT ({matchedAssets.length})
                </div>
                <div className="space-y-1">
                  {matchedAssets.map((asset) => {
                    const category = categories.find((c) => c.id === asset.categoryId)?.name || 'IT Asset';
                    return (
                      <button
                        key={asset.id}
                        onClick={() => {
                          setSelectedAssetForDetail(asset);
                          setIsGlobalSearchOpen(false);
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100 dark:border-blue-900">
                            {asset.brand.slice(0, 3).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              {asset.name}
                              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                {asset.assetTag}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {category} • SN: <span className="font-mono">{asset.serialNumber}</span> • {formatCurrency(asset.purchasePrice)}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Matched Employees */}
            {matchedEmployees.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" /> Karyawan ({matchedEmployees.length})
                </div>
                <div className="space-y-1">
                  {matchedEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setActiveTab('employees');
                        setIsGlobalSearchOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatarUrl}
                          alt={emp.fullName}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                            {emp.fullName}{' '}
                            <span className="text-xs font-normal text-slate-500">({emp.employeeId})</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {emp.position} • {emp.department}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Licenses */}
            {matchedLicenses.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" /> Software License ({matchedLicenses.length})
                </div>
                <div className="space-y-1">
                  {matchedLicenses.map((lic) => (
                    <button
                      key={lic.id}
                      onClick={() => {
                        setActiveTab('licenses');
                        setIsGlobalSearchOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900">
                          <Key className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                            {lic.softwareName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {lic.vendor} • {lic.assignedEmployeeIds.length}/{lic.totalLicenses} Seat Terpakai
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Maintenance */}
            {matchedMaintenance.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" /> Maintenance Tickets ({matchedMaintenance.length})
                </div>
                <div className="space-y-1">
                  {matchedMaintenance.map((mnt) => (
                    <button
                      key={mnt.id}
                      onClick={() => {
                        setActiveTab('maintenance');
                        setIsGlobalSearchOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                            {mnt.maintenanceId} - <span className="font-normal">{mnt.problemDescription}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            Status: {mnt.status.toUpperCase()} • Teknisi: {mnt.technician}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span>Tekan Enter untuk memilih • ESC untuk menutup</span>
            <span>Total Hasil: {totalResults}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
