import React, { useEffect, useState } from "react";
import { userRoleApi } from "../../../../services/userRole-api.service";
import { roleApi } from "../../../../services/role-api.service";
import type { GetUserBaseRes } from "../../../../models/entity.model";
import { toast } from "react-toastify";
import { X, Shield, Plus, Trash2 } from "lucide-react";
import Button from "@/components/UICustoms/Button";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: GetUserBaseRes | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user }) => {
    const [userRoles, setUserRoles] = useState<any[]>([]);
    const [allRoles, setAllRoles] = useState<any[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [selectedRoleToAdd, setSelectedRoleToAdd] = useState<string>("");

    useEffect(() => {
        if (isOpen && user) {
            fetchUserRoles();
            fetchAllRoles();
        } else {
            setUserRoles([]);
            setAllRoles([]);
            setSelectedRoleToAdd("");
        }
    }, [isOpen, user]);

    const fetchUserRoles = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await userRoleApi.getByUserId(user.userId);
            // Fallback for different variations of payload
            setUserRoles(data || []);
        } catch (error) {
            console.error("Failed to fetch roles for user", error);
            toast.error(`Không thể tải role cho ${user.fullName}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllRoles = async () => {
        try {
            const data = await roleApi.getAll();
            setAllRoles(data || []);
        } catch (error) {
            console.error("Failed to fetch all roles", error);
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
                userId: user.userId,
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
        setIsConfirmOpen(true);
    };

    const executeRemoveRole = async () => {
        if (!user || !roleToRemove) return;
        try {
            setIsSubmitting(true);

            const currentIds = userRoles.map(r => r.id || r.roleId || r.Id).filter(Boolean);
            const updatedRoleIds = currentIds.filter(id => id !== roleToRemove.id);

            await userRoleApi.postPut({
                userId: user.userId,
                roleIds: updatedRoleIds
            });

            toast.success("Xóa role thành công!");
            fetchUserRoles();
            setIsConfirmOpen(false);
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
            className="modal-overlay bg-black/60 px-4 py-6"
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
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
                                className="flex-1 h-10 px-3 text-sm rounded-md border border-input bg-surface text-foreground shadow-sm focus-visible:outline-none focus:ring-1 focus:ring-ring"
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
                            <div className="flex justify-center p-6 text-muted-foreground text-sm">
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
                                            <button
                                                onClick={() => handleRemoveRoleClick(roleId, roleName)}
                                                disabled={isSubmitting}
                                                title="Xóa role này"
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center p-6 text-sm text-muted-foreground border border-dashed border-border rounded-md">
                                Người dùng này chưa được gán role nào.
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-4 border-t border-border bg-muted/30 shrink-0">
                    <Button className="border border-border bg-surface hover:bg-muted text-foreground px-4 py-2" onClick={onClose} disabled={isSubmitting}>
                        Đóng
                    </Button>
                </div>
            </div>

            <ActionConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeRemoveRole}
                title="Xác nhận xóa Role khỏi User"
                description={`Bạn có chắc chắn muốn xóa role ${roleToRemove?.name || ''} khỏi người dùng này?`}
                loading={isSubmitting}
                confirmText="Xóa"
                confirmButtonClass="bg-red-600 text-white hover:bg-red-700 px-4 py-2 border-transparent"
            />
        </div >
    );
};

export default UserModal;
