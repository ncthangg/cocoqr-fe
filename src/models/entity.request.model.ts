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