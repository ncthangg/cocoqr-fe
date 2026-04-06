import React, { useEffect, useState, useCallback } from "react";
import { X, Landmark, User, CreditCard, Hash, Calendar, Wallet, ShieldCheck, ShieldOff, LayoutDashboard, Lock, LockOpen } from "lucide-react";
import { toast } from "react-toastify";
import { accountApi } from "@/services/account-api.service";
import type { AccountRes } from "@/models/entity.model";
import ModalLoading from "@/components/UICustoms/Modal/ModalLoading";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";
import Button from "@/components/UICustoms/Button";
import { formatDateTime } from "@/utils/dateTimeUtils";
import { cn } from "@/lib/utils";
import ActionButton from "@/components/UICustoms/ActionButton";
import BrandLogo from "@/components/UICustoms/BrandLogo";

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    accountId: string | null;
    onStatusChanged?: (id: string, newStatus: boolean) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
interface ReadOnlyRowProps {
    icon?: React.ReactNode;
    label: string;
    value?: React.ReactNode;
    mono?: boolean;
    fullWidth?: boolean;
}

function ReadOnlyRow({ icon, label, value, mono, fullWidth }: ReadOnlyRowProps) {
    return (
        <div className={cn("flex flex-col gap-xs p-sm rounded-xl bg-surface-muted/10 border border-border", fullWidth ? "col-span-2" : "")}>
            <span className="inline-flex items-center gap-xs text-xs text-foreground-muted font-bold uppercase tracking-widest">
                {icon}
                {label}
            </span>
            <span className={cn("text-sm text-foreground px-xs", mono ? "font-primary tracking-tight" : "font-medium")}>
                {value ?? <span className="text-foreground-muted italic font-normal">Chưa cập nhật</span>}
            </span>
        </div>
    );
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, accountId, onStatusChanged }) => {
    const [detail, setDetail] = useState<AccountRes | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const fetchDetail = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const res = await accountApi.getById(id);
            if (res) setDetail(res);
        } catch (error) {
            console.error("Error fetching account detail:", error);
            toast.error("Không thể tải thông tin chi tiết tài khoản.");
            onClose();
        } finally {
            setLoading(false);
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen && accountId) {
            fetchDetail(accountId);
        } else if (!isOpen) {
            setDetail(null);
        }
    }, [isOpen, accountId, fetchDetail]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        if (isOpen) window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    const handleToggleStatus = async () => {
        if (!detail || !accountId) return;
        try {
            setActionLoading(true);
            const newStatus = !detail.status;
            await accountApi.updateStatus(accountId, newStatus);
            toast.success(newStatus ? "Đã mở khóa tài khoản thành công." : "Đã khóa tài khoản thành công.");
            setDetail(prev => prev ? { ...prev, status: newStatus } : prev);
            onStatusChanged?.(accountId, newStatus);
        } catch (error) {
            console.error("Error toggling account status:", error);
            toast.error("Không thể thực hiện thao tác. Vui lòng thử lại.");
        } finally {
            setActionLoading(false);
            setIsConfirmOpen(false);
        }
    };

    if (!isOpen) return null;

    const isBank = !!detail?.bankCode;
    const isLocked = detail?.status === false;

    return (
        <>
            <div
                className="modal-overlay"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div
                    className="modal-content max-w-modal-xl flex flex-col overflow-hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Chi tiết tài khoản (Admin Only)"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ModalLoading loading={loading} />

                    {/* Header */}
                    <div className="flex items-center justify-between px-lg py-md border-b border-border bg-surface-muted/30 shrink-0">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-sm">
                            <LayoutDashboard className="w-5 h-5 text-primary" />
                            Chi tiết tài khoản
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
                    <div className="p-lg overflow-y-auto flex-1">
                        {detail && (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-xl">

                                {/* LEFT: Data (3/5) */}
                                <div className="md:col-span-3 flex flex-col gap-lg">
                                    <div className="grid grid-cols-2 gap-md">
                                        <ReadOnlyRow
                                            icon={<Landmark className="w-3.5 h-3.5" />}
                                            label="Loại tài khoản"
                                            value={detail.providerName}
                                        />
                                        {isBank ? (
                                            <ReadOnlyRow
                                                icon={<Hash className="w-3.5 h-3.5" />}
                                                label="Napas Bin"
                                                value={detail.napasBin}
                                                mono
                                            />
                                        ) : (
                                            <ReadOnlyRow
                                                icon={<Wallet className="w-3.5 h-3.5" />}
                                                label="Số dư hiện tại"
                                                value={detail.balance != null
                                                    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(detail.balance)
                                                    : undefined
                                                }
                                            />
                                        )}
                                        <ReadOnlyRow
                                            icon={<User className="w-3.5 h-3.5" />}
                                            label="Tên tài khoản"
                                            value={detail.accountHolder}
                                            fullWidth
                                        />
                                        <ReadOnlyRow
                                            icon={<CreditCard className="w-3.5 h-3.5" />}
                                            label={isBank ? "Số tài khoản" : "Số điện thoại ví"}
                                            value={detail.accountNumber}
                                            fullWidth
                                        />
                                    </div>

                                    {/* Status Card */}
                                    <div className="flex flex-col gap-sm p-md bg-surface-muted/30 rounded-2xl border border-border">
                                        <span className="text-xs text-foreground-muted font-bold uppercase tracking-widest">Trạng thái tài khoản</span>
                                        <div className="flex flex-wrap items-center gap-sm">
                                            <StatusBadge status={detail.isActive} activeText="Đang hoạt động" inactiveText="Ngưng hoạt động" />
                                        </div>
                                    </div>

                                    {/* Time Information */}
                                    <div className="grid grid-cols-2 gap-md p-md bg-surface-elevated rounded-2xl border border-border shadow-sm">
                                        <div className="flex flex-col gap-xs">
                                            <span className="text-xs text-foreground-muted font-bold uppercase tracking-widest flex items-center gap-xs">
                                                <Calendar className="w-3 h-3" /> Ngày tạo
                                            </span>
                                            <p className="text-xs font-semibold text-foreground">{formatDateTime(detail.createdAt)}</p>
                                        </div>
                                        {detail.updatedAt && (
                                            <div className="flex flex-col gap-xs">
                                                <span className="text-xs text-foreground-muted font-bold uppercase tracking-widest flex items-center gap-xs">
                                                    <Calendar className="w-3 h-3" /> Lần cuối cập nhật
                                                </span>
                                                <p className="text-xs font-semibold text-foreground">{formatDateTime(detail.updatedAt)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* RIGHT: Logo Box + System Control (2/5) */}
                                <div className="md:col-span-2 flex flex-col items-center gap-md">

                                    {/* Logo Box */}
                                    <div className={cn(
                                        "relative w-full aspect-square max-w-[240px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-lg transition-all duration-300",
                                        detail?.bankLogoUrl || detail?.providerLogoUrl
                                            ? "bg-surface-muted/20 border-border"
                                            : "bg-surface-muted/10 border-border/50"
                                    )}>
                                        <div className="flex flex-col items-center gap-md text-center animate-in fade-in zoom-in duration-300 w-full">
                                            <BrandLogo
                                                logoUrl={detail?.bankLogoUrl || detail?.providerLogoUrl}
                                                name={isBank ? detail.bankShortName : detail.providerName}
                                                code={isBank ? detail.bankCode : detail.providerCode}
                                                size="xl"
                                                shadow="md"
                                            />
                                            <div className="flex flex-col gap-xs">
                                                <p className="font-bold text-foreground text-lg">
                                                    {isBank ? detail.bankShortName : detail.providerCode}
                                                </p>
                                                <p className="text-xs text-foreground-secondary line-clamp-2 px-sm leading-relaxed">
                                                    {isBank ? detail.bankName : detail.providerName}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="absolute top-md right-md text-primary opacity-20">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                    </div>

                                    {/* System Status Control */}
                                    {detail.status !== undefined && (
                                        <div className="w-full max-w-[240px] p-md bg-surface-elevated rounded-2xl border border-border shadow-sm flex flex-col gap-md">
                                            {/* Title + status badge */}
                                            <div className="flex items-center justify-between gap-sm">
                                                <span className="text-xs text-foreground-muted font-bold uppercase tracking-widest flex items-center gap-xs">
                                                    <StatusBadge
                                                        icon={<ShieldCheck className="w-3 h-3" />}
                                                        status={!isLocked}
                                                        activeText="Status: ACTIVE"
                                                        inactiveText="Status: INACTIVE"
                                                    />
                                                </span>
                                                <ActionButton
                                                    icon={isLocked ? <LockOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                                    onClick={() => setIsConfirmOpen(true)}
                                                    color={isLocked ? "red" : "blue"}
                                                    title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                                                />
                                            </div>

                                            {/* Warning note when locked */}
                                            {isLocked && (
                                                <p className="text-xs text-danger flex items-center gap-xs">
                                                    <ShieldOff className="w-3 h-3 shrink-0" />
                                                    Tài khoản đang bị vô hiệu khóa
                                                </p>
                                            )}

                                        </div>
                                    )}
                                </div>
                            </div>
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

            <ActionConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleToggleStatus}
                loading={actionLoading}
                title={isLocked ? "Xác nhận mở khóa tài khoản" : "Xác nhận khóa tài khoản"}
                description={
                    isLocked
                        ? `Bạn có chắc chắn muốn mở khóa tài khoản "${detail?.accountHolder ?? ""}"? Tài khoản sẽ hoạt động trở lại bình thường.`
                        : `Bạn có chắc chắn muốn khóa tài khoản "${detail?.accountHolder ?? ""}"? Tài khoản sẽ bị tạm dừng hoạt động bởi hệ thống.`
                }
                confirmText={isLocked ? "Mở khóa" : "Xác nhận khóa"}
            />
        </>
    );
};

export default AccountModal;
