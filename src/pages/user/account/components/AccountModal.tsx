import React, { useEffect, useState, useCallback } from "react";
import { X, Landmark, User, CreditCard, ChevronRight, PlusCircle, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/UICustoms/Button";
import { accountApi } from "@/services/account-api.service";
import { providerApi } from "@/services/provider-api.service";
import type { AccountRes, ProviderRes } from "@/models/entity.model";
import type { PostAccountReq, PutAccountReq } from "@/models/entity.request.model";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";
import ModalLoading from "@/components/UICustoms/Modal/ModalLoading";
import BankSelectionModal from "@/components/UICustoms/Modal/BankSelectionModal";
import { ProviderCode } from "@/models/enum";
import { resolveAvatarPreview } from "@/utils/imageConvertUtils";
import { cn } from "@/lib/utils";

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updated?: Partial<AccountRes> & { id: string }) => void;
    accountId: string | null;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSuccess, accountId }) => {
    const [allProviders, setAllProviders] = useState<ProviderRes[]>([]);
    const [formData, setFormData] = useState<PutAccountReq>({
        providerId: "",
        bankCode: "",
        bankName: "",
        accountHolder: "",
        accountNumber: "",
        isActive: true,
        isPinned: false,
    });

    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [hasFetchedProviders, setHasFetchedProviders] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [bankLogoUrl, setBankLogoUrl] = useState<string | null>(null);

    const selectedProvider = allProviders.find(p => p.id === formData.providerId) || null;
    const isBankType = selectedProvider?.code === ProviderCode.BANK;

    const fetchProviders = useCallback(async () => {
        if (hasFetchedProviders) return;
        try {
            const res = await providerApi.getAll();
            if (res) {
                setAllProviders(res || []);
                setHasFetchedProviders(true);
            }
        } catch (error) {
            console.error("Error fetching providers:", error);
        }
    }, [hasFetchedProviders]);

    const fetchAccountDetail = useCallback(async (id: string) => {
        try {
            setModalLoading(true);
            const res = await accountApi.getById(id);
            if (res) {
                setFormData({
                    providerId: res.providerId,
                    bankCode: res.bankCode ?? "",
                    bankName: res.bankName ?? "",
                    accountHolder: res.accountHolder ?? "",
                    accountNumber: res.accountNumber ?? "",
                    isActive: res.isActive,
                    isPinned: res.isPinned,
                });
                setBankLogoUrl(res.bankLogoUrl || null);
            }
        } catch (error) {
            console.error("Error fetching account detail:", error);
            toast.error("Không thể tải thông tin chi tiết tài khoản.");
            onClose();
        } finally {
            setModalLoading(false);
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            fetchProviders();
            if (accountId) fetchAccountDetail(accountId);
        } else {
            setFormData({
                providerId: "",
                bankCode: "",
                bankName: "",
                accountHolder: "",
                accountNumber: "",
                isActive: true,
                isPinned: false,
            });
            setBankLogoUrl(null);
            setModalLoading(false);
        }
    }, [isOpen, accountId, fetchProviders, fetchAccountDetail]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        if (isOpen) window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    const handleProviderChange = useCallback((providerId: string) => {
        setFormData(prev => ({ ...prev, providerId, bankCode: "", bankName: "" }));
        setBankLogoUrl(null);
    }, []);

    const handleFormSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        const isBank = selectedProvider?.code === ProviderCode.BANK;
        if (!formData.providerId || (isBank && !formData.bankCode) || !formData.accountHolder || (!formData.accountNumber && isBank)) {
            toast.warning("Vui lòng điền đầy đủ các trường bắt buộc.");
            return;
        }
        if (accountId) {
            executeSave();
        } else {
            setIsConfirmOpen(true);
        }
    };

    const executeSave = async () => {
        try {
            setLoading(true);
            const isBank = selectedProvider?.code === ProviderCode.BANK;
            const payload = {
                ...formData,
                bankCode: isBank ? formData.bankCode : null,
                bankName: isBank ? formData.bankName : null,
            };
            if (accountId) {
                await accountApi.put(accountId, payload);
                toast.success("Cập nhật tài khoản thành công!");
                onSuccess({
                    id: accountId,
                    providerId: formData.providerId,
                    providerCode: selectedProvider?.code,
                    providerName: selectedProvider?.name,
                    providerLogoUrl: selectedProvider?.logoUrl,
                    bankCode: formData.bankCode ?? undefined,
                    bankName: formData.bankName ?? undefined,
                    bankLogoUrl: bankLogoUrl ?? undefined,
                    accountHolder: formData.accountHolder,
                    accountNumber: formData.accountNumber,
                    isActive: formData.isActive,
                    isPinned: formData.isPinned,
                });
            } else {
                await accountApi.post(payload as PostAccountReq);
                toast.success("Thêm tài khoản mới thành công!");
                onClose();
                onSuccess();
            }
        } catch (error) {
            console.error("Error saving account:", error);
            toast.error("Không thể lưu thông tin tài khoản.");
        } finally {
            setLoading(false);
            setIsConfirmOpen(false);
        }
    };

    const handleSelectBank = useCallback((napasBin: string, code: string, shortName: string, bankName: string, logoUrl: string | null, isActive: boolean) => {
        setFormData(prev => ({ ...prev, napasBin, bankCode: code, bankName: bankName, bankShortName: shortName, bankLogoUrl: logoUrl, isBankInactive: !isActive }));
        setBankLogoUrl(logoUrl);
        setIsBankModalOpen(false);
    }, []);

    if (!isOpen) return null;

    return (
        <>
            <div
                className="modal-overlay"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div
                    className="modal-content max-w-modal-lg flex flex-col overflow-hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-label={accountId ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
                    onClick={(e) => e.stopPropagation()}
                >
                    <ModalLoading loading={modalLoading} />

                    {/* Header */}
                    <div className="flex items-center justify-between px-lg py-md border-b border-border bg-surface-muted/30 shrink-0">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-sm">
                            <PlusCircle className="w-5 h-5 text-primary" />
                            {accountId ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Đóng"
                            className="p-xs rounded-full text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-all"
                            disabled={loading}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleFormSubmit} className="overflow-y-auto flex-1">
                        <div className="p-lg">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-xl">

                                {/* LEFT COLUMN: Inputs (3/5) */}
                                <div className="md:col-span-3 flex flex-col gap-lg">

                                    {/* Provider Selection */}
                                    <div className="flex flex-col gap-sm">
                                        <label className="text-sm font-semibold text-foreground-secondary flex items-center gap-sm">
                                            <Landmark className="w-4 h-4 text-primary" />
                                            Loại tài khoản
                                        </label>
                                        <select
                                            className="input focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer h-11"
                                            value={formData.providerId}
                                            onChange={(e) => handleProviderChange(e.target.value)}
                                        >
                                            <option value="" disabled hidden>Chọn loại tài khoản...</option>
                                            {allProviders.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Account Holder */}
                                    <div className="flex flex-col gap-sm">
                                        <label className="text-sm font-semibold text-foreground-secondary flex items-center gap-sm">
                                            <User className="w-4 h-4 text-primary" />
                                            Tên tài khoản
                                        </label>
                                        <input
                                            type="text"
                                            name="accountHolder"
                                            className="input uppercase tracking-wider h-11 focus:ring-2 focus:ring-primary/20 transition-all"
                                            value={formData.accountHolder}
                                            onChange={(e) => setFormData(prev => ({ ...prev, accountHolder: e.target.value }))}
                                            placeholder="NGUYEN VAN A"
                                            required
                                        />
                                    </div>

                                    {/* Account Number */}
                                    <div className="flex flex-col gap-sm">
                                        <label className="text-sm font-semibold text-foreground-secondary flex items-center gap-sm">
                                            <CreditCard className="w-4 h-4 text-primary" />
                                            {isBankType ? "Số tài khoản" : "Số điện thoại / ID ví"}
                                        </label>
                                        <input
                                            type="text"
                                            name="accountNumber"
                                            className="input h-11 focus:ring-2 focus:ring-primary/20 transition-all font-mono tracking-tight"
                                            value={formData.accountNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                                            placeholder={isBankType ? "0123456789" : "09xxxxxxxx"}
                                            required
                                        />
                                    </div>

                                    {/* IsActive Toggle */}
                                    <label className="flex items-center gap-sm py-sm px-md bg-surface-muted/30 rounded-xl border border-border cursor-pointer hover:bg-surface-muted/50 transition-all group">
                                        <div className="relative inline-flex h-6 w-11 items-center">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={!!formData.isActive}
                                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                                id="isActive-toggle"
                                            />
                                            <div className="w-11 h-6 bg-surface-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-all border border-border"></div>
                                        </div>
                                        <span className="text-sm font-semibold text-foreground-secondary select-none group-hover:text-foreground transition-colors">
                                            Đang hoạt động (Cho phép tạo QR)
                                        </span>
                                    </label>
                                </div>

                                {/* RIGHT COLUMN: Preview / Avatar Box (2/5) */}
                                <div className="md:col-span-2 flex flex-col items-center">
                                    <div
                                        className={cn(
                                            "relative w-full aspect-square max-w-[240px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-lg transition-all duration-300 group",
                                            isBankType
                                                ? "cursor-pointer hover:border-primary hover:bg-primary/5 bg-surface-muted/20 border-border"
                                                : "border-border/50 bg-surface-muted/10 cursor-default"
                                        )}
                                        onClick={() => isBankType && setIsBankModalOpen(true)}
                                    >
                                        {isBankType ? (
                                            <>
                                                {(formData.bankCode || bankLogoUrl) ? (
                                                    <div className="flex flex-col items-center gap-md text-center animate-in fade-in zoom-in duration-300 w-full">
                                                        <div className="w-32 h-32 bg-white rounded-2xl shadow-md p-md border border-border flex items-center justify-center">
                                                            {bankLogoUrl ? (
                                                                <img src={resolveAvatarPreview(bankLogoUrl)} alt={formData.bankName || "Bank"} className="w-full h-full object-contain" />
                                                            ) : (
                                                                <div className="w-full h-full bg-primary/10 rounded-xl flex items-center justify-center">
                                                                    <span className="text-2xl font-bold text-primary">{formData.bankCode?.substring(0, 2) || "BK"}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col gap-xs">
                                                            <p className="font-bold text-foreground text-lg">{formData.bankCode}</p>
                                                            <p className="text-xs text-foreground-secondary line-clamp-2 px-sm leading-relaxed">{formData.bankName}</p>
                                                        </div>
                                                        <div className="absolute top-md right-md bg-primary text-white p-xs rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Pencil className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-md text-center text-foreground-muted group-hover:text-primary transition-colors">
                                                        <div className="w-24 h-24 bg-surface-elevated rounded-2xl border border-border shadow-sm flex items-center justify-center">
                                                            <Landmark className="w-10 h-10" />
                                                        </div>
                                                        <div className="flex flex-col gap-xs">
                                                            <p className="font-bold">Chọn ngân hàng</p>
                                                            <p className="text-xs px-md uppercase tracking-widest opacity-80">Bank Selection Required</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : selectedProvider ? (
                                            <div className="flex flex-col items-center gap-md text-center animate-in fade-in zoom-in duration-300">
                                                <div className="w-32 h-32 bg-white rounded-2xl shadow-md p-md border border-border flex items-center justify-center">
                                                    {selectedProvider.logoUrl ? (
                                                        <img src={resolveAvatarPreview(selectedProvider.logoUrl)} alt={selectedProvider.name} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <div className="w-full h-full bg-primary/10 rounded-xl flex items-center justify-center">
                                                            <span className="text-2xl font-bold text-primary">{selectedProvider.code.substring(0, 2)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-xs">
                                                    <p className="font-bold text-foreground text-lg">{selectedProvider.name}</p>
                                                    <p className="text-xs text-foreground-muted uppercase tracking-widest leading-relaxed">{selectedProvider.code}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-sm text-foreground-muted text-center">
                                                <p className="text-xs font-medium">Vui lòng chọn "LOẠI TÀI KHOẢN"</p>
                                            </div>
                                        )}
                                    </div>

                                    {isBankType && (
                                        <button
                                            type="button"
                                            onClick={() => setIsBankModalOpen(true)}
                                            className="mt-lg flex items-center gap-sm text-sm font-bold text-primary hover:text-primary-dark transition-colors group px-md py-sm hover:bg-primary/5 rounded-full"
                                        >
                                            {formData.bankCode ? "Thay đổi ngân hàng" : "Chọn ngân hàng"}
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="px-lg py-md border-t border-border bg-surface-muted/20 flex justify-end gap-sm shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            value="Hủy"
                        />
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleFormSubmit}
                            disabled={loading || modalLoading}
                            loading={loading || modalLoading}
                            value={accountId ? "Cập nhật dữ liệu" : "Lưu tài khoản"}
                        />
                    </div>
                </div>
            </div>

            <ActionConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeSave}
                title="Xác nhận lưu thay đổi"
                description="Bạn có chắc chắn muốn hệ thống ghi nhận các thông tin tài khoản này không?"
                loading={loading}
                confirmText={accountId ? "Cập nhật" : "Xác nhận lưu"}
            />

            <BankSelectionModal
                isOpen={isBankModalOpen}
                onClose={() => setIsBankModalOpen(false)}
                onSelectBank={handleSelectBank}
                allowInactiveSelection={true}
            />
        </>
    );
};

export default AccountModal;
