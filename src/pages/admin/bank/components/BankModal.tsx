import React, { useEffect, useState, useRef } from "react";
import { X, Upload } from "lucide-react";
import { toast } from "react-toastify";
import Button from "../../../../components/UICustoms/Button";
import { bankApi } from "../../../../services/bank-api.service";
import type { BankRes } from "../../../../models/entity.model";
import type { PostBankInfoReq } from "../../../../models/entity.request.model";
import { resolveAvatarPreview } from "../../../../utils/imageConvertUtils";

interface BankModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
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

    useEffect(() => {
        if (isOpen) {
            if (bank) {
                setFormData({
                    bankCode: bank.bankCode,
                    napasCode: bank.napasCode || "",
                    swiftCode: bank.swiftCode || "",
                    bankName: bank.bankName,
                    shortName: bank.shortName,
                    isActive: bank.isActive,
                });
                setPreviewUrl(resolveAvatarPreview(bank.logoUrl ?? null));
            } else {
                setFormData({
                    bankCode: "",
                    napasCode: "",
                    swiftCode: "",
                    bankName: "",
                    shortName: "",
                    isActive: true,
                });
                setPreviewUrl(null);
            }
            setFile(undefined);
        }
    }, [isOpen, bank]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.bankCode || !formData.bankName || !formData.shortName) {
            toast.error("Please fill in all required fields.");
            return;
        }

        try {
            setLoading(true);

            const reqFormData = new FormData();
            reqFormData.append('bankCode', formData.bankCode);
            reqFormData.append('napasCode', formData.napasCode || '');
            reqFormData.append('swiftCode', formData.swiftCode || '');
            reqFormData.append('bankName', formData.bankName);
            reqFormData.append('shortName', formData.shortName);
            reqFormData.append('isActive', String(formData.isActive));

            if (file) {
                reqFormData.append('logoUrl', file);
            }

            if (bank) {
                reqFormData.append('isDeleteFile', String(!file && !previewUrl));
                await bankApi.put(bank.id, reqFormData as any);
                toast.success("Bank updated successfully!");
            } else {
                await bankApi.post(reqFormData as any);
                toast.success("Bank created successfully!");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving bank:", error);
            toast.error("Failed to save bank information.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="modal-overlay bg-black/60 px-4 py-6"
            onClick={onClose}
        >
            <div
                className="modal-content max-w-modal-lg relative flex flex-col overflow-hidden rounded-2xl p-6 md:p-8 text-center shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground">
                        {bank ? "Edit Bank" : "Create New Bank"}
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Logo Upload */}
                        <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-lg bg-muted/20">
                            {previewUrl ? (
                                <div className="relative group">
                                    <img src={previewUrl} alt="Logo preview" className="w-24 h-24 object-contain rounded bg-white p-2 border border-border" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                </div>
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

                        {/* Text Inputs */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Bank Code <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="bankCode"
                                value={formData.bankCode}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. VCB"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Short Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="shortName"
                                value={formData.shortName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. Vietcombank"
                                required
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-foreground">Full Bank Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. Joint Stock Commercial Bank for Foreign Trade of Vietnam"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Napas Code</label>
                            <input
                                type="text"
                                name="napasCode"
                                value={formData.napasCode}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. 970436"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Swift Code</label>
                            <input
                                type="text"
                                name="swiftCode"
                                value={formData.swiftCode}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. BFTV VNVX"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2 flex items-center space-x-3 mt-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-foreground cursor-pointer">
                                Active (Bank is available for transactions)
                            </label>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-border flex justify-end gap-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-surface border border-border text-foreground hover:bg-muted px-4 py-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Bank"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BankModal;
