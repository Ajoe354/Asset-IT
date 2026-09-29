import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Laptop,
  FolderTree,
  UserCheck,
  Users,
  Wrench,
  Key,
  MapPin,
  FileText,
  Bell,
  ShieldCheck,
  Settings,
  X,
  Sparkles,
  History,
  QrCode
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const {
    activeTab,
    setActiveTab,
    assets,
    maintenanceList,
    licenses,
    notifications,
    settings,
    setIsScannerOpen
  } = useApp();

  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const activeMaintenanceCount = maintenanceList.filter((m) => m.status === 'in_progress' || m.status === 'scheduled').length;
  const expiringLicenseCount = licenses.filter((l) => l.status === 'expiring_soon').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      section: 'UTAMA'
    },
    {
      id: 'assets',
      label: 'Assets',
      icon: Laptop,
      badge: assets.length,
      section: 'MANAJEMEN ASET'
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: FolderTree,
      section: 'MANAJEMEN ASET'
    },
    {
      id: 'assignments',
      label: 'Asset Assignment',
      icon: UserCheck,
      section: 'MANAJEMEN ASET'
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      section: 'ORGANISASI'
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: Wrench,
      badge: activeMaintenanceCount > 0 ? activeMaintenanceCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
      section: 'OPERASIONAL'
    },
    {
      id: 'licenses',
      label: 'Software Licenses',
      icon: Key,
      badge: expiringLicenseCount > 0 ? `${expiringLicenseCount} Exp` : undefined,
      badgeColor: 'bg-rose-500 text-white',
      section: 'OPERASIONAL'
    },
    {
      id: 'locations',
      label: 'Locations',
      icon: MapPin,
      section: 'OPERASIONAL'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      section: 'ANALITIK'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotifCount > 0 ? unreadNotifCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
      section: 'SISTEM'
    },
    {
      id: 'users',
      label: 'Users & Roles',
      icon: ShieldCheck,
      section: 'SISTEM'
    },
    {
      id: 'activity-logs',
      label: 'Activity Logs',
      icon: History,
      section: 'SISTEM'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      section: 'SISTEM'
    },
  ];

  // Group items by section
  const sections = Array.from(new Set(navItems.map((item) => item.section)));

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        id="app-sidebar"
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
              IT
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight tracking-tight">
                Asset IT<span className="text-blue-400">.</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Garuda Mart Indonesia</p>
            </div>
          </div>

          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Tutup Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Action Tag Scanner CTA */}
        <div className="px-4 pt-3 pb-1">
          <button
            onClick={() => {
              setIsScannerOpen(true);
              onMobileClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer group"
          >
            <QrCode className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Scan Barcode / QR Tag</span>
          </button>
        </div>

        {/* Navigation items list */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          {sections.map((secName) => {
            const items = navItems.filter((i) => i.section === secName);
            return (
              <div key={secName} className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {secName}
                </div>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        onMobileClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium sidebar-link transition-all cursor-pointer ${
                        isActive
                          ? 'active-link'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-white' : 'text-slate-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badgeColor
                              ? item.badgeColor
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between opacity-80">
          <div className="truncate font-medium text-[11px] text-slate-300">
            {settings.companyName || 'Enterprise Corp'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            v2.4.0
          </div>
        </div>
      </aside>
    </>
  );
};
