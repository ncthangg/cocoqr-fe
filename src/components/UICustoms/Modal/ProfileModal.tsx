import React, { useEffect, useMemo } from "react";
import { X, User, Mail, Shield, BadgeCheck, UserCircle2 } from "lucide-react";
import type { UserRes, RoleRes } from "@/models/entity.model";
import Button from "@/components/UICustoms/Button";
import { cn } from "@/lib/utils";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserRes | null;
    roles?: RoleRes[] | null;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, roles }) => {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        if (isOpen) window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    const initials = useMemo(() => {
        if (!user?.fullName) return "?";
        return user.fullName
            .split(" ")
            .filter(Boolean)
            .slice(-2)
            .map((w) => w[0])
            .join("")
            .toUpperCase();
    }, [user?.fullName]);

    if (!isOpen || !user) return null;

    return (
        <div
            className="modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="modal-content max-w-modal-md flex flex-col overflow-hidden"
                role="dialog"
                aria-modal="true"
                aria-label="Thông tin tài khoản"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-lg py-md border-b border-border bg-surface-muted/30 shrink-0">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-sm">
                        <UserCircle2 className="w-5 h-5 text-primary" />
                        Thông tin tài khoản
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
                <div className="p-lg overflow-y-auto flex-1 flex flex-col gap-lg">

                    {/* Avatar + Name block */}
                    <div className="flex flex-col items-center gap-md pt-sm">
                        {user.pictureUrl ? (
                            <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border-2 border-primary/30 ring-4 ring-primary/10">
                                <img
                                    src={user.pictureUrl}
                                    alt={user.fullName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 ring-4 ring-primary/10 flex items-center justify-center shadow-md">
                                <span className="text-3xl font-extrabold text-primary tracking-tight">
                                    {initials}
                                </span>
                            </div>
                        )}

                        <div className="text-center flex flex-col gap-xs">
                            <p className="text-xl font-extrabold text-foreground tracking-tight">{user.fullName}</p>
                            <p className="text-sm text-foreground-muted font-mono">{user.email}</p>
                        </div>
                    </div>

                    {/* Info rows */}
                    <div className="flex flex-col gap-sm">
                        <div className={cn(
                            "flex items-center gap-sm px-md py-sm rounded-xl border border-border bg-surface-muted/20"
                        )}>
                            <User className="w-4 h-4 text-primary shrink-0" />
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs text-foreground-muted font-bold uppercase tracking-widest">Họ và tên</span>
                                <span className="text-sm font-semibold text-foreground truncate">{user.fullName}</span>
                            </div>
                        </div>

                        <div className={cn(
                            "flex items-center gap-sm px-md py-sm rounded-xl border border-border bg-surface-muted/20"
                        )}>
                            <Mail className="w-4 h-4 text-primary shrink-0" />
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs text-foreground-muted font-bold uppercase tracking-widest">Email</span>
                                <span className="text-sm font-mono font-semibold text-foreground truncate">{user.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Roles */}
                    {roles && roles.length > 0 && (
                        <div className="flex flex-col gap-sm p-md rounded-2xl border border-border bg-surface-muted/20">
                            <span className="text-xs text-foreground-muted font-bold uppercase tracking-widest flex items-center gap-xs">
                                <Shield className="w-3.5 h-3.5" />
                                Vai trò
                            </span>
                            <div className="flex flex-wrap gap-sm">
                                {roles.map((role, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-xs px-sm py-xs bg-primary/10 rounded-full border border-primary/20 text-primary"
                                    >
                                        <BadgeCheck className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold uppercase">{role.name}</span>
                                    </div>
                                ))}
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
    );
};

export default ProfileModal;
