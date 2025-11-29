import React, { useState, useEffect } from 'react';
import { IconButton } from '~/components/ui/IconButton';

export interface MobileDevice {
  id: string;
  name: string;
  platform: 'ios' | 'android';
  width: number;
  height: number;
  devicePixelRatio: number;
  userAgent: string;
}

export const MOBILE_DEVICES: MobileDevice[] = [
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    platform: 'ios',
    width: 393,
    height: 852,
    devicePixelRatio: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  },
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    platform: 'ios',
    width: 430,
    height: 932,
    devicePixelRatio: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  },
  {
    id: 'iphone-se',
    name: 'iPhone SE',
    platform: 'ios',
    width: 375,
    height: 667,
    devicePixelRatio: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  },
  {
    id: 'ipad-pro',
    name: 'iPad Pro 12.9"',
    platform: 'ios',
    width: 1024,
    height: 1366,
    devicePixelRatio: 2,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  },
  {
    id: 'pixel-8-pro',
    name: 'Pixel 8 Pro',
    platform: 'android',
    width: 412,
    height: 915,
    devicePixelRatio: 2.625,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36',
  },
  {
    id: 'pixel-8',
    name: 'Pixel 8',
    platform: 'android',
    width: 412,
    height: 915,
    devicePixelRatio: 2.625,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36',
  },
  {
    id: 'galaxy-s24',
    name: 'Samsung Galaxy S24',
    platform: 'android',
    width: 360,
    height: 800,
    devicePixelRatio: 3,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36',
  },
];

interface MobilePreviewProps {
  url: string;
  onClose?: () => void;
}

export function MobilePreview({ url, onClose }: MobilePreviewProps) {
  const [selectedDevice, setSelectedDevice] = useState<MobileDevice>(MOBILE_DEVICES[0]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [scale, setScale] = useState(1);
  const [showQR, setShowQR] = useState(false);

  const width = orientation === 'portrait' ? selectedDevice.width : selectedDevice.height;
  const height = orientation === 'portrait' ? selectedDevice.height : selectedDevice.width;

  useEffect(() => {
    // Auto-scale to fit container
    const maxWidth = window.innerWidth - 400;
    const maxHeight = window.innerHeight - 200;
    const scaleX = maxWidth / width;
    const scaleY = maxHeight / height;
    setScale(Math.min(scaleX, scaleY, 1));
  }, [width, height]);

  const toggleOrientation = () => {
    setOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
  };

  const generateQRCode = () => {
    // Generate QR code for the URL
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    return qrUrl;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-bolt-elements-background-depth-1 rounded-lg shadow-2xl max-w-full max-h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-bolt-elements-borderColor">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-bolt-elements-textPrimary">Mobile Preview</h2>

            {/* Device Selector */}
            <select
              value={selectedDevice.id}
              onChange={(e) => {
                const device = MOBILE_DEVICES.find((d) => d.id === e.target.value);

                if (device) {
                  setSelectedDevice(device);
                }
              }}
              className="px-3 py-1.5 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-md text-sm text-bolt-elements-textPrimary"
            >
              {MOBILE_DEVICES.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Orientation Toggle */}
            <IconButton icon="i-ph:device-rotate" title="Rotate Device" onClick={toggleOrientation} />

            {/* QR Code Toggle */}
            <IconButton icon="i-ph:qr-code" title="Show QR Code" onClick={() => setShowQR(!showQR)} />

            {/* Scale Controls */}
            <div className="flex items-center gap-1 px-2 py-1 bg-bolt-elements-background-depth-2 rounded-md">
              <IconButton
                icon="i-ph:minus"
                title="Zoom Out"
                onClick={() => setScale((s) => Math.max(0.25, s - 0.25))}
                size="sm"
              />
              <span className="text-xs text-bolt-elements-textSecondary w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
              <IconButton
                icon="i-ph:plus"
                title="Zoom In"
                onClick={() => setScale((s) => Math.min(2, s + 0.25))}
                size="sm"
              />
            </div>

            {/* Close Button */}
            <IconButton icon="i-ph:x" title="Close" onClick={onClose} />
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
          {showQR ? (
            <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900">Scan to Test on Device</h3>
              <img src={generateQRCode()} alt="QR Code" className="w-48 h-48" />
              <p className="text-sm text-gray-600 max-w-xs text-center">
                Scan this QR code with your mobile device to test the app
              </p>
              <code className="text-xs bg-gray-100 px-3 py-2 rounded break-all max-w-xs">{url}</code>
            </div>
          ) : (
            <div
              className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'center',
              }}
            >
              {/* Device Frame */}
              <div className="absolute inset-0 pointer-events-none z-10">
                {selectedDevice.platform === 'ios' && (
                  <>
                    {/* iOS Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl" />
                    {/* iOS Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-800 rounded-full" />
                  </>
                )}
              </div>

              {/* Preview iframe */}
              <iframe
                src={url}
                className="w-full h-full border-none"
                title="Mobile Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between p-3 border-t border-bolt-elements-borderColor text-xs text-bolt-elements-textSecondary">
          <div className="flex items-center gap-4">
            <span>
              {width} × {height}
            </span>
            <span>{selectedDevice.devicePixelRatio}x DPR</span>
            <span className="capitalize">{selectedDevice.platform}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-bolt-elements-textTertiary">Press ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
