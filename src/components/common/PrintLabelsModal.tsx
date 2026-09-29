import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Printer, QrCode, CheckSquare, Square } from 'lucide-react';
import { Asset } from '../../types';
import { generateQrCodeDataUrl } from '../../utils/qrBarcode';

interface PrintLabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: Asset[];
}

export const PrintLabelsModal: React.FC<PrintLabelsModalProps> = ({
  isOpen,
  onClose,
  selectedAssets
}) => {
  const { categories, settings } = useApp();
  const [qrMap, setQrMap] = useState<{ [assetId: string]: string }>({});

  useEffect(() => {
    if (isOpen && selectedAssets.length > 0) {
      const loadQrs = async () => {
        const map: { [id: string]: string } = {};
        for (const asset of selectedAssets) {
          const url = await generateQrCodeDataUrl(`ITAMS:${asset.assetTag}:${asset.serialNumber}`);
          map[asset.id] = url;
        }
        setQrMap(map);
      };
      loadQrs();
    }
  }, [isOpen, selectedAssets]);

  if (!isOpen) return null;

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const cardsHtml = selectedAssets
      .map((asset) => {
        const cat = categories.find((c) => c.id === asset.categoryId);
        const qr = qrMap[asset.id] || '';
        return `
          <div class="tag-card">
            <div class="header">
              <div>
                <div class="tag-title">PROPERTY OF IT DEPT</div>
                <div class="company">${settings.companyName}</div>
              </div>
              <div class="cat-badge">${cat?.code || 'IT'}</div>
            </div>
            <div class="body">
              <img src="${qr}" class="qr-code" />
              <div class="info">
                <div class="asset-tag">${asset.assetTag}</div>
                <div class="name">${asset.name}</div>
                <div class="meta">SN: ${asset.serialNumber}</div>
                <div class="meta">${asset.brand} ${asset.model}</div>
              </div>
            </div>
            <div class="footer">DO NOT REMOVE OR TAMPER WITH THIS SECURITY BARCODE</div>
          </div>
        `;
      })
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Bulk Print Asset Tags (${selectedAssets.length} Aset)</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
            .tag-card { border: 2px solid #000; border-radius: 6px; padding: 8px; width: 85mm; height: 50mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; page-break-inside: avoid; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #000; padding-bottom: 4px; }
            .tag-title { font-weight: 900; font-size: 11px; color: #1e3a8a; }
            .company { font-size: 9px; color: #333; }
            .cat-badge { background: #000; color: #fff; padding: 2px 5px; font-size: 9px; font-weight: bold; border-radius: 3px; }
            .body { display: flex; gap: 8px; align-items: center; margin-top: 4px; }
            .qr-code { width: 75px; height: 75px; }
            .info { flex: 1; font-size: 9px; line-height: 1.3; }
            .asset-tag { font-family: monospace; font-weight: 900; font-size: 13px; color: #1d4ed8; }
            .name { font-weight: bold; margin-top: 2px; }
            .meta { font-size: 8.5px; color: #555; }
            .footer { border-top: 1px solid #ccc; font-size: 7px; color: #666; text-align: center; padding-top: 2px; }
          </style>
        </head>
        <body>
          <div class="grid">
            ${cardsHtml}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Cetak Stiker Label Tag Aset Sekaligus ({selectedAssets.length} Aset)
              </h3>
              <p className="text-xs text-slate-500">Pratinjau label QR barcode sebelum dicetak pada kertas stiker / thermal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Labels Preview Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-100/60 dark:bg-slate-950/60">
          {selectedAssets.map((asset) => {
            const cat = categories.find((c) => c.id === asset.categoryId);
            const qr = qrMap[asset.id];
            return (
              <div
                key={asset.id}
                className="bg-white text-slate-900 border-2 border-slate-900 rounded-xl p-4 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-2">
                  <div>
                    <div className="text-[11px] font-black tracking-wider text-blue-900">PROPERTY OF IT DEPT</div>
                    <div className="text-[10px] font-semibold text-slate-600">{settings.companyName}</div>
                  </div>
                  <div className="px-2 py-0.5 text-[10px] font-black bg-slate-900 text-white rounded">
                    {cat?.code || 'IT'}
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  {qr ? (
                    <img src={qr} alt={asset.assetTag} className="w-20 h-20 shrink-0 border border-slate-200 rounded" />
                  ) : (
                    <div className="w-20 h-20 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                      Loading QR...
                    </div>
                  )}

                  <div className="flex-1 text-xs space-y-0.5">
                    <div className="font-mono font-black text-sm text-blue-700">{asset.assetTag}</div>
                    <div className="font-bold text-slate-900 truncate">{asset.name}</div>
                    <div className="text-[11px] text-slate-600 font-mono">SN: {asset.serialNumber}</div>
                    <div className="text-[10px] text-slate-500 truncate">{asset.brand} {asset.model}</div>
                  </div>
                </div>

                <div className="mt-2 pt-1 border-t border-slate-300 text-[8px] text-center text-slate-500 font-semibold">
                  DO NOT REMOVE OR TAMPER WITH THIS SECURITY BARCODE
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Format kompatibel dengan printer thermal 80x50mm, stiker Tom & Jerry, atau kertas A4.
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Tutup
            </button>
            <button
              onClick={handlePrintAll}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak {selectedAssets.length} Label Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
