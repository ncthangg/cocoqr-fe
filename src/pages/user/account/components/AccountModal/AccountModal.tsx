import React, { useEffect } from "react";
import { X, PlusCircle } from "lucide-react";
import Button from "@/components/UICustoms/Button";
import ModalLoading from "@/components/UICustoms/Modal/ModalLoading";
import BankSelectionModal from "@/components/UICustoms/Modal/BankSelectionModal";
import type { AccountModalProps } from "./AccountModal.types";
import { useAccountModal } from "./AccountModal.hooks";
import FormSection from "./FormSection";
import PreviewSection from "./PreviewSection";

const AccountModal: React.FC<AccountModalProps> = (props) => {
    const { isOpen, onClose, accountId } = props;

    const {
        allProviders,
        loading,
        modalLoading,
        isBankModalOpen,
        setIsBankModalOpen,
        register,
        handleSubmit,
        control,
        isSubmitDisabled,
        bankCode,
        bankName,
        bankLogoUrl,
        selectedProvider,
        isBankType,
        handleProviderChange,
        executeSave,
        handleSelectBank
    } = useAccountModal(props);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        if (isOpen) window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

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

                    <form onSubmit={handleSubmit(executeSave)} className="overflow-y-auto flex-1">
                        <div className="p-lg">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-xl">
                                <FormSection
                                    providers={allProviders}
                                    isBankType={isBankType}
                                    onProviderChange={handleProviderChange}
                                    register={register}
                                    control={control}
                                />
                                <PreviewSection
                                    isBankType={isBankType}
                                    bankCode={bankCode}
                                    bankName={bankName}
                                    bankLogoUrl={bankLogoUrl}
                                    selectedProvider={selectedProvider}
                                    onOpenBankModal={() => setIsBankModalOpen(true)}
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
                            disabled={loading || modalLoading || isSubmitDisabled || (isBankType && !bankCode)}
                            loading={loading || modalLoading}
                            value={accountId ? "Cập nhật dữ liệu" : "Lưu tài khoản"}
                            onClick={handleSubmit(executeSave)}
                        />
                    </div>
                </div>
            </div>

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
