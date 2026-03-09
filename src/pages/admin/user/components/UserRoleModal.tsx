import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import Button from "../../../../components/UICustoms/Button";
import { userRoleApi } from "../../../../services/userRole-api.service";
import { roleApi } from "../../../../services/role-api.service";
import type { RoleRes } from "../../../../models/entity.model";
import type { AddUserToRoleReq } from "../../../../models/entity.request.model";

interface UserRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const UserRoleModal: React.FC<UserRoleModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<RoleRes[]>([]);
    const [formData, setFormData] = useState<AddUserToRoleReq>({
        userId: "",
        roleId: "",
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                userId: "",
                roleId: "",
            });

            // Fetch roles for the dropdown
            if (roles.length === 0) {
                roleApi.getAll().then(res => {
                    const data = res || [];
                    setRoles(data);
                }).catch(err => {
                    console.error("Error fetching roles", err);
                    toast.error("Could not load roles");
                });
            }
        }
    }, [isOpen, roles.length]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.userId || !formData.roleId) {
            toast.error("Please fill in both User ID and Role.");
            return;
        }

        try {
            setLoading(true);
            await userRoleApi.post(formData);
            toast.success("User role added successfully!");

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving user role:", error);
            toast.error("Failed to add user to role.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="modal-overlay bg-black/60 px-4 py-6"
            onClick={onClose}
        >
            <div
                className="modal-content max-w-modal-lg relative flex flex-col overflow-hidden rounded-2xl p-6 md:p-8 shadow-2xl bg-surface"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center pb-4 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground">
                        Assign Role to User
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="pt-6">
                    <div className="space-y-4">
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium text-foreground">User ID <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="userId"
                                value={formData.userId}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Enter User ID"
                                required
                            />
                        </div>

                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium text-foreground">Select Role <span className="text-red-500">*</span></label>
                            <select
                                name="roleId"
                                value={formData.roleId}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            >
                                <option value="" disabled>-- Select a role --</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>
                                        {role.name} ({role.nameUpperCase})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-border flex justify-end gap-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-background border border-border text-foreground hover:bg-muted px-4 py-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 border-transparent"
                            disabled={loading || !formData.userId || !formData.roleId}
                        >
                            {loading ? "Saving..." : "Assign Role"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserRoleModal;
