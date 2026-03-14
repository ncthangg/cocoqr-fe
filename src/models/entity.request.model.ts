import type { AccountProvider } from "./enum";

export interface PostRoleReq {
    name: string;
}

export interface PutRoleReq {
    name: string;
}

export interface PostPutUserRoleReq {
    userId: string;
    roleIds: string[];
}

export interface PostBankInfoReq {
    bankCode: string;
    napasCode: string | null;
    swiftCode: string | null;
    bankName: string;
    shortName: string;
    logoUrl: File | null;
    isActive: boolean;
}

export interface PutBankInfoReq {
    bankCode: string;
    napasCode: string | null;
    swiftCode: string | null;
    bankName: string;
    shortName: string;
    logoUrl: File | null;
    isActive: boolean;
    isDeleteFile: boolean | null;
}

export interface PostAccountReq {
    accountNumber: string;
    accountHolder: string;
    bankCode: string;
    bankName: string | null;
    provider: AccountProvider;
    isActive: boolean | null;
}

export interface PutAccountReq {
    accountNumber: string;
    accountHolder: string;
    bankCode: string;
    bankName: string | null;
    provider: AccountProvider;
    isPinned: boolean | null;
    isActive: boolean | null;
}

export interface PostQrReq {
    accountId: string | null;

    accountNumber: string;
    bankCode: string | null;

    amount: number | null;
    description: string | null;

    provider: AccountProvider;
    isFixedAmount: boolean;
}