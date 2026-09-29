import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderTree,
  Plus,
  Edit3,
  Trash2,
  Laptop,
  Layers,
  Calendar,
  DollarSign,
  X
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { AssetCategory } from '../../types';

export const CategoriesView: React.FC = () => {
  const { categories, assets, addCategory, updateCategory, deleteCategory, permissions } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [defaultLifespanYears, setDefaultLifespanYears] = useState(4);

  const handleOpenModal = (cat?: AssetCategory) => {
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setCode(cat.code);
      setDescription(cat.description || '');
      setDefaultLifespanYears(cat.defaultLifespanYears || 4);
    } else {
      setEditingCategory(null);
      setName('');
      setCode('');
      setDescription('');
      setDefaultLifespanYears(4);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name,
        code: code.toUpperCase(),
        description,
        defaultLifespanYears: Number(defaultLifespanYears)
      });
    } else {
      addCategory({
        name,
        code: code.toUpperCase(),
        description,
        defaultLifespanYears: Number(defaultLifespanYears)
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
            <span>Kategori Aset IT</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {categories.length} Kategori
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Klasifikasi kelompok perangkat keras dan perangkat lunak beserta estimasi masa manfaat depresiasi
          </p>
        </div>

        {permissions.canManageCategories && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        )}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const categoryAssets = assets.filter((a) => a.categoryId === cat.id);
          const totalValuation = categoryAssets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);

          return (
            <div
              key={cat.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-black text-xs">
                      {cat.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {cat.name}
                      </h3>
                      <div className="text-[11px] font-mono text-slate-400">Kode: {cat.code}</div>
                    </div>
                  </div>

                  {permissions.canManageCategories && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Kategori"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (categoryAssets.length > 0) {
                            alert(`Kategori ini memiliki ${categoryAssets.length} aset. Harap pindahkan aset terlebih dahulu sebelum menghapus.`);
                            return;
                          }
                          if (confirm(`Hapus kategori ${cat.name}?`)) {
                            deleteCategory(cat.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 min-h-[32px] line-clamp-2">
                  {cat.description || 'Tidak ada deskripsi tambahan.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Aset:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {categoryAssets.length} Unit
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Valuasi:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(totalValuation)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Umur Manfaat Akuntansi:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {cat.defaultLifespanYears} Tahun
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Aset'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Laptop & Notebook"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kode Singkat (Prefix) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="LAP, DSK, SRV"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Umur Manfaat (Th)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={defaultLifespanYears}
                    onChange={(e) => setDefaultLifespanYears(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Deskripsi Kategori
                </label>
                <textarea
                  rows={3}
                  placeholder="Keterangan cakupan aset dalam kategori ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
