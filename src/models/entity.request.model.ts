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
    napasCode?: string;
    swiftCode?: string;
    bankName: string;
    shortName: string;
    logoUrl?: File;
    isActive: boolean;
}

export interface PutBankInfoReq {
    bankCode: string;
    napasCode?: string;
    swiftCode?: string;
    bankName: string;
    shortName: string;
    logoUrl?: File;
    isActive: boolean;
    isDeleteFile?: boolean;
}

export interface PostAccountReq {
    accountNumber: string;
    accountHolder: string;
    bankCode: string;
    bankName?: string;
    provider: AccountProvider;
    isActive?: boolean;
}

export interface PutAccountReq {
    accountNumber: string;
    accountHolder: string;
    bankCode: string;
    bankName?: string;
    provider: AccountProvider;
    isPinned?: boolean;
    isActive?: boolean;
}