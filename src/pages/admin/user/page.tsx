import React, { useEffect, useState, useCallback } from "react";
import { userApi } from "../../../services/user-api.service";
import { roleApi } from "../../../services/role-api.service";
import type { PagingVM, GetUserBaseRes } from "../../../models/entity.model";
import { toast } from "react-toastify";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import UserRolesModal from "./components/UserRolesModal";
import UserAccountsModal from "./components/UserAccountsModal";
import { formatDate } from "@/utils/dateTimeUtils";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";

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
    const [selectedUser, setSelectedUser] = useState<GetUserBaseRes | null>(null);

    // Filter states
    const [searchValue, setSearchValue] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [sortState, setSortState] = useState<{ field: string, dir: "asc" | "desc" } | null>(null);
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
    const [roleIdFilter, setRoleIdFilter] = useState<string | undefined>(undefined);

    const [roles, setRoles] = useState<{ label: string, value: string }[]>([]);

    useEffect(() => {
        roleApi.getAll().then((res: any) => {
            const mappedRoles = (res || []).map((r: any) => ({
                label: r.nameUpperCase,
                value: r.id
            }));
            setRoles(mappedRoles);
        }).catch((err) => console.error("Error fetching roles", err));
    }, []);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchValue);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchValue]);

    const fetchUsers = useCallback(async (page: number, size: number, sortField?: string, sortDir?: "asc" | "desc", search?: string, status?: boolean, roleId?: string) => {
        try {
            setLoading(true);

            // userApi.getAll signature: pageNumber, pageSize, sortField, sortDirection, status, searchValue, roleId
            const res = await userApi.getAll(page, size, sortField ?? null, sortDir ?? null, status ?? null, search ?? null, roleId ?? null);
            if (res) {
                let list = res.list || [];

                setUsers(list);
                setPaging(res);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to fetch users data.");
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

    const handleOpenViewRolesModal = (user: GetUserBaseRes) => {
        setSelectedUser(user);
        setIsViewRolesModalOpen(true);
    };

    const handleOpenViewAccountsModal = (user: GetUserBaseRes) => {
        setSelectedUser(user);
        setIsViewAccountsModalOpen(true);
    };

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold text-foreground">User Management</h1>
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
                    />
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                    <DataTable
                        loading={loading}
                        data={users}
                        sortState={sortState ? {
                            index: ["fullName", "email", "createdAt", "status"].indexOf(sortState.field),
                            dir: sortState.dir
                        } : null}
                        filterState={statusFilter !== undefined ? { 3: statusFilter } : {}}
                        onSortChange={(index, dir) => {
                            const columns = ["fullName", "email", "createdAt", "status", "actions"];
                            const field = columns[index];
                            if (!dir) setSortState(null);
                            else setSortState({ field, dir });
                        }}
                        onFilterChange={(index, value) => {
                            if (index === 3) setStatusFilter(value);
                        }}
                        onResetPage={() => handlePageChange(1)}
                        showIndex
                        pageNumber={paging.pageNumber}
                        pageSize={paging.pageSize}
                        columns={[
                            {
                                header: "FullName",
                                accessor: (user) => user.fullName,
                                type: "string",
                                sortable: true,
                                filterable: false,
                                cell: (user) => <span className="font-medium">{user.fullName}</span>
                            },
                            {
                                header: "Email",
                                accessor: (user) => user.email,
                                type: "string",
                                sortable: true,
                                filterable: false,
                                cell: (user) => <span className="font-medium">{user.email}</span>
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
                                        activeColor="green"
                                        inactiveColor="red"
                                    />
                                )
                            },
                            {
                                header: "Actions",
                                accessor: (user) => user.userId,
                                cell: (user) => (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleOpenViewAccountsModal(user)}
                                            className="text-primary hover:text-primary/80 transition-colors font-medium text-sm"
                                        >
                                            View Accounts
                                        </button>
                                        <button
                                            onClick={() => handleOpenViewRolesModal(user)}
                                            className="text-primary hover:text-primary/80 transition-colors font-medium text-sm"
                                        >
                                            View Roles
                                        </button>
                                    </div>
                                )
                            },
                        ]}
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

            <UserRolesModal
                isOpen={isViewRolesModalOpen}
                onClose={() => setIsViewRolesModalOpen(false)}
                user={selectedUser}
            />

            <UserAccountsModal
                isOpen={isViewAccountsModalOpen}
                onClose={() => setIsViewAccountsModalOpen(false)}
                user={selectedUser}
            />
        </div>
    );
};

export default UserPage;
