import React, { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/UICustoms/Button";
import { accountApi } from "@/services/account-api.service";
import { providerApi } from "@/services/provider-api.service";
import type { AccountRes, ProviderRes } from "@/models/entity.model";
import type { PostAccountReq, PutAccountReq } from "@/models/entity.request.model";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";
import AccountProviderSelector from "@/components/UICustoms/Form/AccountProviderSelector";

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    account: AccountRes | null;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSuccess, account }) => {
    const [allProviders, setAllProviders] = useState<ProviderRes[]>([]);
    const [formData, setFormData] = useState<PutAccountReq>({
        providerId: "",
        bankCode: "",
        bankName: "",
        accountHolder: "",
        accountNumber: "",
        isActive: true,
    });

    const [loading, setLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isBankInactive, setIsBankInactive] = useState(false);

    const fetchProviders = useCallback(async () => {
        try {
            const res = await providerApi.getAll();
            if (res) {
                setAllProviders(res || []);
            }
        } catch (error) {
            console.error("Error fetching providers:", error);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchProviders();
        }
    }, [isOpen, fetchProviders]);

    useEffect(() => {
        if (account) {
            setFormData({
                providerId: account.providerId,
                bankCode: account.bankCode ?? "",
                bankName: account.bankName ?? "",
                accountHolder: account.accountHolder ?? "",
                accountNumber: account.accountNumber ?? "",
                isActive: account.isActive,
            });
            setIsBankInactive(account.bankStatus === false);
        } else {
            setFormData({
                providerId: "",
                bankCode: "",
                bankName: "",
                accountHolder: "",
                accountNumber: "",
                isActive: true,
            });
            setIsBankInactive(false);
        }
    }, [account, isOpen]);

    // Tự động điền cho Wallet
    useEffect(() => {
        if (formData.providerId) {
            const p = allProviders.find(x => x.id === formData.providerId);
            if (p && p.code !== "BANK") {
                setFormData(prev => ({
                    ...prev,
                    bankCode: p.code,
                    bankName: p.name,
                }));
            }
        }
    }, [formData.providerId, allProviders]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedProvider = allProviders.find(p => p.id === formData.providerId);
        const isBank = selectedProvider?.code === "BANK";

        if (!formData.providerId || !formData.bankCode || !formData.accountHolder || (!formData.accountNumber && isBank)) {
            toast.warning("Vui lòng điền đầy đủ các trường bắt buộc.");
            return;
        }
        setIsConfirmOpen(true);
    };

    const executeSave = async () => {
        try {
            setLoading(true);
            if (account) {
                await accountApi.put(account.id, formData);
                toast.success("Cập nhật tài khoản thành công!");
            } else {
                await accountApi.post(formData as PostAccountReq);
                toast.success("Thêm tài khoản mới thành công!");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving account:", error);
            toast.error("Không thể lưu thông tin tài khoản.");
        } finally {
            setLoading(false);
            setIsConfirmOpen(false);
        }
    };

    const handleSelectBank = (code: string, name: string, _logoUrl: string | null) => {
        setFormData(prev => ({
            ...prev,
            bankCode: code,
            bankName: name
        }));
        setIsBankInactive(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay px-4 flex items-center justify-center z-50">
            <div className="modal-content max-w-modal-lg bg-surface-base rounded-xl shadow-2xl p-6 relative fade-in">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 text-text-subtle hover:text-text-primary"
                    disabled={loading}
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-text-primary mb-6 text-center">
                    {account ? "Sửa tài khoản" : "Thêm tài khoản mới"}
                </h2>

                <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                    <AccountProviderSelector
                        providerId={formData.providerId}
                        bankCode={formData.bankCode ?? ""}
                        bankName={formData.bankName ?? ""}
                        bankLogo={account?.bankLogoUrl}
                        onProviderChange={(id) => setFormData(prev => ({ ...prev, providerId: id, bankCode: "", bankName: "" }))}
                        onBankSelect={handleSelectBank}
                        isBankInactive={isBankInactive}
                        layout="vertical"
                    />

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-secondary">Chủ tài khoản (viết hoa không dấu)</label>
                        <input
                            type="text"
                            className="input uppercase"
                            value={formData.accountHolder}
                            onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                            placeholder="NGUYEN VAN A"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-secondary">
                            {allProviders.find(p => p.id === formData.providerId)?.code === "BANK" ? "Số tài khoản" : "Số điện thoại ví"}
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                            placeholder={allProviders.find(p => p.id === formData.providerId)?.code === "BANK" ? "0123456789" : "09xxxxxxxx"}
                        />
                    </div>

                    <div className="flex items-center gap-2 py-2">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            checked={!!formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            id="isActive"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-text-secondary cursor-pointer">
                            Đang hoạt động (Cho phép tạo QR)
                        </label>
                    </div>

                    <div className="flex gap-4 mt-4">
                        <Button
                            bgColor="bg-transparent"
                            textColor="text-text-secondary"
                            hoverColor="hover:bg-surface-muted"
                            className="flex-1 border border-border"
                            onClick={onClose}
                            disabled={loading}
                            type="button"
                        >
                            Hủy
                        </Button>
                        <Button
                            className="flex-1 btn-primary"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : account ? "Cập nhật" : "Lưu"}
                        </Button>
                    </div>
                </form>
            </div>

            <ActionConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeSave}
                title="Xác nhận lưu"
                description={`Bạn có chắc chắn muốn ${account ? "cập nhật" : "thêm"} thông tin tài khoản này không?`}
                loading={loading}
            />
        </div>
    );
};

export default AccountModal;
