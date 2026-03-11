import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/UICustoms/Button";
import { accountApi } from "@/services/account-api.service";
import type { AccountRes } from "@/models/entity.model";
import type { PutAccountReq } from "@/models/entity.request.model";
import { AccountProvider } from "@/models/enum";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";
import BankSelectionModal from "@/components/UICustoms/Modal/BankSelectionModal";
import { resolveAvatarPreview } from "@/utils/imageConvertUtils";

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    account?: AccountRes | null;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSuccess, account }) => {
    const [loading, setLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [formData, setFormData] = useState<PutAccountReq>({
        provider: AccountProvider.BANK,
        bankCode: "",
        bankName: "",
        accountHolder: "",
        accountNumber: "",
        isActive: true,
    });
    const [selectedBankLogo, setSelectedBankLogo] = useState<string | null>(null);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (account) {
                setFormData({
                    provider: account.provider ?? AccountProvider.BANK,
                    bankCode: account.bankCode || "",
                    bankName: account.bankName || "",
                    accountHolder: account.accountHolder || "",
                    accountNumber: account.accountNumber || "",
                    isActive: account.isActive ?? true,
                });
            } else {
                setFormData({
                    provider: AccountProvider.BANK,
                    bankCode: "",
                    bankName: "",
                    accountHolder: "",
                    accountNumber: "",
                    isActive: true,
                });
            }
            setIsConfirmOpen(false);
        }
    }, [isOpen, account]);

    const handleSelectBank = (code: string, name: string, logoUrl?: string) => {
        setFormData(prev => ({ ...prev, bankCode: code, bankName: name }));
        if (logoUrl) {
            setSelectedBankLogo(resolveAvatarPreview(logoUrl));
        } else {
            setSelectedBankLogo(null);
        }
        setIsBankModalOpen(false);
    };

    useEffect(() => {
        if (formData.provider === AccountProvider.MOMO) {
            setFormData(prev => ({ ...prev, bankCode: "MOMO", bankName: "Ví MoMo" }));
        } else if (formData.provider === AccountProvider.VNPAY) {
            setFormData(prev => ({ ...prev, bankCode: "VNPAY", bankName: "Ví VNPay" }));
        } else if (formData.provider === AccountProvider.ZALOPAY) {
            setFormData(prev => ({ ...prev, bankCode: "ZALOPAY", bankName: "Ví ZaloPay" }));
        } else {
            // Clear if switched from wallet to bank, unless we are editing an existing bank account
            if (["MOMO", "VNPAY", "ZALOPAY"].includes(formData.bankCode)) {
                setFormData(prev => ({ ...prev, bankCode: "", bankName: "" }));
            }
        }
    }, [formData.provider]);

    if (!isOpen) return null;

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.accountNumber || !formData.accountHolder || !formData.bankCode) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        setIsConfirmOpen(true);
    };

    const executeSave = async () => {
        try {
            setLoading(true);

            // Ensure bankName matches bankCode if empty
            const payload = {
                ...formData,
                bankName: formData.bankName || formData.bankCode
            };

            if (account && account.id) {
                await accountApi.put(account.id, payload as PutAccountReq);
                toast.success("Cập nhật tài khoản thành công!");
            } else {
                await accountApi.post(payload);
                toast.success("Thêm tài khoản thành công!");
            }

            setIsConfirmOpen(false);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving account:", error);
            toast.error("Có lỗi xảy ra khi lưu tài khoản.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="modal-overlay bg-black/60 px-4 py-6"
        >
            <div
                className="modal-content max-w-modal-lg relative flex flex-col overflow-hidden rounded-2xl p-6 md:p-8 text-center shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-text-subtle hover:text-text-primary"
                    disabled={loading}
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-text-primary mb-6">
                    {account ? "Sửa tài khoản" : "Thêm tài khoản mới"}
                </h2>

                <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-secondary">Loại tài khoản</label>
                        <select
                            className="input cursor-pointer"
                            value={formData.provider}
                            onChange={(e) => setFormData({ ...formData, provider: Number(e.target.value) as AccountProvider })}
                        >
                            <option value={AccountProvider.BANK}>Ngân hàng</option>
                            <option value={AccountProvider.MOMO}>Ví MoMo</option>
                            <option value={AccountProvider.VNPAY}>Ví VNPay</option>
                            <option value={AccountProvider.ZALOPAY}>Ví ZaloPay</option>
                        </select>
                    </div>

                    {formData.provider === AccountProvider.BANK && (
                        <div className="flex flex-col gap-2 relative">
                            <label className="text-sm font-medium text-text-secondary">Ngân hàng</label>
                            <div 
                                className="input cursor-pointer flex items-center justify-between min-h-[42px]" 
                                onClick={() => setIsBankModalOpen(true)}
                            >
                                <div className="flex items-center gap-2 overflow-hidden w-full">
                                    {selectedBankLogo && (
                                        <img src={selectedBankLogo} alt="Logo" className="w-6 h-6 object-contain flex-shrink-0" />
                                    )}
                                    <span className="truncate w-full text-left text-sm">
                                        {formData.bankName ? `${formData.bankCode} - ${formData.bankName}` : <span className="text-text-subtle">Chọn ngân hàng</span>}
                                    </span>
                                </div>
                                <span className="text-text-subtle text-xs pl-2">▼</span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-secondary">Tên chủ tài khoản</label>
                        <input
                            type="text"
                            className="input uppercase"
                            placeholder="NGUYEN VAN A"
                            value={formData.accountHolder}
                            onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value.toUpperCase() })}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-secondary">Số tài khoản / Số điện thoại</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Nhập số tài khoản"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-4 h-4 text-primary rounded"
                            />
                            Kích hoạt (Cho phép tạo QR)
                        </label>
                    </div>

                    <div className="flex gap-3 justify-end mt-4">
                        <Button
                            type="button"
                            bgColor="bg-transparent"
                            textColor="text-text-secondary"
                            hoverColor="hover:bg-surface-muted"
                            className="border border-border"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2"
                            disabled={loading || isConfirmOpen}
                        >
                            {loading ? "Đang lưu..." : "Lưu tài khoản"}
                        </Button>
                    </div>
                </form>
            </div>

            <ActionConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeSave}
                title={account ? "Xác nhận cập nhật tài khoản" : "Xác nhận thêm tài khoản"}
                description={`Bạn có chắc chắn muốn ${account ? "cập nhật" : "tạo mới"} tài khoản này không?`}
                loading={loading}
                confirmText={account ? "Cập nhật" : "Thêm mới"}
            />

            <BankSelectionModal 
                isOpen={isBankModalOpen} 
                onClose={() => setIsBankModalOpen(false)} 
                onSelectBank={handleSelectBank} 
            />
        </div>
    );
};

export default AccountModal;
