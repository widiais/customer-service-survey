'use client';

import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Copy, Check } from 'lucide-react';

interface QRPopupProps {
  isOpen: boolean;
  onClose: () => void;
  qrUrl: string;
  storeName: string;
}

export function QRPopup({ isOpen, onClose, qrUrl, storeName }: QRPopupProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    // Convert SVG to canvas for download
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Set canvas size
    canvas.width = 512;
    canvas.height = 512;
    
    // Create SVG data URL
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      if (ctx) {
        // Fill white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR code
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Download
        const link = document.createElement('a');
        link.download = `qr-code-${storeName.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
      URL.revokeObjectURL(svgUrl);
    };
    
    img.src = svgUrl;
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">
            QR Code - {storeName}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div 
              ref={qrRef}
              className="bg-white p-4 rounded-lg shadow-sm border"
            >
              <QRCodeSVG
                value={qrUrl}
                size={200}
                level="M"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          </div>
          
          {/* URL Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              URL Survey:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={qrUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="px-3"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-600">URL berhasil disalin!</p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              onClick={handleDownload}
              className="flex-1"
              variant="default"
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Tutup
            </Button>
          </div>
          
          {/* Instructions */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
            <p className="font-medium mb-1">Cara Penggunaan:</p>
            <ul className="space-y-1">
              <li>• Scan QR code dengan kamera smartphone</li>
              <li>• Atau bagikan URL untuk akses langsung</li>
              <li>• Customer dapat mengisi survey tanpa login</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}