export const ApiConstant = {
    AUTH: {
        SIGN_IN: "/auths/google-auth/signin",
        REFRESH_TOKEN: "/auths/refresh-token",
        SIGN_OUT: "/auths/signout",
        SWITCH_ROLE: "/auths/switch-role",
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
    PROVIDER: {
        GET_ALL: "/providers",
        PUT: (id: string) => `/providers/${id}`,
    },
    BANKINFO: {
        GET_ALL: "/bankinfos",
        PUT: (id: string) => `/bankinfos/${id}`,
    },
    ROLE: {
        GET_ALL: "/roles",
        PUT: (id: string) => `/roles/${id}`,
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
    DATASYNC: {
        ROLES: "/datasync/roles",
        ROLES_PREVIEW: "/datasync/roles/preview",
        BANKS: "/datasync/banks",
        BANKS_PREVIEW: "/datasync/banks/preview",
        PROVIDERS: "/datasync/providers",
        PROVIDERS_PREVIEW: "/datasync/providers/preview",
    },
    QR_STYLE_LIB: {
        GET_ALL: "/qrstylelibraries",
        GET_BY_ID: (id: string) => `/qrstylelibraries/${id}`,
        POST: "/qrstylelibraries",
        PUT: (id: string) => `/qrstylelibraries/${id}`,
        DELETE: (id: string) => `/qrstylelibraries/${id}`,
    },
    CONTACT: {
        POST: "/contacts",
    },
    ADMIN_CONTACT: {
        GET_ALL: "/admin/admincontacts",
        GET_BY_ID: (id: string) => `/admin/admincontacts/${id}`,
        POST: "/admin/admincontacts",
        PATCH_IGNORE: (id: string) => `/admin/admincontacts/${id}/ignore`,
    },
    EMAIL_LOG: {
        GET_ALL: "/admin/emaillogs",
        GET_BY_ID: (id: string) => `/admin/emaillogs/${id}`,
    },
    SMTP_SETTING: {
        GET: "/admin/smtpsettings",
        PUT: "/admin/smtpsettings",
        TEST: "/admin/smtpsettings/test",
        DELETE: (id: string) => `/admin/smtpsettings/${id}`,
    },
    EMAIL_TEMPLATE: {
        GET_ALL: "/admin/emailtemplates",
        GET_BY_ID: (id: string) => `/admin/emailtemplates/${id}`,
        POST: "/admin/emailtemplates",
        PUT: (id: string) => `/admin/emailtemplates/${id}`,
        DELETE: (id: string) => `/admin/emailtemplates/${id}`,
    },
};
