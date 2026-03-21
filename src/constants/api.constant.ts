export const ApiConstant = {
    AUTH: {
        SIGN_IN: "/auths/google-auth/signin",
        REFRESH_TOKEN: "/auths/refresh-token",
        SIGN_OUT: "/auths/signout",
        ME: "/auths/me",
    },
    ACCOUNT: {
        GET_ALL: "/accounts",
        GET_ALL_BY_ADMIN: "/accounts/by-admin",
        GET_BY_ID: (id: string) => `/accounts/${id}`,
        POST: "/accounts",
        PUT: (id: string) => `/accounts/${id}`,
        PUT_STATUS: (id: string) => `/accounts/${id}/status`,
        DELETE: (id: string) => `/accounts/${id}`,
    },
    BANKINFO: {
        GET_ALL: "/bankinfos",
        POST: "/bankinfos",
        PUT: (id: string) => `/bankinfos/${id}`,
        //DELETE: (id: string) => `/bankinfos/${id}`,
    },
    ROLE: {
        GET_ALL: "/roles",
        POST: "/roles",
        PUT: (id: string) => `/roles/${id}`,
        //DELETE: (id: string) => `/roles/${id}`,
    },
    USER: {
        GET_ALL: "/users",
        GET_BY_ID: (id: string) => `/users/${id}`,
        PUT_STATUS: (id: string) => `/users/${id}/status`,
    },
    USER_ROLE: {
        GET_ROLES_BY_USER_ID: (userId: string) => `/userroles/${userId}/roles`,
        ADD_USER_TO_ROLE: "/userroles",
        REMOVE_USER_FROM_ROLE: "/userroles",
    },
    QR: {
        POST: "/qr",
        GET_ALL: "/qr",
        GET_ALL_BY_ADMIN: "/qr/by-admin",
        GET_BY_ID: (id: string) => `/qr/${id}`,
    },
    PROVIDER: {
        GET_ALL: "/providers",
        POST: "/providers",
        PUT: (id: string) => `/providers/${id}`,
        //DELETE: (id: string) => `/providers/${id}`,
    },
    DATASYNC: {
        ROLES: "/datasync/roles",
        ROLES_PREVIEW: "/datasync/roles/preview",
        BANKS: "/datasync/banks",
        BANKS_PREVIEW: "/datasync/banks/preview",
        PROVIDERS: "/datasync/providers",
        PROVIDERS_PREVIEW: "/datasync/providers/preview",
    },
};
