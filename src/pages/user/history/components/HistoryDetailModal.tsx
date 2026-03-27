import React, { useEffect, useState, useCallback } from "react";
import {
    X, QrCode, User, CreditCard, Landmark, Hash, Calendar,
    Clock, CheckCircle2, XCircle, AlertCircle, BadgeDollarSign,
    Tag, FileText, Layers, Wallet, ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { qrApi } from "@/services/qr-api.service";
import type { QrRes } from "@/models/entity.model";
import ModalLoading from "@/components/UICustoms/Modal/ModalLoading";
import Button from "@/components/UICustoms/Button";
import { formatDateTime } from "@/utils/dateTimeUtils";
import BrandLogo from "@/components/UICustoms/BrandLogo";

// ─── Props ────────────────────────────────────────────────────────────────────
interface HistoryDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    historyId: number | null;
}

// ─── QR Status badge ──────────────────────────────────────────────────────────
function QrStatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
        PAID: {
            label: "Đã thanh toán",
            className: "bg-success/10 text-success border border-success/20",
            icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        },
        PENDING: {
            label: "Chờ thanh toán",
            className: "bg-warning/10 text-warning border border-warning/20",
            icon: <AlertCircle className="w-3.5 h-3.5" />,
        },
        EXPIRED: {
            label: "Đã hết hạn",
            className: "bg-danger/10 text-danger border border-danger/20",
            icon: <XCircle className="w-3.5 h-3.5" />,
        },
        DELETED: {
            label: "Đã xoá",
            className: "bg-surface-muted text-foreground-muted border border-border",
            icon: <XCircle className="w-3.5 h-3.5" />,
        },
    };

    const cfg = map[status?.toUpperCase()] ?? {
        label: status,
        className: "bg-primary/10 text-primary border border-primary/20",
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
    };

    return (
        <span className={`inline-flex items-center gap-xs px-sm py-2xs rounded-full text-xs font-semibold ${cfg.className}`}>
            {cfg.icon}
            {cfg.label}
        </span>
    );
}

// ─── QR Mode badge ────────────────────────────────────────────────────────────
function QrModeBadge({ mode }: { mode: string }) {
    const map: Record<string, { label: string; className: string }> = {
        STATIC: { label: "Static", className: "bg-surface-muted text-foreground-secondary border border-border" },
        DYNAMIC: { label: "Dynamic", className: "bg-primary/10 text-primary border border-primary/20" },
    };
    const cfg = map[mode?.toUpperCase()] ?? {
        label: mode,
        className: "bg-surface-muted text-foreground-secondary border border-border",
    };
    return (
        <span className={`inline-flex items-center px-sm py-2xs rounded-full text-xs font-semibold ${cfg.className}`}>
            {cfg.label}
        </span>
    );
}

// ─── Info row ─────────────────────────────────────────────────────────────────
interface InfoRowProps {
    icon?: React.ReactNode;
    label: string;
    value?: React.ReactNode;
    mono?: boolean;
    fullWidth?: boolean;
}

function InfoRow({ icon, label, value, mono, fullWidth }: InfoRowProps) {
    return (
        <div className={`flex flex-col gap-xs ${fullWidth ? "col-span-2" : ""}`}>
            <span className="inline-flex items-center gap-xs text-xs text-foreground-muted font-semibold uppercase tracking-widest">
                {icon}
                {label}
            </span>
            <span className={`text-sm text-foreground break-all ${mono ? "font-mono" : ""}`}>
                {value ?? <span className="text-foreground-muted">—</span>}
            </span>
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-sm pt-xs">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-widest font-bold text-foreground-muted px-xs whitespace-nowrap">
                {children}
            </span>
            <div className="h-px flex-1 bg-border" />
        </div>
    );
}

// ─── Amount formatter ─────────────────────────────────────────────────────────
function formatAmount(amount?: number, currency?: string) {
    if (amount == null) return "Không cố định";
    const cur = currency ?? "VND";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: cur }).format(amount);
}

