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
    bankCode: string;
    napasCode?: string;
    swiftCode?: string;
    bankName: string;
    shortName: string;
    logoUrl?: File;
    isActive: boolean;
}

export interface PutAccountReq {
    bankCode: string;
    napasCode?: string;
    swiftCode?: string;
    bankName: string;
    shortName: string;
    logoUrl?: File;
    isActive: boolean;
    isDeleteFile?: boolean;
}   