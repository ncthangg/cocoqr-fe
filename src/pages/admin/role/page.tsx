import React, { useEffect, useState, useCallback } from "react";
import { roleApi } from "../../../services/role-api.service";
import type { RoleRes } from "../../../models/entity.model";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import RoleModal from "./components/RoleModal";
import DeleteConfirmModal from "@/components/UICustoms/Modal/DeleteConfirmModal";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { DataTable } from "@/components/UICustoms/Table/data-table";

const RolePage: React.FC = () => {
    const [allRoles, setAllRoles] = useState<RoleRes[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Modal state
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<RoleRes | null>(null);

    const fetchRoles = useCallback(async () => {
        try {
            setLoading(true);
            const res = await roleApi.getAll();
            if (res) {
                setAllRoles(res || []);
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
            toast.error("Failed to fetch role data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleOpenCreateModal = () => {
        setSelectedRole(null);
        setIsRoleModalOpen(true);
    };

    const handleOpenEditModal = (role: RoleRes) => {
        setSelectedRole(role);
        setIsRoleModalOpen(true);
    };

    const handleOpenDeleteModal = (role: RoleRes) => {
        setSelectedRole(role);
        setIsDeleteModalOpen(true);
    };

    const handleModalSuccess = () => {
        fetchRoles();
    };

    const handleDeleteRole = async () => {
        if (!selectedRole) return;
        try {
            setLoading(true);
            await roleApi.delete(selectedRole.id);
            toast.success("Role deleted successfully!");
            handleModalSuccess();
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Error deleting role:", error);
            toast.error("Failed to delete role.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold text-foreground">Role Management</h1>
            </div>

            <div className="bg-bg border border-border rounded-lg shadow-sm flex flex-col min-h-0 border-b-0">
                <div className="shrink-0 border-b border-border">
                    <TableToolbar
                        value={null}
                        onChange={null}
                        placeholder="Search roles..."
                        handleOpenCreateModal={handleOpenCreateModal}
                    />
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                    <DataTable
                        loading={loading}
                        data={allRoles}
                        sortState={null}
                        onSortChange={() => { }}
                        onFilterChange={() => { }}
                        showIndex
                        columns={[
                            {
                                header: "Role Name",
                                accessor: (role) => role.name,
                                type: "string",
                                cell: (role) => <span className="font-medium">{role.name}</span>
                            },
                            {
                                header: "Role Code (Uppercase)",
                                accessor: (role) => role.nameUpperCase,
                                type: "string",
                                cell: (role) => <span className="text-muted-foreground">{role.nameUpperCase}</span>
                            },
                            {
                                header: "Status",
                                accessor: (role) => role.status,
                                type: "boolean",
                                cell: (role) =>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {role.status ? 'Active' : 'Inactive'}
                                    </span>
                            },
                            {
                                header: "Actions",
                                accessor: (role) => role.id,
                                cell: (role) => (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleOpenEditModal(role)}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenDeleteModal(role)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )
                            }
                        ]}
                    />
                </div>
            </div>

            <RoleModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                onSuccess={handleModalSuccess}
                role={selectedRole}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteRole}
                itemName={selectedRole?.name || ""}
                loading={loading}
            />
        </div>
    );
};

export default RolePage;
