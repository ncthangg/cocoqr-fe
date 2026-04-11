export const UserRole = {
    ADMIN: "ADMIN",
    USER: "USER",
} as const;

export type UserRole = keyof typeof UserRole;
///=====================================================================
export const PaymentStatus = {
    PENDING: "PENDING",
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
} as const;

export type PaymentStatus = keyof typeof PaymentStatus;
///=====================================================================
export const QRReceiverType = {
    PERSONAL: "PERSONAL",
    GUEST: "GUEST",
} as const;

export type QRReceiverType = keyof typeof QRReceiverType;
///=====================================================================
export const Currency = {
    VND: "VND",
    USD: "USD",
    EUR: "EUR"
} as const;

export type Currency = keyof typeof Currency;
///=====================================================================
export const BankCode = {
    VIB: "VIB",
    MB: "MB",
    TCB: "TCB",
    VCB: "VCB",
    ACB: "ACB",
    BIDV: "BIDV",
    TPB: "TPB",
    VPB: "VPB",
    HDB: "HDB",
    OCB: "OCB",
    MSB: "MSB",
    SHB: "SHB",
} as const;

export type BankCode = keyof typeof BankCode;
///=====================================================================
export const ProviderCode = {
    BANK: "BANK",
    VNPAY: "VNPAY",
    MOMO: "MOMO",
    ZALOPAY: "ZALOPAY",
} as const;

export type ProviderCode = keyof typeof ProviderCode;
///=====================================================================
export const QRStyleType = {
    SYSTEM: "SYSTEM",
    USER: "USER"
} as const;

export type QRStyleType = typeof QRStyleType[keyof typeof QRStyleType];
///=====================================================================
export const ContactMessageStatus = {
    NEW: "NEW",
    REPLIED: "REPLIED",
    IGNORED: "IGNORED"
} as const;

export type ContactMessageStatus = keyof typeof ContactMessageStatus;
///=====================================================================
export const EmailLogStatus = {
    SUCCESS: "SUCCESS",
    FAIL: "FAIL"
} as const;

export type EmailLogStatus = keyof typeof EmailLogStatus;
///=====================================================================
export const EmailDirection = {
    INCOMING: "INCOMING",
    OUTGOING: "OUTGOING"
} as const;

export type EmailDirection = keyof typeof EmailDirection;
///=====================================================================
export const SmtpSettingType = {
    CONTACT: "CONTACT",
    SYSTEM: "SYSTEM",
    ADMIN: "ADMIN",
    SUPPORT: "SUPPORT",
} as const;

export type SmtpSettingType = keyof typeof SmtpSettingType;
///=====================================================================
/** Well-known template keys — matches BE `EmailTemplateKeys` class.  
 *  Using const object avoids typos and enables auto-complete. */
export const EmailTemplateKey = {
    WELCOME: "system_welcome",
    RESET_PASSWORD: "system_reset_password",
    CONTACT_ADMIN_NOTIFY: "contact_admin_notify",
    CONTACT_THANK_YOU: "contact_thank_you",
    SUPPORT_REPLY: "support_reply",
} as const;

export type EmailTemplateKey = (typeof EmailTemplateKey)[keyof typeof EmailTemplateKey];
///=====================================================================
export const QRType = {
    PUBLIC: "public",
    PRIVATE: "private"
} as const;

export type QRType = typeof QRType[keyof typeof QRType];