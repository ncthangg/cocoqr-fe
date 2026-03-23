import React, { useEffect, useState, useMemo, useRef } from "react";
import { X, Layout, Palette, Sliders, Maximize, QrCode, Image as ImageIcon, Eye, EyeOff, Upload, Trash2, AlertCircle } from "lucide-react";
import QRCodeStyling, { type DotType, type CornerSquareType } from "qr-code-styling";
import { toast } from "react-toastify";
import Button from "@/components/UICustoms/Button";
import { qrStyleLibApi } from "@/services/qrStyleLib-api.service";
// import type { CreateQrStyleLibraryReq, UpdateQrStyleLibraryReq } from "@/models/entity.request.model";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";
import type { QrStyleLibraryRes } from "@/models/entity.model";
import { QRStyleType } from "@/models/enum";

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

interface QrStyleLibModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updated?: QrStyleLibraryRes) => void;
    item?: QrStyleLibraryRes | null;
}

const QrStyleLibModal: React.FC<QrStyleLibModalProps> = ({ isOpen, onClose, onSuccess, item }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [showRawJson, setShowRawJson] = useState(false);
    const [isDeletingModal, setIsDeletingModal] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const qrPreviewRef = useRef<HTMLDivElement>(null);
    const qrCodeRef = useRef<QRCodeStyling | null>(null);

    // Visual style state
    const [style, setStyle] = useState<StyleConfig>({ ...DEFAULT_STYLE });

    // Derived JSON from style config
    const styleJson = useMemo(() => JSON.stringify(style, null, 2), [style]);

    useEffect(() => {
        if (isOpen) {
            if (item) {
                setName(item.name || "");
                setIsActive(item.isActive ?? true);
                setStyle(parseStyleJson(item.styleJson));
            } else {
                setName("");
                setIsActive(true);
                setStyle({ ...DEFAULT_STYLE });
            }
            setIsConfirmOpen(false);
            setShowRawJson(false);
            qrCodeRef.current = null;
        }
    }, [isOpen, item]);

    const SAMPLE_QR_VALUE = "https://mywallet.vn/qr/sample-preview";

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

    // Create / update QR code instance
    useEffect(() => {
        if (!isOpen) return;

        const opts = {
            width: 160,
            height: 160,
            data: SAMPLE_QR_VALUE,
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
        }
    }, [style, isOpen]);

    if (!isOpen) return null;

    const updateStyle = (key: keyof StyleConfig, value: any) => {
        setStyle(prev => ({ ...prev, [key]: value }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            toast.error("Vui lòng nhập tên style.");
            return;
        }
        setIsConfirmOpen(true);
    };
    const executeSave = async () => {
        try {
            setLoading(true);
            const payload: any = {
                name,
                styleJson,
                isActive,
                type: QRStyleType.SYSTEM,
                isDefault: item ? item.isDefault : false
            };

            if (item) {
                await qrStyleLibApi.put(item.id, payload);
                toast.success("Cập nhật QR Style thành công!");
                onSuccess({ ...item, ...payload });
            } else {
                await qrStyleLibApi.post(payload);
                toast.success("Tạo mới QR Style thành công!");
                onSuccess();
            }

            setIsConfirmOpen(false);
            onClose();
        } catch (error) {
            console.error("Error saving QR Style:", error);
            toast.error("Có lỗi xảy ra khi lưu QR Style.");
        } finally {
            setLoading(false);
        }
    };

    const executeDelete = async () => {
        if (!item || isDeletingModal) return;
        try {
            setIsDeletingModal(true);
            await qrStyleLibApi.delete(item.id);
            toast.success("Xóa QR Style thành công!");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error deleting QR Style:", error);
            toast.error("Không thể xóa QR Style.");
        } finally {
            setIsDeletingModal(false);
            setIsDeleteConfirmOpen(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div
                className="modal-content max-w-modal-2xl bg-surface-elevated relative flex flex-col overflow-hidden"
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-lg py-md border-b border-border bg-surface-muted/30 shrink-0">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-sm">
                        <Layout className="w-5 h-5 text-primary" />
                        {item ? "Chỉnh sửa QR Style" : "Thêm QR Style hệ thống"}

                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng"
                        className="p-xs rounded-full text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleFormSubmit} className="overflow-y-auto flex-1">
                    <div className="p-lg flex flex-col gap-lg">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-lg">
                            {/* Left: Settings */}
                            <div className="flex flex-col gap-md">
                                {/* Name */}
                                <div className="flex flex-col gap-sm">
                                    <label htmlFor="styleName" className="text-sm font-semibold text-foreground-secondary">
                                        Tên Style <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="styleName"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="input"
                                        placeholder="VD: Style Hiện Đại"
                                        required
                                    />
                                </div>

                                {/* Customization Panel */}
                                <div className="w-full grid grid-cols-3 gap-md p-md bg-surface-muted/40 rounded-xl border border-border/50">
                                    {/* Pattern */}
                                    <div className="flex flex-col gap-xs">
                                        <label htmlFor="qr-pattern" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-xs">
                                            <Sliders className="w-3.5 h-3.5" /> Mẫu
                                        </label>
                                        <select
                                            id="qr-pattern"
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
                                                className="flex items-center gap-xs text-xs h-9 px-2 bg-surface border border-border/60 rounded-md hover:border-primary/40 text-foreground-muted hover:text-primary transition-colors"
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
                                                className="w-8 h-8 rounded-md cursor-pointer border-0 p-0 overflow-hidden shadow-sm"
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
                                                className="w-8 h-8 rounded-md cursor-pointer border-0 p-0 overflow-hidden shadow-sm"
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
                                                className="w-8 h-8 rounded-md cursor-pointer border-0 p-0 overflow-hidden shadow-sm"
                                            />
                                            <span className="text-[10px] font-mono uppercase text-foreground-muted">{style.eyeColor}</span>
                                        </div>
                                    </div>
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
                                                className="w-8 h-8 rounded-md cursor-pointer border-0 p-0 overflow-hidden shadow-sm"
                                            />
                                            <span className="text-[10px] font-mono uppercase text-foreground-muted">{style.borderColor}</span>
                                        </div>
                                    </div>

                                </div>

                                {/* Toggles */}
                                <div className="flex flex-col gap-md">
                                    <label className="flex items-center gap-sm cursor-pointer group">
                                        <div className="relative h-6 w-11 flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={isActive}
                                                onChange={(e) => setIsActive(e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-surface-muted peer-checked:bg-primary rounded-full transition-all border border-border after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-foreground-secondary group-hover:text-foreground transition-colors">Đang hoạt động</span>
                                            <span className="text-xs text-foreground-muted">Cho phép người dùng nhìn thấy và sử dụng style này</span>
                                        </div>
                                    </label>

                                </div>
                            </div>

                            {/* Right: QR Preview + JSON */}
                            <div className="flex flex-col items-center gap-md w-[200px]">
                                <span className="text-sm font-semibold text-foreground-secondary self-start flex items-center gap-xs">
                                    <QrCode className="w-4 h-4 text-primary" /> Xem trước
                                </span>
                                <div
                                    ref={qrPreviewRef}
                                    className="rounded-2xl border-2 shadow-inner overflow-hidden flex items-center justify-center transition-all duration-300"
                                    style={{ borderColor: style.borderColor, backgroundColor: style.bgColor, padding: 12 }}
                                />

                                {/* Toggle raw JSON */}
                                <button
                                    type="button"
                                    onClick={() => setShowRawJson(!showRawJson)}
                                    className="flex items-center gap-xs text-xs font-medium text-foreground-muted hover:text-primary transition-colors"
                                >
                                    {showRawJson ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    {showRawJson ? "Ẩn JSON" : "Xem JSON"}
                                </button>

                                {showRawJson && (
                                    <pre className="w-full text-[9px] font-mono bg-surface-muted/50 p-sm rounded-lg border border-border/40 overflow-auto max-h-[200px] whitespace-pre-wrap break-all animate-in slide-in-from-top-2 duration-300">
                                        {styleJson}
                                    </pre>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-lg py-md border-t border-border flex justify-between items-center bg-surface-muted/20 shrink-0">
                        <div className="flex gap-sm">
                            {item && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="medium"
                                    onClick={() => setIsDeleteConfirmOpen(true)}
                                    className="text-danger hover:bg-danger/10"
                                    disabled={loading || isDeletingModal}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Xóa Style
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-sm">
                            <Button type="button" variant="outline" size="medium" onClick={onClose} disabled={loading || isDeletingModal}>
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="medium"
                                loading={loading}
                                disabled={!name || isConfirmOpen || isDeletingModal}
                            >
                                {item ? "Cập nhật" : "Tạo mới"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>

            <ActionConfirmModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={executeDelete}
                title="Xác nhận xóa Style"
                description={
                    <div className="flex flex-col gap-3">
                        <p>Bạn có chắc muốn xóa style <span className="font-bold">"{name}"</span>?</p>
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-danger/5 border border-danger/10">
                            <AlertCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
                            <p className="text-xs text-danger/80">Hành động này không thể hoàn tác.</p>
                        </div>
                    </div>
                }
                loading={isDeletingModal}
                confirmText="Xác nhận xóa"
                variant="danger"
            />

            <ActionConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeSave}
                title={item ? "Xác nhận cập nhật QR Style" : "Xác nhận tạo QR Style mới"}
                description={`Bạn có chắc chắn muốn ${item ? "cập nhật" : "tạo mới"} style "${name}"?`}
                loading={loading}
                confirmText={item ? "Cập nhật" : "Tạo mới"}
            />
        </div>
    );
};

export default QrStyleLibModal;
