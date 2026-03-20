import React, { useState, useEffect } from 'react';
import { Download, Copy, QrCode, Palette, Image as ImageIcon, Sliders, FileType, Maximize, Check, RefreshCw, SlidersHorizontal, ChevronUp } from 'lucide-react';
import Button from './Button';
import ActionConfirmModal from './Modal/ActionConfirmModal';
import { cn } from '@/lib/utils';
import { openAuthModal } from '@/store/slices/auth.slice';
import { useAppDispatch } from '@/store/redux.hooks';

interface QRDisplayProps {
    type: 'public' | 'private';
    qrImageUrl?: string | null;
    qrData?: string | null;
    transactionRef?: string;
    onDownload?: () => void;
    onCopyLink?: () => void;
}

const QRDisplay: React.FC<QRDisplayProps> = ({ type, qrImageUrl, transactionRef, onDownload, onCopyLink }) => {
    const dispatch = useAppDispatch();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isDownloadConfirmOpen, setIsDownloadConfirmOpen] = useState(false);
    const [showCustom, setShowCustom] = useState(false);

    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Reset states when QR changes
    useEffect(() => {
        setIsDownloaded(false);
        setIsCopied(false);
        setShowCustom(false);
    }, [transactionRef, qrImageUrl]);

    // Customization state (for private mode)
    const [customParams, setCustomParams] = useState({
        bgColor: '#ffffff',
        pointColor: '#000000',
        eyeColor: '#000000',
        borderColor: '#ffffff',
        eyeBorder: 0,
        logo: null as File | null,
        pattern: 'default',
        fileSize: 500,
        format: 'png'
    });

    const handleCustomClick = () => {
        if (type === 'public') {
            setIsLoginModalOpen(true);
        } else {
            setShowCustom(!showCustom);
        }
    };

    const handleDownloadClick = () => {
        if (isDownloaded) {
            setIsDownloadConfirmOpen(true);
        } else {
            if (onDownload) {
                onDownload();
                setIsDownloaded(true);
            }
        }
    };

    const handleCopyClick = () => {
        if (onCopyLink) {
            onCopyLink();
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 10000);
        }
    };

    return (
        <div className="flex flex-col gap-md w-full h-full">
            <div className="card p-lg flex flex-col items-center gap-0 flex-1 min-h-[300px] relative overflow-hidden shadow-lg animate-in fade-in zoom-in duration-500">

                {/* Middle: QR Code */}
                <div className="flex-1 flex flex-col items-center justify-center gap-md py-lg w-full">
                    <div className="w-56 h-56 bg-surface-muted rounded-3xl flex items-center justify-center border border-border-strong border-dashed overflow-hidden relative shadow-inner group hover:border-primary/40 transition-all duration-500">
                        {qrImageUrl ? (
                            <img
                                src={qrImageUrl}
                                alt="Mã QR thanh toán"
                                className="w-full h-full object-contain animate-in fade-in zoom-in duration-700 hover:scale-[1.05] transition-transform"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-sm text-foreground-muted animate-in fade-in duration-500">
                                <QrCode className="w-16 h-16 opacity-20" />
                                <p className="text-xs font-medium uppercase tracking-widest opacity-40">Chờ tạo mã QR</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer: always render for layout stability */}
                <div className={cn(
                    "w-full mt-auto border-t border-border/40 transition-all duration-500 flex flex-col gap-sm pt-md",
                    qrImageUrl ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none min-h-[140px]"
                )}>

                    {/* Private Customization Panel — inline above buttons */}
                    {type === 'private' && showCustom && qrImageUrl && (
                        <div className="w-full grid grid-cols-3 gap-md p-md bg-surface-muted/40 rounded-xl border border-border/50 animate-in slide-in-from-bottom-4 duration-500 mb-sm">
                            {/* Pattern / Style */}
                            <div className="flex flex-col gap-xs">
                                <label htmlFor="qr-pattern" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-xs">
                                    <Sliders className="w-3.5 h-3.5" /> Mẫu
                                </label>
                                <select
                                    id="qr-pattern"
                                    name="pattern"
                                    className="select text-xs h-9 bg-surface border-border/60 rounded-md px-2 hover:border-primary/40 transition-colors"
                                    value={customParams.pattern}
                                    onChange={(e) => setCustomParams({ ...customParams, pattern: e.target.value })}
                                >
                                    <option value="default">Square</option>
                                    <option value="rounded">Rounded</option>
                                    <option value="dots">Dots</option>
                                </select>
                            </div>
                            {/* Size */}
                            <div className="flex flex-col gap-xs">
                                <label htmlFor="qr-size" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-xs">
                                    <Maximize className="w-3.5 h-3.5" /> Size (px)
                                </label>
                                <input
                                    id="qr-size"
                                    name="fileSize"
                                    type="number"
                                    className="input h-9 text-xs"
                                    value={customParams.fileSize}
                                    onChange={(e) => setCustomParams({ ...customParams, fileSize: parseInt(e.target.value) })}
                                    min={100}
                                    max={2000}
                                />
                            </div>
                            {/* Format */}
                            <div className="flex flex-col gap-xs">
                                <label htmlFor="qr-format" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-xs">
                                    <FileType className="w-3.5 h-3.5" /> Định dạng
                                </label>
                                <select
                                    id="qr-format"
                                    name="format"
                                    className="select text-xs h-9 bg-surface border-border/60 rounded-md px-2 hover:border-primary/40 transition-colors"
                                    value={customParams.format}
                                    onChange={(e) => setCustomParams({ ...customParams, format: e.target.value })}
                                >
                                    <option value="png">PNG</option>
                                    <option value="svg">SVG</option>
                                    <option value="jpg">JPG</option>
                                </select>
                            </div>
                            {/* Colors row */}
                            <div className="flex flex-col gap-xs">
                                <label htmlFor="qr-bg-color" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-xs">
                                    <Palette className="w-3.5 h-3.5" /> Màu nền
                                </label>
                                <div className="flex items-center gap-sm">
                                    <input
                                        id="qr-bg-color"
                                        type="color"
                                        value={customParams.bgColor}
                                        onChange={(e) => setCustomParams({ ...customParams, bgColor: e.target.value })}
                                        className="w-8 h-8 rounded-md cursor-pointer border-0 p-0 overflow-hidden shadow-sm"
                                    />
                                    <span className="text-[10px] font-mono uppercase text-foreground-muted">{customParams.bgColor}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-xs">
                                <label htmlFor="qr-point-color" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-xs">
                                    <Palette className="w-3.5 h-3.5" /> Màu điểm
                                </label>
                                <div className="flex items-center gap-sm">
                                    <input
                                        id="qr-point-color"
                                        type="color"
                                        value={customParams.pointColor}
                                        onChange={(e) => setCustomParams({ ...customParams, pointColor: e.target.value })}
                                        className="w-8 h-8 rounded-md cursor-pointer border-0 p-0 overflow-hidden shadow-sm"
                                    />
                                    <span className="text-[10px] font-mono uppercase text-foreground-muted">{customParams.pointColor}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-xs">
                                <label htmlFor="qr-logo" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-xs">
                                    <ImageIcon className="w-3.5 h-3.5" /> Logo
                                </label>
                                <input
                                    id="qr-logo"
                                    type="file"
                                    className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
                                    accept="image/*"
                                    onChange={(e) => setCustomParams({ ...customParams, logo: e.target.files?.[0] || null })}
                                />
                            </div>
                            {/* <div className="col-span-3 mt-xs">
                                <Button variant="primary" className="w-full text-xs h-9 font-bold tracking-wider hover:scale-[1.01] transition-transform">LƯU & TẢI LẠI</Button>
                            </div> */}
                        </div>
                    )}

                    {/* Custom toggle button — small, right-aligned, above action buttons */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleCustomClick}
                            className={cn(
                                "flex items-center gap-2 px-md py-sm rounded-full text-xs font-bold border transition-all duration-300 shadow-sm",
                                showCustom
                                    ? "bg-primary/10 border-primary/40 text-primary"
                                    : "bg-surface-muted border-border/60 text-foreground-secondary hover:border-primary/40 hover:text-primary hover:scale-[1.02]"
                            )}
                            aria-label={showCustom ? "Thu gọn tùy chỉnh" : "Mở tùy chỉnh mã QR"}
                        >
                            {showCustom
                                ? <><ChevronUp className="w-3.5 h-3.5" /> Thu gọn</>
                                : <><SlidersHorizontal className="w-3.5 h-3.5" /> Tùy chỉnh QR theo phong cách của bạn</>
                            }
                        </button>
                    </div>

                    {/* Action Buttons: Download (2/3) + Copy (1/3) */}
                    <div className="flex gap-md w-full">
                        <Button
                            variant="primary"
                            className="w-2/3 flex gap-md items-center justify-center py-sm transition-all duration-300 hover:scale-[1.01]"
                            onClick={handleDownloadClick}
                        >
                            {isDownloaded ? <RefreshCw className="w-4 h-4 animate-spin-slow" /> : <Download className="w-4 h-4" />}
                            <span className="font-bold">{isDownloaded ? "TẢI LẠI" : "TẢI XUỐNG"}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-1/3 flex gap-sm items-center justify-center py-sm border transition-all duration-300 hover:bg-surface-muted",
                                isCopied ? "border-success bg-success/10 text-success" : "border-border hover:border-primary/40"
                            )}
                            onClick={handleCopyClick}
                            aria-label={isCopied ? "Đã copy liên kết" : "Copy liên kết mã QR"}
                        >
                            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span className="font-bold">{isCopied ? "COPIED" : "COPY"}</span>
                        </Button>
                    </div>
                </div>
            </div>

            <ActionConfirmModal
                isOpen={isDownloadConfirmOpen}
                onClose={() => setIsDownloadConfirmOpen(false)}
                onConfirm={() => {
                    if (onDownload) onDownload();
                    setIsDownloadConfirmOpen(false);
                }}
                title="Xác nhận tải lại"
                description="Bạn đã tải xuống mã QR này rồi. Bạn có muốn tải lại không?"
                confirmText="Tải lại"
                cancelText="Hủy"
            />

            <ActionConfirmModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onConfirm={() => {
                    setIsLoginModalOpen(false);
                    setShowCustom(false);
                    dispatch(openAuthModal());
                }}
                title="Yêu cầu đăng nhập"
                description="Vui lòng đăng nhập để có thể sử dụng tính năng tùy chỉnh mã QR của riêng bạn."
                confirmText="Đồng ý"
                cancelText="Hủy"
            />
        </div>
    );
};

export default QRDisplay;
