import type { QRStyleType } from "@/models/enum";

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
    napasBin: string;
    bankCode: string;
    bankName: string;
    shortName: string;
    swiftCode: string;
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
    logoUrl?: string;
    isActive: boolean;
}

export interface PostQrRes {
    id: number;
    qrData: string;
    styleJson?: string | null;
    transactionRef: string;
    isValid: boolean;
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

export interface QrStyleLibraryRes extends BaseRes {
    name: string;
    styleJson: string;
    isDefault: boolean;
    type: QRStyleType;
    isActive: boolean;
}
///===================================================
// Data Sync Models

export const SyncAction = {
    Insert: "Insert",
    Update: "Update",
    Delete: "Delete",
    Unchanged: "Unchanged",
} as const;

export type SyncAction = (typeof SyncAction)[keyof typeof SyncAction];

// Keep backward compat alias
export const BankSyncAction = SyncAction;
export type BankSyncAction = SyncAction;

export interface SyncFieldDiff {
    field: string;
    oldValue: string;
    newValue: string;
}

export interface SyncDiffItem {
    action: SyncAction;
    code: string;
    name: string;
    diffs?: SyncFieldDiff[];
}

export interface SyncSummary {
    totalInFile: number;
    totalInDb: number;
    toInsert: number;
    toUpdate: number;
    toDelete: number;
    unchanged: number;
}

export interface SyncPreviewRes {
    sourceFile: string;
    fileLastModified: string;
    summary: SyncSummary;
    changes: SyncDiffItem[];
}

// Bank-specific aliases (backward compat)
export type BankFieldDiff = SyncFieldDiff;
export interface BankSyncDiffItem {
    action: BankSyncAction;
    bankCode: string;
    bankName: string;
    diffs?: BankFieldDiff[];
}
export type BankSyncSummary = SyncSummary;
export type BankSyncPreviewRes = SyncPreviewRes;