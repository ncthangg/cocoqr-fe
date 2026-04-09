import React from 'react';
import { Palette, X, SlidersHorizontal, Image as ImageIcon, Trash2, Upload, Check, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '../Button';
import { type StyleConfig, type AnimationState, DEFAULT_STYLE, parseStyleJson } from './types';
import { QRType } from "@/models/enum";
import type { QrStyleLibraryRes } from "@/models/entity.model";

interface QRCustomizationModalProps {
    animState: AnimationState;
    modalQrPreviewRef: React.RefObject<HTMLDivElement | null>;
    modalCoords: { x: number, y: number, w: number, h: number } | null;
    style: StyleConfig;
    updateStyle: (key: keyof StyleConfig, value: any) => void;
    handleCloseCustom: () => void;
    type: QRType;
    qrStyles: QrStyleLibraryRes[];
    selectedStyleId: string;
    setSelectedStyleId: (id: string) => void;
    setStyle: (s: StyleConfig) => void;
    logoInputRef: React.RefObject<HTMLInputElement | null>;
}

const QRCustomizationModal: React.FC<QRCustomizationModalProps> = ({
    animState, modalQrPreviewRef, modalCoords, style, updateStyle, handleCloseCustom,
    qrStyles, selectedStyleId, setSelectedStyleId, setStyle, logoInputRef
}) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-sm overflow-hidden font-primary">
            {/* Backdrop: Fades out during closing */}
            <div
                className={cn(
                    "absolute inset-0 bg-background/60 backdrop-blur-xl transition-opacity duration-500",
                    (animState === 'open' || animState === 'opening') ? "opacity-100" : "opacity-0"
                )}
                onClick={handleCloseCustom}
            />

            {/* Modal Container: Professional Studio Layout */}
            <div className={cn(
                "relative w-full max-w-4xl h-auto max-h-[90vh] bg-surface border border-border shadow-2xl rounded-[2rem] overflow-hidden flex flex-col transition-all duration-500 cubic-bezier(0.16,1,0.3,1)",
                (animState === 'open' || animState === 'opening') ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95",
                animState === 'closing' && "pointer-events-none"
            )}>

                {/* Header: Hide during closing to focus on QR movement */}
                <div className={cn(
                    "flex items-center justify-between px-lg py-4 border-b border-border/50 shrink-0 bg-surface/50 backdrop-blur-md transition-opacity duration-300",
                    animState === 'closing' ? "opacity-0" : "opacity-100"
                )}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Palette size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-foreground">Tùy chỉnh mã QR</h3>
                            <p className="text-[10px] text-foreground-muted">Cá nhân hóa thiết kế nhanh chóng</p>
                        </div>
                    </div>
                    <button onClick={handleCloseCustom} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-danger/10 text-foreground-muted hover:text-danger transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-1 min-h-0 flex-col lg:flex-row overflow-hidden">
                    {/* Left Panel: QR Preview (Shared Element Container) */}
                    <div className={cn(
                        "flex-[50%] bg-surface-muted/30 flex items-center justify-center p-8 relative border-r border-border/40 transition-colors duration-500",
                        animState === 'closing' && "bg-transparent border-transparent"
                    )}>
                        <div
                            className={cn(
                                "relative transition-all duration-500 ease-in-out z-50",
                                animState === 'opening' && "animate-in fade-in zoom-in"
                            )}
                            style={animState === 'open' ? {
                                width: 'min(320px, 90%)',
                                aspectRatio: '1/1',
                                padding: 16,
                                backgroundColor: style.borderColor,
                                borderRadius: '2.5rem',
                                boxShadow: '0 20px 50px -10px rgba(0,0,0,0.1)'
                            } : {
                                position: 'fixed', 
                                top: modalCoords?.y, 
                                left: modalCoords?.x, 
                                width: modalCoords?.w, 
                                height: modalCoords?.h, 
                                padding: 8, 
                                backgroundColor: style.borderColor, 
                                borderRadius: '1.5rem', 
                                zIndex: 9999, 
                                pointerEvents: 'none'
                            }}
                        >
                            <div ref={modalQrPreviewRef} className="w-full h-full flex items-center justify-center [&>canvas]:w-full [&>canvas]:h-full drop-shadow-2xl" />
                        </div>
                    </div>

                    {/* Right Panel: Hybrid Controls (Fade out during closing) */}
                    <div className={cn(
                        "flex-[50%] flex flex-col overflow-y-auto p-lg custom-scrollbar bg-surface/30 transition-opacity duration-300",
                        animState === 'closing' ? "opacity-0" : "opacity-100"
                    )}>

                        {/* Section 1: Presets & Patterns */}
                        <div className="grid grid-cols-1 gap-6 mb-8">
                            {/* Templates Dropdown (Themed) */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest flex items-center gap-1.5"><LayoutGrid size={12} /> Chọn mẫu có sẵn</label>
                                <select
                                    className="select h-11 text-xs rounded-xl border-border/60 bg-surface shadow-sm focus:border-primary/50 transition-all font-bold"
                                    value={selectedStyleId}
                                    onChange={(e) => {
                                        const id = e.target.value;
                                        setSelectedStyleId(id);
                                        if (id === "") setStyle({ ...DEFAULT_STYLE });
                                        else {
                                            const found = qrStyles.find(s => s.id === id);
                                            if (found) setStyle(parseStyleJson(found.styleJson || ""));
                                        }
                                    }}
                                >
                                    <option value="">-- Tùy chỉnh tự do --</option>
                                    {qrStyles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            {/* Patterns (Themed Compact - Fixed Dark Mode contrast) */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest flex items-center gap-1.5"><SlidersHorizontal size={12} /> Kiểu điểm ảnh</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'default', label: 'Vuông' },
                                        { id: 'rounded', label: 'Bo góc' },
                                        { id: 'dots', label: 'Chấm' }
                                    ].map((p) => (
                                        <button
                                            key={p.id} onClick={() => updateStyle("pattern", p.id)}
                                            className={cn(
                                                "h-10 text-[11px] font-black rounded-xl border transition-all active:scale-95",
                                                style.pattern === p.id
                                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                                    : "bg-surface border-border/60 text-foreground-muted hover:border-primary/40 hover:text-primary"
                                            )}
                                        >
                                            {p.label.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Colors & Logo (Themed Ratio) */}
                        <div className="grid grid-cols-1 sm:grid-cols-10 gap-6 border-t border-border/40 pt-6">

                            {/* Left Col: Colors (Themed Stack) */}
                            <div className="sm:col-span-6 flex flex-col gap-2.5">
                                <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest mb-1 flex items-center gap-1.5"><Palette size={12} /> Màu sắc</label>
                                {[
                                    { id: 'bgColor', label: 'Màu nền' },
                                    { id: 'pointColor', label: 'Điểm ảnh' },
                                    { id: 'eyeColor', label: 'Mắt mã' },
                                    { id: 'borderColor', label: 'Viền' }
                                ].map((c) => (
                                    <div key={c.id} className="flex items-center gap-3 p-2.5 bg-surface border border-border/50 rounded-2xl hover:border-primary/40 transition-all group">
                                        <div className="relative w-8 h-8 shrink-0">
                                            <input type="color" value={(style as any)[c.id]} onChange={(e) => updateStyle(c.id as any, e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                            <div className="w-full h-full rounded-xl border border-border/40 shadow-sm" style={{ backgroundColor: (style as any)[c.id] }} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-foreground-secondary tracking-tight">{c.label}</span>
                                            <span className="text-[9px] font-mono font-bold text-foreground-muted uppercase tracking-wider">{(style as any)[c.id]}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Right Col: Add Logo (Themed Upload Container) */}
                            <div className="sm:col-span-4 flex flex-col gap-3">
                                <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5"><ImageIcon size={12} /> Logo</label>

                                {style.logo ? (
                                    <div className="relative w-32 h-32 mx-auto animate-in zoom-in duration-300">
                                        <div className="w-full h-full bg-white rounded-[2rem] border-2 border-primary/20 p-2.5 shadow-md flex items-center justify-center">
                                            <img src={style.logo} className="w-full h-full object-contain" alt="Logo" />
                                        </div>
                                        <button
                                            onClick={() => { updateStyle("logo", null); if (logoInputRef.current) logoInputRef.current.value = ""; }}
                                            className="absolute -top-2 -right-2 w-7 h-7 bg-danger text-white rounded-xl flex items-center justify-center shadow-xl hover:bg-danger-strong hover:scale-110 active:scale-95 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => logoInputRef.current?.click()}
                                        className="w-full aspect-square border-2 border-dashed border-border/80 hover:border-primary/50 hover:bg-primary/5 rounded-[2rem] flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group bg-surface/40"
                                    >
                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"><Upload size={18} className="text-primary" /></div>
                                        <span className="text-[10px] font-black text-foreground-muted group-hover:text-primary transition-colors">THÊM LOGO</span>
                                    </div>
                                )}
                                <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) { const r = new FileReader(); r.onload = (ev) => updateStyle("logo", ev.target?.result); r.readAsDataURL(f); }
                                }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="px-lg py-5 border-t border-border/50 bg-surface flex justify-end shrink-0">
                    <Button
                        variant="primary"
                        className="px-10 h-11 rounded-xl text-xs font-black shadow-lg shadow-primary/20 active:scale-95 transition-all"
                        onClick={handleCloseCustom}
                    >
                        <Check className="w-4 h-4 mr-2" /> ÁP DỤNG
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default QRCustomizationModal;
