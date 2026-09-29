import QRCode from 'qrcode';

export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H'
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    return '';
  }
}

// Generate code 128-like clean SVG Barcode representation
export function generateBarcodeSvg(value: string): string {
  // Simple deterministic pattern generator for standard 1D barcode visuals
  let bars = '';
  let x = 10;
  const height = 40;
  
  for (let i = 0; i < value.length; i++) {
    const charCode = value.charCodeAt(i);
    const pattern = [(charCode % 3) + 1, ((charCode >> 1) % 3) + 1, ((charCode >> 2) % 2) + 1, 2];
    
    for (let j = 0; j < pattern.length; j++) {
      const width = pattern[j];
      const isBlack = j % 2 === 0;
      if (isBlack) {
        bars += `<rect x="${x}" y="0" width="${width * 1.5}" height="${height}" fill="#0f172a" />`;
      }
      x += width * 1.5;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x + 10} ${height}" class="w-full h-full max-h-12">${bars}</svg>`;
}
