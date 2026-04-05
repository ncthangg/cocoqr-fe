import React, { useEffect, useState, useCallback, useMemo, useRef, lazy, Suspense } from "react";
import { userApi } from "@/services/user-api.service";
import { roleApi } from "@/services/role-api.service";
import type { PagingVM, GetUserBaseRes, RoleRes } from "@/models/entity.model";
import { toast } from "react-toastify";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import type { Column } from "@/components/UICustoms/Table/data-table";
import ActionButton from "@/components/UICustoms/ActionButton";
import { Eye, Wallet, Mail, ShieldCheck } from "lucide-react";
import { formatDate } from "@/utils/dateTimeUtils";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";
import { StatCard } from "@/components/UICustoms/StatCard";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { TagBadge } from "@/components/UICustoms/TagBadge";
import RefreshButton from "@/components/UICustoms/RefreshButton";

const UserRolesModal = lazy(() => import("./components/UserRolesModal"));
const UserAccountsModal = lazy(() => import("./components/UserAccountsModal"));
const UserModal = lazy(() => import("./components/UserModal"));
const UserEmailModal = lazy(() => import("./components/UserEmailModal"));

const UserPage: React.FC = () => {
    const [users, setUsers] = useState<GetUserBaseRes[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [paging, setPaging] = useState<PagingVM<GetUserBaseRes>>({
        list: [],
        pageSize: 10,
        pageNumber: 1,
        totalPages: 1,
        totalItems: 0
    });

    const [isViewRolesModalOpen, setIsViewRolesModalOpen] = useState(false);
    const [isViewAccountsModalOpen, setIsViewAccountsModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isUserEmailModalOpen, setIsUserEmailModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<GetUserBaseRes | null>(null);

    // Filter states
    const [searchValue, setSearchValue] = useState<string>("");
    const debouncedSearch = useDebounce(searchValue, 500);
    const [sortState, setSortState] = useState<{ field: string, dir: "asc" | "desc" } | null>(null);
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
    const [roleIdFilter, setRoleIdFilter] = useState<string | undefined>(undefined);

    const [roles, setRoles] = useState<{ label: string, value: string }[]>([]);
    const [allRolesRaw, setAllRolesRaw] = useState<RoleRes[]>([]);
    const hasFetchedRoles = useRef(false);

    const fetchRoles = useCallback(async () => {
        if (hasFetchedRoles.current) return;
        try {
            const res = await roleApi.getAll();
            if (res) {
                const mappedRoles = res.map((r: RoleRes) => ({
                    label: r.nameUpperCase,
                    value: r.id
                }));
                setRoles(mappedRoles);
                setAllRolesRaw(res);
                hasFetchedRoles.current = true;
            }
        } catch (error) {
            console.error("Error fetching roles", error);
        }
    }, []);

    const fetchUsers = useCallback(async (page: number, size: number, sortField?: string, sortDir?: "asc" | "desc", search?: string, status?: boolean, roleId?: string) => {
        try {
            setLoading(true);

            const res = await userApi.getAll({
                pageNumber: page,
                pageSize: size,
                sortField: sortField ?? null,
                sortDirection: sortDir ?? null,
                status: status !== undefined ? String(status) : null,
                searchValue: search ?? null,
                roleId: roleId ?? null
            });

            if (res) {
                setUsers(res.list || []);
                setPaging(res);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Không thể tải users data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(paging.pageNumber, paging.pageSize, sortState?.field, sortState?.dir, debouncedSearch, statusFilter, roleIdFilter);
    }, [fetchUsers, paging.pageNumber, paging.pageSize, sortState?.field, sortState?.dir, debouncedSearch, statusFilter, roleIdFilter]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= paging.totalPages) {
            setPaging(prev => ({ ...prev, pageNumber: newPage }));
        }
    };

    const handleOpenUserModal = useCallback((user: GetUserBaseRes) => {
        setSelectedUser(user);
        setIsUserModalOpen(true);
    }, []);

    const handleOpenViewRolesModal = useCallback((user: GetUserBaseRes) => {
        fetchRoles();
        setSelectedUser(user);
        setIsViewRolesModalOpen(true);
    }, [fetchRoles]);

    const handleOpenViewAccountsModal = useCallback((user: GetUserBaseRes) => {
        setSelectedUser(user);
        setIsViewAccountsModalOpen(true);
    }, []);

    const handleUserStatusChanged = useCallback((userId: string, newStatus: boolean) => {
        setUsers(prev =>
            prev.map(u => u.id === userId ? { ...u, status: newStatus } : u)
        );
    }, []);

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Quản lý Người dùng</h1>
                    <p className="text-sm text-foreground-muted font-medium">Quản lý danh sách người dùng, vai trò và các tài khoản liên kết trong hệ thống.</p>
                </div>

                {/* Stats Cards */}
                <div className="flex items-center gap-3">
                    <StatCard
                        label="Tổng"
                        className="font-primary"
                        value={paging.totalItems}
                        icon={<Wallet className="w-5 h-5 text-primary" />}
                        color="blue"
                    />
                    <RefreshButton
                        onRefresh={() => fetchUsers(paging.pageNumber, paging.pageSize, sortState?.field, sortState?.dir, debouncedSearch, statusFilter, roleIdFilter)}
                        loading={loading}
                        className="rounded-full"
                    />
                </div>
            </div>

            <div className="bg-bg border border-border rounded-lg shadow-sm flex flex-col min-h-0 border-b-0">
                <div className="shrink-0 border-b border-border">
                    <TableToolbar
                        value={searchValue}
                        onChange={setSearchValue}
                        placeholder="Search by FullName or Email..."
                        handleOpenCreateModal={null}
                        onResetPage={() => handlePageChange(1)}
                        filterOptions={roles}
                        filterValue={roleIdFilter}
                        onFilterChange={(v) => {
                            setRoleIdFilter(v ? v : undefined);
                            setPaging(prev => ({ ...prev, pageNumber: 1 }));
                        }}
                        onFetchOptions={fetchRoles}
                    />
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                    <DataTable
                        loading={loading}
                        data={users}
                        sortState={useMemo(() => sortState ? {
                            index: ["fullName", "email", "roles", "createdAt", "status"].indexOf(sortState.field),
                            dir: sortState.dir
                        } : null, [sortState])}
                        filterState={useMemo(() => statusFilter !== undefined ? { 4: statusFilter } : {}, [statusFilter])}
                        onSortChange={useCallback((index: number, dir: "asc" | "desc" | null) => {
                            const columns = ["fullName", "email", "roles", "createdAt", "status", "Thao tác"];
                            const field = columns[index];
                            if (!dir) setSortState(null);
                            else setSortState({ field, dir });
                        }, [])}
                        onFilterChange={useCallback((index: number, value: any) => {
                            if (index === 4) setStatusFilter(value);
                        }, [])}
                        onResetPage={useCallback(() => handlePageChange(1), [handlePageChange])}
                        showIndex
                        pageNumber={paging.pageNumber}
                        pageSize={paging.pageSize}
                        columns={useMemo<Column<GetUserBaseRes>[]>(() => [
                            {
                                header: "FullName",
                                accessor: (user) => user.fullName,
                                type: "string",
                                sortable: true,
                                filterable: false,
                                cell: (user) => <span className="font-semibold uppercase">{user.fullName}</span>
                            },
                            {
                                header: "Email",
                                accessor: (user) => user.email,
                                type: "string",
                                sortable: true,
                                filterable: false,
                                cell: (user) => <span className="font-semibold">{user.email}</span>
                            },
                            {
                                header: "Roles",
                                accessor: (user) => user.roles?.map(r => r.name).join(", ") || "",
                                type: "string",
                                sortable: true,
                                filterable: false,
                                cell: (user) => (
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles && user.roles.length > 0 ? (
                                            user.roles.map((role, idx) => (
                                                <TagBadge
                                                    key={idx}
                                                    label={role.name}
                                                    color="blue"
                                                    size="sm"
                                                />
                                            ))
                                        ) : (
                                            <span className="text-xs text-foreground-muted">No roles</span>
                                        )}
                                    </div>
                                )
                            },
                            {
                                header: "CreatedAt",
                                accessor: (user) => user.createdAt,
                                type: "string",
                                sortable: true,
                                filterable: false,
                                cell: (user) => <span className="font-medium">{formatDate(user.createdAt)}</span>
                            },
                            {
                                header: "Status",
                                accessor: (user) => user.status,
                                type: "boolean",
                                sortable: false,
                                filterable: true,
                                cell: (user) => (
                                    <StatusBadge
                                        status={user.status}
                                        activeText="ACTIVE"
                                        inactiveText="INACTIVE"

                                    />
                                )
                            },
                            {
                                header: "Thao tác",
                                accessor: (user) => user.id,
                                cell: (user) => (
                                    <div className="flex items-center gap-2">
                                        <ActionButton
                                            icon={<Eye className="w-4 h-4" />}
                                            onClick={() => handleOpenUserModal(user)}
                                            color="blue"
                                            title="Chi tiết & Khóa/Mở"
                                        />
                                        <ActionButton
                                            icon={<Mail className="w-4 h-4" />}
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setIsUserEmailModalOpen(true);
                                            }}
                                            color="gray"
                                            title="Gửi email"
                                        />
                                        <ActionButton
                                            icon={<Wallet className="w-4 h-4" />}
                                            onClick={() => handleOpenViewAccountsModal(user)}
                                            color="blue"
                                            title="Tài khoản ngân hàng"
                                        />
                                        <ActionButton
                                            icon={<ShieldCheck className="w-4 h-4" />}
                                            onClick={() => handleOpenViewRolesModal(user)}
                                            color="amber"
                                            title="Quyền hạn (Roles)"
                                        />
                                    </div>
                                )
                            },
                        ], [handleOpenUserModal, handleOpenViewAccountsModal, handleOpenViewRolesModal])}
                    />
                </div>

                <div className="shrink-0">
                    <TablePagination
                        pageNumber={paging.pageNumber}
                        pageSize={paging.pageSize}
                        totalItems={paging.totalItems}
                        totalPages={paging.totalPages}
                        loading={loading}
                        onPageChange={handlePageChange}
                        onPageSizeChange={(newSize) => {
                            setPaging(prev => ({ ...prev, pageSize: newSize, pageNumber: 1 }));
                        }}
                    />
                </div>
            </div>

            {isUserModalOpen && (
                <Suspense fallback={null}>
                    <UserModal
                        isOpen={isUserModalOpen}
                        onClose={() => setIsUserModalOpen(false)}
                        user={selectedUser}
                        onStatusChanged={handleUserStatusChanged}
                    />
                </Suspense>
            )}

            {isUserEmailModalOpen && (
                <Suspense fallback={null}>
                    <UserEmailModal
                        isOpen={isUserEmailModalOpen}
                        onClose={() => setIsUserEmailModalOpen(false)}
                        user={selectedUser}
                    />
                </Suspense>
            )}

            {isViewRolesModalOpen && (
                <Suspense fallback={null}>
                    <UserRolesModal
                        isOpen={isViewRolesModalOpen}
                        onClose={() => setIsViewRolesModalOpen(false)}
                        user={selectedUser}
                        allRoles={allRolesRaw}
                        onRolesUpdate={(userId, newRoles) => {
                            setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: newRoles } : u));
                            if (selectedUser?.id === userId) {
                                setSelectedUser(prev => prev ? ({ ...prev, roles: newRoles }) : null);
                            }
                        }}
                    />
                </Suspense>
            )}

            {isViewAccountsModalOpen && (
                <Suspense fallback={null}>
                    <UserAccountsModal
                        isOpen={isViewAccountsModalOpen}
                        onClose={() => setIsViewAccountsModalOpen(false)}
                        user={selectedUser}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default UserPage;
