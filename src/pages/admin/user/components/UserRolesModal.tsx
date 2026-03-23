import React, { useEffect, useState } from "react";
import { userRoleApi } from "../../../../services/userRole-api.service";

import type { GetUserBaseRes } from "../../../../models/entity.model";
import { toast } from "react-toastify";
import { X, Shield, Plus, Trash2 } from "lucide-react";
import Button from "@/components/UICustoms/Button";
import DeleteConfirmModal from "@/components/UICustoms/Modal/DeleteConfirmModal";
import ActionButton from "@/components/UICustoms/ActionButton";

interface UserRolesModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: GetUserBaseRes | null;
    allRoles: any[];
    onRolesUpdate?: (userId: string, roles: any[]) => void;
}

const UserRolesModal: React.FC<UserRolesModalProps> = ({ isOpen, onClose, user, allRoles, onRolesUpdate }) => {
    const [userRoles, setUserRoles] = useState<any[]>(user?.roles || []);

    const [loading, setLoading] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [selectedRoleToAdd, setSelectedRoleToAdd] = useState<string>("");

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            if (user.roles !== undefined && user.roles !== null) {
                setUserRoles(user.roles);
            } else {
                fetchUserRoles();
            }
        } else {
            setUserRoles([]);
            setSelectedRoleToAdd("");
        }
    }, [isOpen, user]);

    const fetchUserRoles = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await userRoleApi.getByUserId(user.id);
            const roles = data || [];
            setUserRoles(roles);
            if (onRolesUpdate) onRolesUpdate(user.id, roles);
        } catch (error) {
            console.error("Failed to fetch roles for user", error);
            toast.error(`Không thể tải role cho ${user.fullName}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRole = async () => {
        if (!user || !selectedRoleToAdd) return;
        try {
            setIsSubmitting(true);

            // Map existing IDs
            const currentIds = userRoles.map(r => r.id || r.roleId || r.Id).filter(Boolean);
            const updatedRoleIds = [...currentIds, selectedRoleToAdd];

            await userRoleApi.postPut({
                userId: user.id,
                roleIds: Array.from(new Set(updatedRoleIds))
            });

            toast.success("Thêm role thành công!");
            setSelectedRoleToAdd("");
            fetchUserRoles();
        } catch (error) {
            console.error("Failed to add role", error);
            toast.error("Thêm role thất bại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [roleToRemove, setRoleToRemove] = useState<{ id: string, name: string } | null>(null);

    const handleRemoveRoleClick = (roleId: string, roleName: string) => {
        setRoleToRemove({ id: roleId, name: roleName });
        setIsDeleteModalOpen(true);
    };

    const executeRemoveRole = async () => {
        if (!user || !roleToRemove) return;
        try {
            setIsSubmitting(true);

            const currentIds = userRoles.map(r => r.id || r.roleId || r.Id).filter(Boolean);
            const updatedRoleIds = currentIds.filter(id => id !== roleToRemove.id);

            await userRoleApi.postPut({
                userId: user.id,
                roleIds: updatedRoleIds
            });

            toast.success("Xóa role thành công!");
            fetchUserRoles();
            setIsDeleteModalOpen(false);
            setRoleToRemove(null);
        } catch (error) {
            console.error("Failed to remove role", error);
            toast.error("Xóa role thất bại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !user) return null;

    const availableRoles = allRoles.filter(role =>
        !userRoles.some(ur => (ur.id || ur.roleId || ur.Id) === (role.id || role.Id))
    );

    return (
        <div
            className="modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="modal-content max-w-modal-lg relative flex flex-col overflow-hidden rounded-2xl p-6 md:p-8 text-center shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30 shrink-0">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Roles: {user.email}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                        disabled={isSubmitting}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-6 overflow-y-auto flex-1 min-h-0">
                    {/* ADD ROLE SECTION */}
                    <div className="bg-muted/20 p-4 border border-border rounded-lg">
                        <h3 className="text-sm font-semibold mb-3 text-foreground">Thêm Role Mới</h3>
                        <div className="flex items-center gap-2">
                            <select
                                className="flex-1 h-10 px-sm text-sm rounded-md border border-border-strong bg-surface text-foreground shadow-sm focus-visible:outline-none focus:ring-1 focus:ring-primary/40"
                                value={selectedRoleToAdd}
                                onChange={(e) => setSelectedRoleToAdd(e.target.value)}
                                disabled={isSubmitting || loading}
                            >
                                <option value="">-- Chọn Role --</option>
                                {availableRoles.map((role, idx) => (
                                    <option key={idx} value={role.id || role.Id}>
                                        {role.name || role.Name}
                                    </option>
                                ))}
                            </select>
                            <Button
                                className="btn-primary h-10 shrink-0 flex items-center gap-2 px-4"
                                onClick={handleAddRole}
                                disabled={!selectedRoleToAdd || isSubmitting || loading}
                            >
                                <Plus className="w-4 h-4" /> Thêm
                            </Button>
                        </div>
                    </div>

                    {/* CURRENT ROLES LIST */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3 text-foreground">Roles Hiện Tại</h3>
                        {loading ? (
                            <div className="flex justify-center p-6 text-foreground-muted text-sm">
                                Đang tải roles...
                            </div>
                        ) : userRoles.length > 0 ? (
                            <div className="space-y-2">
                                {userRoles.map((r, idx) => {
                                    const roleId = r.id || r.roleId || r.Id;
                                    const roleName = r.name || r.roleName || r.Name || "Unknown Role";
                                    return (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-md border border-border bg-surface hover:bg-muted/30 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{roleName}</span>
                                            </div>

                                            <ActionButton
                                                icon={<Trash2 className="w-3.5 h-3.5" />}
                                                onClick={() => handleRemoveRoleClick(roleId, roleName)}
                                                color="red"
                                                title="Xóa"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center p-6 text-sm text-foreground-muted border border-dashed border-border rounded-md">
                                Người dùng này chưa được gán role nào.
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-4 border-t border-border bg-muted/30 shrink-0">
                    <Button variant="outline"
                        onClick={onClose} disabled={isSubmitting}
                    >
                        Đóng
                    </Button>
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => executeRemoveRole()}
                title="Xác nhận xóa Role khỏi User"
                description={`Bạn có chắc chắn muốn xóa role ${roleToRemove?.name || ""} khỏi người dùng này?`}
                loading={loading}
                confirmText="Xóa hoàn toàn"
                itemName={roleToRemove?.name || ""}
            />
        </div >
    );
};

export default UserRolesModal;
