import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import Button from "../../../../components/UICustoms/Button";
import { roleApi } from "../../../../services/role-api.service";
import type { RoleRes } from "../../../../models/entity.model";
import type { PostRoleReq, PutRoleReq } from "../../../../models/entity.request.model";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    role?: RoleRes | null;
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, onSuccess, role }) => {
    const [loading, setLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [formData, setFormData] = useState<PostRoleReq>({
        name: "",
    });

    useEffect(() => {
        if (isOpen) {
            if (role) {
                setFormData({
                    name: role.name || "",
                });
            } else {
                setFormData({
                    name: "",
                });
            }
            setIsConfirmOpen(false);
        }
    }, [isOpen, role]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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

            if (role && role.id) {
                const putReq: PutRoleReq = { name: formData.name };
                await roleApi.put(role.id, putReq);
                toast.success("Cập nhật role thành công!");
            } else {
                await roleApi.post(formData);
                toast.success("Tạo mới role thành công!");
            }

            setIsConfirmOpen(false);
            onSuccess();
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
            className="modal-overlay bg-black/60 px-4 py-6"
        >
            <div
                className="modal-content max-w-modal-lg relative flex flex-col overflow-hidden rounded-2xl p-6 md:p-8 shadow-2xl bg-surface"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center pb-4 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground">
                        {role ? "Edit Role" : "Create New Role"}
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="pt-6">
                    <div className="space-y-4">
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium text-foreground">Role Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. Admin"
                                required
                            />
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium text-foreground">Role Code (Uppercase)</label>
                            <input
                                type="text"
                                value={formData.name ? formData.name.toUpperCase().trim().replace(/\s+/g, '_') : ""}
                                disabled
                                className="w-full px-3 py-2 bg-muted text-muted-foreground border border-border rounded-md text-sm cursor-not-allowed"
                            />
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
                            disabled={loading || !formData.name || isConfirmOpen}
                        >
                            {loading ? "Saving..." : "Save Role"}
                        </Button>
                    </div>
                </form>
            </div>

            <ActionConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeSave}
                title={role ? "Xác nhận cập nhật Role" : "Xác nhận tạo Role"}
                description={`Bạn có chắc chắn muốn ${role ? "cập nhật" : "tạo mới"} role ${formData.name}?`}
                loading={loading}
                confirmText={role ? "Cập nhật" : "Tạo mới"}
            />
        </div>
    );
};

export default RoleModal;
