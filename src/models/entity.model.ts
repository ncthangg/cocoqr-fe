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
    email: string;
    fullName: string;
    pictureUrl?: string;
}

export interface GetUserBaseRes extends BaseRes {
    email: string;
    fullName: string;
    pictureUrl?: string;
    roles?: RoleRes[];
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
    napasBin: string;
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
    napasBin?: string;
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

export interface QrRes {
    id: number;
    userId?: string;
    email?: string;
    accountId?: string;

    accountNumberSnapshot?: string;
    accountHolderSnapshot?: string;

    bankCodeSnapshot?: string;
    bankNameSnapshot?: string;
    napasBinSnapshot?: string;

    bankShortName?: string;
    bankLogoUrl?: string;

    amount?: number;
    currency: string;
    description?: string;

    qrData?: string;
    qrImageUrl?: string;
    transactionRef?: string;

    providerId: string;
    providerCode?: string;
    providerName?: string;
    providerLogoUrl?: string;

    receiverType: string;

    isFixedAmount: boolean;
    qrMode: string;
    qrStatus: string;

    createdAt: string;
    expiredAt?: string;
    paidAt?: string;
    deletedAt?: string;
}