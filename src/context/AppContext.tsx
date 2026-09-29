import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Asset,
  AssetCategory,
  Location,
  Employee,
  AssetAssignment,
  AssetMaintenance,
  SoftwareLicense,
  NotificationItem,
  ActivityLog,
  User,
  CompanySettings,
  UserRole,
  AssetStatus,
  AssetCondition,
  MaintenanceStatus
} from '../types';
import {
  INITIAL_ASSETS,
  INITIAL_CATEGORIES,
  INITIAL_LOCATIONS,
  INITIAL_EMPLOYEES,
  INITIAL_ASSIGNMENTS,
  INITIAL_MAINTENANCE,
  INITIAL_LICENSES,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SETTINGS
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  // Theme & UI
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedAssetForDetail: Asset | null;
  setSelectedAssetForDetail: (asset: Asset | null) => void;
  isScannerOpen: boolean;
  setIsScannerOpen: (open: boolean) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
  removeToast: (id: string) => void;

  // Auth & RBAC
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  permissions: {
    canCreateAsset: boolean;
    canEditAsset: boolean;
    canDeleteAsset: boolean;
    canAssignAsset: boolean;
    canManageMaintenance: boolean;
    canManageLicenses: boolean;
    canManageCategories: boolean;
    canManageLocations: boolean;
    canManageEmployees: boolean;
    canManageUsers: boolean;
    canManageSettings: boolean;
    canExportReports: boolean;
  };

  // Data Collections
  assets: Asset[];
  categories: AssetCategory[];
  locations: Location[];
  employees: Employee[];
  assignments: AssetAssignment[];
  maintenanceList: AssetMaintenance[];
  licenses: SoftwareLicense[];
  notifications: NotificationItem[];
  activityLogs: ActivityLog[];
  users: User[];
  settings: CompanySettings;

  // Asset Actions
  addAsset: (assetData: Omit<Asset, 'id' | 'assetTag' | 'createdAt' | 'updatedAt'>) => Asset;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  bulkUpdateAssets: (ids: string[], updates: Partial<Asset>) => void;
  bulkDeleteAssets: (ids: string[]) => void;
  bulkImportAssets: (newAssets: any[]) => number;

  // Category Actions
  addCategory: (cat: Omit<AssetCategory, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<AssetCategory>) => void;
  deleteCategory: (id: string) => void;

  // Location Actions
  addLocation: (loc: Omit<Location, 'id'>) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  deleteLocation: (id: string) => void;

  // Employee Actions
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Assignment Actions
  assignAsset: (assetId: string, employeeId: string, expectedReturnDate?: string, notes?: string) => void;
  returnAsset: (assignmentId: string, actualReturnDate: string, returnCondition: AssetCondition, notes?: string) => void;
  transferAsset: (assignmentId: string, newEmployeeId: string, notes?: string) => void;

  // Maintenance Actions
  createMaintenanceTicket: (data: Omit<AssetMaintenance, 'id' | 'maintenanceId'>) => void;
  updateMaintenanceStatus: (id: string, status: MaintenanceStatus, cost?: number, resolution?: string) => void;

  // License Actions
  addLicense: (license: Omit<SoftwareLicense, 'id'>) => void;
  updateLicense: (id: string, updates: Partial<SoftwareLicense>) => void;
  deleteLicense: (id: string) => void;
  assignLicenseSeat: (licenseId: string, employeeId: string) => void;
  revokeLicenseSeat: (licenseId: string, employeeId: string) => void;

  // Notification Actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;

  // User Actions
  addUser: (user: Omit<User, 'id' | 'lastLogin'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Settings & System Actions
  updateSettings: (newSettings: Partial<CompanySettings>) => void;
  resetToDemoData: () => void;
  exportDatabaseBackup: () => void;
  importDatabaseBackup: (jsonData: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'IT_ASSET_MGMT_DATA_V1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('IT_THEME');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load or Initialize persistent data
  const [categories, setCategories] = useState<AssetCategory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_CATEGORIES`);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_LOCATIONS`);
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_EMPLOYEES`);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ASSETS`);
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [assignments, setAssignments] = useState<AssetAssignment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ASSIGNMENTS`);
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [maintenanceList, setMaintenanceList] = useState<AssetMaintenance[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_MAINTENANCE`);
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE;
  });

  const [licenses, setLicenses] = useState<SoftwareLicense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_LICENSES`);
    return saved ? JSON.parse(saved) : INITIAL_LICENSES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_NOTIFICATIONS`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_USERS`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_LOGS`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [settings, setSettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_SETTINGS`);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    return users[0] || INITIAL_USERS[0];
  });

  // Sync theme to DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('IT_THEME', theme);
  }, [theme]);

  // Sync data to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_CATEGORIES`, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_LOCATIONS`, JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_EMPLOYEES`, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_ASSETS`, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_ASSIGNMENTS`, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_MAINTENANCE`, JSON.stringify(maintenanceList));
  }, [maintenanceList]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_LICENSES`, JSON.stringify(licenses));
  }, [licenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_NOTIFICATIONS`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_USERS`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_LOGS`, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_SETTINGS`, JSON.stringify(settings));
  }, [settings]);

  // Keyboard shortcut Ctrl+K / Cmd+K for Global Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logActivity = (
    action: ActivityLog['action'],
    entityType: ActivityLog['entityType'],
    entityName: string,
    details: string,
    entityId?: string
  ) => {
    if (!settings.autoLogActivity) return;
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      action,
      entityType,
      entityId,
      entityName,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      details,
      ipAddress: '192.168.10.101'
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 199)]); // Keep last 200 logs
  };

  // RBAC Matrix
  const permissions = {
    canCreateAsset: ['super_admin', 'it_admin'].includes(currentUser.role),
    canEditAsset: ['super_admin', 'it_admin', 'it_support'].includes(currentUser.role),
    canDeleteAsset: ['super_admin', 'it_admin'].includes(currentUser.role),
    canAssignAsset: ['super_admin', 'it_admin'].includes(currentUser.role),
    canManageMaintenance: ['super_admin', 'it_admin', 'it_support'].includes(currentUser.role),
    canManageLicenses: ['super_admin', 'it_admin'].includes(currentUser.role),
    canManageCategories: ['super_admin', 'it_admin'].includes(currentUser.role),
    canManageLocations: ['super_admin', 'it_admin'].includes(currentUser.role),
    canManageEmployees: ['super_admin', 'it_admin'].includes(currentUser.role),
    canManageUsers: currentUser.role === 'super_admin',
    canManageSettings: currentUser.role === 'super_admin',
    canExportReports: ['super_admin', 'it_admin', 'manager'].includes(currentUser.role),
  };

  const switchRole = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role) || {
      id: 'usr-switched',
      name: `User (${role})`,
      email: `${role}@perusahaan.co.id`,
      role,
      department: 'Corporate',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      lastLogin: new Date().toISOString()
    };
    setCurrentUser(targetUser);
    addToast('info', 'Beralih Akun / Role', `Sekarang aktif sebagai role: ${role.replace('_', ' ').toUpperCase()}`);
    logActivity('LOGIN', 'USER', targetUser.name, `Beralih sesi aktif ke role ${role}`, targetUser.id);
  };

  // Asset Actions
  const addAsset = (assetData: Omit<Asset, 'id' | 'assetTag' | 'createdAt' | 'updatedAt'>): Asset => {
    const nextNum = settings.nextAssetNumber;
    const padded = String(nextNum).padStart(3, '0');
    const assetTag = `${settings.assetTagPrefix}${padded}`;
    
    const newAsset: Asset = {
      ...assetData,
      id: 'ast-' + Date.now(),
      assetTag,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAssets((prev) => [newAsset, ...prev]);
    setSettings((prev) => ({ ...prev, nextAssetNumber: prev.nextAssetNumber + 1 }));

    logActivity('CREATE', 'ASSET', `${newAsset.name} (${newAsset.assetTag})`, `Menambahkan aset baru dengan serial number ${newAsset.serialNumber}`, newAsset.id);
    addToast('success', 'Aset Berhasil Ditambahkan', `${newAsset.name} (${newAsset.assetTag})`);
    
    return newAsset;
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
          logActivity('UPDATE', 'ASSET', `${updated.name} (${updated.assetTag})`, `Memperbarui data aset`, id);
          return updated;
        }
        return item;
      })
    );
    if (selectedAssetForDetail?.id === id) {
      setSelectedAssetForDetail((prev) => (prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null));
    }
    addToast('success', 'Data Aset Diperbarui');
  };

  const deleteAsset = (id: string) => {
    const target = assets.find((a) => a.id === id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    if (target) {
      logActivity('DELETE', 'ASSET', `${target.name} (${target.assetTag})`, `Menghapus aset dari sistem`, id);
      addToast('info', 'Aset Dihapus', `${target.name} (${target.assetTag})`);
    }
  };

  const bulkUpdateAssets = (ids: string[], updates: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((item) => {
        if (ids.includes(item.id)) {
          return { ...item, ...updates, updatedAt: new Date().toISOString() };
        }
        return item;
      })
    );
    logActivity('UPDATE', 'ASSET', `${ids.length} Aset`, `Melakukan update massal pada ${ids.length} item aset`);
    addToast('success', 'Update Massal Berhasil', `${ids.length} aset telah diperbarui`);
  };

  const bulkDeleteAssets = (ids: string[]) => {
    setAssets((prev) => prev.filter((a) => !ids.includes(a.id)));
    logActivity('DELETE', 'ASSET', `${ids.length} Aset`, `Menghapus massal ${ids.length} item aset`);
    addToast('info', 'Hapus Massal Berhasil', `${ids.length} aset telah dihapus`);
  };

  const bulkImportAssets = (importedRows: any[]): number => {
    let importedCount = 0;
    let currentNext = settings.nextAssetNumber;

    const newAssetItems: Asset[] = [];

    importedRows.forEach((row) => {
      const name = row['Nama Aset'] || row['name'] || row['Nama'] || 'Imported Asset';
      const catCode = row['Kategori Code'] || row['categoryId'] || 'cat-1';
      const matchedCat = categories.find((c) => c.code.toLowerCase() === String(catCode).toLowerCase() || c.id === catCode) || categories[0];

      const padded = String(currentNext).padStart(3, '0');
      const assetTag = `${settings.assetTagPrefix}${padded}`;
      currentNext++;

      const asset: Asset = {
        id: 'ast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        assetTag,
        name: String(name),
        categoryId: matchedCat.id,
        brand: String(row['Brand'] || row['brand'] || 'Generik'),
        model: String(row['Model'] || row['model'] || '-'),
        serialNumber: String(row['Serial Number'] || row['serialNumber'] || `SN-${Date.now()}`),
        purchaseDate: String(row['Tanggal Pembelian'] || row['purchaseDate'] || new Date().toISOString().slice(0, 10)),
        purchasePrice: Number(row['Harga Pembelian'] || row['purchasePrice']) || 0,
        supplier: String(row['Supplier'] || row['supplier'] || 'Vendor IT'),
        warrantyExpiryDate: String(row['Garansi Berakhir'] || row['warrantyExpiryDate'] || '2027-12-31'),
        status: (row['Status'] || 'available').toLowerCase() as AssetStatus,
        condition: (row['Kondisi'] || 'good').toLowerCase() as AssetCondition,
        locationId: String(row['Lokasi ID'] || row['locationId'] || locations[0]?.id || 'loc-1'),
        department: String(row['Departemen'] || row['department'] || 'Information Technology'),
        ipAddress: row['IP Address'] || row['ipAddress'] || '',
        macAddress: row['MAC Address'] || row['macAddress'] || '',
        os: row['Operating System'] || row['os'] || '',
        processor: row['Processor'] || row['processor'] || '',
        ram: row['RAM'] || row['ram'] || '',
        storage: row['Storage'] || row['storage'] || '',
        notes: row['Catatan'] || row['notes'] || 'Imported from Excel',
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      newAssetItems.push(asset);
      importedCount++;
    });

    if (newAssetItems.length > 0) {
      setAssets((prev) => [...newAssetItems, ...prev]);
      setSettings((prev) => ({ ...prev, nextAssetNumber: currentNext }));
      logActivity('IMPORT', 'ASSET', `${importedCount} Aset`, `Import massal ${importedCount} aset dari file Excel`);
      addToast('success', 'Import Excel Berhasil', `${importedCount} aset baru ditambahkan ke database`);
    }

    return importedCount;
  };

  // Category Actions
  const addCategory = (catData: Omit<AssetCategory, 'id'>) => {
    const newCat: AssetCategory = { ...catData, id: 'cat-' + Date.now() };
    setCategories((prev) => [...prev, newCat]);
    logActivity('CREATE', 'CATEGORY', newCat.name, `Membuat kategori aset baru: ${newCat.name}`, newCat.id);
    addToast('success', 'Kategori Berhasil Ditambahkan', newCat.name);
  };

  const updateCategory = (id: string, updates: Partial<AssetCategory>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    logActivity('UPDATE', 'CATEGORY', updates.name || id, `Memperbarui kategori aset`, id);
    addToast('success', 'Kategori Diperbarui');
  };

  const deleteCategory = (id: string) => {
    const target = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (target) {
      logActivity('DELETE', 'CATEGORY', target.name, `Menghapus kategori aset`, id);
      addToast('info', 'Kategori Dihapus', target.name);
    }
  };

  // Location Actions
  const addLocation = (locData: Omit<Location, 'id'>) => {
    const newLoc: Location = { ...locData, id: 'loc-' + Date.now() };
    setLocations((prev) => [...prev, newLoc]);
    logActivity('CREATE', 'LOCATION', newLoc.name, `Menambahkan lokasi kantor/gudang baru`, newLoc.id);
    addToast('success', 'Lokasi Berhasil Ditambahkan', newLoc.name);
  };

  const updateLocation = (id: string, updates: Partial<Location>) => {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    logActivity('UPDATE', 'LOCATION', updates.name || id, `Memperbarui data lokasi`, id);
    addToast('success', 'Lokasi Diperbarui');
  };

  const deleteLocation = (id: string) => {
    const target = locations.find((l) => l.id === id);
    setLocations((prev) => prev.filter((l) => l.id !== id));
    if (target) {
      logActivity('DELETE', 'LOCATION', target.name, `Menghapus lokasi aset`, id);
      addToast('info', 'Lokasi Dihapus', target.name);
    }
  };

  // Employee Actions
  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = { ...empData, id: 'emp-' + Date.now() };
    setEmployees((prev) => [...prev, newEmp]);
    logActivity('CREATE', 'EMPLOYEE', `${newEmp.fullName} (${newEmp.employeeId})`, `Menambahkan data karyawan baru`, newEmp.id);
    addToast('success', 'Karyawan Ditambahkan', newEmp.fullName);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    logActivity('UPDATE', 'EMPLOYEE', updates.fullName || id, `Memperbarui profil karyawan`, id);
    addToast('success', 'Profil Karyawan Diperbarui');
  };

  const deleteEmployee = (id: string) => {
    const target = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    if (target) {
      logActivity('DELETE', 'EMPLOYEE', target.fullName, `Menghapus karyawan`, id);
      addToast('info', 'Karyawan Dihapus', target.fullName);
    }
  };

  // Assignment Actions
  const assignAsset = (assetId: string, employeeId: string, expectedReturnDate?: string, notes?: string) => {
    const asset = assets.find((a) => a.id === assetId);
    const employee = employees.find((e) => e.id === employeeId);
    if (!asset || !employee) return;

    const newAssignment: AssetAssignment = {
      id: 'asg-' + Date.now(),
      assignmentCode: `ASG-${new Date().getFullYear()}-${String(assignments.length + 1).padStart(3, '0')}`,
      assetId,
      employeeId,
      department: employee.department,
      assignedDate: new Date().toISOString().slice(0, 10),
      expectedReturnDate,
      status: 'active',
      conditionOnAssign: asset.condition,
      notes,
      assignedByUserId: currentUser.id
    };

    setAssignments((prev) => [newAssignment, ...prev]);
    
    // Update asset status
    updateAsset(assetId, {
      status: 'assigned',
      assignedToEmployeeId: employeeId,
      assignedDate: new Date().toISOString().slice(0, 10),
      department: employee.department,
      locationId: employee.locationId
    });

    logActivity('ASSIGN', 'ASSIGNMENT', `${asset.name} -> ${employee.fullName}`, `Menugaskan aset ${asset.assetTag} ke ${employee.fullName} (${employee.department})`, newAssignment.id);
    addToast('success', 'Aset Berhasil Ditugaskan', `${asset.name} -> ${employee.fullName}`);
  };

  const returnAsset = (assignmentId: string, actualReturnDate: string, returnCondition: AssetCondition, notes?: string) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignmentId) {
          return {
            ...a,
            actualReturnDate,
            conditionOnReturn: returnCondition,
            status: 'returned',
            notes: notes ? `${a.notes ? a.notes + ' | ' : ''}Pengembalian: ${notes}` : a.notes
          };
        }
        return a;
      })
    );

    const asset = assets.find((a) => a.id === assignment.assetId);
    if (asset) {
      updateAsset(asset.id, {
        status: returnCondition === 'damaged' ? 'maintenance' : 'available',
        condition: returnCondition,
        assignedToEmployeeId: undefined,
        assignedDate: undefined
      });
      logActivity('RETURN', 'ASSIGNMENT', `${asset.name} (${asset.assetTag})`, `Pengembalian aset dengan kondisi: ${returnCondition.toUpperCase()}`, assignmentId);
      addToast('info', 'Aset Dikembalikan', `Status aset kini ${returnCondition === 'damaged' ? 'Maintenance' : 'Available'}`);
    }
  };

  const transferAsset = (assignmentId: string, newEmployeeId: string, notes?: string) => {
    const currentAssignment = assignments.find((a) => a.id === assignmentId);
    const newEmployee = employees.find((e) => e.id === newEmployeeId);
    if (!currentAssignment || !newEmployee) return;

    // Complete old assignment as transferred
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignmentId ? { ...a, status: 'transferred', actualReturnDate: new Date().toISOString().slice(0, 10) } : a))
    );

    // Create new assignment
    const asset = assets.find((a) => a.id === currentAssignment.assetId);
    if (!asset) return;

    const newAssignment: AssetAssignment = {
      id: 'asg-' + Date.now(),
      assignmentCode: `ASG-${new Date().getFullYear()}-${String(assignments.length + 1).padStart(3, '0')}`,
      assetId: asset.id,
      employeeId: newEmployeeId,
      department: newEmployee.department,
      assignedDate: new Date().toISOString().slice(0, 10),
      expectedReturnDate: currentAssignment.expectedReturnDate,
      status: 'active',
      conditionOnAssign: asset.condition,
      notes: `Transfer dari penugasan ${currentAssignment.assignmentCode}. ${notes || ''}`,
      assignedByUserId: currentUser.id
    };

    setAssignments((prev) => [newAssignment, ...prev]);

    updateAsset(asset.id, {
      assignedToEmployeeId: newEmployeeId,
      assignedDate: new Date().toISOString().slice(0, 10),
      department: newEmployee.department,
      locationId: newEmployee.locationId
    });

    logActivity('TRANSFER', 'ASSIGNMENT', `${asset.name} -> ${newEmployee.fullName}`, `Transfer kepemilikan aset ke ${newEmployee.fullName}`, newAssignment.id);
    addToast('success', 'Transfer Aset Berhasil', `Aset dialihkan ke ${newEmployee.fullName}`);
  };

  // Maintenance Actions
  const createMaintenanceTicket = (data: Omit<AssetMaintenance, 'id' | 'maintenanceId'>) => {
    const newTicket: AssetMaintenance = {
      ...data,
      id: 'mnt-' + Date.now(),
      maintenanceId: `MNT-${new Date().getFullYear()}-${String(maintenanceList.length + 1).padStart(3, '0')}`
    };

    setMaintenanceList((prev) => [newTicket, ...prev]);

    // Update asset status to maintenance
    updateAsset(data.assetId, { status: 'maintenance' });

    const asset = assets.find((a) => a.id === data.assetId);
    logActivity('MAINTENANCE', 'MAINTENANCE', `${asset?.name || 'Aset'} (${newTicket.maintenanceId})`, `Membuat tiket pemeliharaan baru: ${data.problemDescription}`, newTicket.id);
    addToast('success', 'Tiket Maintenance Dibuat', newTicket.maintenanceId);
  };

  const updateMaintenanceStatus = (id: string, status: MaintenanceStatus, cost?: number, resolution?: string) => {
    const ticket = maintenanceList.find((m) => m.id === id);
    if (!ticket) return;

    setMaintenanceList((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            status,
            maintenanceCost: cost !== undefined ? cost : m.maintenanceCost,
            resolutionDetails: resolution || m.resolutionDetails,
            completedDate: status === 'completed' ? new Date().toISOString().slice(0, 10) : m.completedDate
          };
        }
        return m;
      })
    );

    // If completed, set asset back to available (or assigned if had owner)
    if (status === 'completed') {
      const asset = assets.find((a) => a.id === ticket.assetId);
      if (asset) {
        updateAsset(asset.id, {
          status: asset.assignedToEmployeeId ? 'assigned' : 'available',
          condition: 'good'
        });
      }
    }

    logActivity('MAINTENANCE', 'MAINTENANCE', ticket.maintenanceId, `Update status tiket maintenance menjadi: ${status.toUpperCase()}`, id);
    addToast('info', 'Status Maintenance Diperbarui', `Status: ${status.toUpperCase()}`);
  };

  // License Actions
  const addLicense = (licenseData: Omit<SoftwareLicense, 'id'>) => {
    const newLicense: SoftwareLicense = { ...licenseData, id: 'lic-' + Date.now() };
    setLicenses((prev) => [newLicense, ...prev]);
    logActivity('CREATE', 'LICENSE', newLicense.softwareName, `Menambahkan lisensi software: ${newLicense.softwareName}`, newLicense.id);
    addToast('success', 'Lisensi Berhasil Ditambahkan', newLicense.softwareName);
  };

  const updateLicense = (id: string, updates: Partial<SoftwareLicense>) => {
    setLicenses((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    logActivity('UPDATE', 'LICENSE', updates.softwareName || id, `Memperbarui data lisensi software`, id);
    addToast('success', 'Lisensi Diperbarui');
  };

  const deleteLicense = (id: string) => {
    const target = licenses.find((l) => l.id === id);
    setLicenses((prev) => prev.filter((l) => l.id !== id));
    if (target) {
      logActivity('DELETE', 'LICENSE', target.softwareName, `Menghapus lisensi software`, id);
      addToast('info', 'Lisensi Dihapus', target.softwareName);
    }
  };

  const assignLicenseSeat = (licenseId: string, employeeId: string) => {
    setLicenses((prev) =>
      prev.map((lic) => {
        if (lic.id === licenseId) {
          if (lic.assignedEmployeeIds.includes(employeeId)) return lic;
          if (lic.assignedEmployeeIds.length >= lic.totalLicenses) {
            addToast('warning', 'Kuota Lisensi Penuh', 'Jumlah seat telah mencapai batas maksimal.');
            return lic;
          }
          const updated = [...lic.assignedEmployeeIds, employeeId];
          const emp = employees.find((e) => e.id === employeeId);
          logActivity('ASSIGN', 'LICENSE', `${lic.softwareName} -> ${emp?.fullName || employeeId}`, `Menugaskan lisensi software`, licenseId);
          addToast('success', 'Lisensi Ditugaskan', `${lic.softwareName} -> ${emp?.fullName}`);
          return { ...lic, assignedEmployeeIds: updated };
        }
        return lic;
      })
    );
  };

  const revokeLicenseSeat = (licenseId: string, employeeId: string) => {
    setLicenses((prev) =>
      prev.map((lic) => {
        if (lic.id === licenseId) {
          const updated = lic.assignedEmployeeIds.filter((id) => id !== employeeId);
          const emp = employees.find((e) => e.id === employeeId);
          logActivity('RETURN', 'LICENSE', `${lic.softwareName} -x ${emp?.fullName || employeeId}`, `Mencabut lisensi software dari karyawan`, licenseId);
          addToast('info', 'Lisensi Dicabut', `${lic.softwareName}`);
          return { ...lic, assignedEmployeeIds: updated };
        }
        return lic;
      })
    );
  };

  // Notification Actions
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('info', 'Semua Notifikasi Ditandai Sudah Dibaca');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // User Actions
  const addUser = (userData: Omit<User, 'id' | 'lastLogin'>) => {
    const newUser: User = {
      ...userData,
      id: 'usr-' + Date.now(),
      lastLogin: new Date().toISOString()
    };
    setUsers((prev) => [...prev, newUser]);
    logActivity('CREATE', 'USER', `${newUser.name} (${newUser.role})`, `Menambahkan akun pengguna baru`, newUser.id);
    addToast('success', 'User Berhasil Dibuat', newUser.name);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
    logActivity('UPDATE', 'USER', updates.name || id, `Memperbarui akun pengguna`, id);
    addToast('success', 'User Diperbarui');
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (target?.role === 'super_admin' && users.filter((u) => u.role === 'super_admin').length <= 1) {
      addToast('error', 'Gagal Menghapus', 'Tidak dapat menghapus Super Admin terakhir.');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (target) {
      logActivity('DELETE', 'USER', target.name, `Menghapus akun pengguna`, id);
      addToast('info', 'User Dihapus', target.name);
    }
  };

  // Settings & System Actions
  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logActivity('SYSTEM', 'SETTINGS', 'System Settings', `Memperbarui pengaturan sistem & perusahaan`);
    addToast('success', 'Pengaturan Tersimpan');
  };

  const resetToDemoData = () => {
    setCategories(INITIAL_CATEGORIES);
    setLocations(INITIAL_LOCATIONS);
    setEmployees(INITIAL_EMPLOYEES);
    setAssets(INITIAL_ASSETS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setMaintenanceList(INITIAL_MAINTENANCE);
    setLicenses(INITIAL_LICENSES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setUsers(INITIAL_USERS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setSettings(INITIAL_SETTINGS);
    setCurrentUser(INITIAL_USERS[0]);

    localStorage.removeItem(`${STORAGE_KEY}_CATEGORIES`);
    localStorage.removeItem(`${STORAGE_KEY}_LOCATIONS`);
    localStorage.removeItem(`${STORAGE_KEY}_EMPLOYEES`);
    localStorage.removeItem(`${STORAGE_KEY}_ASSETS`);
    localStorage.removeItem(`${STORAGE_KEY}_ASSIGNMENTS`);
    localStorage.removeItem(`${STORAGE_KEY}_MAINTENANCE`);
    localStorage.removeItem(`${STORAGE_KEY}_LICENSES`);
    localStorage.removeItem(`${STORAGE_KEY}_NOTIFICATIONS`);
    localStorage.removeItem(`${STORAGE_KEY}_USERS`);
    localStorage.removeItem(`${STORAGE_KEY}_LOGS`);
    localStorage.removeItem(`${STORAGE_KEY}_SETTINGS`);

    addToast('info', 'Reset Database Berhasil', 'Data dikembalikan ke data default demo.');
  };

  const exportDatabaseBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        categories,
        locations,
        employees,
        assets,
        assignments,
        maintenanceList,
        licenses,
        notifications,
        users,
        activityLogs,
        settings
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ITAMS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Backup Database Diunduh', 'File JSON siap disimpan sebagai arsip');
  };

  const importDatabaseBackup = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.data) throw new Error('Invalid backup format');
      const d = parsed.data;

      if (d.categories) setCategories(d.categories);
      if (d.locations) setLocations(d.locations);
      if (d.employees) setEmployees(d.employees);
      if (d.assets) setAssets(d.assets);
      if (d.assignments) setAssignments(d.assignments);
      if (d.maintenanceList) setMaintenanceList(d.maintenanceList);
      if (d.licenses) setLicenses(d.licenses);
      if (d.notifications) setNotifications(d.notifications);
      if (d.users) setUsers(d.users);
      if (d.activityLogs) setActivityLogs(d.activityLogs);
      if (d.settings) setSettings(d.settings);

      logActivity('IMPORT', 'SETTINGS', 'Database Restore', 'Memulihkan database dari file backup JSON');
      addToast('success', 'Restore Database Berhasil', 'Seluruh data berhasil dipulihkan.');
      return true;
    } catch (e) {
      console.error(e);
      addToast('error', 'Gagal Memulihkan Backup', 'Format file JSON tidak valid.');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        selectedAssetForDetail,
        setSelectedAssetForDetail,
        isScannerOpen,
        setIsScannerOpen,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        toasts,
        addToast,
        removeToast,
        currentUser,
        setCurrentUser,
        switchRole,
        permissions,
        assets,
        categories,
        locations,
        employees,
        assignments,
        maintenanceList,
        licenses,
        notifications,
        activityLogs,
        users,
        settings,
        addAsset,
        updateAsset,
        deleteAsset,
        bulkUpdateAssets,
        bulkDeleteAssets,
        bulkImportAssets,
        addCategory,
        updateCategory,
        deleteCategory,
        addLocation,
        updateLocation,
        deleteLocation,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        assignAsset,
        returnAsset,
        transferAsset,
        createMaintenanceTicket,
        updateMaintenanceStatus,
        addLicense,
        updateLicense,
        deleteLicense,
        assignLicenseSeat,
        revokeLicenseSeat,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        addUser,
        updateUser,
        deleteUser,
        updateSettings,
        resetToDemoData,
        exportDatabaseBackup,
        importDatabaseBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
