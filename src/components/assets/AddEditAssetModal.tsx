import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Laptop,
  Cpu,
  Wifi,
  DollarSign,
  FileText,
  Upload,
  Camera,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Asset, AssetStatus, AssetCondition } from '../../types';

interface AddEditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetToEdit?: Asset | null;
}

export const AddEditAssetModal: React.FC<AddEditAssetModalProps> = ({
  isOpen,
  onClose,
  assetToEdit
}) => {
  const {
    categories,
    locations,
    employees,
    settings,
    addAsset,
    updateAsset,
    addToast
  } = useApp();

  const isEditing = !!assetToEdit;

  // Form State
  const [activeTab, setActiveTab] = useState<'basic' | 'hardware' | 'network' | 'purchase' | 'docs'>('basic');

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [status, setStatus] = useState<AssetStatus>('available');
  const [condition, setCondition] = useState<AssetCondition>('excellent');
  const [locationId, setLocationId] = useState('');
  const [department, setDepartment] = useState('Information Technology');
  const [assignedToEmployeeId, setAssignedToEmployeeId] = useState('');

  // Hardware Specs
  const [processor, setProcessor] = useState('');
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');
  const [os, setOs] = useState('');

  // Network Specs
  const [ipAddress, setIpAddress] = useState('');
  const [macAddress, setMacAddress] = useState('');

  // Purchase & Vendor
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number | string>('');
  const [supplier, setSupplier] = useState('');
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Load existing data if editing
  useEffect(() => {
    if (assetToEdit) {
      setName(assetToEdit.name || '');
      setCategoryId(assetToEdit.categoryId || (categories[0]?.id || ''));
      setBrand(assetToEdit.brand || '');
      setModel(assetToEdit.model || '');
      setSerialNumber(assetToEdit.serialNumber || '');
      setStatus(assetToEdit.status || 'available');
      setCondition(assetToEdit.condition || 'good');
      setLocationId(assetToEdit.locationId || (locations[0]?.id || ''));
      setDepartment(assetToEdit.department || 'Information Technology');
      setAssignedToEmployeeId(assetToEdit.assignedToEmployeeId || '');
      setProcessor(assetToEdit.processor || '');
      setRam(assetToEdit.ram || '');
      setStorage(assetToEdit.storage || '');
      setOs(assetToEdit.os || '');
      setIpAddress(assetToEdit.ipAddress || '');
      setMacAddress(assetToEdit.macAddress || '');
      setPurchaseDate(assetToEdit.purchaseDate || new Date().toISOString().slice(0, 10));
      setPurchasePrice(assetToEdit.purchasePrice || '');
      setSupplier(assetToEdit.supplier || '');
      setWarrantyExpiryDate(assetToEdit.warrantyExpiryDate || '');
      setNotes(assetToEdit.notes || '');
      setPhotoUrl(assetToEdit.photoUrl || '');
    } else {
      // Default new asset values
      setName('');
      setCategoryId(categories[0]?.id || '');
      setBrand('');
      setModel('');
      setSerialNumber(`SN-${Date.now().toString().slice(-6)}`);
      setStatus('available');
      setCondition('excellent');
      setLocationId(locations[0]?.id || '');
      setDepartment('Information Technology');
      setAssignedToEmployeeId('');
      setProcessor('');
      setRam('16 GB');
      setStorage('512 GB SSD');
      setOs('Windows 11 Pro');
      setIpAddress('');
      setMacAddress('');
      setPurchaseDate(new Date().toISOString().slice(0, 10));
      setPurchasePrice(15000000);
      setSupplier('PT Mitra Integrasi');
      // 3 years warranty default
      const future = new Date();
      future.setFullYear(future.getFullYear() + 3);
      setWarrantyExpiryDate(future.toISOString().slice(0, 10));
      setNotes('');
      setPhotoUrl('https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=80');
    }
  }, [assetToEdit, isOpen, categories, locations]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast('error', 'Nama Aset Wajib Diisi');
      return;
    }
    if (!serialNumber.trim()) {
      addToast('error', 'Nomor Seri (Serial Number) Wajib Diisi');
      return;
    }

    const priceNum = typeof purchasePrice === 'number' ? purchasePrice : Number(purchasePrice) || 0;

    if (isEditing && assetToEdit) {
      updateAsset(assetToEdit.id, {
        name,
        categoryId,
        brand,
        model,
        serialNumber,
        status,
        condition,
        locationId,
        department,
        assignedToEmployeeId: assignedToEmployeeId || undefined,
        assignedDate: assignedToEmployeeId ? (assetToEdit.assignedDate || new Date().toISOString().slice(0, 10)) : undefined,
        processor,
        ram,
        storage,
        os,
        ipAddress,
        macAddress,
        purchaseDate,
        purchasePrice: priceNum,
        supplier,
        warrantyExpiryDate,
        notes,
        photoUrl
      });
    } else {
      addAsset({
        name,
        categoryId: categoryId || categories[0]?.id || 'cat-1',
        brand: brand || 'Generik',
        model: model || '-',
        serialNumber,
        status,
        condition,
        locationId: locationId || locations[0]?.id || 'loc-1',
        department,
        assignedToEmployeeId: assignedToEmployeeId || undefined,
        assignedDate: assignedToEmployeeId ? new Date().toISOString().slice(0, 10) : undefined,
        processor,
        ram,
        storage,
        os,
        ipAddress,
        macAddress,
        purchaseDate: purchaseDate || new Date().toISOString().slice(0, 10),
        purchasePrice: priceNum,
        supplier: supplier || 'Vendor IT',
        warrantyExpiryDate: warrantyExpiryDate || '2027-12-31',
        notes,
        photoUrl,
        documents: []
      });
    }

    onClose();
  };

  // Sample photo options
  const samplePhotos = [
    { label: 'Laptop Modern', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80' },
    { label: 'Dell Ultrabook', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=80' },
    { label: 'Workstation PC', url: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500&auto=format&fit=crop&q=80' },
    { label: '4K Monitor', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80' },
    { label: 'Rack Server', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80' },
    { label: 'Network Switch', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80' },
    { label: 'Enterprise Phone', url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=80' },
    { label: 'Tablet Pro', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        id="add-edit-asset-modal"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isEditing ? 'Edit Data Aset IT' : 'Registrasi Aset IT Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing ? `Tag Aset: ${assetToEdit.assetTag}` : `Nomor Tag Otomatis: ${settings.assetTagPrefix}${String(settings.nextAssetNumber).padStart(3, '0')}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-200 dark:border-slate-800 flex gap-4 text-xs font-semibold overflow-x-auto bg-slate-50/50 dark:bg-slate-950/50">
          {[
            { id: 'basic', label: '1. Informasi Utama' },
            { id: 'hardware', label: '2. Spesifikasi Hardware' },
            { id: 'network', label: '3. Jaringan & Lokasi' },
            { id: 'purchase', label: '4. Pembelian & Garansi' },
            { id: 'docs', label: '5. Foto & Dokumen' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nama Aset <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MacBook Pro 16 M3 Max"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kategori Aset <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Brand / Merk
                  </label>
                  <input
                    type="text"
                    placeholder="Apple, Dell, Lenovo, Cisco..."
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Model
                  </label>
                  <input
                    type="text"
                    placeholder="Latitude 7440, ThinkPad T14..."
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Serial Number (SN) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nomor seri pabrik..."
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Status Aset
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AssetStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="available">Available (Tersedia di Gudang/Stok)</option>
                    <option value="assigned">Assigned / In Use (Digunakan Karyawan)</option>
                    <option value="maintenance">Maintenance (Dalam Perbaikan)</option>
                    <option value="reserved">Reserved (Direservasi)</option>
                    <option value="lost">Lost / Missing (Hilang)</option>
                    <option value="retired">Retired (Afkir / Tidak Digunakan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kondisi Fisik
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as AssetCondition)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="excellent">Sangat Baik (Excellent / Baru)</option>
                    <option value="good">Baik (Good / Normal)</option>
                    <option value="fair">Cukup (Fair / Lecet wajar)</option>
                    <option value="poor">Kurang (Poor / Ada kendala ringan)</option>
                    <option value="damaged">Rusak (Damaged / Perlu perbaikan)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HARDWARE SPECS */}
          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Processor (CPU)
                  </label>
                  <input
                    type="text"
                    placeholder="Intel Core i7-1365U / Apple M3 Max / AMD Ryzen 7"
                    value={processor}
                    onChange={(e) => setProcessor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kapasitas RAM
                  </label>
                  <input
                    type="text"
                    placeholder="16 GB / 32 GB / 64 GB DDR5"
                    value={ram}
                    onChange={(e) => setRam(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kapasitas Storage / SSD
                  </label>
                  <input
                    type="text"
                    placeholder="512 GB NVMe SSD / 1 TB PCIe Gen4"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Operating System (OS)
                  </label>
                  <input
                    type="text"
                    placeholder="Windows 11 Pro Enterprise / macOS Sonoma / Ubuntu 22.04"
                    value={os}
                    onChange={(e) => setOs(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NETWORK & LOCATION */}
          {activeTab === 'network' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    IP Address
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 192.168.10.45"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    MAC Address
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: F0:18:98:3E:22:91"
                    value={macAddress}
                    onChange={(e) => setMacAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Lokasi Gedung / Ruang
                  </label>
                  <select
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Departemen Pemilik
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Information Technology">Information Technology</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing & Sales">Marketing & Sales</option>
                    <option value="Operations">Operations</option>
                    <option value="Executive Management">Executive Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Assigned To / Pengguna
                  </label>
                  <select
                    value={assignedToEmployeeId}
                    onChange={(e) => {
                      setAssignedToEmployeeId(e.target.value);
                      if (e.target.value && status === 'available') {
                        setStatus('assigned');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="">-- Belum Ditugaskan --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PURCHASE & WARRANTY */}
          {activeTab === 'purchase' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tanggal Pembelian
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Harga Pembelian (IDR)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 25000000"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Supplier / Vendor
                  </label>
                  <input
                    type="text"
                    placeholder="Nama PT vendor penyedia..."
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Garansi Berakhir (Warranty Expiry Date)
                  </label>
                  <input
                    type="date"
                    value={warrantyExpiryDate}
                    onChange={(e) => setWarrantyExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Catatan / Keterangan Khusus
                </label>
                <textarea
                  rows={3}
                  placeholder="Catatan penempatan, konfigurasi khusus, atau histori aset..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 5: PHOTO & DOCUMENTS */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  URL Foto Aset
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Atau Pilih Contoh Foto Representatif:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {samplePhotos.map((s) => (
                    <button
                      key={s.url}
                      type="button"
                      onClick={() => setPhotoUrl(s.url)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        photoUrl === s.url
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <img src={s.url} alt={s.label} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-[11px] font-medium truncate">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {photoUrl && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-4">
                  <img src={photoUrl} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-white">Foto Aset Terpasang</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Foto akan ditampilkan di halaman detail dan cetak tag aset.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              Batal
            </button>

            <div className="flex gap-2">
              {activeTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs = ['basic', 'hardware', 'network', 'purchase', 'docs'];
                    const idx = tabs.indexOf(activeTab);
                    if (idx > 0) setActiveTab(tabs[idx - 1] as any);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Kembali
                </button>
              )}

              {activeTab !== 'docs' ? (
                <button
                  type="button"
                  onClick={() => {
                    const tabs = ['basic', 'hardware', 'network', 'purchase', 'docs'];
                    const idx = tabs.indexOf(activeTab);
                    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1] as any);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800"
                >
                  Lanjut →
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  {isEditing ? 'Simpan Perubahan Aset' : 'Daftarkan Aset IT'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
