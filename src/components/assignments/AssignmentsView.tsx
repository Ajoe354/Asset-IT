import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  Plus,
  Search,
  ArrowRightLeft,
  RotateCcw,
  Printer,
  Calendar,
  Laptop,
  CheckCircle,
  Clock,
  User as UserIcon,
  X,
  FileText
} from 'lucide-react';
import { formatDate, formatDateTime, getAssetStatusMeta, getConditionMeta } from '../../utils/formatters';
import { AssetAssignment, AssetCondition } from '../../types';

export const AssignmentsView: React.FC = () => {
  const {
    assignments,
    assets,
    employees,
    settings,
    assignAsset,
    returnAsset,
    transferAsset,
    permissions
  } = useApp();

  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssetAssignment | null>(null);

  // New Assignment Form State
  const [assignAssetId, setAssignAssetId] = useState('');
  const [assignEmployeeId, setAssignEmployeeId] = useState('');
  const [assignDept, setAssignDept] = useState('');
  const [assignDate, setAssignDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  // Return Form State
  const [returnDate, setReturnDate] = useState(new Date().toISOString().slice(0, 10));
  const [returnCondition, setReturnCondition] = useState<AssetCondition>('good');
  const [returnNotes, setReturnNotes] = useState('');

  // Transfer Form State
  const [transferTargetEmpId, setTransferTargetEmpId] = useState('');
  const [transferDept, setTransferDept] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  const availableAssets = assets.filter((a) => a.status === 'available');

  const filteredAssignments = assignments.filter((asg) => {
    const asset = assets.find((a) => a.id === asg.assetId);
    const emp = employees.find((e) => e.id === asg.employeeId);
    const term = searchTerm.toLowerCase();

    const matchText =
      !term ||
      asg.assignmentCode.toLowerCase().includes(term) ||
      (asset && asset.name.toLowerCase().includes(term)) ||
      (asset && asset.assetTag.toLowerCase().includes(term)) ||
      (emp && emp.fullName.toLowerCase().includes(term)) ||
      asg.department.toLowerCase().includes(term);

    if (activeTab === 'active') {
      return matchText && asg.status === 'active';
    }
    return matchText;
  });

  const handleOpenAssignModal = () => {
    if (availableAssets.length > 0) {
      setAssignAssetId(availableAssets[0].id);
    }
    if (employees.length > 0) {
      setAssignEmployeeId(employees[0].id);
      setAssignDept(employees[0].department);
    }
    setAssignDate(new Date().toISOString().slice(0, 10));
    setExpectedReturnDate('');
    setAssignNotes('Perangkat diserahkan dalam kondisi lengkap dan prima untuk keperluan operasional.');
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignAssetId || !assignEmployeeId) return;

    assignAsset({
      assetId: assignAssetId,
      employeeId: assignEmployeeId,
      department: assignDept || 'General',
      assignedDate: assignDate,
      expectedReturnDate: expectedReturnDate || undefined,
      notes: assignNotes,
      status: 'active'
    });

    setIsAssignModalOpen(false);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    returnAsset(selectedAssignment.id, returnDate, returnCondition, returnNotes);
    setIsReturnModalOpen(false);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !transferTargetEmpId) return;

    transferAsset(selectedAssignment.id, transferTargetEmpId, transferDept || 'General', transferNotes);
    setIsTransferModalOpen(false);
  };

  // Print Berita Acara Serah Terima (BAST)
  const handlePrintBAST = (asg: AssetAssignment) => {
    const asset = assets.find((a) => a.id === asg.assetId);
    const emp = employees.find((e) => e.id === asg.employeeId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>BAST Aset IT - ${asg.assignmentCode}</title>
          <style>
            body { font-family: "Segoe UI", Arial, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
            .title { font-size: 18px; font-weight: bold; text-transform: uppercase; }
            .subtitle { font-size: 14px; color: #555; }
            .doc-num { font-size: 12px; font-weight: bold; margin-top: 5px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
            .sig-box { width: 40%; text-align: center; font-size: 12px; }
            .sig-space { height: 70px; }
            .footer { margin-top: 40px; font-size: 10px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${settings.companyName}</div>
            <div class="subtitle">BERITA ACARA SERAH TERIMA ASET IT (BAST)</div>
            <div class="doc-num">Nomor: ${asg.assignmentCode}</div>
          </div>

          <div class="section">
            <p style="font-size: 12px;">Pada hari ini, tanggal <b>${formatDate(asg.assignedDate)}</b>, telah dilakukan serah terima fasilitas perangkat IT dengan rincian sebagai berikut:</p>
          </div>

          <div class="section">
            <div class="section-title">I. IDENTITAS PENERIMA ASET</div>
            <table>
              <tr><td width="30%"><b>Nama Karyawan</b></td><td>${emp?.fullName || '-'}</td></tr>
              <tr><td><b>NIP / Employee ID</b></td><td>${emp?.employeeId || '-'}</td></tr>
              <tr><td><b>Departemen / Divisi</b></td><td>${asg.department}</td></tr>
              <tr><td><b>Email / Telepon</b></td><td>${emp?.email || '-'} / ${emp?.phone || '-'}</td></tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">II. RINCIAN SPESIFIKASI PERANGKAT IT</div>
            <table>
              <tr><td width="30%"><b>Asset Tag ID</b></td><td><b>${asset?.assetTag || '-'}</b></td></tr>
              <tr><td><b>Nama Perangkat</b></td><td>${asset?.name || '-'}</td></tr>
              <tr><td><b>Brand & Model</b></td><td>${asset?.brand || '-'} ${asset?.model || '-'}</td></tr>
              <tr><td><b>Serial Number (SN)</b></td><td>${asset?.serialNumber || '-'}</td></tr>
              <tr><td><b>Processor & RAM</b></td><td>${asset?.processor || '-'} / ${asset?.ram || '-'}</td></tr>
              <tr><td><b>Storage & OS</b></td><td>${asset?.storage || '-'} / ${asset?.os || '-'}</td></tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">III. PERNYATAAN & KETENTUAN PENGGUNAAN</div>
            <p style="font-size: 11px; text-align: justify;">
              Penerima bertanggung jawab penuh menjaga, merawat, dan mengamankan aset perusahaan yang diserahkan. Segala bentuk kelalaian yang menyebabkan kerusakan berat atau kehilangan wajib dilaporkan ke Divisi IT selambat-lambatnya 1x24 jam. Perangkat ini hanya diperuntukkan bagi penunjang pekerjaan kedinasan resmi.
            </p>
          </div>

          <div class="signatures">
            <div class="sig-box">
              <div><b>Yang Menyerahkan (IT Dept)</b></div>
              <div class="sig-space"></div>
              <div>( __________________________ )</div>
              <div style="font-size: 10px; color: #555;">IT Support & Asset Admin</div>
            </div>

            <div class="sig-box">
              <div><b>Yang Menerima (Karyawan)</b></div>
              <div class="sig-space"></div>
              <div>( <b>${emp?.fullName || 'Karyawan'}</b> )</div>
              <div style="font-size: 10px; color: #555;">${emp?.jobTitle || asg.department}</div>
            </div>
          </div>

          <div class="footer">
            Dokumen sah dicetak melalui IT Asset Management System • Tanggal Cetak: ${new Date().toLocaleDateString()}
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Asset Assignment & Peminjaman</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {assignments.filter((a) => a.status === 'active').length} Peminjaman Aktif
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen penyerahan, alih tugas (transfer), pengembalian, dan cetak Berita Acara Serah Terima (BAST)
          </p>
        </div>

        {permissions.canAssignAsset && (
          <button
            onClick={handleOpenAssignModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Tugaskan Aset Baru</span>
          </button>
        )}
      </div>

      {/* Toolbar: Search & Tab switcher */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari kode BAST, tag aset, nama karyawan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl p-1 bg-slate-50 dark:bg-slate-800/60 w-full sm:w-auto justify-center">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'active'
                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sedang Dipinjam ({assignments.filter((a) => a.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Semua Riwayat ({assignments.length})
          </button>
        </div>
      </div>

      {/* Assignment Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 pl-5">Kode BAST</th>
                <th className="p-3.5">Perangkat IT</th>
                <th className="p-3.5">Karyawan / Penerima</th>
                <th className="p-3.5">Departemen</th>
                <th className="p-3.5">Tgl Peminjaman</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    Tidak ada data peminjaman yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((asg) => {
                  const asset = assets.find((a) => a.id === asg.assetId);
                  const employee = employees.find((e) => e.id === asg.employeeId);

                  return (
                    <tr key={asg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 pl-5">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {asg.assignmentCode}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {asset?.name || 'Perangkat Aset'}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">
                          {asset?.assetTag} • SN: {asset?.serialNumber}
                        </div>
                      </td>

                      <td className="p-3.5">
                        {employee ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={employee.avatarUrl}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {employee.fullName}
                              </div>
                              <div className="text-[10px] text-slate-400">{employee.jobTitle}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-400">
                        {asg.department}
                      </td>

                      <td className="p-3.5">
                        <div className="text-slate-800 dark:text-slate-200">
                          {formatDate(asg.assignedDate)}
                        </div>
                        {asg.returnDate ? (
                          <div className="text-[10px] text-slate-400">
                            Kembali: {formatDate(asg.returnDate)}
                          </div>
                        ) : asg.expectedReturnDate ? (
                          <div className="text-[10px] text-blue-500">
                            Rencana: {formatDate(asg.expectedReturnDate)}
                          </div>
                        ) : null}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            asg.status === 'active'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : asg.status === 'transferred'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {asg.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Print BAST */}
                          <button
                            onClick={() => handlePrintBAST(asg)}
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Cetak Berita Acara (BAST)"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Action for active assignments */}
                          {asg.status === 'active' && permissions.canAssignAsset && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedAssignment(asg);
                                  setTransferDept(asg.department);
                                  setIsTransferModalOpen(true);
                                }}
                                className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                                title="Transfer Aset ke Karyawan Lain"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                                <span>Transfer</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedAssignment(asg);
                                  setIsReturnModalOpen(true);
                                }}
                                className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                                title="Kembalikan Aset ke Gudang IT"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Kembalikan</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: NEW ASSIGNMENT */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Tugaskan Aset IT ke Karyawan</span>
              </h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Aset Tersedia (Gudang/Stock) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={assignAssetId}
                  onChange={(e) => setAssignAssetId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                >
                  {availableAssets.length === 0 ? (
                    <option value="">Tidak ada aset berstatus Available</option>
                  ) : (
                    availableAssets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} [{a.assetTag}] (SN: {a.serialNumber})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Karyawan Penerima <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={assignEmployeeId}
                  onChange={(e) => {
                    setAssignEmployeeId(e.target.value);
                    const emp = employees.find((x) => x.id === e.target.value);
                    if (emp) setAssignDept(emp.department);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} - {emp.jobTitle} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tanggal Penyerahan
                  </label>
                  <input
                    type="date"
                    required
                    value={assignDate}
                    onChange={(e) => setAssignDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Rencana Pengembalian
                  </label>
                  <input
                    type="date"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Catatan Kondisi / Keperluan
                </label>
                <textarea
                  rows={3}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={availableAssets.length === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold"
                >
                  Simpan & Buat BAST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RETURN ASSET */}
      {isReturnModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span>Pengembalian Aset (Check-in)</span>
              </h3>
              <button onClick={() => setIsReturnModalOpen(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  {assets.find((a) => a.id === selectedAssignment.assetId)?.name}
                </div>
                <div className="text-slate-500">
                  Dikembalikan oleh: <b>{employees.find((e) => e.id === selectedAssignment.employeeId)?.fullName}</b>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tgl Pengembalian
                  </label>
                  <input
                    type="date"
                    required
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kondisi Saat Kembali
                  </label>
                  <select
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value as AssetCondition)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  >
                    <option value="excellent">Sangat Baik (Mulus)</option>
                    <option value="good">Baik (Normal)</option>
                    <option value="fair">Cukup (Lecet Pemakaian)</option>
                    <option value="damaged">Rusak (Perlu Servis)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Catatan Inspeksi IT
                </label>
                <textarea
                  rows={3}
                  placeholder="Kelengkapan charger, mouse, kondisi fisik casing, dll..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Konfirmasi Pengembalian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TRANSFER ASSET */}
      {isTransferModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                <span>Alih Tugas / Transfer Aset</span>
              </h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  {assets.find((a) => a.id === selectedAssignment.assetId)?.name}
                </div>
                <div className="text-slate-500">
                  Pemegang saat ini: <b>{employees.find((e) => e.id === selectedAssignment.employeeId)?.fullName}</b>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Transfer ke Karyawan Baru <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={transferTargetEmpId}
                  onChange={(e) => {
                    setTransferTargetEmpId(e.target.value);
                    const emp = employees.find((x) => x.id === e.target.value);
                    if (emp) setTransferDept(emp.department);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                >
                  <option value="">-- Pilih Karyawan Tujuan --</option>
                  {employees
                    .filter((e) => e.id !== selectedAssignment.employeeId)
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.jobTitle} - {emp.department})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Departemen Baru
                </label>
                <input
                  type="text"
                  value={transferDept}
                  onChange={(e) => setTransferDept(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Alasan Alih Tugas
                </label>
                <textarea
                  rows={3}
                  placeholder="Mutasi jabatan, pergantian tim project, handover rotasi..."
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!transferTargetEmpId}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold"
                >
                  Proses Alih Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
