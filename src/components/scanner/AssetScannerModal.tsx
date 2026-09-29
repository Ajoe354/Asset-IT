import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { QrCode, Camera, Upload, Search, X, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const AssetScannerModal: React.FC = () => {
  const { isScannerOpen, setIsScannerOpen, assets, setSelectedAssetForDetail, addToast } = useApp();
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanningEffect, setScanningEffect] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isScannerOpen) {
      startCamera();
    } else {
      stopCamera();
      setManualCode('');
      setCameraError(null);
    }
    return () => {
      stopCamera();
    };
  }, [isScannerOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } else {
        setCameraError('Kamera tidak didukung pada browser ini atau izin dibatasi.');
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Tidak dapat mengakses kamera. Anda dapat menginput kode aset manual atau memilih foto barcode.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleLookup = (codeToSearch: string) => {
    const clean = codeToSearch.trim().toLowerCase();
    if (!clean) return;

    // Search by Asset Tag, Serial Number, or ID
    const found = assets.find(
      (a) =>
        a.assetTag.toLowerCase() === clean ||
        a.serialNumber.toLowerCase() === clean ||
        a.id.toLowerCase() === clean ||
        a.name.toLowerCase().includes(clean)
    );

    if (found) {
      addToast('success', 'Aset Terdeteksi!', `${found.name} (${found.assetTag})`);
      setIsScannerOpen(false);
      setSelectedAssetForDetail(found);
    } else {
      addToast('error', 'Aset Tidak Ditemukan', `Tidak ada aset dengan kode "${codeToSearch}"`);
    }
  };

  // Quick simulation trigger for testing
  const handleSimulateScan = (assetTag: string) => {
    handleLookup(assetTag);
  };

  if (!isScannerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        id="asset-scanner-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Scan Barcode / QR Code Aset</h3>
              <p className="text-xs text-slate-500">Arahkan kamera ke stiker QR tag aset IT</p>
            </div>
          </div>
          <button
            onClick={() => setIsScannerOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Camera Section */}
        <div className="p-6 space-y-4">
          <div className="relative w-full aspect-4/3 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 text-slate-400">
                <Camera className="w-12 h-12 mx-auto mb-2 text-slate-600 opacity-60" />
                <p className="text-sm font-medium text-slate-300">Scanner Viewfinder Siap</p>
                {cameraError && (
                  <p className="text-xs text-amber-400 mt-1 max-w-xs mx-auto">{cameraError}</p>
                )}
              </div>
            )}

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
              <div className="w-48 h-48 border-2 border-blue-500/80 rounded-2xl relative">
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />

                {/* Animated Laser Scanning Line */}
                <motion.div
                  animate={{ y: [0, 180, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                  className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                />
              </div>
            </div>
          </div>

          {/* Quick Demo Scan Shortcuts */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center justify-between">
              <span>Simulasi Cepat (Klik untuk uji coba scan stiker aset):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {assets.slice(0, 3).map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleSimulateScan(a.assetTag)}
                  className="text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-mono font-medium">{a.assetTag}</span>
                  <span className="text-slate-400 truncate max-w-[80px]">({a.name})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Code Input Form */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Atau Masukkan Asset Tag / Serial Number Manual:
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookup(manualCode);
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Contoh: AST-2024-001 atau C02G89A4MD6R"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
              >
                Cari Aset
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
