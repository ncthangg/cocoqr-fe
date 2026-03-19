import React, { useEffect, useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/UICustoms/Button";
import { roleApi } from "@/services/role-api.service";
import type { RoleRes } from "@/models/entity.model";
import type { PostRoleReq, PutRoleReq } from "@/models/entity.request.model";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedRole?: RoleRes) => void;
    role?: RoleRes | null;
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, onSuccess, role }) => {
    const [loading, setLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [formData, setFormData] = useState<PostRoleReq>({ name: "" });

    useEffect(() => {
        if (isOpen) {
            setFormData({ name: role ? (role.name || "") : "" });
            setIsConfirmOpen(false);
        }
    }, [isOpen, role]);

    if (!isOpen) return null;

    const roleCode = formData.name ? formData.name.toUpperCase().trim().replace(/\s+/g, "_") : "";

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error("Vui lòng nhập tên role.");
            return;
        }
        setIsConfirmOpen(true);
    };

    const executeSave = async () => {
        try {
            setLoading(true);
            if (role?.id) {
                const putReq: PutRoleReq = { name: formData.name };
                await roleApi.put(role.id, putReq);
                toast.success("Cập nhật role thành công!");
                const updatedRole: RoleRes = {
                    ...role,
                    name: formData.name,
                    nameUpperCase: formData.name.toUpperCase().trim().replace(/\s+/g, "_"),
                };
                setIsConfirmOpen(false);
                onSuccess(updatedRole);
            } else {
                await roleApi.post(formData);
                toast.success("Tạo mới role thành công!");
                setIsConfirmOpen(false);
                onSuccess();
            }
            onClose();
        } catch (error) {
            console.error("Error saving role:", error);
            toast.error("Có lỗi xảy ra khi lưu role.");
        } finally {
            setLoading(false);
        }
    };

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
                        {role ? "Chỉnh sửa Role" : "Thêm Role mới"}
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
                <form onSubmit={handleFormSubmit} className="flex-1">
                    <div className="p-lg flex flex-col gap-md">
                        <div className="flex flex-col gap-sm">
                            <label htmlFor="roleName" className="text-sm font-semibold text-foreground-secondary flex items-center gap-xs">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                Tên Role <span className="text-danger">*</span>
                            </label>
                            <input
                                id="roleName"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="input"
                                placeholder="VD: Admin"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-sm">
                            <label className="text-sm font-semibold text-foreground-secondary">
                                Mã Role (tự động)
                            </label>
                            <input
                                type="text"
                                value={roleCode}
                                disabled
                                className="input opacity-60 cursor-not-allowed font-mono tracking-wider"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-lg py-md border-t border-border flex justify-end gap-sm bg-surface-muted/20 shrink-0">
                        <Button type="button" variant="ghost" size="medium" onClick={onClose} disabled={loading}>
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="medium"
                            loading={loading}
                            disabled={!formData.name || isConfirmOpen}
                        >
                            {role ? "Cập nhật" : "Tạo mới"}
                        </Button>
                    </div>
                </form>
            </div>

            <ActionConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeSave}
                title={role ? "Xác nhận cập nhật Role" : "Xác nhận tạo Role mới"}
                description={`Bạn có chắc chắn muốn ${role ? "cập nhật" : "tạo mới"} role "${formData.name}"?`}
                loading={loading}
                confirmText={role ? "Cập nhật" : "Tạo mới"}
            />
        </div>
    );
};

export default RoleModal;
