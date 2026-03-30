import React, { useState, useEffect, useRef } from 'react';
import { Download, Copy, Palette, Image as ImageIcon, Sliders, Maximize, Check, RefreshCw, SlidersHorizontal, ChevronUp, Trash2, Upload } from 'lucide-react';
import Button from './Button';
import ActionConfirmModal from './Modal/ActionConfirmModal';
import { cn } from '@/lib/utils';
import { openAuthModal } from '@/store/slices/auth.slice';
import { useAppDispatch } from '@/store/redux.hooks';
import QRCodeStyling, { type DotType, type CornerSquareType } from "qr-code-styling";
import { qrStyleLibApi } from "@/services/qrStyleLib-api.service";
import type { QrStyleLibraryRes } from "@/models/entity.model";
import { QRStyleType } from "@/models/enum";
import { toast } from "react-toastify";
import Logo from '@/components/UICustoms/Logo';

interface QRDisplayProps {
    type: 'public' | 'private';
    qrImageUrl?: string | null;
    qrData?: string | null;
    styleJson?: string | null;
    transactionRef?: string;
    onDownload?: () => void;
    onCopyLink?: () => void;
    isWide?: boolean;
}

interface StyleConfig {
    bgColor: string;
    pointColor: string;
    eyeColor: string;
    borderColor: string;
    pattern: string;
    fileSize: number;
    logo: string | null;
}

const DEFAULT_STYLE: StyleConfig = {
    bgColor: "#ffffff",
    pointColor: "#000000",
    eyeColor: "#000000",
    borderColor: "#ffffff",
    pattern: "default",
    fileSize: 512,
    logo: null
};

function parseStyleJson(json: string): StyleConfig {
    try {
        const parsed = JSON.parse(json);
        return { ...DEFAULT_STYLE, ...parsed };
    } catch {
        return { ...DEFAULT_STYLE };
    }
}

const patternToDotType = (p: string): DotType => {
    if (p === "dots") return "dots";
    if (p === "rounded") return "rounded";
    return "square";
};

const patternToEyeType = (p: string): CornerSquareType => {
    if (p === "dots") return "dot";
    if (p === "rounded") return "extra-rounded";
    return "square";
};

