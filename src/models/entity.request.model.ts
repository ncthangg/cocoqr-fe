import type { QRStyleType, SmtpSettingType } from "./enum";

export interface PutRoleReq {
    name: string;
    status: boolean;
}

export interface PostPutUserRoleReq {
    userId: string;
    roleIds: string[];
}

export interface SwitchRoleReq {
    userId: string;
    roleId: string;
}

export interface PutBankInfoReq {
    bankCode: string;
    napasBin: string | null;
    swiftCode: string | null;
    bankName: string;
    shortName: string;
    logoUrl?: File;
    isActive: boolean;
    isDeleteFile?: boolean;
}

export interface PostAccountReq {
    accountNumber: string;
    accountHolder: string;
    bankCode: string | null;
    bankName: string | null;
    providerId: string;
    isActive: boolean;
}

export interface PutAccountReq {
    accountNumber: string;
    accountHolder: string;
    bankCode: string | null;
    bankName: string | null;
    providerId: string;
    isPinned?: boolean;
    isActive: boolean;
}

export interface PostQrReq {
    providerId: string;

    accountId: string | null;
    accountNumber: string | null;

    bankCode: string | null;
    amount: number | null;
    description: string | null;

    isFixedAmount: boolean;
    styleJson?: string | null;
}

export interface PutProviderReq {
    code: string;
    name: string;
    isActive: boolean;
    logoUrl?: File;
    isDeleteFile?: boolean;
}

export interface GetQrStyleLibraryReq {
    userId?: string | null;
    type?: QRStyleType | null;
    isActive?: boolean | null;
    name?: string | null;
}

export interface CreateQrStyleLibraryReq {
    name: string;
    styleJson: string;
    isDefault: boolean;
    type: QRStyleType;
    isActive: boolean;
}

export interface UpdateQrStyleLibraryReq {
    name: string;
    styleJson: string;
    isDefault: boolean;
    type: QRStyleType;
    isActive: boolean;
}

/** Public endpoint — user sends to system */
export interface PostContactReq {
    fullName: string;
    email: string;
    subject: string;
    content: string;
}

/** Admin endpoint — system/admin sends to user/guest */
export interface AdminPostContactReq {
    contactMessageId?: string | null;
    fullName: string;
    email: string;
    subject: string;
    content: string;
    templateKey?: string | null;
    htmlBody?: string | null;
    smtpType?: SmtpSettingType | null;
}

export interface GetEmailLogReq {
    pageNumber: number;
    pageSize: number;
    sortField?: string | null;
    sortDirection?: "asc" | "desc" | null;
    type?: SmtpSettingType | null;
    recipientUserId?: string | null;
    toEmail?: string | null;
    recipientFullName?: string | null;
    subject?: string | null;
    fromDate?: string | null;
    toDate?: string | null;
    status?: string | null;
    direction?: string | null;
    templateKey?: string | null;
}

export interface GetSmtpSettingReq {
    type?: SmtpSettingType | null;
}

export interface PutSmtpSettingReq {
    type: SmtpSettingType;
    host: string;
    port: number;
    username: string;
    password: string;
    enableSSL: boolean;
    fromEmail: string;
    fromName: string;
    isActive: boolean;
}

export interface TestSmtpSettingReq {
    type: SmtpSettingType;
    toEmail: string;
    subject?: string;
    body?: string;
    templateKey?: string;
    variables?: Record<string, string>;
}

export interface PostEmailTemplateReq {
    templateKey: string;
    subject: string;
    body: string;
    description?: string | null;
    isActive: boolean;
}

export interface PutEmailTemplateReq {
    templateKey: string;
    subject: string;
    body: string;
    description?: string | null;
    isActive: boolean;
}