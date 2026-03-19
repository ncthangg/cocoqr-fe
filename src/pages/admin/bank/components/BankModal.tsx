import React, { useEffect, useState, useRef } from "react";
import { X, Upload, Trash2, Landmark, Hash, FileText } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/UICustoms/Button";
import { bankApi } from "@/services/bank-api.service";
import type { BankRes } from "@/models/entity.model";
import type { PostBankInfoReq } from "@/models/entity.request.model";
import { resolveAvatarPreview } from "@/utils/imageConvertUtils";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";

interface BankModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedBank?: BankRes) => void;
    bank?: BankRes | null;
}

const BankModal: React.FC<BankModalProps> = ({ isOpen, onClose, onSuccess, bank }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<PostBankInfoReq>({
        bankCode: "",
        napasCode: "",
        swiftCode: "",
        bankName: "",
        shortName: "",
        isActive: true,
    });
    const [file, setFile] = useState<File | undefined>(undefined);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (bank) {
                setFormData({
                    bankCode: bank.bankCode,
                    napasCode: bank.napasBin || "",
                    swiftCode: bank.swiftCode || "",
                    bankName: bank.bankName,
                    shortName: bank.shortName,
                    isActive: bank.isActive,
                });
                setPreviewUrl(resolveAvatarPreview(bank.logoUrl ?? null));
            } else {
                setFormData({ bankCode: "", napasCode: "", swiftCode: "", bankName: "", shortName: "", isActive: true });
                setPreviewUrl(null);
            }
            setFile(undefined);
            setIsConfirmOpen(false);
        }
    }, [isOpen, bank]);

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
        if (!formData.bankCode || !formData.bankName || !formData.shortName) {
            toast.error("Vui lòng điền các trường bắt buộc.");
            return;
        }
        setIsConfirmOpen(true);
    };

    const executeSave = async () => {
        try {
            setLoading(true);
            const reqFormData = new FormData();
            reqFormData.append("bankCode", formData.bankCode);
            reqFormData.append("napasCode", formData.napasCode || "");
            reqFormData.append("swiftCode", formData.swiftCode || "");
            reqFormData.append("bankName", formData.bankName);
            reqFormData.append("shortName", formData.shortName);
            reqFormData.append("isActive", String(formData.isActive));
            if (file) reqFormData.append("logoUrl", file);

            if (bank) {
                reqFormData.append("isDeleteFile", String(!file && !previewUrl));
                await bankApi.put(bank.id, reqFormData as any);
                toast.success("Cập nhật ngân hàng thành công!");
                const updatedBank: BankRes = {
                    ...bank,
                    bankCode: formData.bankCode,
                    bankName: formData.bankName,
                    shortName: formData.shortName,
                    napasBin: formData.napasCode || undefined,
                    swiftCode: formData.swiftCode || undefined,
                    isActive: formData.isActive,
                };
                setIsConfirmOpen(false);
                onSuccess(updatedBank);
            } else {
                await bankApi.post(reqFormData as any);
                toast.success("Thêm mới ngân hàng thành công!");
                setIsConfirmOpen(false);
                onSuccess();
            }
            onClose();
        } catch (error) {
            console.error("Error saving bank:", error);
            toast.error("Có lỗi xảy ra khi lưu ngân hàng.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="modal-content max-w-modal-lg bg-surface-elevated relative flex flex-col overflow-hidden"
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-lg py-md border-b border-border bg-surface-muted/30 shrink-0">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-sm">
                        <Landmark className="w-5 h-5 text-primary" />
                        {bank ? "Chỉnh sửa ngân hàng" : "Thêm ngân hàng mới"}
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
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-lg">

                            {/* LEFT: Inputs (3/5) */}
                            <div className="md:col-span-3 flex flex-col gap-md">
                                <div className="grid grid-cols-2 gap-md">
                                    {/* Bank Code */}
                                    <div className="flex flex-col gap-sm">
                                        <label htmlFor="bankCode" className="text-sm font-semibold text-foreground-secondary flex items-center gap-xs">
                                            <Hash className="w-4 h-4 text-primary" />
                                            Mã ngân hàng <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            id="bankCode"
                                            type="text"
                                            name="bankCode"
                                            value={formData.bankCode}
                                            onChange={handleInputChange}
                                            className="input uppercase tracking-wider"
                                            placeholder="VD: VCB"
                                            required
                                        />
                                    </div>

                                    {/* Short Name */}
                                    <div className="flex flex-col gap-sm">
                                        <label htmlFor="shortName" className="text-sm font-semibold text-foreground-secondary flex items-center gap-xs">
                                            <FileText className="w-4 h-4 text-primary" />
                                            Tên viết tắt <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            id="shortName"
                                            type="text"
                                            name="shortName"
                                            value={formData.shortName}
                                            onChange={handleInputChange}
                                            className="input"
                                            placeholder="VD: Vietcombank"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div className="flex flex-col gap-sm">
                                    <label htmlFor="bankName" className="text-sm font-semibold text-foreground-secondary flex items-center gap-xs">
                                        <Landmark className="w-4 h-4 text-primary" />
                                        Tên đầy đủ <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="bankName"
                                        type="text"
                                        name="bankName"
                                        value={formData.bankName}
                                        onChange={handleInputChange}
                                        className="input"
                                        placeholder="VD: Ngân hàng TMCP Ngoại thương Việt Nam"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-md">
                                    {/* Napas Code */}
                                    <div className="flex flex-col gap-sm">
                                        <label htmlFor="napasCode" className="text-sm font-semibold text-foreground-secondary">
                                            Mã Napas
                                        </label>
                                        <input
                                            id="napasCode"
                                            type="text"
                                            name="napasCode"
                                            value={formData.napasCode || ""}
                                            onChange={handleInputChange}
                                            className="input font-mono"
                                            placeholder="VD: 970436"
                                        />
                                    </div>

                                    {/* Swift Code */}
                                    <div className="flex flex-col gap-sm">
                                        <label htmlFor="swiftCode" className="text-sm font-semibold text-foreground-secondary">
                                            Mã SWIFT
                                        </label>
                                        <input
                                            id="swiftCode"
                                            type="text"
                                            name="swiftCode"
                                            value={formData.swiftCode || ""}
                                            onChange={handleInputChange}
                                            className="input font-mono uppercase"
                                            placeholder="VD: BFTVVNVX"
                                        />
                                    </div>
                                </div>

                                {/* isActive Toggle */}
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
                                        Đang hoạt động (Cho phép giao dịch)
                                    </span>
                                </label>
                            </div>

                            {/* RIGHT: Logo Upload (2/5) */}
                            <div className="md:col-span-2 flex flex-col items-center gap-md">
                                <span className="text-sm font-semibold text-foreground-secondary self-start">Logo ngân hàng</span>
                                <div
                                    className="relative w-full aspect-square max-w-[200px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-strong bg-surface-muted/20 hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer"
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
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-lg py-md border-t border-border flex justify-end gap-sm bg-surface-muted/20 shrink-0">
                        <Button type="button" variant="ghost" size="medium" onClick={onClose} disabled={loading}>
                            Hủy
                        </Button>
                        <Button type="submit" variant="primary" size="medium" loading={loading} disabled={isConfirmOpen}>
                            {bank ? "Cập nhật" : "Tạo mới"}
                        </Button>
                    </div>
                </form>
            </div>

            <ActionConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeSave}
                title={bank ? "Xác nhận cập nhật ngân hàng" : "Xác nhận tạo ngân hàng mới"}
                description={`Bạn có chắc chắn muốn ${bank ? "cập nhật" : "tạo mới"} ngân hàng "${formData.shortName || formData.bankCode}"?`}
                loading={loading}
                confirmText={bank ? "Cập nhật" : "Tạo mới"}
            />
        </div>
    );
};

export default BankModal;
