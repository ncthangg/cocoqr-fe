import React from "react";
import { X, ShieldCheck } from "lucide-react";
import Button from "@/components/UICustoms/Button";
import type { RoleRes } from "@/models/entity.model";
import { useState, useEffect } from "react";
import StatusToggle from "@/components/UICustoms/Form/StatusToggle";
import { roleApi } from "@/services/role-api.service";
import { toast } from "react-toastify";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (updatedRole: RoleRes) => void;
    role?: RoleRes | null;
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, onSuccess, role }) => {
    //#region States & Refs
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(true);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    //#endregion

    //#region Side Effects
    useEffect(() => {
        if (isOpen && role) {
            setStatus(role.status ?? true);
        }
    }, [isOpen, role]);
    //#endregion

    //#region Handlers
    const handleUpdateStatus = () => {
        if (isAdminRole && !status) {
            toast.warning("Không thể vô hiệu hóa quyền Admin.");
            return;
        }
        setIsConfirmOpen(true);
    };

    const executeUpdate = async () => {
        try {
            setLoading(true);
            await roleApi.put(role.id, {
                name: role.name,
                status: status
            });

            toast.success("Cập nhật trạng thái Role thành công!");
            onSuccess?.({ ...role, status });
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Lỗi khi cập nhật Role.");
        } finally {
            setLoading(false);
            setIsConfirmOpen(false);
        }
    };

    const roleCode = role.nameUpperCase || role.name?.toUpperCase().trim().replace(/\s+/g, "_") || "";
    //#endregion

    //#region Render
    if (!isOpen || !role) return null;

    const isAdminRole = role.name.toLowerCase() === "admin";
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
                            className="input bg-surface-muted/50 cursor-not-allowed opacity-80 font-primary tracking-wider"
                        />
                    </div>

                    <div className="flex flex-col gap-sm pt-sm">
                        <label className="text-sm font-semibold text-foreground-secondary">
                            Trạng thái {isAdminRole && <span className="text-[10px] text-amber-500 font-normal italic">(Không thể thay đổi cho Admin)</span>}
                        </label>
                        <StatusToggle
                            checked={status}
                            onChange={(e) => setStatus(e.target.checked)}
                            disabled={isAdminRole || loading}
                            checkedLabel="Hoạt động"
                            uncheckedLabel="Ngừng hoạt động"
                            checkedSubtext={isAdminRole ? "Quyền quản trị luôn phải ở trạng thái hoạt động" : "Role này có thể được gán cho người dùng"}
                            uncheckedSubtext="Role này sẽ không khả dụng để gán cho người dùng"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-lg py-md border-t border-border flex justify-end gap-sm bg-surface-muted/20 shrink-0">
                    <Button type="button" variant="outline" size="medium" onClick={onClose} disabled={loading}>
                        Hủy
                    </Button>
                    {!isAdminRole && (
                        <Button
                            type="button"
                            variant="primary"
                            size="medium"
                            onClick={handleUpdateStatus}
                            loading={loading}
                            disabled={status === role.status}
                        >
                            Cập nhật
                        </Button>
                    )}
                </div>

                <ActionConfirmModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={executeUpdate}
                    title="Xác nhận thay đổi"
                    description={`Bạn có chắc muốn ${status ? "kích hoạt" : "vô hiệu hóa"} role "${role.name}"?`}
                    loading={loading}
                />
            </div>
        </div>
    );
    //#endregion
};

export default RoleModal;