// ─── Main Component ───────────────────────────────────────────────────────────
const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ isOpen, onClose, historyId }) => {
    const [detail, setDetail] = useState<QrRes | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchDetail = useCallback(async (id: number) => {
        try {
            setLoading(true);
            const res = await qrApi.getById(id);
            setDetail(res);
        } catch (error) {
            console.error("Error fetching QR history detail:", error);
            toast.error("Không thể tải chi tiết lịch sử QR.");
            onClose();
        } finally {
            setLoading(false);
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen && historyId) {
            fetchDetail(historyId);
        } else if (!isOpen) {
            setDetail(null);
        }
    }, [isOpen, historyId, fetchDetail]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        if (isOpen) window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const bankLogo = detail?.bankLogoUrl;
    const providerLogo = detail?.providerLogoUrl;
    const logoUrl = bankLogo || providerLogo;

    return (
        <div
            className="modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="modal-content max-w-modal-md flex flex-col overflow-hidden"
                role="dialog"
                aria-modal="true"
                aria-label="Chi tiết lịch sử QR"
                onClick={(e) => e.stopPropagation()}
            >
                <ModalLoading loading={loading} />

                {/* Header */}
                <div className="flex items-center justify-between px-lg py-md border-b border-border bg-surface-muted/30 shrink-0">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-sm">
                        <QrCode className="w-5 h-5 text-primary" />
                        Chi tiết lịch sử QR
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng"
                        className="p-xs rounded-full text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-lg overflow-y-auto flex-1 flex flex-col gap-md">
                    {detail && (
                        <>
                            {/* QR Image */}
                            {detail.qrImageUrl && (
                                <div className="flex justify-center">
                                    <div className="p-sm bg-white rounded-xl border border-border shadow-sm">
                                        <img
                                            src={detail.qrImageUrl}
                                            alt="QR Code"
                                            className="w-44 h-44 object-contain"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Status badges */}
                            <div className="flex flex-wrap items-center justify-center gap-sm">
                                <QrStatusBadge status={detail.qrStatus} />
                                <QrModeBadge mode={detail.qrMode} />
                                {detail.isFixedAmount ? (
                                    <span className="inline-flex items-center gap-xs px-sm py-2xs rounded-full text-xs font-semibold bg-warning/10 text-warning border border-warning/20">
                                        <BadgeDollarSign className="w-3.5 h-3.5" />
                                        Cố định
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-xs px-sm py-2xs rounded-full text-xs font-semibold bg-surface-muted text-foreground-secondary border border-border">
                                        <BadgeDollarSign className="w-3.5 h-3.5" />
                                        Không cố định
                                    </span>
                                )}
                            </div>

                            {/* Provider / Bank card */}
                            <div className="flex items-center gap-sm bg-surface-muted/40 p-sm rounded-xl border border-border">
                                <BrandLogo 
                                    logoUrl={logoUrl}
                                    name={detail.bankShortName ?? detail.providerName}
                                    code={detail.bankCodeSnapshot ?? detail.providerCode}
                                    size="md"
                                />
                                <div className="flex flex-col gap-xs">
                                    <p className="font-semibold text-foreground leading-tight">
                                        {detail.bankNameSnapshot || detail.providerName || "—"}
                                    </p>
                                    <p className="text-xs text-foreground-secondary">
                                        {[detail.bankShortName, detail.bankCodeSnapshot].filter(Boolean).join(" · ") || detail.providerCode || "—"}
                                    </p>
                                    {detail.providerName && detail.bankNameSnapshot && (
                                        <p className="text-xs text-foreground-muted">
                                            via {detail.providerName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Thông tin tài khoản */}
                            <SectionTitle>Thông tin tài khoản</SectionTitle>
                            <div className="grid grid-cols-2 gap-md">
                                <InfoRow
                                    icon={<User className="w-3.5 h-3.5" />}
                                    label="Tên chủ tài khoản"
                                    value={detail.accountHolderSnapshot}
                                />
                                <InfoRow
                                    icon={<CreditCard className="w-3.5 h-3.5" />}
                                    label="Số tài khoản"
                                    value={detail.accountNumberSnapshot}
                                    mono
                                />
                                <InfoRow
                                    icon={<Landmark className="w-3.5 h-3.5" />}
                                    label="Mã ngân hàng (Napas)"
                                    value={detail.napasBinSnapshot}
                                    mono
                                />
                                <InfoRow
                                    icon={<Wallet className="w-3.5 h-3.5" />}
                                    label="Loại người nhận"
                                    value={detail.receiverType}
                                />
                            </div>

                            {/* Thông tin giao dịch */}
                            <SectionTitle>Thông tin giao dịch</SectionTitle>
                            <div className="grid grid-cols-2 gap-md">
                                <InfoRow
                                    icon={<BadgeDollarSign className="w-3.5 h-3.5" />}
                                    label="Số tiền"
                                    value={formatAmount(detail.amount, detail.currency)}
                                />
                                <InfoRow
                                    icon={<Tag className="w-3.5 h-3.5" />}
                                    label="Tiền tệ"
                                    value={detail.currency}
                                />
                                <InfoRow
                                    icon={<Hash className="w-3.5 h-3.5" />}
                                    label="Mã giao dịch"
                                    value={detail.transactionRef}
                                    mono
                                    fullWidth
                                />
                                {detail.description && (
                                    <InfoRow
                                        icon={<FileText className="w-3.5 h-3.5" />}
                                        label="Nội dung"
                                        value={
                                            <span className="block bg-surface-muted/40 border border-border rounded-lg px-sm py-xs text-sm text-foreground whitespace-pre-wrap">
                                                {detail.description}
                                            </span>
                                        }
                                        fullWidth
                                    />
                                )}
                            </div>

                            {/* QR Data */}
                            {detail.qrData && (
                                <>
                                    <SectionTitle>QR Data</SectionTitle>
                                    <div className="bg-surface-muted/40 border border-border rounded-xl p-sm">
                                        <div className="flex items-center gap-xs mb-xs">
                                            <Layers className="w-3.5 h-3.5 text-foreground-muted" />
                                            <span className="text-xs uppercase tracking-widest font-bold text-foreground-muted">
                                                Raw QR String
                                            </span>
                                        </div>
                                        <p className="text-xs font-mono text-foreground-secondary break-all leading-relaxed">
                                            {detail.qrData}
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Thời gian */}
                            <SectionTitle>Thời gian</SectionTitle>
                            <div className="grid grid-cols-2 gap-md">
                                <InfoRow
                                    icon={<Calendar className="w-3.5 h-3.5" />}
                                    label="Ngày tạo"
                                    value={formatDateTime(detail.createdAt)}
                                />
                                {detail.expiredAt && (
                                    <InfoRow
                                        icon={<Clock className="w-3.5 h-3.5" />}
                                        label="Hết hạn lúc"
                                        value={formatDateTime(detail.expiredAt)}
                                    />
                                )}
                                {detail.paidAt && (
                                    <InfoRow
                                        icon={<CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                                        label="Thanh toán lúc"
                                        value={formatDateTime(detail.paidAt)}
                                    />
                                )}
                                {detail.deletedAt && (
                                    <InfoRow
                                        icon={<XCircle className="w-3.5 h-3.5 text-danger" />}
                                        label="Đã xoá lúc"
                                        value={formatDateTime(detail.deletedAt)}
                                    />
                                )}
                            </div>

                            {/* Định danh */}
                            <SectionTitle>Định danh</SectionTitle>
                            <div className="grid grid-cols-2 gap-md">
                                <InfoRow
                                    icon={<Hash className="w-3.5 h-3.5" />}
                                    label="QR ID"
                                    value={String(detail.id)}
                                    mono
                                />
                                <InfoRow
                                    icon={<User className="w-3.5 h-3.5" />}
                                    label="Email"
                                    value={detail.email}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-lg py-md border-t border-border bg-surface-muted/20 flex justify-end shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        value="Đóng"
                    />
                </div>
            </div>
        </div>
    );
};

export default HistoryDetailModal;
