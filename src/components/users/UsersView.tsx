import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  Lock,
  User as UserIcon,
  CheckCircle,
  XCircle,
  X,
  Mail
} from 'lucide-react';
import { User, UserRole } from '../../types';

export const UsersView: React.FC = () => {
  const {
    users,
    currentUser,
    setCurrentUser,
    addUser,
    updateUser,
    deleteUser,
    permissions
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('it_support');
  const [department, setDepartment] = useState('Information Technology');
  const [avatarUrl, setAvatarUrl] = useState('');

  const handleOpenModal = (u?: User) => {
    if (u) {
      setEditingUser(u);
      setName(u.name);
      setEmail(u.email);
      setRole(u.role);
      setDepartment(u.department);
      setAvatarUrl(u.avatarUrl);
    } else {
      setEditingUser(null);
      setName('');
      setEmail('');
      setRole('it_support');
      setDepartment('Information Technology');
      setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingUser) {
      updateUser(editingUser.id, {
        name,
        email,
        role,
        department,
        avatarUrl
      });
    } else {
      addUser({
        name,
        email,
        role,
        department,
        avatarUrl
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Manajemen Pengguna & Role Akses</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {users.length} Akun
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kontrol akses berbasis peran (RBAC) untuk Super Admin, IT Administrator, IT Support, Manager, dan Karyawan
          </p>
        </div>

        {permissions.canManageUsers && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah User Sistem</span>
          </button>
        )}
      </div>

      {/* Role Matrix Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Matriks Izin Akses (RBAC Matrix)</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="py-2.5 pr-4">Fitur / Hak Akses</th>
                <th className="py-2.5 px-3 text-center">Super Admin</th>
                <th className="py-2.5 px-3 text-center">IT Admin</th>
                <th className="py-2.5 px-3 text-center">IT Support</th>
                <th className="py-2.5 px-3 text-center">Manager</th>
                <th className="py-2.5 pl-3 text-center">Employee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-2.5 pr-4 font-medium">Tambah / Edit Aset IT</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-slate-300">-</td>
                <td className="py-2.5 pl-3 text-center text-slate-300">-</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium">Hapus Aset Permanen</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-slate-300">-</td>
                <td className="py-2.5 px-3 text-center text-slate-300">-</td>
                <td className="py-2.5 pl-3 text-center text-slate-300">-</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium">Penugasan & Transfer Aset (BAST)</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-slate-300">-</td>
                <td className="py-2.5 pl-3 text-center text-slate-300">-</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium">Kelola Maintenance & Biaya</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-slate-300">-</td>
                <td className="py-2.5 pl-3 text-center text-slate-300">-</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium">Laporan & Audit Log Ekspor</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 pl-3 text-center text-slate-300">-</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium">Pengaturan Sistem & User Management</td>
                <td className="py-2.5 px-3 text-center text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-center text-slate-300">-</td>
                <td className="py-2.5 px-3 text-center text-slate-300">-</td>
                <td className="py-2.5 px-3 text-center text-slate-300">-</td>
                <td className="py-2.5 pl-3 text-center text-slate-300">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Users List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 pl-5">Nama Pengguna</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Departemen</th>
                <th className="p-3.5">Role Akses</th>
                <th className="p-3.5 pr-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {users.map((u) => {
                const isCurrent = currentUser.id === u.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                Sesi Aktif
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">ID: {u.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{u.email}</td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{u.department}</td>

                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'super_admin'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : u.role === 'admin'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : u.role === 'it_support'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : u.role === 'manager'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setCurrentUser(u)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-700 dark:text-slate-300 hover:text-blue-600 rounded-lg text-xs font-semibold"
                        >
                          Switch ke Akun Ini
                        </button>

                        {permissions.canManageUsers && (
                          <>
                            <button
                              onClick={() => handleOpenModal(u)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {users.length > 1 && (
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus user ${u.name}?`)) {
                                    deleteUser(u.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingUser ? 'Edit User' : 'Tambah User Sistem'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Akun <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Role Hak Akses
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">IT Administrator</option>
                    <option value="it_support">IT Support</option>
                    <option value="manager">Department Manager</option>
                    <option value="employee">Employee (View Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Departemen
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Foto Avatar URL
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
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
                  Simpan User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