const QRDisplay: React.FC<QRDisplayProps> = ({ type, qrImageUrl, qrData, styleJson, transactionRef, onDownload, onCopyLink, isWide = false }) => {
    const dispatch = useAppDispatch();
    const [isDownloadConfirmOpen, setIsDownloadConfirmOpen] = useState(false);
    const [showCustom, setShowCustom] = useState(false);

    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const qrPreviewRef = useRef<HTMLDivElement>(null);
    const qrCodeRef = useRef<QRCodeStyling | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const [qrStyles, setQrStyles] = useState<QrStyleLibraryRes[]>([]);
    const [selectedStyleId, setSelectedStyleId] = useState<string>("");

    // Customization state
    const [format, setFormat] = useState('png');
    const [style, setStyle] = useState<StyleConfig>({ ...DEFAULT_STYLE });

    useEffect(() => {
        setIsDownloaded(false);
        setIsCopied(false);
        setShowCustom(false);
    }, [transactionRef, qrData, qrImageUrl]);

    useEffect(() => {
        if (styleJson) {
            setStyle(parseStyleJson(styleJson));
            const matched = qrStyles.find(s => s.styleJson === styleJson);
            setSelectedStyleId(matched ? matched.id : "");
        } else {
            const userDefault = qrStyles.find(s => s.type === QRStyleType.USER && s.isDefault);
            const sysDefault = qrStyles.find(s => s.type === QRStyleType.SYSTEM && s.isDefault);

            if (userDefault) {
                setStyle(parseStyleJson(userDefault.styleJson));
                setSelectedStyleId(userDefault.id);
            } else if (sysDefault) {
                setStyle(parseStyleJson(sysDefault.styleJson));
                setSelectedStyleId(sysDefault.id);
            } else {
                setStyle({ ...DEFAULT_STYLE });
                setSelectedStyleId("");
            }
        }
    }, [styleJson, qrStyles]);

    useEffect(() => {
        if (type === 'private') {
            const fetchStyles = async () => {
                try {
                    const [sysRes, usrRes] = await Promise.all([
                        qrStyleLibApi.getAll({ isActive: true, type: QRStyleType.SYSTEM }),
                        qrStyleLibApi.getAll({ isActive: true, type: QRStyleType.USER })
                    ]);
                    const allStyles = [...(sysRes || []), ...(usrRes || [])];
                    setQrStyles(allStyles);
                } catch (error) {
                    console.error("Error fetching QR styles:", error);
                }
            };
            fetchStyles();
        }
    }, [type]);

    useEffect(() => {
        if (!qrData && !qrImageUrl) return;

        const opts = {
            width: style.fileSize,
            height: style.fileSize,
            data: qrData || qrImageUrl || "https://cocoqr.vn",
            dotsOptions: { color: style.pointColor, type: patternToDotType(style.pattern) },
            backgroundOptions: { color: style.bgColor },
            cornersSquareOptions: { color: style.eyeColor, type: patternToEyeType(style.pattern) },
            cornersDotOptions: { color: style.eyeColor },
            imageOptions: { crossOrigin: "anonymous" as const, margin: 4, hideBackgroundDots: true },
            image: style.logo || "",
            qrOptions: { errorCorrectionLevel: "H" as const },
        };

        if (!qrCodeRef.current) {
            qrCodeRef.current = new QRCodeStyling(opts);
            if (qrPreviewRef.current) {
                qrPreviewRef.current.innerHTML = "";
                qrCodeRef.current.append(qrPreviewRef.current);
            }
        } else {
            qrCodeRef.current.update(opts);
            if (qrPreviewRef.current && !qrPreviewRef.current.hasChildNodes()) {
                qrCodeRef.current.append(qrPreviewRef.current);
            }
        }
    }, [style, qrData, qrImageUrl]);

    const updateStyle = (key: keyof StyleConfig, value: any) => {
        setStyle(prev => ({ ...prev, [key]: value }));
    };

    const handleCustomClick = () => {
        if (type === 'public') {
            dispatch(openAuthModal());
        } else {
            setShowCustom(!showCustom);
        }
    };

    const executeDownload = () => {
        if (qrCodeRef.current && (qrData || qrImageUrl)) {
            qrCodeRef.current.download({ name: `QR_${transactionRef ?? 'code'}`, extension: format as any });
            setIsDownloaded(true);
            if (onDownload) onDownload();
        } else if (onDownload) {
            onDownload(); // fallback
            setIsDownloaded(true);
        }
    };

    const handleDownloadClick = () => {
        if (isDownloaded) {
            setIsDownloadConfirmOpen(true);
        } else {
            executeDownload();
        }
    };

    const handleCopyClick = async () => {
        try {
            if (qrCodeRef.current && (qrData || qrImageUrl)) {
                const blob = await qrCodeRef.current.getRawData("png");
                if (blob) {
                    await navigator.clipboard.write([
                        new ClipboardItem({ [blob.type]: blob })
                    ]);
                }
            } else if (onCopyLink) {
                onCopyLink(); // fallback
            }
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        } catch (error) {
            console.error("Failed to copy image:", error);
            toast?.error("Không thể copy hình ảnh.");
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        }
    };

    const isLayoutTwoColumns = isWide && type === 'private' && showCustom && (qrData || qrImageUrl);

    return (
        <div className="flex flex-col w-full h-full">
            <div className="card flex flex-col p-sm sm:p-md relative overflow-hidden shadow-lg animate-in fade-in zoom-in duration-500 flex-1 min-h-[300px]">

                {/* Upper Content: QR Code & Customization Panel */}
                <div className={cn(
                    "flex flex-1 min-h-0",
                    isLayoutTwoColumns ? "flex-row gap-lg mb-sm" : "flex-col gap-0"
                )}>

                    {/* Left/Top: QR Code */}
                    <div className={cn(
                        "flex flex-col items-center justify-center py-sm",
                        isLayoutTwoColumns ? "flex-[40%] min-w-[280px]" : "flex-1 w-full gap-sm md:flex-[50%]"
                    )}>
                        <div
                            className="w-56 h-56 lg:w-48 lg:h-48 xl:w-56 xl:h-56 bg-surface-muted rounded-3xl flex items-center justify-center border border-border-strong border-dashed overflow-hidden relative shadow-inner group hover:border-primary/40 transition-all duration-500 shrink-0"
                            style={{ backgroundColor: style.borderColor, padding: 8 }}
                        >
                            {qrData || qrImageUrl ? (
                                <div
                                    ref={qrPreviewRef}
                                    className="w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-700 hover:scale-[1.05] transition-transform [&>canvas]:max-w-full [&>svg]:max-w-full [&>canvas]:max-h-full [&>svg]:max-h-full"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-sm text-foreground-muted animate-in fade-in duration-500">
                                    <Logo className='w-20 h-20' variant='dark' />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right/Bottom: Customization panel & Buttons */}
                    <div className={cn(
                        "transition-all duration-500 flex flex-col justify-end",
                        isLayoutTwoColumns ? "flex-[60%] border-l border-border/40 pl-lg pb-sm" : "w-full border-t border-border/40 pt-sm mt-auto",
                        (qrData || qrImageUrl) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                    )}>

                        {/* Private Customization Panel */}
                        {type === 'private' && showCustom && (qrData || qrImageUrl) && (
                            <div className="w-full grid grid-cols-3 gap-sm p-sm bg-surface-muted/40 rounded-xl border border-border/50 animate-in slide-in-from-bottom-4 duration-500 mb-xs mt-auto">

                                <div className="col-span-3 flex flex-col gap-xs mb-xs">
                                    <label htmlFor="my-style" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-xs">
                                        <Sliders className="w-3.5 h-3.5" /> Phong cách của tôi (My Style)
                                    </label>
                                    <select
                                        id="my-style"
                                        className="select text-xs h-9 bg-surface border-border/60 rounded-md px-2 hover:border-primary/40 transition-colors"
                                        value={selectedStyleId}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            setSelectedStyleId(id);
                                            const found = qrStyles.find(s => s.id === id);
                                            if (found && found.styleJson) {
                                                setStyle(parseStyleJson(found.styleJson));
                                            }
                                        }}
                                    >
                                        <option value="">-- Tùy chỉnh tự do --</option>
                                        {qrStyles.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} {s.type === QRStyleType.SYSTEM ? "(Hệ thống)" : "(Của tôi)"}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Row 2: Pattern, Size, Logo */}
                                {/* Pattern */}
                                <div className="flex flex-col gap-xs">
                                    <label htmlFor="qr-pattern" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-xs">
                                        <Sliders className="w-3.5 h-3.5" /> Mẫu
                                    </label>
                                    <select
                                        id="qr-pattern"
                                        name="pattern"
                                        className="select text-xs h-9 bg-surface border-border/60 rounded-md px-2 hover:border-primary/40 transition-colors"
                                        value={style.pattern}
                                        onChange={(e) => updateStyle("pattern", e.target.value)}
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
                                    <select
                                        id="qr-size"
                                        name="fileSize"
                                        className="select text-xs h-9 bg-surface border-border/60 rounded-md px-2 hover:border-primary/40 transition-colors"
                                        value={style.fileSize}
                                        onChange={(e) => updateStyle("fileSize", parseInt(e.target.value))}
                                    >
                                        <option value={256}>256</option>
                                        <option value={512}>512</option>
                                        <option value={1024}>1024</option>
                                        <option value={2048}>2048</option>
                                    </select>
                                </div>
                                {/* Logo */}
                                <div className="flex flex-col gap-xs">
                                    <label htmlFor="qr-logo" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-xs">
                                        <ImageIcon className="w-3.5 h-3.5" /> Logo
                                    </label>
                                    {style.logo ? (
                                        <div className="flex items-center gap-sm">
                                            <img src={style.logo} alt="logo" className="w-8 h-8 rounded object-contain border border-border bg-white" />
                                            <button
                                                type="button"
                                                onClick={() => { updateStyle("logo", null); if (logoInputRef.current) logoInputRef.current.value = ""; }}
                                                className="p-1 rounded text-danger hover:bg-danger/10 transition-colors"
                                                aria-label="Xóa logo"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => logoInputRef.current?.click()}
                                            className="flex items-center justify-center gap-xs text-[10px] h-9 w-full bg-surface border border-border/60 rounded-md hover:border-primary/40 text-foreground-muted hover:text-primary transition-colors"
                                        >
                                            <Upload className="w-3.5 h-3.5" /> Tải lên
                                        </button>
                                    )}
                                    <input
                                        ref={logoInputRef}
                                        id="qr-logo"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => updateStyle("logo", ev.target?.result as string);
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </div>

                                {/* Row 3: Colors */}
                                {/* Bg Color */}
                                <div className="flex flex-col gap-xs">
                                    <label htmlFor="qr-bg-color" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-xs">
                                        <Palette className="w-3.5 h-3.5" /> Màu nền
                                    </label>
                                    <div className="flex items-center gap-sm">
                                        <input
                                            id="qr-bg-color"
                                            type="color"
                                            value={style.bgColor}
                                            onChange={(e) => updateStyle("bgColor", e.target.value)}
                                            className="w-8 h-8 rounded-md cursor-pointer border-0 p-0 overflow-hidden shadow-sm shrink-0"
                                        />
                                        <span className="text-[10px] font-mono uppercase text-foreground-muted">{style.bgColor}</span>
                                    </div>
                                </div>
                                {/* Point Color */}
                                <div className="flex flex-col gap-xs">
                                    <label htmlFor="qr-point-color" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-xs">
                                        <Palette className="w-3.5 h-3.5" /> Màu điểm
                                    </label>
                                    <div className="flex items-center gap-sm">
                                        <input
                                            id="qr-point-color"
                                            type="color"
                                            value={style.pointColor}
                                            onChange={(e) => updateStyle("pointColor", e.target.value)}
                                            className="w-8 h-8 rounded-md cursor-pointer border-0 p-0 overflow-hidden shadow-sm shrink-0"
                                        />
                                        <span className="text-[10px] font-mono uppercase text-foreground-muted">{style.pointColor}</span>
                                    </div>
                                </div>
                                {/* Eye Color */}
                                <div className="flex flex-col gap-xs">
                                    <label htmlFor="qr-eye-color" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-xs">
                                        <Palette className="w-3.5 h-3.5" /> Màu mắt
                                    </label>
                                    <div className="flex items-center gap-sm">
                                        <input
                                            id="qr-eye-color"
                                            type="color"
                                            value={style.eyeColor}
                                            onChange={(e) => updateStyle("eyeColor", e.target.value)}
                                            className="w-8 h-8 rounded-md cursor-pointer border-0 p-0 overflow-hidden shadow-sm shrink-0"
                                        />
                                        <span className="text-[10px] font-mono uppercase text-foreground-muted">{style.eyeColor}</span>
                                    </div>
                                </div>

                                {/* Row 4: Border Color */}
                                {/* Border Color */}
                                <div className="flex flex-col gap-xs">
                                    <label htmlFor="qr-border-color" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-xs">
                                        <Palette className="w-3.5 h-3.5" /> Màu viền
                                    </label>
                                    <div className="flex items-center gap-sm">
                                        <input
                                            id="qr-border-color"
                                            type="color"
                                            value={style.borderColor}
                                            onChange={(e) => updateStyle("borderColor", e.target.value)}
                                            className="w-8 h-8 rounded-md cursor-pointer border-0 p-0 overflow-hidden shadow-sm shrink-0"
                                        />
                                        <span className="text-[10px] font-mono uppercase text-foreground-muted">{style.borderColor}</span>
                                    </div>
                                </div>

                            </div>
                        )}

                        {/* Custom toggle button */}
                        <div className="flex justify-end shrink-0">
                            <button
                                onClick={handleCustomClick}
                                className={cn(
                                    "flex items-center gap-1.5 px-sm py-1.5 rounded-full text-[11px] font-bold border transition-all duration-300 shadow-sm",
                                    showCustom
                                        ? "bg-primary/10 border-primary/40 text-primary"
                                        : "bg-surface-muted border-border/60 text-foreground-secondary hover:border-primary/40 hover:text-primary hover:scale-[1.02]"
                                )}
                                disabled={!qrData && !qrImageUrl}
                                aria-label={showCustom ? "Thu gọn tùy chỉnh" : "Mở tùy chỉnh mã QR"}
                            >
                                {showCustom
                                    ? <><ChevronUp className="w-3.5 h-3.5" /> Thu gọn</>
                                    : <><SlidersHorizontal className="w-3.5 h-3.5" /> Tùy chỉnh QR theo phong cách của bạn</>
                                }
                            </button>
                        </div>

                    </div>
                </div>

                {/* Footer: Action Buttons: Download + Copy ALWAYS FULL WIDTH */}
                <div className={cn(
                    "w-full border-t border-border/40 pt-sm sm:pt-md mt-auto shrink-0 transition-opacity duration-500",
                    (qrData || qrImageUrl) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none hidden"
                )}>
                    <div className="flex gap-sm w-full shrink-0">
                        <select
                            className="bg-primary/5 text-primary font-bold text-xs px-1 sm:px-2 rounded-lg border border-primary/20 outline-none cursor-pointer hover:bg-primary/10 transition-colors h-10 w-20 sm:w-24 text-center shrink-0"
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                            disabled={!qrData && !qrImageUrl}
                            title="Chọn định dạng tải xuống"
                        >
                            <option value="png">PNG</option>
                            <option value="svg">SVG</option>
                            <option value="jpeg">JPG</option>
                            <option value="webp">WEBP</option>
                        </select>
                        <Button
                            variant="primary"
                            className="flex-1 flex gap-sm items-center justify-center transition-all duration-300 hover:scale-[1.01] h-10"
                            onClick={handleDownloadClick}
                            disabled={!qrData && !qrImageUrl}
                        >
                            {isDownloaded ? <RefreshCw className="w-4 h-4 animate-spin-slow shrink-0" /> : <Download className="w-4 h-4 shrink-0" />}
                            <span className="font-bold whitespace-nowrap text-xs sm:text-sm">{isDownloaded ? "TẢI LẠI" : "TẢI XUỐNG"}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            className={cn(
                                "flex gap-sm items-center justify-center px-2 sm:px-4 border transition-all duration-300 hover:bg-surface-muted shrink-0 h-10",
                                isCopied ? "border-success bg-success/10 text-success" : "border-border hover:border-primary/40"
                            )}
                            onClick={handleCopyClick}
                            disabled={!qrData && !qrImageUrl}
                            aria-label={isCopied ? "Đã copy liên kết" : "Copy liên kết mã QR"}
                        >
                            {isCopied ? <Check className="w-4 h-4 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
                            <span className="font-bold hidden md:inline text-xs sm:text-sm">{isCopied ? "COPIED" : "COPY"}</span>
                        </Button>
                    </div>
                </div>

            </div>

            <ActionConfirmModal
                isOpen={isDownloadConfirmOpen}
                onClose={() => setIsDownloadConfirmOpen(false)}
                onConfirm={() => {
                    executeDownload();
                    setIsDownloadConfirmOpen(false);
                }}
                title="Xác nhận tải lại"
                description="Bạn đã tải xuống mã QR này rồi. Bạn có muốn tải lại không?"
                confirmText="Tải lại"
                cancelText="Hủy"
            />

        </div>
    );
};

export default QRDisplay;
