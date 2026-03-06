export const UserRole = {
    ADMIN: "ADMIN",
    USER: "USER",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const PaymentStatus = {
    PENDING: "PENDING",
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
} as const;

export type PaymentStatus =
    typeof PaymentStatus[keyof typeof PaymentStatus];
