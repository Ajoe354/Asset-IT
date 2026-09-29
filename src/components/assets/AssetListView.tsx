import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Laptop,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Printer,
  Grid,
  List,
  MoreVertical,
  Edit3,
  Trash2,
  UserCheck,
  Wrench,
  QrCode,
  CheckSquare,
  Square,
  ChevronDown,
  ArrowUpDown,
  FileSpreadsheet,
  FileText,
  SlidersHorizontal,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  getAssetStatusMeta,
  getConditionMeta
} from '../../utils/formatters';
import { exportAssetsToExcel, exportAssetsToCsv } from '../../utils/excelExport';
import { Asset, AssetStatus, AssetCondition } from '../../types';
import { AddEditAssetModal } from './AddEditAssetModal';
import { ImportAssetsModal } from './ImportAssetsModal';
import { PrintLabelsModal } from '../common/PrintLabelsModal';

interface AssetListViewProps {
  onAssignAssetModal?: (asset: Asset) => void;
  onMaintenanceAssetModal?: (asset: Asset) => void;
}

export const AssetListView: React.FC<AssetListViewProps> = ({
  onAssignAssetModal,
  onMaintenanceAssetModal
}) => {
  const {
    assets,
    categories,
    locations,
    employees,
    setSelectedAssetForDetail,
    deleteAsset,
    bulkUpdateAssetStatus,
    bulkDeleteAssets,
    permissions,
    addToast
  } = useApp();

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // View & Sort State
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'assetTag' | 'purchasePrice' | 'purchaseDate'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selection state for bulk operations
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isPrintLabelsOpen, setIsPrintLabelsOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered and Sorted Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Text Search
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        asset.name.toLowerCase().includes(term) ||
        asset.assetTag.toLowerCase().includes(term) ||
        asset.serialNumber.toLowerCase().includes(term) ||
        asset.brand.toLowerCase().includes(term) ||
        asset.model.toLowerCase().includes(term) ||
        (asset.department && asset.department.toLowerCase().includes(term)) ||
        (asset.ipAddress && asset.ipAddress.toLowerCase().includes(term));

      // Category filter
      const matchCategory = selectedCategory === 'all' || asset.categoryId === selectedCategory;

      // Status filter
      const matchStatus = selectedStatus === 'all' || asset.status === selectedStatus;

      // Location filter
      const matchLocation = selectedLocation === 'all' || asset.locationId === selectedLocation;

      // Condition filter
      const matchCondition = selectedCondition === 'all' || asset.condition === selectedCondition;

      // Department filter
      const matchDept = selectedDepartment === 'all' || asset.department === selectedDepartment;

      return matchSearch && matchCategory && matchStatus && matchLocation && matchCondition && matchDept;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'assetTag') comparison = a.assetTag.localeCompare(b.assetTag);
      else if (sortBy === 'purchasePrice') comparison = (a.purchasePrice || 0) - (b.purchasePrice || 0);
      else if (sortBy === 'purchaseDate') comparison = new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
      else comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [
    assets,
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedLocation,
    selectedCondition,
    selectedDepartment,
    sortBy,
    sortOrder
  ]);

  // Paginated Assets
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage) || 1;
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedAssetIds.length === paginatedAssets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(paginatedAssets.map((a) => a.id));
    }
  };

  const toggleSelectAsset = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedAssets = assets.filter((a) => selectedAssetIds.includes(a.id));

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedLocation('all');
    setSelectedCondition('all');
    setSelectedDepartment('all');
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Manajemen Aset IT</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {filteredAssets.length} Aset
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar lengkap inventaris perangkat IT, spesifikasi teknis, status, dan riwayat peminjaman
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Dropdown */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
            <button
              onClick={() => exportAssetsToExcel(filteredAssets, categories, locations, employees)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
              title="Export ke Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Excel</span>
            </button>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
            <button
              onClick={() => exportAssetsToCsv(filteredAssets, categories, locations, employees)}
              className="px-2.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
              title="Export ke CSV"
            >
              <FileText className="w-4 h-4 text-blue-500" />
              <span>CSV</span>
            </button>
          </div>

          {/* Import Button */}
          {permissions.canCreateAsset && (
            <button
              onClick={() => setIsImportOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Import Excel</span>
            </button>
          )}

          {/* Add Asset Button */}
          {permissions.canCreateAsset && (
            <button
              onClick={() => {
                setAssetToEdit(null);
                setIsAddEditOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Aset</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Main Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, asset tag, SN, brand, model, IP..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Quick Controls: View Toggle & Sort */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl p-1 bg-slate-50 dark:bg-slate-800/60">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Grid Kartu"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="createdAt">Terbaru Ditambahkan</option>
              <option value="name">Nama Aset (A-Z)</option>
              <option value="assetTag">Asset Tag ID</option>
              <option value="purchasePrice">Harga Pembelian</option>
              <option value="purchaseDate">Tanggal Pembelian</option>
            </select>

            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Balik Urutan"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills / Selects */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Kategori</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.code})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300"
            >
              <option value="all">Semua Status</option>
              <option value="available">Available (Tersedia)</option>
              <option value="assigned">In Use (Digunakan)</option>
              <option value="maintenance">Maintenance (Perbaikan)</option>
              <option value="reserved">Reserved</option>
              <option value="retired">Retired (Afkir)</option>
              <option value="lost">Lost / Missing</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Lokasi</label>
            <select
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300"
            >
              <option value="all">Semua Lokasi</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Kondisi Fisik</label>
            <select
              value={selectedCondition}
              onChange={(e) => {
                setSelectedCondition(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300"
            >
              <option value="all">Semua Kondisi</option>
              <option value="excellent">Sangat Baik (Baru)</option>
              <option value="good">Baik (Normal)</option>
              <option value="fair">Cukup (Lecet)</option>
              <option value="poor">Kurang (Kendala)</option>
              <option value="damaged">Rusak</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 text-xs font-semibold flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Banner (Appears when 1 or more assets are checked) */}
      {selectedAssetIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span>{selectedAssetIds.length} Aset Terpilih</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bulk Status Update */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  bulkUpdateAssetStatus(selectedAssetIds, e.target.value as AssetStatus);
                  e.target.value = '';
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="">Ubah Status Masal...</option>
              <option value="available">Set: Available</option>
              <option value="assigned">Set: Assigned</option>
              <option value="maintenance">Set: Maintenance</option>
              <option value="retired">Set: Retired</option>
              <option value="lost">Set: Lost</option>
            </select>

            {/* Bulk Label Print */}
            <button
              onClick={() => setIsPrintLabelsOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-100 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Cetak {selectedAssetIds.length} Label</span>
            </button>

            {/* Bulk Delete */}
            {permissions.canDeleteAsset && (
              <button
                onClick={() => {
                  if (confirm(`Hapus ${selectedAssetIds.length} aset terpilih secara permanen?`)) {
                    bulkDeleteAssets(selectedAssetIds);
                    setSelectedAssetIds([]);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Terpilih</span>
              </button>
            )}

            <button
              onClick={() => setSelectedAssetIds([])}
              className="text-xs text-slate-500 hover:text-slate-700 px-2"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Main Content: Table or Card Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <Laptop className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Tidak ada aset yang sesuai</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau sesuaikan opsi filter kategori dan status.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3 pl-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        paginatedAssets.length > 0 &&
                        paginatedAssets.every((a) => selectedAssetIds.includes(a.id))
                      }
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Asset Tag & Nama</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Serial Number</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Kondisi</th>
                  <th className="p-3">Pengguna / Lokasi</th>
                  <th className="p-3">Harga Beli</th>
                  <th className="p-3 pr-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedAssets.map((asset) => {
                  const category = categories.find((c) => c.id === asset.categoryId);
                  const location = locations.find((l) => l.id === asset.locationId);
                  const employee = employees.find((e) => e.id === asset.assignedToEmployeeId);
                  const statusMeta = getAssetStatusMeta(asset.status);
                  const conditionMeta = getConditionMeta(asset.condition);
                  const isChecked = selectedAssetIds.includes(asset.id);

                  return (
                    <tr
                      key={asset.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isChecked ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <td className="p-3 pl-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectAsset(asset.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="p-3">
                        <div
                          onClick={() => setSelectedAssetForDetail(asset)}
                          className="font-bold text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer"
                        >
                          {asset.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                            {asset.assetTag}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {asset.brand} {asset.model}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {category?.name || 'IT'}
                        </span>
                        <div className="text-[10px] font-mono text-slate-400">{category?.code}</div>
                      </td>

                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                        {asset.serialNumber}
                      </td>

                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                          {statusMeta.label.split(' ')[0]}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${conditionMeta.bg} ${conditionMeta.text}`}>
                          {conditionMeta.label}
                        </span>
                      </td>

                      <td className="p-3">
                        {employee ? (
                          <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <img src={employee.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                            <span className="truncate max-w-[120px]">{employee.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">Gudang / Stock</span>
                        )}
                        <div className="text-[10px] text-slate-400">{location?.name}</div>
                      </td>

                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {formatCurrency(asset.purchasePrice)}
                      </td>

                      <td className="p-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedAssetForDetail(asset)}
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Lihat Detail & QR Tag"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {permissions.canEditAsset && (
                            <button
                              onClick={() => {
                                setAssetToEdit(asset);
                                setIsAddEditOpen(true);
                              }}
                              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Edit Aset"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {permissions.canDeleteAsset && (
                            <button
                              onClick={() => {
                                if (confirm(`Hapus aset ${asset.name} (${asset.assetTag})?`)) {
                                  deleteAsset(asset.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Hapus Aset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredAssets.length)} dari {filteredAssets.length} aset
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
              >
                Sebelumnya
              </button>
              <span className="px-2 font-semibold text-slate-800 dark:text-slate-200">
                Hal {currentPage} dari {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedAssets.map((asset) => {
              const category = categories.find((c) => c.id === asset.categoryId);
              const location = locations.find((l) => l.id === asset.locationId);
              const employee = employees.find((e) => e.id === asset.assignedToEmployeeId);
              const statusMeta = getAssetStatusMeta(asset.status);
              const conditionMeta = getConditionMeta(asset.condition);
              const isChecked = selectedAssetIds.includes(asset.id);

              return (
                <div
                  key={asset.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                    isChecked
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    {/* Card Top: Checkbox & Status */}
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectAsset(asset.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                        {statusMeta.label.split(' ')[0]}
                      </span>
                    </div>

                    {/* Image / Thumbnail & Title */}
                    <div className="flex gap-3 mb-3">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                        {asset.photoUrl ? (
                          <img src={asset.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Laptop className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          onClick={() => setSelectedAssetForDetail(asset)}
                          className="font-bold text-sm text-slate-900 dark:text-white truncate hover:text-blue-600 cursor-pointer"
                        >
                          {asset.name}
                        </div>
                        <div className="font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                          {asset.assetTag}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {asset.brand} {asset.model}
                        </div>
                      </div>
                    </div>

                    {/* Metadata Specs */}
                    <div className="space-y-1 text-xs py-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Kategori:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{category?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">SN:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">{asset.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pengguna:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                          {employee ? employee.fullName : 'Gudang'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nilai:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(asset.purchasePrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedAssetForDetail(asset)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-700 dark:text-slate-300 hover:text-blue-600 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Detail & QR</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {permissions.canEditAsset && (
                        <button
                          onClick={() => {
                            setAssetToEdit(asset);
                            setIsAddEditOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination for Card Grid */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredAssets.length)} dari {filteredAssets.length} aset
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50"
              >
                Sebelumnya
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Asset Modal */}
      <AddEditAssetModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        assetToEdit={assetToEdit}
      />

      {/* Bulk Excel/CSV Import Modal */}
      <ImportAssetsModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      {/* Bulk Print Labels Modal */}
      <PrintLabelsModal
        isOpen={isPrintLabelsOpen}
        onClose={() => setIsPrintLabelsOpen(false)}
        selectedAssets={selectedAssets}
      />
    </div>
  );
};
