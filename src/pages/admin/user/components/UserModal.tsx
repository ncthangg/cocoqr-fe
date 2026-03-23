import React, { useEffect, useState } from "react";
import {
    X, User, Mail, Calendar, Shield, ShieldCheck, ShieldOff,
    Lock, LockOpen, UserCircle2, BadgeCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { userApi } from "@/services/user-api.service";
import type { GetUserBaseRes } from "@/models/entity.model";
import ModalLoading from "@/components/UICustoms/Modal/ModalLoading";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";
import Button from "@/components/UICustoms/Button";
import ActionButton from "@/components/UICustoms/ActionButton";
import { formatDate } from "@/utils/dateTimeUtils";
import { cn } from "@/lib/utils";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: GetUserBaseRes | null;
    onStatusChanged?: (id: string, newStatus: boolean) => void;
}

interface ReadOnlyRowProps {
    icon?: React.ReactNode;
    label: string;
    value?: React.ReactNode;
    mono?: boolean;
    fullWidth?: boolean;
}

function ReadOnlyRow({ icon, label, value, mono, fullWidth }: ReadOnlyRowProps) {
    return (
        <div className={cn(
            "flex flex-col gap-xs p-sm rounded-xl bg-surface-muted/10 border border-border",
            fullWidth ? "col-span-2" : ""
        )}>
            <span className="inline-flex items-center gap-xs text-xs text-foreground-muted font-bold uppercase tracking-widest">
                {icon}
                {label}
            </span>
            <span className={cn("text-sm text-foreground px-xs", mono ? "font-mono tracking-tight" : "font-medium")}>
                {value ?? <span className="text-foreground-muted italic font-normal">Chưa cập nhật</span>}
            </span>
        </div>
    );
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, onStatusChanged }) => {
    const [detail, setDetail] = useState<GetUserBaseRes | null>(null);
    const [loading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setDetail(user ?? null);
            setIsConfirmOpen(false);
        } else {
            setDetail(null);
            setIsConfirmOpen(false);
        }
        // chỉ sync khi modal mở/đóng, không phụ thuộc vào `user` để tránh ghi đè status sau khi update
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleToggleStatus = async () => {
        if (!detail || !user) return;
        try {
            setActionLoading(true);
            const newStatus = !detail.status;
            await userApi.updateStatus(user.id, newStatus);
            toast.success(
                newStatus
                    ? "Đã mở khóa tài khoản người dùng thành công."
                    : "Đã khóa tài khoản người dùng thành công."
            );
            setDetail(prev => prev ? { ...prev, status: newStatus } : prev);
            onStatusChanged?.(user.id, newStatus);
        } catch (error) {
            console.error("Error toggling user status:", error);
            toast.error("Không thể thực hiện thao tác. Vui lòng thử lại.");
        } finally {
            setActionLoading(false);
            setIsConfirmOpen(false);
        }
    };

    if (!isOpen) return null;

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
                    aria-label="Chi tiết người dùng (Admin Only)"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ModalLoading loading={loading} />

                    {/* Header */}
                    <div className="flex items-center justify-between px-lg py-md border-b border-border bg-surface-muted/30 shrink-0">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-sm">
                            <UserCircle2 className="w-5 h-5 text-primary" />
                            Chi tiết người dùng
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

                                {/* LEFT: Info (3/5) */}
                                <div className="md:col-span-3 flex flex-col gap-lg">
                                    <div className="grid grid-cols-2 gap-md">
                                        <ReadOnlyRow
                                            icon={<User className="w-3.5 h-3.5" />}
                                            label="Họ và tên"
                                            value={detail.fullName}
                                            fullWidth
                                        />
                                        <ReadOnlyRow
                                            icon={<Mail className="w-3.5 h-3.5" />}
                                            label="Email"
                                            value={detail.email}
                                            fullWidth
                                            mono
                                        />
                                    </div>

                                    {/* Roles */}
                                    <div className="flex flex-col gap-sm p-md bg-surface-muted/30 rounded-2xl border border-border">
                                        <span className="text-xs text-foreground-muted font-bold uppercase tracking-widest flex items-center gap-xs">
                                            <Shield className="w-3.5 h-3.5" />
                                            Vai trò (Roles)
                                        </span>
                                        {detail.roles && detail.roles.length > 0 ? (
                                            <div className="flex flex-wrap gap-sm">
                                                {detail.roles.map((role, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-xs px-sm py-xs bg-primary/10 rounded-full border border-primary/20 text-primary"
                                                    >
                                                        <BadgeCheck className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-bold uppercase">{role.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-foreground-muted italic">Chưa được gán role nào</span>
                                        )}
                                    </div>

                                    {/* Status Card */}
                                    <div className="flex flex-col gap-sm p-md bg-surface-muted/30 rounded-2xl border border-border">
                                        <span className="text-xs text-foreground-muted font-bold uppercase tracking-widest">Trạng thái tài khoản</span>
                                        <div className="flex flex-wrap items-center gap-sm">
                                            <StatusBadge
                                                status={detail.status !== false}
                                                activeText="Đang hoạt động"
                                                inactiveText="Đã bị khóa"
                                                activeColor="green"
                                                inactiveColor="red"
                                            />
                                        </div>
                                    </div>

                                    {/* Timestamps */}
                                    <div className="grid grid-cols-2 gap-md p-md bg-surface-elevated rounded-2xl border border-border shadow-sm">
                                        <div className="flex flex-col gap-xs">
                                            <span className="text-xs text-foreground-muted font-bold uppercase tracking-widest flex items-center gap-xs">
                                                <Calendar className="w-3 h-3" /> Ngày tạo
                                            </span>
                                            <p className="text-xs font-semibold text-foreground">{formatDate(detail.createdAt)}</p>
                                        </div>
                                        {detail.updatedAt && (
                                            <div className="flex flex-col gap-xs">
                                                <span className="text-xs text-foreground-muted font-bold uppercase tracking-widest flex items-center gap-xs">
                                                    <Calendar className="w-3 h-3" /> Lần cuối cập nhật
                                                </span>
                                                <p className="text-xs font-semibold text-foreground">{formatDate(detail.updatedAt)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* RIGHT: Avatar + System Status Control (2/5) */}
                                <div className="md:col-span-2 flex flex-col items-center gap-md">

                                    {/* Avatar Box */}
                                    <div className="relative w-full aspect-square max-w-[240px] rounded-3xl border-2 border-dashed bg-surface-muted/10 border-border/50 flex flex-col items-center justify-center p-lg transition-all duration-300">
                                        {/* <div className="flex flex-col items-center gap-md text-center text-foreground-muted">
                                            <div className="w-32 h-32 rounded-full bg-surface-muted border-2 border-border flex items-center justify-center">
                                                <User className="w-16 h-16 opacity-20" />
                                            </div>
                                            <div className="flex flex-col gap-xs">
                                                <p className="font-bold text-foreground text-base">{detail.fullName}</p>
                                                <p className="text-xs text-foreground-muted font-mono">{detail.email}</p>
                                            </div>
                                        </div> */}
                                        {detail.pictureUrl ? (
                                            <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border-2 border-primary/30 ring-4 ring-primary/10">
                                                <img
                                                    src={detail.pictureUrl}
                                                    alt={detail.fullName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-md text-center text-foreground-muted">
                                                <div className="w-32 h-32 rounded-full bg-surface-muted border-2 border-border flex items-center justify-center">
                                                    <User className="w-16 h-16 opacity-20" />
                                                </div>
                                                <div className="flex flex-col gap-xs">
                                                    <p className="font-bold text-foreground text-base">{detail.fullName}</p>
                                                    <p className="text-xs text-foreground-muted font-mono">{detail.email}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="absolute top-md right-md text-primary opacity-20">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                    </div>

                                    {/* System Status Control — same pattern as AccountModal */}
                                    {detail.status !== undefined && (
                                        <div className="w-full max-w-[240px] p-md bg-surface-elevated rounded-2xl border border-border shadow-sm flex flex-col gap-md">
                                            {/* Title + badge + action button */}
                                            <div className="flex items-center justify-between gap-sm">
                                                <span className="text-xs text-foreground-muted font-bold uppercase tracking-widest flex items-center gap-xs">
                                                    <StatusBadge
                                                        icon={<ShieldCheck className="w-3 h-3" />}
                                                        status={!isLocked}
                                                        activeText="Status: TRUE"
                                                        inactiveText="Status: FALSE"
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
                title={isLocked ? "Xác nhận mở khóa người dùng" : "Xác nhận khóa người dùng"}
                description={
                    isLocked
                        ? `Bạn có chắc chắn muốn mở khóa tài khoản "${detail?.fullName ?? ""}"? Người dùng sẽ truy cập lại hệ thống bình thường.`
                        : `Bạn có chắc chắn muốn khóa tài khoản "${detail?.fullName ?? ""}"? Người dùng sẽ không thể đăng nhập vào hệ thống.`
                }
                confirmText={isLocked ? "Mở khóa" : "Xác nhận khóa"}
            />
        </>
    );
};

export default UserModal;
