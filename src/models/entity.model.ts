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

    createdAt: string;
    updatedAt?: string;
    deletedAt?: string;

    status: boolean;
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
    salt: string;
    encryptedUserKeyWithUMK?: string;
    isNewUser?: boolean;
    roles?: RoleRes[];
}

export interface TokenRes {
    accessToken?: string;
    refreshToken?: string;
}

export interface RoleRes {
    roleId?: string;
    roleName?: string;
    roleNameUpperCase?: string;
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
