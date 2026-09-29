import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { parseAssetsExcel, downloadAssetTemplate } from '../../utils/excelExport';
import { Asset } from '../../types';

interface ImportAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportAssetsModal: React.FC<ImportAssetsModalProps> = ({ isOpen, onClose }) => {
  const { bulkImportAssets, addToast } = useApp();
  const [parsedData, setParsedData] = useState<Partial<Asset>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    try {
      const data = await parseAssetsExcel(file);
      if (data.length === 0) {
        addToast('error', 'File Kosong', 'Tidak ada data valid yang ditemukan dalam file.');
      } else {
        setParsedData(data);
        addToast('success', 'File Terbaca', `Ditemukan ${data.length} data aset.`);
      }
    } catch (err: any) {
      addToast('error', 'Gagal Membaca File', err.message || 'Format file tidak valid.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommitImport = () => {
    if (parsedData.length === 0) return;
    bulkImportAssets(parsedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Import Aset Masal (Excel / CSV)</h3>
              <p className="text-xs text-slate-500">Unggah file template untuk menambahkan banyak aset sekaligus</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Download Template Step */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-xs text-blue-900 dark:text-blue-200">
                1. Unduh Format Template Standar
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                Gunakan template resmi untuk memastikan struktur kolom (Nama, SN, Brand, Model, Harga, dll) terpetakan dengan sempurna.
              </p>
            </div>
            <button
              onClick={downloadAssetTemplate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Template Excel</span>
            </button>
          </div>

          {/* Upload Area */}
          <div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              2. Upload File Excel (.xlsx, .xls, .csv)
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition-colors group"
            >
              <Upload className="w-10 h-10 mx-auto text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {fileName ? fileName : 'Klik di sini atau drag & drop file Excel/CSV'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Mendukung format .XLSX, .XLS, dan .CSV</p>
            </div>
          </div>

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Pratinjau Data ({parsedData.length} baris terdeteksi):</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Siap diimport
                </span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 font-semibold border-b border-slate-200 dark:border-slate-800 text-slate-500 sticky top-0">
                    <tr>
                      <th className="p-2.5 pl-4">Nama Aset</th>
                      <th className="p-2.5">Brand & Model</th>
                      <th className="p-2.5">Serial Number</th>
                      <th className="p-2.5">Harga Beli</th>
                      <th className="p-2.5 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 pl-4 font-semibold text-slate-900 dark:text-white">{row.name}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">{row.brand} {row.model}</td>
                        <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">{row.serialNumber}</td>
                        <td className="p-2.5 text-slate-700 dark:text-slate-300">Rp {row.purchasePrice?.toLocaleString()}</td>
                        <td className="p-2.5 pr-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                            {row.status || 'available'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            Batal
          </button>
          <button
            onClick={handleCommitImport}
            disabled={parsedData.length === 0}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
          >
            Import {parsedData.length} Aset ke Sistem
          </button>
        </div>
      </div>
    </div>
  );
};
