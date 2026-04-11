import type { AccountRes, ProviderRes } from "@/models/entity.model";

export interface AccountForm {
    providerId: string;
    bankCode: string | null;
    bankName: string | null;
    bankShortName: string | null;
    napasBin: string | null;
    accountHolder: string;
    accountNumber: string;
    isActive: boolean;
    isPinned: boolean;
    bankLogoUrl: string | null;
    bankIsActive?: boolean;
    providerIsActive?: boolean;
}

export interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    accountId: string | null | undefined;
    onSuccess: (updated?: Partial<AccountRes> & { id: string }) => void;
    allProviders: ProviderRes[];
}
