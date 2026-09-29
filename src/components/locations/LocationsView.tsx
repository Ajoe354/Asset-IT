import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Building2,
  X,
  User as UserIcon
} from 'lucide-react';
import { Location, LocationType } from '../../types';

export const LocationsView: React.FC = () => {
  const {
    locations,
    assets,
    addLocation,
    updateLocation,
    deleteLocation,
    setSelectedAssetForDetail,
    permissions
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<LocationType>('Head Office');
  const [address, setAddress] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');

  const handleOpenModal = (loc?: Location) => {
    if (loc) {
      setEditingLocation(loc);
      setName(loc.name);
      setType(loc.type);
      setAddress(loc.address);
      setBuilding(loc.building);
      setFloor(loc.floor);
      setContactPerson(loc.contactPerson || '');
      setPhone(loc.phone || '');
    } else {
      setEditingLocation(null);
      setName('');
      setType('Head Office');
      setAddress('Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan');
      setBuilding('Menara Sudirman');
      setFloor('Lantai 12 - Wing A');
      setContactPerson('Budi Santoso');
      setPhone('+62 21 555-0199');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingLocation) {
      updateLocation(editingLocation.id, {
        name,
        type,
        address,
        building,
        floor,
        contactPerson,
        phone
      });
    } else {
      addLocation({
        name,
        type,
        address,
        building,
        floor,
        contactPerson,
        phone
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
            <span>Lokasi & Penempatan Aset</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {locations.length} Lokasi
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola gedung kantor pusat, cabang, server room, ruang kerja, dan inventaris perangkat per lokasi fisik
          </p>
        </div>

        {permissions.canManageLocations && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Lokasi Baru</span>
          </button>
        )}
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((loc) => {
          const locAssets = assets.filter((a) => a.locationId === loc.id);

          return (
            <div
              key={loc.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {loc.name}
                      </h3>
                      <div className="text-xs text-slate-500">{loc.floor} • {loc.building}</div>
                    </div>
                  </div>

                  {permissions.canManageLocations && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(loc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (locAssets.length > 0) {
                            alert(`Lokasi ini memiliki ${locAssets.length} aset. Pindahkan aset terlebih dahulu.`);
                            return;
                          }
                          if (confirm(`Hapus lokasi ${loc.name}?`)) {
                            deleteLocation(loc.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 py-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{loc.address}</span>
                  </div>
                  {loc.contactPerson && (
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>PIC / Kontak: <b>{loc.contactPerson}</b> ({loc.phone})</span>
                    </div>
                  )}
                </div>

                {/* Assets preview */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                    <span>ASET TERDAFTAR:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{locAssets.length} Unit</span>
                  </div>

                  {locAssets.length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic">Belum ada aset di lokasi ini</div>
                  ) : (
                    <div className="space-y-1">
                      {locAssets.slice(0, 2).map((a) => (
                        <div
                          key={a.id}
                          onClick={() => setSelectedAssetForDetail(a)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                            {a.name}
                          </span>
                          <span className="font-mono text-[10px] text-blue-600 font-bold ml-2">
                            {a.assetTag}
                          </span>
                        </div>
                      ))}
                      {locAssets.length > 2 && (
                        <div className="text-[10px] text-slate-400 text-center">
                          +{locAssets.length - 2} aset lainnya
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add/Edit Location */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingLocation ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Lokasi / Ruang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: IT Main Data Center, Head Office"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tipe Fasilitas
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as LocationType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  >
                    <option value="Head Office">Head Office</option>
                    <option value="Branch Office">Branch Office</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Server Room">Server Room</option>
                    <option value="Meeting Room">Meeting Room</option>
                    <option value="Data Center">Data Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Gedung
                  </label>
                  <input
                    type="text"
                    placeholder="Menara Sudirman"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Lantai / Ruangan
                </label>
                <input
                  type="text"
                  placeholder="Lantai 12 - IT Operations Room"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Alamat Lengkap
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    PIC / Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="Nama PIC"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Telepon PIC
                  </label>
                  <input
                    type="text"
                    placeholder="+62 21..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Simpan Lokasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
