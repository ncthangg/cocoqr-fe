import React, { useEffect, useState, useRef } from "react";
import { X, Upload, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Button from "../../../../components/UICustoms/Button";
import { providerApi } from "../../../../services/provider-api.service";
import type { ProviderRes } from "../../../../models/entity.model";
import type { PostProviderReq } from "../../../../models/entity.request.model";
import { resolveAvatarPreview } from "../../../../utils/imageConvertUtils";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";

interface ProviderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    provider?: ProviderRes | null;
}

const ProviderModal: React.FC<ProviderModalProps> = ({ isOpen, onClose, onSuccess, provider }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<PostProviderReq>({
        code: "",
        name: "",
        isActive: true,
    });
    const [file, setFile] = useState<File | undefined>(undefined);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (provider) {
                setFormData({
                    code: provider.code || "",
                    name: provider.name || "",
                    isActive: provider.isActive ?? true,
                });
                setPreviewUrl(resolveAvatarPreview(provider.logoUrl ?? null));
            } else {
                setFormData({
                    code: "",
                    name: "",
                    isActive: true,
                });
                setPreviewUrl(null);
            }
            setFile(undefined);
            setIsConfirmOpen(false);
        }
    }, [isOpen, provider]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleClearImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(undefined);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
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
            reqFormData.append('code', formData.code);
            reqFormData.append('name', formData.name);
            reqFormData.append('isActive', String(formData.isActive));

            if (file) {
                reqFormData.append('logoUrl', file);
            }

            if (provider) {
                reqFormData.append('isDeleteFile', String(!file && !previewUrl));
                await providerApi.put(provider.id, reqFormData as any);
                toast.success("Cập nhật provider thành công!");
            } else {
                await providerApi.post(reqFormData as any);
                toast.success("Tạo mới provider thành công!");
            }

            setIsConfirmOpen(false);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving provider:", error);
            toast.error("Có lỗi xảy ra khi lưu provider.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="modal-overlay px-4 py-6"
        >
            <div
                className="modal-content max-w-modal-lg relative flex flex-col overflow-hidden rounded-2xl p-6 md:p-8 shadow-2xl bg-surface"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center pb-4 border-b border-border text-center">
                    <h2 className="text-xl font-bold text-foreground mx-auto">
                        {provider ? "Edit Provider" : "Create New Provider"}
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors absolute right-6 top-6">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="pt-6 overflow-y-auto max-h-[80vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Logo Upload */}
                        <div className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-lg bg-muted/20">
                            {previewUrl ? (
                                <>
                                    <div className="relative group">
                                        <img src={previewUrl} alt="Logo preview" className="w-24 h-24 object-contain rounded bg-white p-2 border border-border" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleClearImage}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-500/20"
                                        title="Delete image"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <div
                                    className="w-24 h-24 flex flex-col items-center justify-center bg-muted rounded border border-border cursor-pointer hover:bg-muted/80 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                                    <span className="text-xs text-muted-foreground">Upload Logo</span>
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

                        <div className="space-y-4">
                            <div className="space-y-2 text-left">
                                <label className="text-sm font-medium text-foreground">Provider Code <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="e.g. MOMO"
                                    required
                                />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-sm font-medium text-foreground">Provider Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="e.g. MoMo"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 rounded border-border focus:ring-primary/50"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-foreground cursor-pointer">Hoạt động</label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-border flex justify-end gap-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-background border border-border text-foreground hover:bg-muted px-4 py-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 border-transparent"
                            disabled={loading || !formData.name || !formData.code || isConfirmOpen}
                        >
                            {loading ? "Saving..." : "Save Provider"}
                        </Button>
                    </div>
                </form>
            </div>

            <ActionConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeSave}
                title={provider ? "Xác nhận cập nhật Provider" : "Xác nhận tạo Provider"}
                description={`Bạn có chắc chắn muốn ${provider ? "cập nhật" : "tạo mới"} provider ${formData.name}?`}
                loading={loading}
                confirmText={provider ? "Cập nhật" : "Tạo mới"}
            />
        </div>
    );
};

export default ProviderModal;
