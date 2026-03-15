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