import type { AccountProvider } from "@/models/enum";

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
    napasCode?: string;
    swiftCode?: string;
    bankName: string;
    shortName: string;
    logoUrl?: string;
    isActive: boolean;
}

export interface AccountRes extends BaseRes {
    userId: string;
    accountNumber?: string;
    accountHolder?: string;
    bankCode: string;
    bankName: string;
    provider: AccountProvider;
    balance?: number;
    isPinned?: boolean;
    isActive: boolean;
}

