import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "react-toastify";
import Button from "../../../../components/UICustoms/Button";
import { userRoleApi } from "../../../../services/userRole-api.service";
import type { RemoveUserFromRoleReq } from "../../../../models/entity.request.model";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: string;
    roleId: string;
    roleName: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen, onClose, onSuccess, userId, roleId, roleName
}) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleDelete = async () => {
        try {
            setLoading(true);
            const req: RemoveUserFromRoleReq = { userId, roleId };
            await userRoleApi.delete(req);
            toast.success("User role removed successfully!");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error deleting user role:", error);
            toast.error("Failed to remove user role.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="bg-surface max-w-modal-lg rounded-xl shadow-2xl overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b border-border">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        <h2 className="text-lg font-bold">Remove Role from User</h2>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-foreground">
                        Are you sure you want to remove the role <strong>{roleName}</strong> from this user (ID: {userId})?
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        This action will immediately revoke the user's access associated with this role.
                    </p>
                </div>

                <div className="p-5 border-t border-border flex justify-end gap-3 bg-muted/20">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="bg-background border border-border text-foreground hover:bg-muted px-4 py-2"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleDelete}
                        className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 border-transparent"
                        disabled={loading}
                    >
                        {loading ? "Removing..." : "Remove"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
