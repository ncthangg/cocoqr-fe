import React, { useState } from 'react';
import { Palette, X, SlidersHorizontal, Image as ImageIcon, Trash2, Upload, Check, LayoutGrid, Save, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '../Button';
import { type StyleConfig, type AnimationState, DEFAULT_STYLE, parseStyleJson } from './types';
import { QRType } from "@/models/enum";
import type { QrStyleLibraryRes } from "@/models/entity.model";
import SaveStyleModal from './SaveStyleModal';
import { useAppDispatch, useAppSelector } from '@/store/redux.hooks';
import { openAuthModal } from '@/store/slices/auth.slice';

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

const SECTION_LABEL_CLASS = "text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] mb-3 flex items-center gap-2";

const QRCustomizationModal: React.FC<QRCustomizationModalProps> = React.memo(({
    animState, modalQrPreviewRef, modalCoords, style, updateStyle, handleCloseCustom,
    qrStyles, selectedStyleId, setSelectedStyleId, setStyle, logoInputRef, type
}) => {
    //#region States
    const dispatch = useAppDispatch();
    const { token, user } = useAppSelector(state => state.auth);
    const isAuthenticated = !!(token && user);

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const isChanged = React.useMemo(() => {
        let baseline = DEFAULT_STYLE;
        if (selectedStyleId) {
            const found = qrStyles.find(s => s.id === selectedStyleId);
            if (found) {
                baseline = parseStyleJson(found.styleJson || "");
            }
        }
        return JSON.stringify(style) !== JSON.stringify(baseline);
    }, [style, selectedStyleId, qrStyles]);
    //#endregion

    //#region Handlers
    const onSaveClick = React.useCallback(() => {
        if (!isChanged) return;
        if (type === QRType.PUBLIC && !isAuthenticated) {
            dispatch(openAuthModal());
        } else {
            setIsSaveModalOpen(true);
        }
    }, [isChanged, type, isAuthenticated, dispatch]);

    const onStyleChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedStyleId(id);
        if (id === "") setStyle({ ...DEFAULT_STYLE });
        else {
            const found = qrStyles.find(s => s.id === id);
            if (found) setStyle(parseStyleJson(found.styleJson || ""));
        }
    }, [qrStyles, setSelectedStyleId, setStyle]);

    const onLogoChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            const r = new FileReader();
            r.onload = (ev) => updateStyle("logo", ev.target?.result);
            r.readAsDataURL(f);
        }
    }, [updateStyle]);

    const onRemoveLogo = React.useCallback(() => {
        updateStyle("logo", null);
        if (logoInputRef.current) logoInputRef.current.value = "";
    }, [updateStyle, logoInputRef]);
    //#endregion

    //#region Render
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-sm overflow-hidden font-primary isolate">
            <div
                className={cn(
                    "absolute inset-0 bg-background/45 backdrop-blur-2xl transition-opacity duration-500 ease-out",
                    (animState === 'open' || animState === 'opening') ? "opacity-100" : "opacity-0"
                )}
                onClick={handleCloseCustom}
            />

            <div className={cn(
                "relative w-full max-w-5xl h-auto max-h-[92vh] bg-surface/90 backdrop-blur-xl border border-border/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] rounded-[3rem] overflow-hidden flex flex-col transition-all duration-700 cubic-bezier(0.16,1,0.3,1) transform-gpu",
                (animState === 'open' || animState === 'opening') ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-[0.96]",
                animState === 'closing' && "pointer-events-none"
            )}
            style={{ 
                willChange: 'transform, opacity, width, height, top, left',
                backfaceVisibility: 'hidden'
            }}>

                <div className={cn(
                    "flex items-center justify-between px-8 py-6 border-b border-border/30 shrink-0 bg-surface/40 backdrop-blur-xl transition-all duration-500",
                    animState === 'closing' ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                )}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 animate-pulse-slow">
                            <Palette size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-foreground leading-tight tracking-tight">Cá nhân hóa QR</h3>
                            <p className="text-[11px] text-foreground-muted font-bold uppercase tracking-widest opacity-70">Thiết kế & Phong cách</p>
                        </div>
                    </div>
                    <button
                        onClick={handleCloseCustom}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center bg-surface-muted/50 text-foreground-muted hover:text-danger hover:bg-danger/5 transition-all active:scale-90 border border-border/40"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="flex flex-1 min-h-0 flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border/30 overflow-hidden">
                    <div className={cn(
                        "flex-[45%] bg-surface-muted/15 flex flex-col items-center justify-center p-12 relative transition-all duration-500",
                        animState === 'closing' && "bg-transparent opacity-0 scale-95"
                    )}>
                        <div
                            className={cn(
                                "relative transition-all duration-700 cubic-bezier(0.16,1,0.3,1) z-50 transform-gpu",
                                animState === 'opening' && "animate-in fade-in zoom-in-95 duration-500"
                            )}
                            style={animState === 'open' ? {
                                width: 'min(360px, 100%)',
                                aspectRatio: '1/1',
                                padding: 20,
                                backgroundColor: style.borderColor || '#ffffff',
                                borderRadius: '3rem',
                                boxShadow: '0 40px 80px -20px rgba(0,0,0,0.25)',
                                willChange: 'transform, width, height'
                            } : {
                                position: 'fixed',
                                top: modalCoords?.y,
                                left: modalCoords?.x,
                                width: modalCoords?.w,
                                height: modalCoords?.h,
                                padding: 8,
                                backgroundColor: style.borderColor || '#ffffff',
                                borderRadius: '1.5rem',
                                zIndex: 9999,
                                pointerEvents: 'none'
                            }}
                        >
                            <div ref={modalQrPreviewRef} className="w-full h-full flex items-center justify-center [&>canvas]:w-full [&>canvas]:h-full [&>canvas]:rounded-[1.5rem] transform-gpu" />
                        </div>
                    </div>

                    <div className={cn(
                        "flex-[55%] flex flex-col overflow-y-auto p-10 custom-scrollbar bg-surface/10 transition-all duration-500",
                        animState === 'closing' ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
                    )}>

                        <div className="mb-10 w-full animate-in fade-in slide-in-from-right-2 duration-500 delay-150">
                            <label className={SECTION_LABEL_CLASS}><LayoutGrid size={13} /> Mẫu thiết kế</label>
                            <div className="relative group">
                                <select
                                    className="w-full h-14 pl-5 pr-12 text-[13px] rounded-2xl border-2 border-border/40 bg-surface/50 shadow-sm focus:border-primary/50 focus:bg-surface transition-all font-black appearance-none outline-none cursor-pointer"
                                    value={selectedStyleId}
                                    onChange={onStyleChange}
                                >
                                    <option value="">-- THIẾT KẾ RIÊNG --</option>
                                    {qrStyles.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-muted group-hover:text-primary transition-colors">
                                    <SlidersHorizontal size={14} />
                                </div>
                            </div>
                        </div>

                        <div className="mb-10 animate-in fade-in slide-in-from-right-2 duration-500 delay-200">
                            <label className={SECTION_LABEL_CLASS}><Circle size={13} /> Hình dáng điểm ảnh</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'default', label: 'Hình vuông' },
                                    { id: 'rounded', label: 'Bo góc' },
                                    { id: 'dots', label: 'Dạng chấm' }
                                ].map((p) => (
                                    <button
                                        key={p.id} onClick={() => updateStyle("pattern", p.id)}
                                        className={cn(
                                            "group relative h-14 text-[11px] font-black rounded-2xl border-2 transition-all p-1 transform-gpu active:scale-95",
                                            style.pattern === p.id
                                                ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-[1.02]"
                                                : "bg-surface border-border/40 text-foreground-secondary hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:scale-[1.01]"
                                        )}
                                    >
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            {p.label.toUpperCase()}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-10 gap-10 animate-in fade-in slide-in-from-right-2 duration-500 delay-300 border-t border-border/20 pt-10">

                            <div className="md:col-span-7 flex flex-col gap-5">
                                <label className={SECTION_LABEL_CLASS}><Palette size={13} /> Bảng phối màu</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { id: 'bgColor', label: 'Màu nền' },
                                        { id: 'pointColor', label: 'Màu điểm' },
                                        { id: 'eyeColor', label: 'Màu mắt' },
                                        { id: 'borderColor', label: 'Màu viền' }
                                    ].map((c) => (
                                        <div key={c.id} className="group flex items-center justify-between p-4 bg-surface/40 border-2 border-border/30 rounded-2xl hover:border-primary/40 hover:bg-surface/80 transition-all transform-gpu hover:scale-[1.02]">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] font-black text-foreground-muted uppercase tracking-wider">{c.label}</span>
                                                <span className="text-[12px] font-mono font-bold text-foreground">{(style as any)[c.id].toUpperCase()}</span>
                                            </div>
                                            <div className="relative w-10 h-10 group-hover:scale-110 transition-transform">
                                                <input type="color" value={(style as any)[c.id]} onChange={(e) => updateStyle(c.id as any, e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                                <div className="w-full h-full rounded-xl border-2 border-white/50 shadow-lg ring-1 ring-border/20" style={{ backgroundColor: (style as any)[c.id] }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-3 flex flex-col">
                                <label className={cn(SECTION_LABEL_CLASS, "text-primary")}><ImageIcon size={13} /> Logo thương hiệu</label>
                                {style.logo ? (
                                    <div className="relative group w-full aspect-square max-w-[200px] mx-auto animate-in zoom-in-95 duration-500 transform-gpu">
                                        <div className="w-full h-full bg-white rounded-[2.5rem] border-4 border-primary/10 p-5 shadow-2xl flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
                                            <img src={style.logo} className="w-full h-full object-contain relative z-10" alt="Logo thương hiệu" />
                                        </div>
                                        <button
                                            onClick={onRemoveLogo}
                                            className="absolute -top-3 -right-3 w-10 h-10 bg-danger text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-danger-strong hover:scale-110 active:scale-95 transition-all border-4 border-surface z-20"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => logoInputRef.current?.click()}
                                        className="w-full h-full min-h-[180px] border-2 border-dashed border-border/50 hover:border-primary/60 hover:bg-primary/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group bg-surface-muted/15 transform-gpu hover:scale-[1.01]"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-sm"><Upload size={24} className="group-hover:text-white text-primary" /></div>
                                        <div className="text-center">
                                            <span className="text-[11px] font-black text-foreground block group-hover:text-primary transition-colors uppercase tracking-tight">Tải logo lên</span>
                                            <span className="text-[9px] font-bold text-foreground-muted/60 uppercase tracking-widest mt-1 block">Hỗ trợ SVG, PNG, JPG</span>
                                        </div>
                                    </div>
                                )}
                                <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={onLogoChange} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-10 py-8 border-t border-border/30 bg-surface/40 backdrop-blur-xl flex justify-end gap-5 shrink-0 animate-in slide-in-from-bottom-4 duration-700 delay-500 transition-opacity">
                    <Button
                        variant="ghost"
                        className={cn(
                            "px-8 h-14 rounded-2xl text-[11px] font-black transition-all border border-transparent transform-gpu",
                            !isChanged
                                ? "text-foreground-muted/30 cursor-not-allowed opacity-50 grayscale"
                                : "text-foreground-muted hover:text-primary hover:bg-primary/5 active:scale-95 hover:border-primary/20 hover:scale-[1.02]"
                        )}
                        onClick={onSaveClick}
                        disabled={!isChanged}
                    >
                        <Save className="w-5 h-5 mr-3" /> LƯU VÀO THƯ VIỆN
                    </Button>
                    <Button
                        variant="primary"
                        className="px-14 h-14 rounded-2xl text-[11px] font-black shadow-[0_20px_40px_-12px_rgba(var(--primary-rgb),0.35)] active:scale-[0.98] transition-all transform-gpu hover:scale-[1.02] hover:-translate-y-0.5"
                        onClick={handleCloseCustom}
                    >
                        <Check className="w-5 h-5 mr-3" strokeWidth={3} /> ÁP DỤNG
                    </Button>
                </div>

                <SaveStyleModal
                    isOpen={isSaveModalOpen}
                    onClose={() => setIsSaveModalOpen(false)}
                    currentStyle={style}
                />
            </div>
        </div>
    );
});

export default QRCustomizationModal;
