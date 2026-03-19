

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
    logoUrl?: File;
    isActive: boolean;
}

export interface PutBankInfoReq {
    bankCode: string;
    napasCode: string | null;
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
    accountNumber: string;

    bankCode: string | null;
    amount: number | null;
    description: string | null;

    isFixedAmount: boolean;
}

export interface PostProviderReq {
    code: string;
    name: string;
    isActive: boolean;
    logoUrl?: File;
}

export interface PutProviderReq {
    code: string;
    name: string;
    isActive: boolean;
    logoUrl?: File;
    isDeleteFile?: boolean;
}