import { AssetStatus, AssetCondition, MaintenanceStatus, AssignmentStatus, UserRole } from '../types';

export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  if (isNaN(amount)) return 'Rp 0';
  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function getDaysRemaining(targetDateStr?: string): { days: number; isExpired: boolean; text: string } {
  if (!targetDateStr) return { days: 9999, isExpired: false, text: '-' };
  const target = new Date(targetDateStr);
  const now = new Date('2026-09-01T00:00:00Z'); // Current simulation baseline
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: diffDays, isExpired: true, text: `Kedaluwarsa ${Math.abs(diffDays)} hari lalu` };
  } else if (diffDays === 0) {
    return { days: 0, isExpired: false, text: 'Hari ini' };
  } else {
    return { days: diffDays, isExpired: false, text: `${diffDays} hari lagi` };
  }
}

export function calculateDepreciation(
  purchasePrice: number = 0,
  purchaseDateStr?: string,
  lifespanYears: number = 4,
  salvageValue: number = 0
): {
  currentBookValue: number;
  accumulatedDepreciation: number;
  annualDepreciation: number;
  percentDepreciated: number;
  yearsRemaining: number;
} {
  const pDate = purchaseDateStr ? new Date(purchaseDateStr) : new Date();
  const now = new Date();
  const diffYears = Math.max(0, (now.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

  const depreciableAmount = Math.max(0, purchasePrice - salvageValue);
  const safeLifespan = Math.max(1, lifespanYears || 4);
  const annualDepreciation = depreciableAmount / safeLifespan;

  const accumulatedDepreciation = Math.min(depreciableAmount, annualDepreciation * diffYears);
  const currentBookValue = Math.max(salvageValue, purchasePrice - accumulatedDepreciation);
  const percentDepreciated = depreciableAmount > 0 ? (accumulatedDepreciation / depreciableAmount) * 100 : 100;
  const yearsRemaining = Math.max(0, safeLifespan - diffYears);

  return {
    currentBookValue: Math.round(currentBookValue),
    accumulatedDepreciation: Math.round(accumulatedDepreciation),
    annualDepreciation: Math.round(annualDepreciation),
    percentDepreciated: Math.min(100, Math.round(percentDepreciated)),
    yearsRemaining: Number(yearsRemaining.toFixed(1))
  };
}

export function getAssetStatusMeta(status: AssetStatus): { label: string; bg: string; text: string; border: string; dot: string } {
  switch (status) {
    case 'available':
      return {
        label: 'Available (Tersedia)',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500'
      };
    case 'assigned':
      return {
        label: 'In Use (Digunakan)',
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        dot: 'bg-blue-500'
      };
    case 'maintenance':
      return {
        label: 'Maintenance (Perbaikan)',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500'
      };
    case 'reserved':
      return {
        label: 'Reserved (Direservasi)',
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
        dot: 'bg-purple-500'
      };
    case 'lost':
      return {
        label: 'Lost / Missing (Hilang)',
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800',
        dot: 'bg-rose-500'
      };
    case 'retired':
      return {
        label: 'Retired (Afkir/Tidak Digunakan)',
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-300 dark:border-slate-700',
        dot: 'bg-slate-400'
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-700',
        dot: 'bg-slate-400'
      };
  }
}

export function getConditionMeta(condition: AssetCondition): { label: string; bg: string; text: string } {
  switch (condition) {
    case 'excellent':
      return { label: 'Sangat Baik (Excellent)', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-300' };
    case 'good':
      return { label: 'Baik (Good)', bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-800 dark:text-teal-300' };
    case 'fair':
      return { label: 'Cukup (Fair)', bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-300' };
    case 'poor':
      return { label: 'Kurang (Poor)', bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-800 dark:text-orange-300' };
    case 'damaged':
      return { label: 'Rusak (Damaged)', bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-300' };
    default:
      return { label: condition, bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' };
  }
}

export function getRoleMeta(role: UserRole): { label: string; badge: string; color: string } {
  switch (role) {
    case 'super_admin':
      return { label: 'Super Admin', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800', color: 'text-purple-600 dark:text-purple-400' };
    case 'it_admin':
      return { label: 'IT Admin', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800', color: 'text-blue-600 dark:text-blue-400' };
    case 'it_support':
      return { label: 'IT Support', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800', color: 'text-amber-600 dark:text-amber-400' };
    case 'manager':
      return { label: 'Manager', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', color: 'text-emerald-600 dark:text-emerald-400' };
    case 'employee':
      return { label: 'Employee', badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700', color: 'text-slate-600 dark:text-slate-400' };
  }
}

export function getMaintenanceStatusMeta(status: MaintenanceStatus): { label: string; bg: string; text: string } {
  switch (status) {
    case 'scheduled':
      return { label: 'Scheduled (Terjadwal)', bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-800 dark:text-indigo-300' };
    case 'in_progress':
      return { label: 'In Progress (Dikerjakan)', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-300' };
    case 'completed':
      return { label: 'Completed (Selesai)', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-300' };
    case 'cancelled':
      return { label: 'Cancelled (Dibatalkan)', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' };
  }
}
