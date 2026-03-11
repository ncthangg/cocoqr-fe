export const UserRole = {
    ADMIN: "ADMIN",
    USER: "USER",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];
///=====================================================================
export const PaymentStatus = {
    PENDING: "PENDING",
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
} as const;

export type PaymentStatus =
    typeof PaymentStatus[keyof typeof PaymentStatus];
///=====================================================================
export const AccountProvider = {
    BANK: 0,
    MOMO: 1,
    VNPAY: 2,
    ZALOPAY: 3,
} as const;

export type AccountProvider = typeof AccountProvider[keyof typeof AccountProvider];
///=====================================================================
export const QRReceiverType = {
    PERSONAL: "PERSONAL",
    GUEST: "GUEST",
} as const;

export type QRReceiverType =
    typeof QRReceiverType[keyof typeof QRReceiverType];
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

export type BankCode =
    typeof BankCode[keyof typeof BankCode];