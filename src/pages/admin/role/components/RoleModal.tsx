import React from "react";
import { X, ShieldCheck } from "lucide-react";
import Button from "@/components/UICustoms/Button";
import type { RoleRes } from "@/models/entity.model";

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    role?: RoleRes | null;
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, role }) => {
    if (!isOpen || !role) return null;

    const roleCode = role.nameUpperCase || role.name?.toUpperCase().trim().replace(/\s+/g, "_") || "";

    return (
        <div
            className="modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="modal-content max-w-modal-sm bg-surface-elevated relative flex flex-col overflow-hidden"
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-lg py-md border-b border-border bg-surface-muted/30 shrink-0">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-sm">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        Chi tiết Role
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
                <div className="p-lg flex flex-col gap-md">
                    <div className="flex flex-col gap-sm">
                        <label className="text-sm font-semibold text-foreground-secondary flex items-center gap-xs">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            Tên Role
                        </label>
                        <input
                            type="text"
                            value={role.name || ""}
                            readOnly
                            className="input bg-surface-muted/50 cursor-not-allowed opacity-80"
                        />
                    </div>

                    <div className="flex flex-col gap-sm">
                        <label className="text-sm font-semibold text-foreground-secondary">
                            Mã Role
                        </label>
                        <input
                            type="text"
                            value={roleCode}
                            readOnly
                            className="input bg-surface-muted/50 cursor-not-allowed opacity-80 font-mono tracking-wider"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-lg py-md border-t border-border flex justify-end bg-surface-muted/20 shrink-0">
                    <Button type="button" variant="outline" size="medium" onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RoleModal;
