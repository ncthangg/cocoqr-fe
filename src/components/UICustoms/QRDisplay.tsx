import React from 'react';
import { Download, Copy, QrCode } from 'lucide-react';
import Button from './Button';

interface QRDisplayProps {
    qrImageUrl?: string | null;
    transactionRef?: string;
    onDownload?: () => void;
    onCopyLink?: () => void;
}

const QRDisplay: React.FC<QRDisplayProps> = ({ qrImageUrl, transactionRef, onDownload, onCopyLink }) => {
    return (
        <div className="card p-6 flex flex-row items-center gap-6 flex-1 min-h-[200px]">
            {/* Left side: QR Code (4/5 width) */}
            <div className="w-4/5 flex flex-col items-center justify-center gap-2">
                <div className="w-48 h-48 bg-surface-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border overflow-hidden">
                    {qrImageUrl ? (
                        <img src={qrImageUrl} alt="QR Code" className="w-full h-full object-contain" />
                    ) : (
                        <QrCode className="w-16 h-16 text-text-disabled" />
                    )}
                </div>
                {transactionRef && (
                    <p className="text-xs text-text-secondary font-mono truncate max-w-[180px]" title={transactionRef}>
                        Ref: {transactionRef}
                    </p>
                )}
            </div>

            {/* Right side: Buttons (1/5 width) */}
            <div className="w-1/5 flex flex-col gap-4">
                <Button
                    className="w-full flex gap-2 items-center justify-center"
                    bgColor="bg-surface-muted"
                    textColor="text-text-primary"
                    hoverColor="hover:bg-border"
                    onClick={onDownload}
                    disabled={!qrImageUrl}
                >
                    <Download className="w-4 h-4" />
                    Tải xuống
                </Button>
                <Button
                    className="w-full flex gap-2 items-center justify-center"
                    bgColor="bg-surface-muted"
                    textColor="text-text-primary"
                    hoverColor="hover:bg-border"
                    onClick={onCopyLink}
                    disabled={!qrImageUrl}
                >
                    <Copy className="w-4 h-4" />
                    Copy Link
                </Button>
            </div>
        </div>
    );
};

export default QRDisplay;
