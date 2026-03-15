export interface PagingVM<T> {
    list?: T[];
    pageSize: number;
    pageNumber: number;
    totalPages: number;
    totalItems: number;
}

export interface BaseRes {
    id: string;

    createdBy?: string;
    updatedBy?: string;
    deletedBy?: string;

    createdByName?: string;
    updatedByName?: string;
    deletedByName?: string;

    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;

    status?: boolean;
}

///===================================================

export interface SignInGoogleRes {
    user: UserRes;
    token: TokenRes;
    roles: RoleRes[];
}

export interface UserRes {
    userId: string;
    googleId: string;
    fullName: string;
    email: string;
    pictureUrl?: string;
    roles?: RoleRes[];
}

export interface GetUserBaseRes extends BaseRes {
    userId: string;
    fullName: string;
    email: string;
    pictureUrl?: string;
    getRolesRes?: RoleRes[];
}

export interface TokenRes {
    accessToken?: string;
    refreshToken?: string;
}

export interface RoleRes extends BaseRes {
    name: string;
    nameUpperCase: string;
}

export interface BankRes extends BaseRes {
    bankCode: string;
    bankName: string;
    shortName: string;
    napasCode?: string;
    swiftCode?: string;
    logoUrl?: string;
    isActive: boolean;
}

export interface AccountRes extends BaseRes {
    userId: string;
    accountNumber: string | null;
    accountHolder: string | null;

    bankCode?: string;
    bankName?: string;
    bankShortName?: string;
    napasCode?: string;
    swiftCode?: string;
    bankLogoUrl?: string;
    bankIsActive?: boolean;
    bankStatus?: boolean;

    providerId: string;
    providerCode?: string;
    providerName?: string;
    providerLogoUrl?: string;
    providerIsActive?: boolean;
    providerStatus?: boolean;

    balance?: number;
    isPinned?: boolean;
    isActive: boolean;
}

export interface ProviderRes extends BaseRes {
    code: string;
    name: string;
    isActive: boolean;
    logoUrl?: string;
}

export interface PostQrRes {
    id: number;

    qrData: string;
    qrImageUrl: string;
    transactionRef: string;
}

export interface QrRes extends BaseRes {
    userId: string;
    accountNumber?: string;
    accountHolder?: string;

    bankCode?: string;
    bankName?: string;
    bankShortName?: string;
    napasCode?: string;
    swiftCode?: string;
    bankogoUrl?: string;

    providerId: string;
    balance?: number;
    isPinned?: boolean;
    isActive: boolean;
}