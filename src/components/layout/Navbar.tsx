import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  QrCode,
  Bell,
  Sun,
  Moon,
  Shield,
  Menu,
  ChevronDown,
  Check,
  User as UserIcon,
  LogOut,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { formatDateTime, getRoleMeta } from '../../utils/formatters';
import { UserRole } from '../../types';

interface NavbarProps {
  onMobileMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle }) => {
  const {
    theme,
    toggleTheme,
    currentUser,
    switchRole,
    users,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setIsScannerOpen,
    setIsGlobalSearchOpen,
    setActiveTab,
    setSelectedAssetForDetail,
    assets
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.read);
  const currentRoleMeta = getRoleMeta(currentUser.role);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolesList: { role: UserRole; title: string; desc: string }[] = [
    { role: 'super_admin', title: 'Super Admin', desc: 'Akses penuh ke seluruh modul & konfigurasi sistem' },
    { role: 'it_admin', title: 'IT Admin', desc: 'Kelola aset, assignment, kategori, lisensi & karyawan' },
    { role: 'it_support', title: 'IT Support', desc: 'Update status aset, maintenance, & penanganan tiket' },
    { role: 'manager', title: 'Manager', desc: 'Melihat laporan aset, analitik, & pemantauan departemen' },
    { role: 'employee', title: 'Employee', desc: 'Melihat aset & lisensi yang ditugaskan ke dirinya' },
  ];

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs z-10 shrink-0 transition-colors">
      {/* Left section: Hamburger (mobile) + Global Search pill */}
      <div className="flex items-center gap-3 lg:gap-4 flex-1 max-w-xl">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Pill */}
        <button
          onClick={() => setIsGlobalSearchOpen(true)}
          className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 w-full max-w-md text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-all text-left group border border-transparent focus:outline-hidden"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <span className="truncate">Search assets, users, or IDs...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right section: Add Asset + Scanner + Notifications + Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Sleek Add Asset Button */}
        <button
          onClick={() => setActiveTab('assets')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>+ Add Asset</span>
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

        {/* Quick QR Scanner Button */}
        <button
          onClick={() => setIsScannerOpen(true)}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:flex items-center justify-center"
          title="Scan QR / Barcode Aset"
          aria-label="Scan QR Code"
        >
          <QrCode className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setIsNotifDropdownOpen((prev) => !prev)}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                {unreadNotifs.length > 9 ? '9+' : unreadNotifs.length}
              </span>
            )}
          </button>

          {isNotifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Notifikasi</span>
                  {unreadNotifs.length > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      {unreadNotifs.length} Baru
                    </span>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">Belum ada notifikasi</div>
                ) : (
                  notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.relatedAssetId) {
                          const asset = assets.find((a) => a.id === notif.relatedAssetId);
                          if (asset) setSelectedAssetForDetail(asset);
                        } else if (notif.linkTab) {
                          setActiveTab(notif.linkTab);
                        }
                        setIsNotifDropdownOpen(false);
                      }}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex gap-3 items-start ${
                        !notif.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          notif.priority === 'critical' || notif.priority === 'high'
                            ? 'bg-rose-500'
                            : notif.priority === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {notif.title}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {formatDateTime(notif.date)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-950/50">
                <button
                  onClick={() => {
                    setActiveTab('notifications');
                    setIsNotifDropdownOpen(false);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Lihat Semua Notifikasi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher & User Profile */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-300 dark:ring-slate-700"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {currentUser.name}
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${currentRoleMeta.badge}`}>
                  {currentRoleMeta.label}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {/* Role Dropdown Menu */}
          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</div>
                <div className="text-xs text-slate-500">{currentUser.email}</div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5 font-medium">
                  {currentUser.department}
                </div>
              </div>

              <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Ganti Role Akses (RBAC Simulator)
              </div>

              <div className="space-y-0.5 px-1.5">
                {rolesList.map((item) => {
                  const isActive = currentUser.role === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => {
                        switchRole(item.role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-start justify-between transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 opacity-70" />
                          {item.title}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 px-2">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setIsRoleDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  Pengaturan Akun & Perusahaan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
