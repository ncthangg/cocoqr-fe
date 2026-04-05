import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
import { cn } from "@/lib/utils";
import StatusToggle from "@/components/UICustoms/Form/StatusToggle";
import BrandLogo from "@/components/UICustoms/BrandLogo";

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
    const hasFetchedProviders = useRef(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [bankLogoUrl, setBankLogoUrl] = useState<string | null>(null);

    const selectedProvider = useMemo(() => allProviders.find(p => p.id === formData.providerId) || null, [allProviders, formData.providerId]);
    const isBankType = selectedProvider?.code === ProviderCode.BANK;

    const fetchProviders = useCallback(async () => {
        if (hasFetchedProviders.current) return;
        try {
            const res = await providerApi.getAll();
            if (res) {
                setAllProviders(res || []);
                hasFetchedProviders.current = true;
            }
        } catch (error) {
            console.error("Error fetching providers:", error);
        }
    }, []);

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
            resetForm();
        }
    }, [isOpen, accountId, fetchProviders, fetchAccountDetail]);

    const resetForm = () => {
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
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        if (isOpen) window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    const handleProviderChange = useCallback((providerId: string) => {
        setFormData(prev => ({ ...prev, providerId, bankCode: "", bankName: "" }));
        setBankLogoUrl(null);
    }, []);

    const executeSave = useCallback(async () => {
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
    }, [accountId, formData, selectedProvider, bankLogoUrl, onSuccess, onClose]);

    const handleFormSubmit = useCallback((e?: React.FormEvent) => {
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
    }, [accountId, executeSave, formData, selectedProvider]);

    const handleSelectBank = useCallback((napasBin: string, code: string, shortName: string, bankName: string, logoUrl: string | null, isActive: boolean) => {
        setFormData(prev => ({ ...prev, napasBin, bankCode: code, bankName: bankName, bankShortName: shortName, bankLogoUrl: logoUrl, isBankInactive: !isActive }));
        setBankLogoUrl(logoUrl);
        setIsBankModalOpen(false);
    }, []);

    const toggleActive = useCallback((checked: boolean) => {
        setFormData(prev => ({ ...prev, isActive: checked }));
    }, []);

    const updateAccountHolder = useCallback((val: string) => {
        setFormData(prev => ({ ...prev, accountHolder: val }));
    }, []);

    const updateAccountNumber = useCallback((val: string) => {
        setFormData(prev => ({ ...prev, accountNumber: val }));
    }, []);

    const openBankModal = useCallback(() => setIsBankModalOpen(true), []);

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay">
                <div
                    className="modal-content max-w-modal-lg flex flex-col overflow-hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-label={accountId ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
                    onClick={(e) => e.stopPropagation()}
                >
                    <ModalLoading loading={modalLoading} />

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

                    <form onSubmit={handleFormSubmit} className="overflow-y-auto flex-1">
                        <div className="p-lg">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-xl">
                                <FormSection
                                    formData={formData}
                                    providers={allProviders}
                                    isBankType={isBankType}
                                    onProviderChange={handleProviderChange}
                                    onAccountHolderChange={updateAccountHolder}
                                    onAccountNumberChange={updateAccountNumber}
                                    onActiveToggle={toggleActive}
                                />
                                <PreviewSection
                                    isBankType={isBankType}
                                    bankCode={formData.bankCode}
                                    bankName={formData.bankName}
                                    bankLogoUrl={bankLogoUrl}
                                    selectedProvider={selectedProvider}
                                    onOpenBankModal={openBankModal}
                                />
                            </div>
                        </div>
                    </form>

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

// --- Subcomponents ---

interface FormSectionProps {
    formData: PutAccountReq;
    providers: ProviderRes[];
    isBankType: boolean;
    onProviderChange: (id: string) => void;
    onAccountHolderChange: (val: string) => void;
    onAccountNumberChange: (val: string) => void;
    onActiveToggle: (checked: boolean) => void;
}

const FormSection: React.FC<FormSectionProps> = React.memo(({
    formData,
    providers,
    isBankType,
    onProviderChange,
    onAccountHolderChange,
    onAccountNumberChange,
    onActiveToggle
}) => (
    <div className="md:col-span-3 flex flex-col gap-lg">
        <div className="flex flex-col gap-sm">
            <label className="text-sm font-semibold text-foreground-secondary flex items-center gap-sm">
                <Landmark className="w-4 h-4 text-primary" />
                Loại tài khoản
            </label>
            <select
                className="input focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer h-11"
                value={formData.providerId}
                onChange={(e) => onProviderChange(e.target.value)}
            >
                <option value="" disabled hidden>Chọn loại tài khoản...</option>
                {providers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
        </div>

        <div className="flex flex-col gap-sm">
            <label className="text-sm font-semibold text-foreground-secondary flex items-center gap-sm">
                <User className="w-4 h-4 text-primary" />
                Tên tài khoản
            </label>
            <input
                type="text"
                className="input uppercase tracking-wider h-11 focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.accountHolder}
                onChange={(e) => onAccountHolderChange(e.target.value)}
                placeholder="NGUYEN VAN A"
                required
            />
        </div>

        <div className="flex flex-col gap-sm">
            <label className="text-sm font-semibold text-foreground-secondary flex items-center gap-sm">
                <CreditCard className="w-4 h-4 text-primary" />
                {isBankType ? "Số tài khoản" : "Số điện thoại / ID ví"}
            </label>
            <input
                type="text"
                className="input h-11 focus:ring-2 focus:ring-primary/20 transition-all font-primary tracking-tight"
                value={formData.accountNumber}
                onChange={(e) => onAccountNumberChange(e.target.value)}
                placeholder={isBankType ? "0123456789" : "09xxxxxxxx"}
                required
            />
        </div>

        <StatusToggle
            checked={!!formData.isActive}
            onChange={(e) => onActiveToggle(e.target.checked)}
            id="isActive-toggle"
            checkedLabel="Đang hoạt động (Cho phép tạo QR)"
            uncheckedLabel="Không hoạt động"
        />
    </div>
));

interface PreviewSectionProps {
    isBankType: boolean;
    bankCode?: string | null;
    bankName?: string | null;
    bankLogoUrl: string | null;
    selectedProvider: ProviderRes | null;
    onOpenBankModal: () => void;
}

const PreviewSection: React.FC<PreviewSectionProps> = React.memo(({
    isBankType,
    bankCode,
    bankName,
    bankLogoUrl,
    selectedProvider,
    onOpenBankModal
}) => (
    <div className="md:col-span-2 flex flex-col items-center">
        <div
            className={cn(
                "relative w-full aspect-square max-w-[240px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-lg transition-all duration-300 group",
                isBankType
                    ? "cursor-pointer hover:border-primary hover:bg-primary/[0.03] bg-surface-muted/50 dark:bg-surface-muted/20 border-border shadow-inner"
                    : "border-border/50 bg-surface-muted/10 cursor-default"
            )}
            onClick={() => isBankType && onOpenBankModal()}
        >
            {isBankType ? (
                <>
                    {(bankCode || bankLogoUrl) ? (
                        <div className="flex flex-col items-center gap-md text-center animate-in fade-in zoom-in duration-300 w-full">
                            <BrandLogo
                                logoUrl={bankLogoUrl}
                                name={bankName ?? undefined}
                                code={bankCode ?? undefined}
                                size="xl"
                                shadow="lg"
                                className="group-hover:scale-105"
                            />
                            <div className="flex flex-col gap-xs">
                                <p className="font-bold text-foreground text-lg tracking-tight">{bankCode}</p>
                                <p className="text-[11px] text-foreground-secondary font-medium line-clamp-2 px-sm leading-relaxed uppercase opacity-80">{bankName}</p>
                            </div>
                            <div className="absolute top-md right-md bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <Pencil className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-md text-center text-foreground-muted group-hover:text-primary transition-all duration-300">
                            <div className="w-24 h-24 bg-surface-elevated rounded-2xl border border-border shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:border-primary/30 transition-all">
                                <Landmark className="w-10 h-10 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                            </div>
                            <div className="flex flex-col gap-xs">
                                <p className="font-bold text-sm">Chọn ngân hàng</p>
                                <p className="text-[10px] px-md uppercase tracking-[0.2em] font-black opacity-40 group-hover:opacity-100 transition-opacity">Required</p>
                            </div>
                        </div>
                    )}
                </>
            ) : selectedProvider ? (
                <div className="flex flex-col items-center gap-md text-center animate-in fade-in zoom-in duration-300 w-full">
                    <BrandLogo
                        logoUrl={selectedProvider.logoUrl}
                        name={selectedProvider.name}
                        code={selectedProvider.code}
                        size="xl"
                        shadow="lg"
                        className="group-hover:scale-105"
                    />
                    <div className="flex flex-col gap-xs">
                        <p className="font-bold text-foreground text-lg tracking-tight">{selectedProvider.name}</p>
                        <p className="text-[11px] text-foreground-muted uppercase tracking-[0.2em] font-black leading-relaxed">{selectedProvider.code}</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-sm text-foreground-muted text-center p-md">
                    <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center mb-2">
                        <PlusCircle className="w-6 h-6 opacity-20" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-normal">
                        Vui lòng chọn<br />"LOẠI TÀI KHOẢN"
                    </p>
                </div>
            )}
        </div>

        {isBankType && (
            <button
                type="button"
                onClick={onOpenBankModal}
                className="mt-lg flex items-center gap-sm text-sm font-bold text-primary hover:text-primary-dark transition-colors group px-md py-sm hover:bg-primary/5 rounded-full"
            >
                {bankCode ? "Thay đổi ngân hàng" : "Chọn ngân hàng"}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        )}
    </div>
));

export default AccountModal;
