import React from 'react';
import { Download, Copy, RefreshCw, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '../Button';
import { type StyleConfig } from './types';

interface QRFooterActionsProps {
    format: string;
    setFormat: (f: string) => void;
    isFormatMenuOpen: boolean;
    setIsFormatMenuOpen: (o: boolean) => void;
    formatMenuRef: React.RefObject<HTMLDivElement | null>;

    fileSize: number;
    isSizeMenuOpen: boolean;
    setIsSizeMenuOpen: (o: boolean) => void;
    sizeMenuRef: React.RefObject<HTMLDivElement | null>;
    updateStyle: (key: keyof StyleConfig, value: any) => void;

    isDownloaded: boolean;
    handleDownloadClick: () => void;
    isCopied: boolean;
    handleCopyClick: () => void;
    disabled: boolean;
}

const QRFooterActions: React.FC<QRFooterActionsProps> = ({
    format, setFormat, isFormatMenuOpen, setIsFormatMenuOpen, formatMenuRef,
    fileSize, isSizeMenuOpen, setIsSizeMenuOpen, sizeMenuRef, updateStyle,
    isDownloaded, handleDownloadClick, isCopied, handleCopyClick, disabled
}) => {
    return (
        <div className="flex gap-sm w-full shrink-0">
            {/* Size Selector */}
            <div className="relative h-10 shrink-0" ref={sizeMenuRef}>
                <button
                    onClick={() => setIsSizeMenuOpen(!isSizeMenuOpen)}
                    className="h-10 w-16 sm:w-20 flex flex-col items-center justify-center bg-surface border border-border/60 rounded-lg hover:border-primary/40 transition-all"
                    title="Chọn kích thước tải xuống"
                    disabled={disabled}
                >
                    <span className="text-[8px] font-black text-foreground-muted uppercase leading-none mb-0.5">SIZE</span>
                    <div className="flex items-center gap-0.5">
                        <span className="text-[10px] font-bold text-foreground">{fileSize}</span>
                        <ChevronDown className={cn("w-2.5 h-2.5 text-foreground-muted transition-transform", isSizeMenuOpen && "rotate-180")} />
                    </div>
                </button>
                {isSizeMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-20 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex flex-col p-1 gap-1">
                            {[256, 512, 1024, 2048].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => { updateStyle("fileSize", s); setIsSizeMenuOpen(false); }}
                                    className={cn("w-full px-2 py-1.5 text-center text-[10px] font-bold rounded-lg transition-colors", fileSize === s ? "bg-primary text-white" : "hover:bg-surface-muted")}
                                >
                                    {s}px
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Type Selector */}
            <div className="relative h-10 shrink-0" ref={formatMenuRef}>
                <button
                    onClick={() => setIsFormatMenuOpen(!isFormatMenuOpen)}
                    className="h-10 w-16 sm:w-20 flex flex-col items-center justify-center bg-surface border border-border/60 rounded-lg hover:border-primary/40 transition-all"
                    disabled={disabled}
                >
                    <span className="text-[8px] font-black text-foreground-muted uppercase leading-none mb-0.5">TYPE</span>
                    <div className="flex items-center gap-0.5">
                        <span className="text-[10px] font-bold text-foreground uppercase">{format === 'jpeg' ? 'JPG' : format}</span>
                        <ChevronDown className={cn("w-2.5 h-2.5 text-foreground-muted transition-transform", isFormatMenuOpen && "rotate-180")} />
                    </div>
                </button>
                {isFormatMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-24 bg-surface border rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex flex-col p-1 gap-1">
                            {[{ v: 'png', l: 'PNG' }, { v: 'svg', l: 'SVG' }, { v: 'jpeg', l: 'JPG' }, { v: 'webp', l: 'WEBP' }].map((o) => (
                                <button key={o.v} onClick={() => { setFormat(o.v); setIsFormatMenuOpen(false); }} className={cn("w-full px-3 py-2 text-left text-[10px] font-bold rounded-lg transition-colors", format === o.v ? "bg-primary text-white" : "hover:bg-surface-muted")}>{o.l}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Button
                variant="primary"
                className="flex-1 transition-all h-10"
                onClick={handleDownloadClick}
                disabled={disabled}
            >
                {isDownloaded ? <RefreshCw className="w-4 h-4 animate-spin-slow mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                <span className="font-bold text-xs sm:text-sm">{isDownloaded ? "TẢI LẠI" : "TẢI XUỐNG"}</span>
            </Button>

            <Button
                variant="ghost"
                className={cn("px-2 sm:px-4 border h-10 transition-all", isCopied ? "border-success bg-success/10 text-success" : "border-border hover:border-primary/40")}
                onClick={handleCopyClick}
                disabled={disabled}
            >
                {isCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                <span className="font-bold hidden md:inline text-xs sm:text-sm">{isCopied ? "COPIED" : "COPY"}</span>
            </Button>
        </div>
    );
};

export default QRFooterActions;
