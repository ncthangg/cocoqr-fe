import React, { useEffect, useState, useCallback, useMemo, lazy, Suspense } from "react";
import { roleApi } from "@/services/role-api.service";
import type { RoleRes } from "@/models/entity.model";
import { Eye, Wallet } from "lucide-react";
import { toast } from "react-toastify";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import type { Column } from "@/components/UICustoms/Table/data-table";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";
import ActionButton from "@/components/UICustoms/ActionButton";
import { StatCard } from "@/components/UICustoms/StatCard";

const RoleModal = lazy(() => import("./components/RoleModal"));

const RolePage: React.FC = () => {
    const [allRoles, setAllRoles] = useState<RoleRes[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
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
            toast.error("Kh�ng th? t?i d? li?u role.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleOpenViewModal = (role: RoleRes) => {
        setSelectedRole(role);
        setIsRoleModalOpen(true);
    };

    const handleUpdateRoleSuccess = (updatedRole: RoleRes) => {
        setAllRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
    };

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Quản lý Role</h1>
                    <p className="text-sm text-foreground-muted font-medium">Quản lý các vai trò và quyền hạn truy cập của người dùng trong hệ thống.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 shrink-0">
                    <StatCard
                        label="Tổng role"
                        value={allRoles.length}
                        icon={<Wallet className="w-5 h-5 text-primary" />}
                        color="blue"
                    />
                </div>
            </div>

            <div className="bg-bg border border-border rounded-lg shadow-sm flex flex-col min-h-0 border-b-0">

                <div className="min-h-0 flex-1 overflow-hidden">
                    <DataTable
                        loading={loading}
                        data={allRoles}
                        sortState={null}
                        onSortChange={() => { }}
                        onFilterChange={() => { }}
                        showIndex
                        columns={useMemo<Column<RoleRes>[]>(() => [
                            {
                                header: "Role Code",
                                accessor: (role) => role.nameUpperCase,
                                type: "string",
                                cell: (role) => <span className="font-semibold uppercase">{role.nameUpperCase}</span>
                            },
                            {
                                header: "Role Name",
                                accessor: (role) => role.name,
                                type: "string",
                                cell: (role) => <span className="font-medium">{role.name}</span>
                            },
                            {
                                header: "Status",
                                accessor: (role) => role.status,
                                type: "boolean",
                                cell: (role) =>
                                    <StatusBadge
                                        status={role.status}
                                        activeText="ACTIVE"
                                        inactiveText="INACTIVE"
                                        activeColor="green"
                                        inactiveColor="red"
                                    />
                            },
                            {
                                header: "Thao tác",
                                accessor: (role) => role.id,
                                cell: (role) => (
                                    <div className="flex items-center gap-sm">
                                        <ActionButton
                                            icon={<Eye className="w-4 h-4" />}
                                            onClick={() => handleOpenViewModal(role)}
                                            color="blue"
                                            title="Xem chi tiết"
                                        />
                                    </div>
                                )
                            }
                        ], [handleOpenViewModal])}
                    />
                </div>
            </div>

            {isRoleModalOpen && (
                <Suspense fallback={null}>
                    <RoleModal
                        isOpen={isRoleModalOpen}
                        onClose={() => setIsRoleModalOpen(false)}
                        onSuccess={handleUpdateRoleSuccess}
                        role={selectedRole}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default RolePage;
