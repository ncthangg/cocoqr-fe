import { useState, useCallback, useEffect, useMemo } from "react";
import { accountApi } from "@/services/account-api.service";
import { useWatch } from "react-hook-form";
import { useModalForm } from "@/hooks/useModalForm";
import { ProviderCode } from "@/models/enum";
import type { PostAccountReq, PutAccountReq } from "@/models/entity.request.model";
import type { AccountForm, AccountModalProps } from "./AccountModal.types";

export const useAccountModal = ({ isOpen, onClose, onSuccess, accountId, allProviders }: AccountModalProps) => {
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [originalValues, setOriginalValues] = useState<AccountForm | undefined>(undefined);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        reset,
        formState: { isValid }
    } = useModalForm<AccountForm>({
        isOpen,
        values: originalValues,
        defaultValues: {
            providerId: "", bankCode: "", bankName: "", bankShortName: "", napasBin: "",
            accountHolder: "", accountNumber: "", isActive: true, isPinned: false, bankLogoUrl: null
        }
    });

    const providerId = useWatch({ control, name: "providerId" });
    const bankCode = useWatch({ control, name: "bankCode" });
    const accountNumber = useWatch({ control, name: "accountNumber" });
    const accountHolder = useWatch({ control, name: "accountHolder" });
    const isActive = useWatch({ control, name: "isActive" });
    const isPinned = useWatch({ control, name: "isPinned" });
    const bankName = useWatch({ control, name: "bankName" });
    const bankLogoUrl = useWatch({ control, name: "bankLogoUrl" });

    const isEditMode = !!accountId;

    const hasChanges = useMemo(() => {
        if (!isEditMode) return true;
        if (!originalValues) return false;

        const normalize = (val: any) => (val === null || val === undefined) ? "" : String(val).trim().toUpperCase();

        return (
            normalize(accountNumber) !== normalize(originalValues.accountNumber) ||
            normalize(accountHolder) !== normalize(originalValues.accountHolder) ||
            isActive !== originalValues.isActive ||
            isPinned !== originalValues.isPinned ||
            providerId !== originalValues.providerId ||
            normalize(bankCode) !== normalize(originalValues.bankCode)
        );
    }, [isEditMode, originalValues, accountNumber, accountHolder, isActive, isPinned, providerId, bankCode]);

    const isSubmitDisabled = !isValid || (isEditMode && !hasChanges);

    const selectedProvider = useMemo(() => allProviders.find(p => p.id === providerId) || null, [allProviders, providerId]);
    const isBankType = selectedProvider?.code === ProviderCode.BANK;

    const fetchAccountDetail = useCallback(async (id: string) => {
        try {
            setModalLoading(true);
            const response = await accountApi.getById(id);

            let res = response;
            if (response && (response as any).data) {
                res = (response as any).data;
            }

            if (res) {
                setOriginalValues({
                    providerId: res.providerId || "",
                    providerIsActive: res.providerIsActive,
                    bankCode: res.bankCode || "",
                    bankName: res.bankName || "",
                    bankIsActive: res.bankIsActive,
                    accountHolder: String(res.accountHolder || ""),
                    accountNumber: String(res.accountNumber || ""),
                    isActive: res.isActive !== undefined ? res.isActive : true,
                    isPinned: res.isPinned || false,
                    bankLogoUrl: res.bankLogoUrl || null,
                    bankShortName: res.bankShortName || "",
                    napasBin: res.napasBin || "",
                });
            }
        } finally {
            setModalLoading(false);
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            if (accountId) fetchAccountDetail(accountId);
        } else {
            setOriginalValues(undefined);
            reset();
        }
    }, [isOpen, accountId, fetchAccountDetail, reset]);

    const handleProviderChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const pId = e.target.value;
        const prov = allProviders.find(p => p.id === pId);
        setValue("providerId", pId, { shouldValidate: true, shouldDirty: true });
        setValue("providerIsActive", prov?.isActive, { shouldDirty: true });
        setValue("bankCode", "", { shouldValidate: true, shouldDirty: true });
        setValue("bankName", "", { shouldDirty: true });
        setValue("bankLogoUrl", null, { shouldDirty: true });
        setValue("bankIsActive", undefined, { shouldDirty: true });
    }, [setValue, allProviders]);

    const handleSelectBank = useCallback((napasBin: string, code: string, shortName: string, bankName: string, logoUrl: string | null, isActive: boolean) => {
        setValue("napasBin", napasBin, { shouldDirty: true });
        setValue("bankCode", code, { shouldDirty: true, shouldValidate: true });
        setValue("bankName", bankName, { shouldDirty: true });
        setValue("bankShortName", shortName, { shouldDirty: true });
        setValue("bankLogoUrl", logoUrl, { shouldDirty: true });
        setValue("bankIsActive", isActive, { shouldDirty: true });
        setIsBankModalOpen(false);
    }, [setValue]);

    const executeSave = useCallback(async (data: AccountForm) => {
        try {
            setLoading(true);
            const isBank = selectedProvider?.code === ProviderCode.BANK;

            if (accountId) {
                const putPayload: PutAccountReq = {
                    providerId: data.providerId,
                    bankCode: isBank ? data.bankCode : null,
                    bankName: isBank ? data.bankName : null,
                    accountHolder: data.accountHolder,
                    accountNumber: data.accountNumber,
                    isActive: data.isActive,
                };
                await accountApi.put(accountId, putPayload);
                onClose();
                onSuccess({
                    id: accountId,
                    providerId: data.providerId,
                    providerCode: selectedProvider?.code,
                    providerName: selectedProvider?.name,
                    providerLogoUrl: selectedProvider?.logoUrl,
                    providerIsActive: selectedProvider?.isActive,
                    bankCode: data.bankCode ?? undefined,
                    bankName: data.bankName ?? undefined,
                    bankLogoUrl: data.bankLogoUrl ?? undefined,
                    bankShortName: data.bankShortName ?? undefined,
                    bankIsActive: data.bankIsActive,
                    accountHolder: data.accountHolder,
                    accountNumber: data.accountNumber,
                    isActive: data.isActive,
                    isPinned: data.isPinned
                });
            } else {
                const postPayload: PostAccountReq = {
                    providerId: data.providerId,
                    bankCode: isBank ? data.bankCode : null,
                    bankName: isBank ? data.bankName : null,
                    accountHolder: data.accountHolder,
                    accountNumber: data.accountNumber,
                    isActive: data.isActive,
                };
                await accountApi.post(postPayload);
                onClose();
                onSuccess();
            }
        } finally {
            setLoading(false);
        }
    }, [accountId, selectedProvider, onSuccess, onClose]);

    return {
        allProviders,
        loading,
        modalLoading,
        isBankModalOpen,
        setIsBankModalOpen,
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        isSubmitDisabled,
        providerId,
        bankCode,
        bankName,
        bankLogoUrl,
        selectedProvider,
        isBankType,
        handleProviderChange,
        executeSave,
        handleSelectBank
    };
};
