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