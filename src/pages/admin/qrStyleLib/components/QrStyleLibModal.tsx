import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { X, Palette, LayoutGrid, Image as ImageIcon, Eye, EyeOff, Upload, Trash2, Check, Save, Circle, ShieldCheck } from "lucide-react";
import QRCodeStyling, { type DotType, type CornerSquareType } from "qr-code-styling";
import { toast } from "react-toastify";
import Button from "@/components/UICustoms/Button";
import { qrStyleLibApi } from "@/services/qrStyleLib-api.service";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";
import type { QrStyleLibraryRes } from "@/models/entity.model";
import { QRStyleType } from "@/models/enum";
import { cn } from "@/lib/utils";
import StatusToggle from "@/components/UICustoms/Form/StatusToggle";

//#region Types & Constants
interface StyleConfig {
    bgColor: string;
    pointColor: string;
    eyeColor: string;
    borderColor: string;
    pattern: string;
    logo: string | null;
}

const DEFAULT_STYLE: StyleConfig = {
    bgColor: "#ffffff",
    pointColor: "#000000",
    eyeColor: "#000000",
    borderColor: "#ffffff",
    pattern: "default",
    logo: null
};

const SECTION_LABEL_CLASS = "text-[11px] font-black text-foreground-muted uppercase tracking-[0.15em] mb-4 flex items-center gap-2";

function parseStyleJson(json: string): StyleConfig {
    try {
        const parsed = JSON.parse(json);
        if (parsed.fileSize) delete parsed.fileSize;
        return { ...DEFAULT_STYLE, ...parsed };
    } catch {
        return { ...DEFAULT_STYLE };
    }
}
//#endregion

interface QrStyleLibModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updated?: QrStyleLibraryRes) => void;
    item?: QrStyleLibraryRes | null;
}

