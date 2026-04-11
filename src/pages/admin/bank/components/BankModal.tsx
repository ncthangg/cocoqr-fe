import React, { useEffect, useState, useRef } from "react";
import { X, Upload, Trash2, Landmark, Hash, FileText } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/UICustoms/Button";
import { bankApi } from "@/services/bank-api.service";
import type { BankRes } from "@/models/entity.model";
import type { PutBankInfoReq } from "@/models/entity.request.model";
import StatusToggle from "@/components/UICustoms/Form/StatusToggle";
import BrandLogo from "@/components/UICustoms/BrandLogo";

interface BankModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedBank?: BankRes) => void;
    bank?: BankRes | null;
}

const BankModal: React.FC<BankModalProps> = ({ isOpen, onClose, onSuccess, bank }) => {
    //#region States & Refs
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<PutBankInfoReq>({
        bankCode: "",
        napasBin: "",
        swiftCode: "",
        bankName: "",
        shortName: "",
        isActive: true,
    });
    const [file, setFile] = useState<File | undefined>(undefined);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    //#endregion

    //#region Side Effects
    useEffect(() => {
        if (isOpen) {
            if (bank) {
                setFormData({
                    bankCode: bank.bankCode,
                    napasBin: bank.napasBin || "",
                    swiftCode: bank.swiftCode || "",
                    bankName: bank.bankName,
                    shortName: bank.shortName,
                    isActive: bank.isActive,
                });
                setPreviewUrl(bank.logoUrl ?? null);
            } else {
                setFormData({ bankCode: "", napasBin: "", swiftCode: "", bankName: "", shortName: "", isActive: true });
                setPreviewUrl(null);
            }
            setFile(undefined);
        }
    }, [isOpen, bank]);
    //#endregion

    //#region Handlers
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

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.bankCode || !formData.bankName || !formData.shortName) {
            toast.error("Vui lòng điền các trường bắt buộc.");
            return;
        }
        await executeSave();
    };

    const executeSave = async () => {
        try {
            setLoading(true);
            if (bank) {
                const reqFormData = new FormData();
                reqFormData.append("isActive", String(formData.isActive));
                if (file) reqFormData.append("logoUrl", file);
                reqFormData.append("isDeleteFile", String(!file && !previewUrl));

                await bankApi.put(bank.id, reqFormData as any);
                const updatedBank: BankRes = {
                    ...bank,
                    isActive: formData.isActive,
                    logoUrl: file ? (previewUrl ?? undefined) : (previewUrl ? bank.logoUrl : undefined),
                };
                onSuccess(updatedBank);
            }
            onClose();
        } finally {
            setLoading(false);
        }
    };
    const isSubmitDisabled = () => {
        if (loading) return true;
        if (!bank) return false; // In create mode, we can always submit if no specific validation is needed
        const hasStatusChanged = formData.isActive !== bank.isActive;
        const hasImageChanged = !!file || previewUrl !== (bank.logoUrl ?? null);
        return !hasStatusChanged && !hasImageChanged;
    };
    //#endregion

    //#region Render
    if (!isOpen) return null;

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
                        Cập nhật ngân hàng
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

                            {/* LEFT: Inputs (1/2) */}
                            <div className="flex flex-col gap-md">
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
                                            readOnly
                                            className="input uppercase tracking-wider bg-surface-muted/50 cursor-not-allowed opacity-80"
                                            placeholder="VD: VCB"
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
                                            readOnly
                                            className="input bg-surface-muted/50 cursor-not-allowed opacity-80"
                                            placeholder="VD: Vietcombank"
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
                                        readOnly
                                        className="input bg-surface-muted/50 cursor-not-allowed opacity-80"
                                        placeholder="VD: Ngân hàng TMCP Ngoại thương Việt Nam"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-md items-end">
                                    {/* Napas Code */}
                                    <div className="flex flex-col gap-sm">
                                        <label htmlFor="napasBin" className="text-sm font-semibold text-foreground-secondary">
                                            Mã Napas
                                        </label>
                                        <input
                                            id="napasBin"
                                            type="text"
                                            name="napasBin"
                                            value={formData.napasBin || ""}
                                            readOnly
                                            className="input font-primary bg-surface-muted/50 cursor-not-allowed opacity-80 text-center"
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
                                            readOnly
                                            className="input font-primary uppercase bg-surface-muted/50 cursor-not-allowed opacity-80 text-center"
                                            placeholder="VD: BFTVVNVX"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Logo Upload (2/2) */}
                            <div className="flex flex-col items-center gap-md">
                                <span className="text-sm font-semibold text-foreground-secondary self-start">Logo ngân hàng</span>
                                <div
                                    className="relative w-full aspect-square max-w-[240px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-strong bg-surface-muted/20 hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer"
                                    onClick={() => !previewUrl && fileInputRef.current?.click()}
                                >
                                    {previewUrl ? (
                                        <>
                                            <div className="relative group/logo">
                                                <BrandLogo
                                                    logoUrl={previewUrl}
                                                    name={formData.bankName}
                                                    code={formData.bankCode}
                                                    size="xl"
                                                    shadow="md"
                                                />
                                                <div
                                                    className="absolute inset-0 bg-foreground/40 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity rounded-xl cursor-pointer"
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

                                {/* isActive Toggle */}
                                <div className="mt-auto w-full flex flex-col gap-sm pt-md">
                                    <StatusToggle
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        checkedLabel="Hoạt động"
                                        uncheckedLabel="Bảo trì"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-lg py-md border-t border-border flex justify-end gap-sm bg-surface-muted/20 shrink-0">
                        <Button type="button" variant="outline" size="medium" onClick={onClose} disabled={loading}>
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="medium"
                            loading={loading}
                            disabled={isSubmitDisabled()}
                        >
                            Cập nhật
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
    //#endregion
};

export default BankModal;
