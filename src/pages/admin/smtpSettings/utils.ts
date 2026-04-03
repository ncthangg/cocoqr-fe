import { SmtpSettingType } from "@/models/enum";
import type { SmtpSettingRes } from "@/models/entity.model";
import type { PutSmtpSettingReq } from "@/models/entity.request.model";

// ─── Type helpers ─────────────────────────────────────────────────────────────
// BE returns PascalCase ("Support"), enum keys are UPPER_CASE ("SUPPORT").
// Normalise once on ingest — never scattered across render code.
export type SmtpTypeKey = keyof typeof SmtpSettingType;
export const ALL_SMTP_TYPES = Object.keys(SmtpSettingType) as SmtpTypeKey[];

export function normaliseType(raw: string): SmtpTypeKey | null {
    const upper = raw.toUpperCase() as SmtpTypeKey;
    return upper in SmtpSettingType ? upper : null;
}

/**
 * Derives `{ label, value }` option list from SmtpSettingType at runtime.
 * Pass `exclude` keys to hide specific types (e.g. "CONTACT" for UI filters).
 */
export function getSmtpTypeOptions(exclude: SmtpTypeKey[] = []): { label: string; value: string }[] {
    return ALL_SMTP_TYPES
        .filter(key => !exclude.includes(key))
        .map(key => ({
            label: key.charAt(0) + key.slice(1).toLowerCase(),
            value: SmtpSettingType[key],
        }));
}

// ─── Dynamic palette — cycles by index, zero hardcoded per-type data ──────────
const ACCENT_PALETTE = [
    { accentClass: "bg-blue-500/5",    badgeClass: "bg-blue-500/10 text-blue-500" },
    { accentClass: "bg-purple-500/5",  badgeClass: "bg-purple-500/10 text-purple-500" },
    { accentClass: "bg-emerald-500/5", badgeClass: "bg-emerald-500/10 text-emerald-600" },
    { accentClass: "bg-rose-500/5",    badgeClass: "bg-rose-500/10 text-rose-500" },
    { accentClass: "bg-amber-500/5",   badgeClass: "bg-amber-500/10 text-amber-600" },
    { accentClass: "bg-cyan-500/5",    badgeClass: "bg-cyan-500/10 text-cyan-600" },
];

export function getPanelMeta(type: SmtpTypeKey) {
    const index   = ALL_SMTP_TYPES.indexOf(type);
    const palette = ACCENT_PALETTE[index % ACCENT_PALETTE.length];
    const label   = type.charAt(0) + type.slice(1).toLowerCase() + " SMTP";
    return { label, ...palette };
}

// ─── Form helpers ─────────────────────────────────────────────────────────────
export const EMPTY_FORM: Omit<PutSmtpSettingReq, "type"> = {
    host: "", port: 587, username: "", password: "",
    enableSSL: true, fromEmail: "", fromName: "", isActive: true,
};

export function settingToForm(res: SmtpSettingRes): Omit<PutSmtpSettingReq, "type"> {
    return {
        host:      res.host      ?? "",
        port:      res.port      ?? 587,
        username:  res.username  ?? "",
        password:  "",                       // never echo password from server
        enableSSL: res.enableSSL ?? true,
        fromEmail: res.fromEmail ?? "",
        fromName:  res.fromName  ?? "",
        isActive:  res.isActive  ?? true,
    };
}

export const inputCls =
    "w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-foreground placeholder:text-foreground-muted outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all";
