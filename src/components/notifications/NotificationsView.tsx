import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Wrench,
  Key,
  ShieldAlert,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import { NotificationItem } from '../../types';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    assets,
    setSelectedAssetForDetail,
    setActiveTab
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'warranty':
        return <ShieldAlert className="w-5 h-5 text-amber-500" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5 text-rose-500" />;
      case 'license':
        return <Key className="w-5 h-5 text-purple-500" />;
      case 'assignment':
        return <AlertTriangle className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleNotificationClick = (n: NotificationItem) => {
    markNotificationAsRead(n.id);
    if (n.relatedAssetId) {
      const asset = assets.find((a) => a.id === n.relatedAssetId);
      if (asset) {
        setSelectedAssetForDetail(asset);
        return;
      }
    }
    if (n.type === 'license') {
      setActiveTab('licenses');
    } else if (n.type === 'maintenance') {
      setActiveTab('maintenance');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Pusat Notifikasi & Peringatan IT</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {notifications.filter((n) => !n.read).length} Belum Dibaca
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemberitahuan otomatis terkait jadwal maintenance, masa garansi berakhir, lisensi expired, dan status kritis aset
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={markAllNotificationsAsRead}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            <CheckCheck className="w-4 h-4 text-blue-600" />
            <span>Tandai Semua Dibaca</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Semua Notifikasi ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Belum Dibaca ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
            <Bell className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Tidak ada notifikasi</p>
            <p className="text-xs text-slate-400 mt-1">Seluruh jadwal maintenance dan garansi dalam kondisi aman.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !n.read
                  ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-2xs border border-slate-100 dark:border-slate-700 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDateTime(n.date)}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 self-center">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <span>Lihat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
