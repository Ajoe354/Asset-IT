import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Building,
  Laptop,
  Edit3,
  Trash2,
  Key,
  X,
  UserCheck
} from 'lucide-react';
import { Employee } from '../../types';

export const EmployeesView: React.FC = () => {
  const {
    employees,
    assets,
    licenses,
    locations,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    setSelectedAssetForDetail,
    permissions
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState<Employee | null>(null);

  // Form State
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [locationId, setLocationId] = useState(locations[0]?.id || 'loc-1');
  const [status, setStatus] = useState<'active' | 'on_leave' | 'inactive'>('active');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [joinedDate, setJoinedDate] = useState(new Date().toISOString().slice(0, 10));

  const departments = Array.from(new Set(employees.map((e) => e.department)));

  const filteredEmployees = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    const matchText =
      !term ||
      emp.fullName.toLowerCase().includes(term) ||
      emp.employeeId.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.position.toLowerCase().includes(term);

    const matchDept = selectedDept === 'all' || emp.department === selectedDept;

    return matchText && matchDept;
  });

  const handleOpenAddEdit = (emp?: Employee) => {
    if (emp) {
      setEditingEmployee(emp);
      setEmployeeId(emp.employeeId);
      setFullName(emp.fullName);
      setEmail(emp.email);
      setDepartment(emp.department);
      setPosition(emp.position);
      setPhone(emp.phone);
      setLocationId(emp.locationId);
      setStatus(emp.status);
      setAvatarUrl(emp.avatarUrl);
      setJoinedDate(emp.joinedDate);
    } else {
      setEditingEmployee(null);
      setEmployeeId(`EMP-${Date.now().toString().slice(-4)}`);
      setFullName('');
      setEmail('');
      setDepartment('Engineering');
      setPosition('');
      setPhone('+62 812-');
      setLocationId(locations[0]?.id || 'loc-1');
      setStatus('active');
      setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
      setJoinedDate(new Date().toISOString().slice(0, 10));
    }
    setIsAddEditOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        employeeId,
        fullName,
        email,
        department,
        position,
        phone,
        locationId,
        status,
        avatarUrl,
        joinedDate
      });
    } else {
      addEmployee({
        employeeId,
        fullName,
        email,
        department,
        position,
        phone,
        locationId,
        status,
        avatarUrl,
        joinedDate
      });
    }

    setIsAddEditOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Data Karyawan & Kepemilikan Aset</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {employees.length} Karyawan
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola daftar pegawai, asosiasi perangkat IT kerja, lisensi software terpasang, dan riwayat penugasan
          </p>
        </div>

        {permissions.canManageEmployees && (
          <button
            onClick={() => handleOpenAddEdit()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Karyawan</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama, NIP, email, jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="all">Semua Departemen</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const assignedAssets = assets.filter((a) => a.assignedToEmployeeId === emp.id);

          return (
            <div
              key={emp.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Header: Avatar & Info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatarUrl}
                      alt={emp.fullName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                    />
                    <div>
                      <div
                        onClick={() => setSelectedEmployeeDetail(emp)}
                        className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer"
                      >
                        {emp.fullName}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">{emp.position}</div>
                      <div className="font-mono text-[10px] text-blue-600 dark:text-blue-400">
                        {emp.employeeId}
                      </div>
                    </div>
                  </div>

                  {permissions.canManageEmployees && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenAddEdit(emp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (assignedAssets.length > 0) {
                            alert(`Karyawan ini masih memegang ${assignedAssets.length} aset. Harap kembalikan aset terlebih dahulu.`);
                            return;
                          }
                          if (confirm(`Hapus data karyawan ${emp.fullName}?`)) {
                            deleteEmployee(emp.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Contact metadata */}
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 py-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{emp.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                </div>

                {/* Assigned Assets Preview */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                    <span>ASET IT TERPASANG:</span>
                    <span className="text-blue-600 dark:text-blue-400">{assignedAssets.length} Unit</span>
                  </div>

                  {assignedAssets.length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic">Belum ada aset IT ditugaskan</div>
                  ) : (
                    <div className="space-y-1">
                      {assignedAssets.slice(0, 2).map((a) => (
                        <div
                          key={a.id}
                          onClick={() => setSelectedAssetForDetail(a)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] flex items-center justify-between hover:bg-blue-50 cursor-pointer"
                        >
                          <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                            {a.name}
                          </span>
                          <span className="font-mono text-[10px] text-blue-600 font-bold ml-2">
                            {a.assetTag}
                          </span>
                        </div>
                      ))}
                      {assignedAssets.length > 2 && (
                        <div className="text-[10px] text-slate-400 text-center">
                          +{assignedAssets.length - 2} aset lainnya
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedEmployeeDetail(emp)}
                  className="w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 text-slate-700 dark:text-slate-300 hover:text-blue-600 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Lihat Profil & Riwayat Lengkap</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: ADD/EDIT EMPLOYEE */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <button onClick={() => setIsAddEditOpen(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    NIP / Employee ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Karyawan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Perusahaan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="karyawan@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nomor Telepon
                  </label>
                  <input
                    type="text"
                    placeholder="+62 812-..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Departemen / Divisi
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing & Sales">Marketing & Sales</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Jabatan (Position)
                  </label>
                  <input
                    type="text"
                    placeholder="Software Engineer, HR Specialist..."
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Foto Profil URL
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EMPLOYEE DETAIL & ASSET HISTORY */}
      {selectedEmployeeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedEmployeeDetail.avatarUrl}
                  alt={selectedEmployeeDetail.fullName}
                  className="w-12 h-12 rounded-2xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedEmployeeDetail.fullName}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {selectedEmployeeDetail.position} • {selectedEmployeeDetail.department}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployeeDetail(null)}
                className="p-1 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Currently Assigned Hardware */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-blue-600" />
                  Perangkat Hardware yang Sedang Dipegang
                </h4>
                {assets.filter((a) => a.assignedToEmployeeId === selectedEmployeeDetail.id).length === 0 ? (
                  <div className="text-xs text-slate-400 italic p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    Tidak ada perangkat keras yang sedang ditugaskan ke karyawan ini.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assets
                      .filter((a) => a.assignedToEmployeeId === selectedEmployeeDetail.id)
                      .map((a) => (
                        <div
                          key={a.id}
                          onClick={() => {
                            setSelectedEmployeeDetail(null);
                            setSelectedAssetForDetail(a);
                          }}
                          className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:border-blue-500 cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white">{a.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              Tag: {a.assetTag} • SN: {a.serialNumber}
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-blue-600">Lihat Detail →</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Assigned Software Licenses */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-600" />
                  Lisensi Software Terdaftar
                </h4>
                {licenses.filter((l) => l.assignedEmployeeIds.includes(selectedEmployeeDetail.id)).length === 0 ? (
                  <div className="text-xs text-slate-400 italic p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    Belum ada lisensi software yang dialokasikan.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {licenses
                      .filter((l) => l.assignedEmployeeIds.includes(selectedEmployeeDetail.id))
                      .map((l) => (
                        <div
                          key={l.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white">{l.softwareName}</div>
                            <div className="text-[11px] text-slate-500">{l.category} • {l.licenseType}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                            Seat Aktif
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
