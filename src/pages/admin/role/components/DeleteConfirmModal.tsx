import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "react-toastify";
import Button from "../../../../components/UICustoms/Button";
import { roleApi } from "../../../../services/role-api.service";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    roleId: string;
    roleName: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen, onClose, onSuccess, roleId, roleName
}) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleDelete = async () => {
        try {
            setLoading(true);
            await roleApi.delete(roleId);
            toast.success("Role deleted successfully!");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error deleting role:", error);
            toast.error("Failed to delete role.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="bg-surface w-full rounded-xl shadow-2xl overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b border-border">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        <h2 className="text-lg font-bold">Delete Role</h2>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-foreground">
                        Are you sure you want to delete the role <strong>{roleName}</strong>?
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        This action cannot be undone. Users with this role might be affected.
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
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
