import type { QRStyleType } from "./enum";

export interface PutRoleReq {
    name: string;
}

export interface PostPutUserRoleReq {
    userId: string;
    roleIds: string[];
}

export interface PutBankInfoReq {
    bankCode: string;
    napasBin: string | null;
    swiftCode: string | null;
    bankName: string;
    shortName: string;
    logoUrl?: File;
    isActive: boolean;
    isDeleteFile?: boolean;
}

export interface PostAccountReq {
    accountNumber: string;
    accountHolder: string;
    bankCode: string | null;
    bankName: string | null;
    providerId: string;
    isActive: boolean;
}

export interface PutAccountReq {
    accountNumber: string;
    accountHolder: string;
    bankCode: string | null;
    bankName: string | null;
    providerId: string;
    isPinned?: boolean;
    isActive: boolean;
}

export interface PostQrReq {
    providerId: string;

    accountId: string | null;
    accountNumber: string | null;

    bankCode: string | null;
    amount: number | null;
    description: string | null;

    isFixedAmount: boolean;
    styleJson?: string | null;
}

export interface PutProviderReq {
    code: string;
    name: string;
    isActive: boolean;
    logoUrl?: File;
    isDeleteFile?: boolean;
}

export interface GetQrStyleLibraryReq {
    userId?: string | null;
    type?: QRStyleType | null;
    isActive?: boolean | null;
}

export interface CreateQrStyleLibraryReq {
    name: string;
    styleJson: string;
    isDefault: boolean;
    type: QRStyleType;
    isActive: boolean;
}

export interface UpdateQrStyleLibraryReq {
    name: string;
    styleJson: string;
    isDefault: boolean;
    type: QRStyleType;
    isActive: boolean;
}