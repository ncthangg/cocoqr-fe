import React, { useEffect, useState, useRef } from "react";
import { X, Upload, Trash2, Hash, Layers } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/UICustoms/Button";
import { providerApi } from "@/services/provider-api.service";
import type { ProviderRes } from "@/models/entity.model";
import type { PostProviderReq } from "@/models/entity.request.model";
import { resolveAvatarPreview } from "@/utils/imageConvertUtils";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";

interface ProviderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedProvider?: ProviderRes) => void;
    provider?: ProviderRes | null;
}

const ProviderModal: React.FC<ProviderModalProps> = ({ isOpen, onClose, onSuccess, provider }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<PostProviderReq>({ code: "", name: "", isActive: true });
    const [file, setFile] = useState<File | undefined>(undefined);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (provider) {
                setFormData({ code: provider.code || "", name: provider.name || "", isActive: provider.isActive ?? true });
                setPreviewUrl(resolveAvatarPreview(provider.logoUrl ?? null));
            } else {
                setFormData({ code: "", name: "", isActive: true });
                setPreviewUrl(null);
            }
            setFile(undefined);
            setIsConfirmOpen(false);
        }
    }, [isOpen, provider]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreviewUrl(URL.createObjectURL(f));
        }
    };

    const handleClearImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(undefined);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.code) {
            toast.error("Vui lòng nhập tên và mã provider.");
            return;
        }
        setIsConfirmOpen(true);
    };

    const executeSave = async () => {
        try {
            setLoading(true);
            const reqFormData = new FormData();
            reqFormData.append("code", formData.code);
            reqFormData.append("name", formData.name);
            reqFormData.append("isActive", String(formData.isActive));
            if (file) reqFormData.append("logoUrl", file);

            if (provider) {
                reqFormData.append("isDeleteFile", String(!file && !previewUrl));
                await providerApi.put(provider.id, reqFormData as any);
                toast.success("Cập nhật provider thành công!");
                const updatedProvider: ProviderRes = {
                    ...provider,
                    code: formData.code,
                    name: formData.name,
                    isActive: formData.isActive,
                    logoUrl: file ? (previewUrl ?? undefined) : (previewUrl ? provider.logoUrl : undefined),
                };
                setIsConfirmOpen(false);
                onSuccess(updatedProvider);
            } else {
                await providerApi.post(reqFormData as any);
                toast.success("Tạo mới provider thành công!");
                setIsConfirmOpen(false);
                onSuccess();
            }
            onClose();
        } catch (error) {
            console.error("Error saving provider:", error);
            toast.error("Có lỗi xảy ra khi lưu provider.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div
                className="modal-content max-w-modal-md bg-surface-elevated relative flex flex-col overflow-hidden"
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-lg py-md border-b border-border bg-surface-muted/30 shrink-0">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-sm">
                        <Layers className="w-5 h-5 text-primary" />
                        {provider ? "Chỉnh sửa provider" : "Thêm provider mới"}
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
                    <div className="p-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">

                            {/* Logo Upload */}
                            <div className="flex flex-col items-center gap-md">
                                <span className="text-sm font-semibold text-foreground-secondary self-start">Logo</span>
                                <div
                                    className="relative w-full aspect-square max-w-[180px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-strong bg-surface-muted/20 hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer"
                                    onClick={() => !previewUrl && fileInputRef.current?.click()}
                                >
                                    {previewUrl ? (
                                        <>
                                            <div className="relative">
                                                <img
                                                    src={previewUrl}
                                                    alt="Logo preview"
                                                    className="w-24 h-24 object-contain rounded-xl bg-bg p-xs border border-border"
                                                />
                                                <div
                                                    className="absolute inset-0 bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer"
                                                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                                >
                                                    <Upload className="w-6 h-6 text-bg" />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleClearImage}
                                                aria-label="Xóa ảnh"
                                                className="absolute top-sm right-sm p-2xs rounded-md bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all border border-danger/20"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-sm text-foreground-muted group-hover:text-primary transition-colors">
                                            <Upload className="w-8 h-8" />
                                            <span className="text-sm font-medium">Tải lên logo</span>
                                            <span className="text-xs">PNG, JPG, SVG</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="flex flex-col gap-md justify-center">
                                <div className="flex flex-col gap-sm">
                                    <label htmlFor="code" className="text-sm font-semibold text-foreground-secondary flex items-center gap-xs">
                                        <Hash className="w-4 h-4 text-primary" />
                                        Mã provider <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="code"
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        readOnly={!!provider}
                                        className={`input uppercase tracking-wider ${provider ? "bg-surface-muted/50 cursor-not-allowed opacity-80" : ""}`}
                                        placeholder="VD: MOMO"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-sm">
                                    <label htmlFor="providerName" className="text-sm font-semibold text-foreground-secondary flex items-center gap-xs">
                                        <Layers className="w-4 h-4 text-primary" />
                                        Tên provider <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="providerName"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="input"
                                        placeholder="VD: MoMo"
                                        required
                                    />
                                </div>

                                <label className="flex items-center gap-sm py-sm px-md bg-surface-muted/30 rounded-xl border border-border cursor-pointer hover:bg-surface-muted/50 transition-all group">
                                    <div className="relative h-6 w-11 flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            name="isActive"
                                            id="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                        />
                                        <div className="w-11 h-6 bg-surface-muted peer-checked:bg-primary rounded-full transition-all border border-border after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                                    </div>
                                    <span className="text-sm font-semibold text-foreground-secondary select-none group-hover:text-foreground transition-colors">
                                        Đang hoạt động
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-lg py-md border-t border-border flex justify-end gap-sm bg-surface-muted/20 shrink-0">
                        <Button type="button" variant="ghost" size="medium" onClick={onClose} disabled={loading}>
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="medium"
                            loading={loading}
                            disabled={!formData.name || !formData.code || isConfirmOpen}
                        >
                            {provider ? "Cập nhật" : "Tạo mới"}
                        </Button>
                    </div>
                </form>
            </div>

            <ActionConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeSave}
                title={provider ? "Xác nhận cập nhật Provider" : "Xác nhận tạo Provider mới"}
                description={`Bạn có chắc chắn muốn ${provider ? "cập nhật" : "tạo mới"} provider "${formData.name}"?`}
                loading={loading}
                confirmText={provider ? "Cập nhật" : "Tạo mới"}
            />
        </div>
    );
};

export default ProviderModal;
