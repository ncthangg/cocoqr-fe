import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import ActionConfirmModal from '../Modal/ActionConfirmModal';
import { cn } from '@/lib/utils';
import QRCodeStyling from "qr-code-styling";
import { qrStyleLibApi } from "@/services/qrStyleLib-api.service";
import type { QrStyleLibraryRes } from "@/models/entity.model";
import { QRStyleType, QRType } from "@/models/enum";
import { toast } from "react-toastify";

// Sub-components & Types
import {
    type QRDisplayProps, type StyleConfig, DEFAULT_STYLE, type AnimationState,
    parseStyleJson, patternToDotType, patternToEyeType
} from './types';
import QRPreview from './QRPreview';
import QRStyleSummary from './QRStyleSummary';
import QRFooterActions from './QRFooterActions';
import QRCustomizationModal from './QRCustomizationModal';

const QRDisplay: React.FC<QRDisplayProps> = ({
    type, qrImageUrl, qrData, styleJson, transactionRef,
    onDownload, onCopyLink, isWide = false, shouldFetchStyles = false,
    className
}) => {
    //#region States & Refs
    const [isDownloadConfirmOpen, setIsDownloadConfirmOpen] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [showCustom, setShowCustom] = useState(false);

    const qrPreviewRef = useRef<HTMLDivElement>(null);
    const modalQrPreviewRef = useRef<HTMLDivElement>(null);
    const originalContainerRef = useRef<HTMLDivElement>(null);
    const qrCodeRef = useRef<QRCodeStyling | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const hasFetchedStyles = useRef(false);
    const defaultStyleApplied = useRef(false);

    const [qrStyles, setQrStyles] = useState<QrStyleLibraryRes[]>([]);
    const [selectedStyleId, setSelectedStyleId] = useState<string>("");
    const [style, setStyle] = useState<StyleConfig>({ ...DEFAULT_STYLE });

    const [animState, setAnimState] = useState<AnimationState>('closed');
    const [modalCoords, setModalCoords] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

    const [format, setFormat] = useState('png');
    const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false);
    const formatMenuRef = useRef<HTMLDivElement>(null);

    const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
    const sizeMenuRef = useRef<HTMLDivElement>(null);
    //#endregion

    //#region Logic & Handlers
    const isDefaultStyle = useMemo(() => {
        return style.bgColor === DEFAULT_STYLE.bgColor &&
            style.pointColor === DEFAULT_STYLE.pointColor &&
            style.eyeColor === DEFAULT_STYLE.eyeColor &&
            style.borderColor === DEFAULT_STYLE.borderColor &&
            style.pattern === DEFAULT_STYLE.pattern &&
            style.logo === null;
    }, [style]);

    const fetchStyles = useCallback(async () => {
        if (hasFetchedStyles.current) return;
        try {
            const reqType = type === QRType.PUBLIC ? QRStyleType.SYSTEM : null;
            const res = await qrStyleLibApi.getAll({ isActive: true, type: reqType });
            if (res) {
                setQrStyles(res);
                hasFetchedStyles.current = true;
            }
        } catch (error) {
            console.error("Error fetching QR styles:", error);
        }
    }, [type]);

    const handleCustomClick = () => {
        if (animState === 'closed') {
            fetchStyles();
            if (originalContainerRef.current) {
                const rect = originalContainerRef.current.getBoundingClientRect();
                setModalCoords({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
            }
            setShowCustom(true);
            setAnimState('opening');
            setTimeout(() => setAnimState('open'), 50);
        } else {
            handleCloseCustom();
        }
    };

    const handleCloseCustom = () => {
        setAnimState('closing');
        setTimeout(() => {
            setAnimState('closed');
            setShowCustom(false);
        }, 500);
    };

    const updateStyle = useCallback((key: keyof StyleConfig, value: any) => {
        setStyle(prev => ({ ...prev, [key]: value }));
    }, []);

    const executeDownload = async () => {
        if (qrCodeRef.current && (qrData || qrImageUrl)) {
            const targetSize = style.fileSize;
            const currentOpts = qrCodeRef.current._options;

            // Apply target resolution smoothly for download only
            if (targetSize !== 512) {
                await qrCodeRef.current.update({ width: targetSize, height: targetSize });
            }

            qrCodeRef.current.download({ name: `QR_${transactionRef ?? 'code'}`, extension: format as any });

            // Revert to preview resolution after a tiny delay
            if (targetSize !== 512) {
                setTimeout(() => {
                    qrCodeRef.current?.update(currentOpts);
                }, 100);
            }

            setIsDownloaded(true);
            onDownload?.();
        } else {
            onDownload?.();
            setIsDownloaded(true);
        }
    };

    const handleCopyClick = async () => {
        try {
            if (qrCodeRef.current && (qrData || qrImageUrl)) {
                const blob = await qrCodeRef.current.getRawData("png");
                if (blob) {
                    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
                }
            } else {
                onCopyLink?.();
            }
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        } catch (error) {
            toast?.error("Không thể copy hình ảnh.");
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        }
    };
    //#endregion

    //#region Effects
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (formatMenuRef.current && !formatMenuRef.current.contains(target)) setIsFormatMenuOpen(false);
            if (sizeMenuRef.current && !sizeMenuRef.current.contains(target)) setIsSizeMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsDownloaded(false);
        setIsCopied(false);
        setShowCustom(false);
        setAnimState('closed');
        defaultStyleApplied.current = false;
    }, [transactionRef, qrData, qrImageUrl]);

    useEffect(() => {
        if (shouldFetchStyles) fetchStyles();
    }, [shouldFetchStyles, fetchStyles]);

    useEffect(() => {
        if (styleJson) {
            setStyle(parseStyleJson(styleJson));
            const matched = qrStyles.find(s => s.styleJson === styleJson);
            setSelectedStyleId(matched ? matched.id : "");
            defaultStyleApplied.current = true;
        } else if (qrStyles.length > 0 && !defaultStyleApplied.current) {
            if (type === QRType.PUBLIC) {
                setStyle({ ...DEFAULT_STYLE });
                setSelectedStyleId("");
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
            defaultStyleApplied.current = true;
        }
    }, [styleJson, qrStyles, type]);

    // 1. Core QR Logic: Sync instance options with style state (Single Instance)
    useEffect(() => {
        if (!qrData && !qrImageUrl) return;

        const PREVIEW_QUALITY = 512;
        const opts = {
            width: PREVIEW_QUALITY, height: PREVIEW_QUALITY,
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
        } else {
            qrCodeRef.current.update(opts);
        }
    }, [style.bgColor, style.pointColor, style.eyeColor, style.pattern, style.logo, qrData, qrImageUrl]);

    // 2. DOM Management: Move (Append) the single QR canvas between page and modal
    useEffect(() => {
        if (!qrCodeRef.current) return;

        const targetRef = (animState === 'open' || animState === 'opening' || animState === 'closing')
            ? modalQrPreviewRef
            : qrPreviewRef;

        if (targetRef.current) {
            // Move the existing canvas to the current target container
            // This avoids re-rendering the whole QR code
            if (!targetRef.current.hasChildNodes()) {
                targetRef.current.innerHTML = "";
                qrCodeRef.current.append(targetRef.current);
            }
        }
    }, [animState, qrData, qrImageUrl]); // Re-run when switching between modal/page
    //#endregion

    return (
        <div className={cn("flex flex-col w-full h-full font-primary", className)}>
            <div className="card flex flex-col p-sm sm:p-md relative overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-500 flex-1 min-h-[300px]">

                {/* Style Summary Overlay for Private type (Enhanced Glassmorphism) */}
                {type === QRType.PRIVATE && !isDefaultStyle && animState === 'closed' && (qrData || qrImageUrl) && (
                    <div className="absolute top-5 right-5 z-20 animate-in fade-in slide-in-from-right-4 zoom-in-90 duration-700 origin-top-right">
                        <div className="p-1 rounded-[1.25rem] bg-surface/40 backdrop-blur-md border border-border/40 shadow-xl scale-90">
                            <QRStyleSummary style={style} />
                        </div>
                    </div>
                )}

                <div className={cn(
                    "flex flex-1 min-h-0 items-center justify-center transition-all duration-700 relative",
                    (type !== QRType.PRIVATE && !isDefaultStyle && isWide) ? "flex-row gap-lg mb-sm" : "flex-col gap-0"
                )}>
                    {/* Main QR Preview Container: Always visible to show placeholder */}
                    <div className={cn(
                        "transition-all duration-700 ease-in-out",
                        (qrData || qrImageUrl) ? "scale-100" : "scale-100"
                    )}>
                        <QRPreview
                            qrPreviewRef={qrPreviewRef}
                            originalContainerRef={originalContainerRef}
                            style={style}
                            qrData={qrData}
                            qrImageUrl={qrImageUrl}
                            isDefaultStyle={isDefaultStyle}
                            isWide={type === QRType.PRIVATE ? false : isWide}
                            animState={animState}
                        />
                    </div>

                    {/* Controls Region: Stabilized for Private type */}
                    <div className={cn(
                        "transition-all duration-700 flex flex-col justify-center",
                        (type !== QRType.PRIVATE && !isDefaultStyle && isWide) ? "flex-[55%] border-l border-border/40 pl-lg py-sm" : "w-full py-sm items-center",
                        (qrData || qrImageUrl) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
                    )}>
                        {/* Summary for Public mode */}
                        {type !== QRType.PRIVATE && !isDefaultStyle && isWide && animState === 'closed' && (
                            <QRStyleSummary style={style} />
                        )}

                        <div className={cn("flex shrink-0", (type !== QRType.PRIVATE && !isDefaultStyle && isWide) ? "justify-start" : "justify-center")}>
                            <button
                                onClick={handleCustomClick}
                                className={cn(
                                    "flex items-center gap-2.5 px-6 py-2.5 rounded-full text-[12px] font-black border transition-all duration-300 shadow-md active:scale-95 group",
                                    animState !== 'closed'
                                        ? "bg-primary text-primary-foreground border-primary shadow-primary/20"
                                        : "bg-surface border-border/60 text-foreground-secondary hover:border-primary/50 hover:text-primary hover:shadow-lg hover:shadow-primary/5"
                                )}
                                disabled={!qrData && !qrImageUrl}
                            >
                                <SlidersHorizontal className="w-4 h-4 transition-transform group-hover:rotate-12" />
                                CUSTOMIZE
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer: Action Buttons */}
                <div className={cn(
                    "w-full border-t border-border/40 pt-sm sm:pt-md mt-auto shrink-0 transition-opacity duration-500",
                    (qrData || qrImageUrl) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none hidden"
                )}>
                    <QRFooterActions
                        format={format} setFormat={setFormat}
                        isFormatMenuOpen={isFormatMenuOpen} setIsFormatMenuOpen={setIsFormatMenuOpen} formatMenuRef={formatMenuRef}
                        fileSize={style.fileSize} isSizeMenuOpen={isSizeMenuOpen} setIsSizeMenuOpen={setIsSizeMenuOpen} sizeMenuRef={sizeMenuRef}
                        updateStyle={updateStyle}
                        isDownloaded={isDownloaded} handleDownloadClick={() => isDownloaded ? setIsDownloadConfirmOpen(true) : executeDownload()}
                        isCopied={isCopied} handleCopyClick={handleCopyClick}
                        disabled={!qrData && !qrImageUrl}
                    />
                </div>
            </div>

            {/* Customization Modal */}
            {showCustom && (
                <QRCustomizationModal
                    animState={animState} modalQrPreviewRef={modalQrPreviewRef} modalCoords={modalCoords}
                    style={style} updateStyle={updateStyle} handleCloseCustom={handleCloseCustom}
                    type={type} qrStyles={qrStyles} selectedStyleId={selectedStyleId}
                    setSelectedStyleId={setSelectedStyleId} setStyle={setStyle} logoInputRef={logoInputRef}
                />
            )}

            <ActionConfirmModal
                isOpen={isDownloadConfirmOpen}
                onClose={() => setIsDownloadConfirmOpen(false)}
                onConfirm={() => { executeDownload(); setIsDownloadConfirmOpen(false); }}
                title="Xác nhận tải lại"
                description="Bạn đã tải xuống mã QR này rồi. Bạn có muốn tải lại không?"
                confirmText="Tải lại"
                cancelText="Hủy"
            />
        </div>
    );
};

export default QRDisplay;