const QrStyleLibModal: React.FC<QrStyleLibModalProps> = ({ isOpen, onClose, onSuccess, item }) => {
    //#region States & Refs
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [isDefault, setIsDefault] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [showRawJson, setShowRawJson] = useState(false);
    const [isDeletingModal, setIsDeletingModal] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const qrPreviewRef = useRef<HTMLDivElement>(null);
    const qrCodeRef = useRef<QRCodeStyling | null>(null);

    const [style, setStyle] = useState<StyleConfig>({ ...DEFAULT_STYLE });
    const styleJson = useMemo(() => JSON.stringify(style, null, 2), [style]);

    const displayJson = useMemo(() => {
        const displayStyle = { ...style };
        if (displayStyle.logo && displayStyle.logo.length > 30) {
            displayStyle.logo = displayStyle.logo.substring(0, 30) + "...";
        }
        return JSON.stringify(displayStyle, null, 2);
    }, [style]);
    //#endregion

    //#region Handlers
    const updateStyle = useCallback((key: keyof StyleConfig, value: any) => {
        setStyle(prev => ({ ...prev, [key]: value }));
    }, []);

    const onLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => updateStyle("logo", ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    }, [updateStyle]);

    const onRemoveLogo = useCallback(() => {
        updateStyle("logo", null);
        if (logoInputRef.current) logoInputRef.current.value = "";
    }, [updateStyle]);

    const executeSave = async () => {
        try {
            setLoading(true);
            const payload = {
                name,
                styleJson,
                isActive,
                type: QRStyleType.SYSTEM,
                isDefault
            };

            if (item) {
                await qrStyleLibApi.put(item.id, payload);
                toast.success("Cập nhật QR Style hệ thống thành công! ✨");
            } else {
                await qrStyleLibApi.post(payload);
                toast.success("Đã tạo QR Style hệ thống mới! ✨");
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving system style:", error);
            toast.error("Không thể lưu QR Style hệ thống.");
        } finally {
            setLoading(false);
            setIsConfirmOpen(false);
        }
    };

    const executeDelete = async () => {
        if (!item) return;
        try {
            setIsDeletingModal(true);
            await qrStyleLibApi.delete(item.id);
            toast.success("Đã xóa QR Style hệ thống.");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error deleting style:", error);
            toast.error("Không thể xóa QR Style.");
        } finally {
            setIsDeletingModal(false);
            setIsDeleteConfirmOpen(false);
        }
    };
    //#endregion

    //#region Effects
    useEffect(() => {
        if (isOpen) {
            if (item) {
                setName(item.name || "");
                setIsActive(item.isActive ?? true);
                setIsDefault(item.isDefault || false);
                setStyle(parseStyleJson(item.styleJson));
            } else {
                setName("");
                setIsActive(true);
                setIsDefault(false);
                setStyle({ ...DEFAULT_STYLE });
            }
            setShowRawJson(false);
            qrCodeRef.current = null;
        }
    }, [isOpen, item]);

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

    useEffect(() => {
        if (!isOpen) return;
        const opts = {
            width: 320,
            height: 320,
            data: "https://cocoqr.vn/system-preview",
            dotsOptions: { color: style.pointColor, type: patternToDotType(style.pattern) },
            backgroundOptions: { color: style.bgColor },
            cornersSquareOptions: { color: style.eyeColor, type: patternToEyeType(style.pattern) },
            cornersDotOptions: { color: style.eyeColor },
            imageOptions: { crossOrigin: "anonymous" as const, margin: 8, hideBackgroundDots: true },
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
        }
    }, [style, isOpen]);
    //#endregion

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-sm overflow-hidden font-primary isolate">
            <div className="absolute inset-0 bg-background/45 backdrop-blur-2xl transition-opacity duration-500 ease-out" onClick={onClose} />

            <div className="relative w-full max-w-5xl h-auto max-h-[92vh] bg-surface/90 backdrop-blur-xl border border-border/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] rounded-[3rem] overflow-hidden flex flex-col transform-gpu animate-in fade-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-border/30 shrink-0 bg-surface/40 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                            <ShieldCheck size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-foreground leading-tight tracking-tight">
                                {item ? "Quản lý phong cách hệ thống" : "Thêm phong cách hệ thống mới"}
                            </h3>
                            <p className="text-[11px] text-foreground-muted font-bold uppercase tracking-widest opacity-70">Admin Control Panel</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center text-foreground-muted hover:text-danger hover:bg-danger/5 transition-all active:scale-90 border border-border/40">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-1 min-h-0 flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border/30 overflow-hidden">
                    {/* Left Column: Preview */}
                    <div className="flex-[45%] bg-surface-muted/15 flex flex-col items-center justify-center p-12 relative overflow-hidden group">
                        <div
                            className="relative z-10 transition-all duration-700 cubic-bezier(0.16,1,0.3,1) p-5 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)] flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: style.borderColor, width: 'min(360px, 100%)', aspectRatio: '1/1' }}
                        >
                            <div ref={qrPreviewRef} className="w-full h-full flex items-center justify-center [&>canvas]:w-full [&>canvas]:h-full [&>canvas]:rounded-[1.5rem] transform-gpu" />
                        </div>

                        {/* JSON Toggle */}
                        <div className="mt-8 relative z-20">
                            <button
                                onClick={() => setShowRawJson(!showRawJson)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface/50 border border-border/40 text-[10px] font-black text-foreground-muted hover:text-primary hover:border-primary/40 transition-all"
                            >
                                {showRawJson ? <EyeOff size={14} /> : <Eye size={14} />}
                                {showRawJson ? "ẨN CẤU HÌNH JSON" : "XEM CẤU HÌNH JSON"}
                            </button>
                        </div>

                        {showRawJson && (
                            <div className="absolute inset-0 z-30 bg-surface/95 backdrop-blur-xl p-8 animate-in slide-in-from-bottom-5 duration-500 overflow-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-sm font-black text-primary tracking-widest uppercase">System Style JSON</span>
                                    <button onClick={() => setShowRawJson(false)} className="p-2 rounded-lg hover:bg-surface-muted"><X size={18} /></button>
                                </div>
                                <pre className="text-[11px] font-mono p-4 rounded-2xl bg-surface-muted/50 border border-border/40 text-foreground-secondary leading-relaxed">
                                    {displayJson}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Settings */}
                    <div className="flex-[55%] flex flex-col overflow-y-auto p-10 custom-scrollbar bg-surface/10">
                        {/* Name Input */}
                        <div className="mb-10 w-full animate-in fade-in slide-in-from-right-2 duration-500">
                            <label className={SECTION_LABEL_CLASS}><LayoutGrid size={13} /> Tên phong cách hệ thống</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    className="w-full h-14 pl-5 pr-12 text-[13px] rounded-2xl border-2 border-border/40 bg-surface/50 shadow-sm focus:border-primary/50 focus:bg-surface transition-all font-black outline-none"
                                    placeholder="Ví dụ: System Modern Blue..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground-muted group-focus-within:text-primary transition-colors">
                                    <Check size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Shape Pattern */}
                        <div className="mb-10 animate-in fade-in slide-in-from-right-2 duration-500 delay-100">
                            <label className={SECTION_LABEL_CLASS}><Circle size={13} /> Hình dáng điểm ảnh</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'default', label: 'HÌNH VUÔNG' },
                                    { id: 'rounded', label: 'BO GÓC' },
                                    { id: 'dots', label: 'DẠNG CHẤM' }
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
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Colors and Logo */}
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
                                <label className={cn(SECTION_LABEL_CLASS, "text-primary")}><ImageIcon size={13} /> Logo thương hiệu hệ thống</label>
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
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                            <Upload size={24} className="group-hover:text-white text-primary" />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-[11px] font-black text-foreground block group-hover:text-primary transition-colors uppercase tracking-tight">Tải logo lên</span>
                                            <span className="text-[9px] font-bold text-foreground-muted/60 uppercase tracking-widest mt-1 block">Hỗ trợ SVG, PNG, JPG</span>
                                        </div>
                                    </div>
                                )}
                                <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={onLogoChange} />
                            </div>
                        </div>

                        {/* Status & Settings (Bottom of form) */}
                        <div className="mt-10 animate-in fade-in slide-in-from-right-2 duration-500 delay-400 border-t border-border/20 pt-10 flex flex-col gap-6">
                            <label className={SECTION_LABEL_CLASS}><Check size={13} /> Trạng thái hiển thị & Mặc định</label>
                            <div className="p-6 rounded-[2.5rem] bg-surface-muted/20 border border-border/30 flex flex-col gap-6">
                                <StatusToggle
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    checkedLabel="HOẠT ĐỘNG"
                                    uncheckedLabel="BẢO TRÌ/ẨN"
                                    checkedSubtext="Cho phép người dùng nhìn thấy và sử dụng style này"
                                    uncheckedSubtext="Style sẽ bị ẩn khỏi danh sách lựa chọn của người dùng"
                                />
                                <div className="h-px bg-border/20 w-full" />
                                <StatusToggle
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                    checkedLabel="STYLE MẶC ĐỊNH"
                                    uncheckedLabel="STYLE BÌNH THƯỜNG"
                                    checkedSubtext="Tự động áp dụng style này cho người dùng mới"
                                    uncheckedSubtext="Style này đóng vai trò như một tùy chọn trong thư viện"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-10 py-8 border-t border-border/30 bg-surface/40 backdrop-blur-xl flex justify-between items-center shrink-0">
                    <div className="flex gap-4">
                        {item && (
                            <Button
                                variant="ghost"
                                className="text-danger hover:bg-danger/5 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest"
                                onClick={() => setIsDeleteConfirmOpen(true)}
                                disabled={loading}
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Xóa Style Hệ thống
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" className="px-10 rounded-2xl text-[11px] font-black uppercase tracking-widest" onClick={onClose} disabled={loading}>
                            Hủy bỏ
                        </Button>
                        <Button
                            variant="primary"
                            className="px-14 h-14 rounded-2xl text-[11px] font-black shadow-[0_20px_40px_-12px_rgba(var(--primary-rgb),0.35)] active:scale-[0.98] transition-all transform-gpu hover:scale-[1.02] hover:-translate-y-0.5"
                            onClick={() => setIsConfirmOpen(true)}
                            disabled={loading || !name}
                        >
                            <Save className="w-4 h-4 mr-2" /> {item ? "CẬP NHẬT HỆ THỐNG" : "TẠO MỚI HỆ THỐNG"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ActionConfirmModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={executeDelete}
                title="Xác nhận xóa Style"
                description={`Lưu ý: Bạn đang thực hiện xóa một style hệ thống. Hành động này sẽ ảnh hưởng đến mọi người dùng đang sử dụng nó.`}
                loading={isDeletingModal}
                confirmText="Xác nhận xóa hệ thống"
                variant="danger"
            />

            <ActionConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeSave}
                title={item ? "Cập nhật Style hệ thống" : "Tạo Style hệ thống mới"}
                description={`Lưu lại các thay đổi thiết kế cho phong cách hệ thống "${name}"?`}
                loading={loading}
                confirmText={item ? "Cập nhật hệ thống" : "Tạo mới hệ thống"}
            />
        </div>
    );
};

export default QrStyleLibModal;
