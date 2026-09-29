export type AssetStatus = 'available' | 'assigned' | 'maintenance' | 'reserved' | 'lost' | 'retired';

export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';

export type UserRole = 'super_admin' | 'it_admin' | 'it_support' | 'manager' | 'employee';

export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type MaintenanceType = 'preventive' | 'corrective' | 'upgrade' | 'inspection' | 'repair';

export type AssignmentStatus = 'active' | 'transferred' | 'returned' | 'overdue';

export type LicenseType = 'perpetual' | 'subscription_annual' | 'subscription_monthly' | 'per_user' | 'volume';

export type LocationType = 'Head Office' | 'Branch Office' | 'Warehouse' | 'Server Room' | 'Meeting Room' | 'Data Center';

export interface AssetCategory {
  id: string;
  name: string;
  code: string;
  iconName: string;
  description: string;
  defaultLifespanYears: number;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  address: string;
  building: string;
  floor: string;
  contactPerson: string;
  phone: string;
}

export interface Employee {
  id: string;
  employeeId: string; // e.g. EMP-001
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  locationId: string;
  status: 'active' | 'on_leave' | 'inactive';
  avatarUrl: string;
  joinedDate: string;
}

export interface AssetDocument {
  id: string;
  name: string;
  type: 'invoice' | 'warranty_card' | 'manual' | 'handover_form' | 'other';
  url: string;
  size: string;
  uploadDate: string;
}

export interface Asset {
  id: string;
  assetTag: string; // e.g. AST-2026-001
  name: string;
  categoryId: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  supplier: string;
  warrantyExpiryDate: string;
  status: AssetStatus;
  condition: AssetCondition;
  locationId: string;
  department: string;
  assignedToEmployeeId?: string;
  assignedDate?: string;
  ipAddress?: string;
  macAddress?: string;
  os?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  notes?: string;
  photoUrl?: string;
  documents: AssetDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface AssetAssignment {
  id: string;
  assignmentCode: string; // e.g. ASG-2026-001
  assetId: string;
  employeeId: string;
  department: string;
  assignedDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  status: AssignmentStatus;
  conditionOnAssign: AssetCondition;
  conditionOnReturn?: AssetCondition;
  notes?: string;
  assignedByUserId: string;
  handoverDocUrl?: string;
}

export interface AssetMaintenance {
  id: string;
  maintenanceId: string; // e.g. MNT-2026-001
  assetId: string;
  maintenanceType: MaintenanceType;
  problemDescription: string;
  maintenanceDate: string;
  completedDate?: string;
  technician: string;
  vendor?: string;
  maintenanceCost: number;
  status: MaintenanceStatus;
  notes?: string;
  resolutionDetails?: string;
}

export interface SoftwareLicense {
  id: string;
  softwareName: string;
  licenseKey: string;
  licenseType: LicenseType;
  totalLicenses: number;
  assignedEmployeeIds: string[];
  purchaseDate: string;
  expirationDate: string;
  vendor: string;
  licenseCost: number;
  status: 'active' | 'expiring_soon' | 'expired' | 'suspended';
  category: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'warranty' | 'license' | 'maintenance' | 'assignment' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  relatedAssetId?: string;
  relatedLicenseId?: string;
  relatedMaintenanceId?: string;
  date: string;
  read: boolean;
  linkTab?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN' | 'RETURN' | 'TRANSFER' | 'MAINTENANCE' | 'IMPORT' | 'EXPORT' | 'LOGIN' | 'SYSTEM';
  entityType: 'ASSET' | 'CATEGORY' | 'EMPLOYEE' | 'ASSIGNMENT' | 'MAINTENANCE' | 'LICENSE' | 'LOCATION' | 'USER' | 'SETTINGS';
  entityId?: string;
  entityName: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  details: string;
  ipAddress?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  employeeId?: string;
  avatarUrl: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

export interface CompanySettings {
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  currency: 'IDR' | 'USD' | 'EUR' | 'SGD';
  assetTagPrefix: string;
  nextAssetNumber: number;
  warrantyAlertDays: number;
  licenseAlertDays: number;
  autoLogActivity: boolean;
  enableEmailAlerts: boolean;
  alertEmail: string;
}
