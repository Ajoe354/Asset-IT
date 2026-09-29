import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { AssetListView } from './components/assets/AssetListView';
import { AssignmentsView } from './components/assignments/AssignmentsView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { LicensesView } from './components/licenses/LicensesView';
import { CategoriesView } from './components/categories/CategoriesView';
import { LocationsView } from './components/locations/LocationsView';
import { EmployeesView } from './components/employees/EmployeesView';
import { ReportsView } from './components/reports/ReportsView';
import { UsersView } from './components/users/UsersView';
import { ActivityLogsView } from './components/audit/ActivityLogsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { SettingsView } from './components/settings/SettingsView';

// Global Modals
import { AssetDetailModal } from './components/assets/AssetDetailModal';
import { AddEditAssetModal } from './components/assets/AddEditAssetModal';
import { AssetScannerModal } from './components/scanner/AssetScannerModal';
import { PrintLabelsModal } from './components/common/PrintLabelsModal';
import { ImportAssetsModal } from './components/assets/ImportAssetsModal';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'assets':
        return <AssetListView />;
      case 'assignments':
        return <AssignmentsView />;
      case 'maintenance':
        return <MaintenanceView />;
      case 'licenses':
        return <LicensesView />;
      case 'categories':
        return <CategoriesView />;
      case 'locations':
        return <LocationsView />;
      case 'employees':
        return <EmployeesView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
        return <UsersView />;
      case 'audit':
      case 'activity-logs':
        return <ActivityLogsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-[#090d16] antialiased selection:bg-blue-600 selection:text-white">
      {/* Sleek Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sleek Top Navbar */}
        <Navbar onMobileMenuToggle={() => setMobileOpen(true)} />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <AssetDetailModal />
      <AddEditAssetModal />
      <AssetScannerModal />
      <PrintLabelsModal />
      <ImportAssetsModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
