import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Laptop,
  CheckCircle2,
  Users,
  Wrench,
  Archive,
  AlertOctagon,
  Plus,
  QrCode,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Building2,
  PieChart,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { formatCurrency, formatDate, getAssetStatusMeta, getDaysRemaining } from '../../utils/formatters';

export const DashboardView: React.FC = () => {
  const {
    assets,
    categories,
    locations,
    employees,
    maintenanceList,
    licenses,
    setActiveTab,
    setSelectedAssetForDetail,
    setIsScannerOpen,
    permissions
  } = useApp();

  // Metric counts
  const totalAssets = assets.length;
  const availableAssets = assets.filter((a) => a.status === 'available').length;
  const inUseAssets = assets.filter((a) => a.status === 'assigned').length;
  const maintenanceAssets = assets.filter((a) => a.status === 'maintenance').length;
  const retiredAssets = assets.filter((a) => a.status === 'retired').length;
  const lostAssets = assets.filter((a) => a.status === 'lost').length;
  const reservedAssets = assets.filter((a) => a.status === 'reserved').length;

  const totalAssetValue = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);

  // Expiring warranties (<60 days)
  const expiringWarrantyAssets = assets
    .map((a) => ({ ...a, remaining: getDaysRemaining(a.warrantyExpiryDate) }))
    .filter((a) => a.remaining.days <= 60 && a.remaining.days >= -30)
    .sort((a, b) => a.remaining.days - b.remaining.days);

  // Urgent Maintenance needed or in progress
  const urgentMaintenanceTickets = maintenanceList.filter(
    (m) => m.status === 'in_progress' || m.status === 'scheduled'
  );

  // Expiring licenses
  const expiringLicenses = licenses.filter((l) => {
    const rem = getDaysRemaining(l.expirationDate);
    return rem.days <= 60;
  });

  // Recent assets (sorted by creation date)
  const recentAssets = [...assets].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  // Category distribution data
  const categoryCounts = categories.map((cat) => {
    const count = assets.filter((a) => a.categoryId === cat.id).length;
    const value = assets
      .filter((a) => a.categoryId === cat.id)
      .reduce((sum, a) => sum + a.purchasePrice, 0);
    return { ...cat, count, value };
  }).sort((a, b) => b.count - a.count);

  // Department distribution data
  const deptMap: { [key: string]: number } = {};
  assets.forEach((a) => {
    const dept = a.department || 'Unassigned';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const deptDistribution = Object.entries(deptMap)
    .map(([dept, count]) => ({ dept, count }))
    .sort((a, b) => b.count - a.count);

  // Location distribution data
  const locationDistribution = locations.map((loc) => {
    const count = assets.filter((a) => a.locationId === loc.id).length;
    return { ...loc, count };
  });

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards Grid with Sleek Border-Left Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Assets */}
        <div
          onClick={() => setActiveTab('assets')}
          className="stat-card p-5 border-l-4 border-blue-500 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Assets
            </p>
            <Laptop className="w-4 h-4 text-blue-500 opacity-80" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
            {totalAssets.toLocaleString()}
          </h3>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium flex items-center gap-1">
            <span>Valuasi: {formatCurrency(totalAssetValue)}</span>
          </p>
        </div>

        {/* Available */}
        <div
          onClick={() => setActiveTab('assets')}
          className="stat-card p-5 border-l-4 border-emerald-500 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Available
            </p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-80" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
            {availableAssets.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            {totalAssets > 0 ? Math.round((availableAssets / totalAssets) * 100) : 0}% of inventory
          </p>
        </div>

        {/* In Use */}
        <div
          onClick={() => setActiveTab('assignments')}
          className="stat-card p-5 border-l-4 border-amber-500 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              In Use
            </p>
            <Users className="w-4 h-4 text-amber-500 opacity-80" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
            {inUseAssets.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            Across {locations.length || 5} locations
          </p>
        </div>

        {/* Maintenance */}
        <div
          onClick={() => setActiveTab('maintenance')}
          className="stat-card p-5 border-l-4 border-red-500 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Maintenance
            </p>
            <Wrench className="w-4 h-4 text-red-500 opacity-80" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
            {maintenanceAssets.toLocaleString()}
          </h3>
          <p className="text-xs text-red-500 mt-2 font-medium">
            {urgentMaintenanceTickets.length} active tickets
          </p>
        </div>
      </div>

      {/* Main Grid: 2 Cols Recent Activities + 1 Col Analytics & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Asset Activities */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 dark:text-white text-base">Recent Asset Activities</h2>
            <button
              onClick={() => setActiveTab('assets')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold sticky top-0 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Asset ID</th>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Assigned To</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentAssets.map((asset) => {
                  const category = categories.find((c) => c.id === asset.categoryId)?.name || 'Hardware';
                  const employee = employees.find((e) => e.id === asset.assignedToEmployeeId);
                  const location = locations.find((l) => l.id === asset.locationId)?.name || '-';

                  const getStatusClass = (st: string) => {
                    switch (st) {
                      case 'available':
                        return 'status-pill status-available';
                      case 'assigned':
                        return 'status-pill status-inuse';
                      case 'maintenance':
                        return 'status-pill status-maintenance';
                      case 'retired':
                        return 'status-pill status-retired';
                      case 'lost':
                        return 'status-pill status-lost';
                      default:
                        return 'status-pill status-available';
                    }
                  };

                  const getStatusLabel = (st: string) => {
                    switch (st) {
                      case 'available':
                        return 'Available';
                      case 'assigned':
                        return 'In Use';
                      case 'maintenance':
                        return 'Repair';
                      case 'retired':
                        return 'Retired';
                      case 'lost':
                        return 'Lost';
                      default:
                        return st;
                    }
                  };

                  return (
                    <tr
                      key={asset.id}
                      onClick={() => setSelectedAssetForDetail(asset)}
                      className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {asset.assetTag}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">
                        {asset.name}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {category}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {employee ? (
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {employee.fullName}
                          </span>
                        ) : (
                          <span className="text-slate-400">{location.split('-')[0]}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusClass(asset.status)}>
                          {getStatusLabel(asset.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Category Distribution + Alerts & Notifications */}
        <div className="flex flex-col gap-6">
          {/* Category Distribution */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 dark:text-white text-base">Category Distribution</h2>
              <button
                onClick={() => setActiveTab('categories')}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-4">
              {categoryCounts.slice(0, 4).map((cat, idx) => {
                const percentage = totalAssets > 0 ? Math.round((cat.count / totalAssets) * 100) : 0;
                const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500'];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={cat.id}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{cat.name}</span>
                      <span className="text-slate-800 dark:text-white font-bold">{percentage}% ({cat.count} units)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${barColor} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alerts & Notifications */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 dark:text-white text-base">Alerts & Notifications</h2>
              <button
                onClick={() => setActiveTab('notifications')}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                All Alerts
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-72">
              {/* Expiring Warranty Alert */}
              {expiringWarrantyAssets.length > 0 ? (
                <div
                  onClick={() => setSelectedAssetForDetail(expiringWarrantyAssets[0])}
                  className="flex gap-3 p-3 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-100 dark:border-red-900/50 cursor-pointer hover:bg-red-100/60 dark:hover:bg-red-900/40 transition-colors"
                >
                  <div className="text-red-500 text-base shrink-0 mt-0.5">⚠️</div>
                  <div>
                    <p className="text-xs font-bold text-red-800 dark:text-red-300">Warranty Expiring Soon</p>
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">
                      {expiringWarrantyAssets[0].name} ({expiringWarrantyAssets[0].assetTag}) - {expiringWarrantyAssets[0].remaining.text}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 p-3 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-100 dark:border-red-900/50">
                  <div className="text-red-500 text-base shrink-0 mt-0.5">⚠️</div>
                  <div>
                    <p className="text-xs font-bold text-red-800 dark:text-red-300">Warranty Expiring Soon</p>
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">Semua garansi aset hardware dalam status aman.</p>
                  </div>
                </div>
              )}

              {/* Maintenance Ticket Alert */}
              {urgentMaintenanceTickets.length > 0 ? (
                <div
                  onClick={() => setActiveTab('maintenance')}
                  className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-100 dark:border-amber-900/50 cursor-pointer hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition-colors"
                >
                  <div className="text-amber-500 text-base shrink-0 mt-0.5">🛠️</div>
                  <div>
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Scheduled Maintenance</p>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                      {urgentMaintenanceTickets[0].problemDescription.slice(0, 50)}... ({urgentMaintenanceTickets.length} tiket)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-100 dark:border-amber-900/50">
                  <div className="text-amber-500 text-base shrink-0 mt-0.5">🛠️</div>
                  <div>
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Scheduled Maintenance</p>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">Tidak ada antrean servis mendesak saat ini.</p>
                  </div>
                </div>
              )}

              {/* License / Overdue Return Alert */}
              {expiringLicenses.length > 0 ? (
                <div
                  onClick={() => setActiveTab('licenses')}
                  className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900/50 cursor-pointer hover:bg-blue-100/60 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <div className="text-blue-500 text-base shrink-0 mt-0.5">📥</div>
                  <div>
                    <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Software License Renewal</p>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
                      {expiringLicenses[0].softwareName} langganan akan habis dalam {getDaysRemaining(expiringLicenses[0].expirationDate).text}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900/50">
                  <div className="text-blue-500 text-base shrink-0 mt-0.5">📥</div>
                  <div>
                    <p className="text-xs font-bold text-blue-800 dark:text-blue-300">System Status</p>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">Semua pencatatan peminjaman & lisensi dalam kondisi sinkron.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
