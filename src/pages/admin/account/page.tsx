import React, { useState, useEffect, useCallback } from "react";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { accountApi } from "@/services/account-api.service";
import { providerApi } from "@/services/provider-api.service";
import type { AccountRes, ProviderRes } from "@/models/entity.model";
import type { PagingVM } from "@/models/entity.model";
import AccountModal from "./components/AccountModal";
import DeleteConfirmModal from "@/components/UICustoms/Modal/DeleteConfirmModal";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import { resolveAvatarPreview } from "@/utils/imageConvertUtils";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";

const AccountsPage: React.FC = () => {
    const [accounts, setAccounts] = useState<AccountRes[]>([]);
    const [allProviders, setAllProviders] = useState<ProviderRes[]>([]);
    const [loading, setLoading] = useState(false);
    const [paging, setPaging] = useState<PagingVM<AccountRes>>({
        list: [],
        pageSize: 10,
        pageNumber: 1,
        totalPages: 1,
        totalItems: 0
    });

    const [searchValue, setSearchValue] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortState, setSortState] = useState<{ field: string, dir: "asc" | "desc" } | null>(null);
    const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
    const [providerFilter, setProviderFilter] = useState<string | undefined>(undefined);

    // Modals state
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<AccountRes | null>(null);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchValue);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchValue]);

    const fetchProviders = useCallback(async () => {
        try {
            const res = await providerApi.getAll();
            if (res) {
                setAllProviders(res);
            }
        } catch (error) {
            console.error("Error fetching providers:", error);
        }
    }, []);

    const fetchAccounts = useCallback(async (page: number, size: number,
        sortField?: string, sortDir?: "asc" | "desc",
        search?: string,
        providerId?: string,
        isActive?: boolean,
        isDeleted?: boolean,
        status?: boolean) => {
        try {
            setLoading(true);
            const res = await accountApi.getAllByAdmin(
                page,
                size,
                sortField ?? null,
                sortDir ?? null,
                null,
                providerId ?? null,
                search ?? null,
                isActive ?? null,
                isDeleted ?? null,
                status ?? null,
            );
            if (res) {
                setAccounts(res.list || []);
                setPaging(res);
            }
        } catch (error) {
            console.error("Error fetching accounts:", error);
            toast.error("Không thể tải danh sách tài khoản.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    useEffect(() => {
        fetchAccounts(paging.pageNumber, paging.pageSize, sortState?.field, sortState?.dir, debouncedSearch, providerFilter, activeFilter, false, statusFilter);
    }, [fetchAccounts, paging.pageNumber, paging.pageSize, sortState, debouncedSearch, providerFilter, activeFilter, statusFilter]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= paging.totalPages) {
            setPaging(prev => ({ ...prev, pageNumber: newPage }));
        }
    };

    const handleOpenAdd = () => {
        setSelectedAccount(null);
        setIsAccountModalOpen(true);
    };

    const handleOpenEdit = (acc: AccountRes) => {
        setSelectedAccount(acc);
        setIsAccountModalOpen(true);
    };

    const handleOpenDelete = (acc: AccountRes) => {
        setSelectedAccount(acc);
        setIsDeleteModalOpen(true);
    };

    const handleModalSuccess = () => {
        fetchAccounts(paging.pageNumber, paging.pageSize, sortState?.field, sortState?.dir, debouncedSearch, providerFilter, activeFilter, false, statusFilter);
    };

    const handleDeleteAccount = async () => {
        if (!selectedAccount) return;
        try {
            setLoading(true);
            await accountApi.delete(selectedAccount.id);
            toast.success("Xóa tài khoản thành công!");
            handleModalSuccess();
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Error deleting account:", error);
            toast.error("Xóa tài khoản thất bại.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold text-foreground">Account Management</h1>
            </div>

            <div className="bg-bg border border-border rounded-lg shadow-sm flex flex-col min-h-0 border-b-0">
                <div className="shrink-0 border-b border-border">
                    <TableToolbar
                        value={searchValue}
                        onChange={setSearchValue}
                        placeholder="Search accounts..."
                        handleOpenCreateModal={handleOpenAdd}
                        onResetPage={() => handlePageChange(1)}
                        filterValue={providerFilter !== undefined ? String(providerFilter) : ""}
                        filterOptions={allProviders.map(p => ({
                            label: p.code,
                            value: p.id
                        }))}
                        onFilterChange={(val) => setProviderFilter(val === undefined ? undefined : String(val))}
                    />
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                    <DataTable
                        loading={loading}
                        data={accounts}
                        sortState={sortState ? {
                            index: ["accountHolder", "bankCode", "accountNumber", "createdAt", "isActive", "status"]
                                .indexOf(sortState.field), dir: sortState.dir
                        } : null}
                        filterState={{
                            ...(activeFilter !== undefined ? { 5: activeFilter } : {}),
                            ...(statusFilter !== undefined ? { 6: statusFilter } : {}),
                        }}
                        onSortChange={(index, dir) => {
                            const columns = ["accountHolder", "bankCode", "accountNumber", "createdAt", "isActive", "status", "actions"];
                            const field = columns[index];
                            if (!dir) setSortState(null);
                            else setSortState({ field, dir });
                        }}
                        onFilterChange={(index, value) => {
                            if (index === 5) setActiveFilter(value as boolean | undefined);
                            if (index === 6) setStatusFilter(value as boolean | undefined);
                        }}
                        onResetPage={() => handlePageChange(1)}
                        showIndex
                        pageNumber={paging.pageNumber}
                        pageSize={paging.pageSize}
                        columns={[
                            {
                                header: "TÊN CHỦ TÀI KHOẢN",
                                accessor: (acc) => acc.accountHolder,
                                type: "string",
                                sortable: true,
                                filterable: false,
                                cell: (acc) => <span className="font-semibold uppercase">{acc.accountHolder}</span>
                            },
                            {
                                header: "NGÂN HÀNG / VÍ",
                                accessor: (acc) => acc.bankCode,
                                type: "string",
                                sortable: true,
                                filterable: false,
                                cell: (acc) => (
                                    <span className="inline-flex items-center gap-2">
                                        {acc.bankLogoUrl ? (
                                            <img src={resolveAvatarPreview(acc.bankLogoUrl ?? null)} alt={acc.bankShortName || ""} className="w-10 h-10 object-contain rounded bg-white p-1 border border-border" />
                                        ) : (
                                            <div className="w-10 h-10 bg-surface-muted border border-border rounded flex items-center justify-center text-xs font-bold text-text-secondary">
                                                {acc.bankCode}
                                            </div>
                                        )}
                                        {acc.bankName && acc.providerName && acc.bankName !== acc.providerName ? acc.bankName : acc.providerName}
                                        {(acc.bankStatus === false || acc.providerStatus === false) && (
                                            <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded font-bold ml-1">BẢO TRÌ</span>
                                        )}
                                    </span>
                                )
                            },
                            {
                                header: "SỐ TÀI KHOẢN",
                                accessor: (acc) => acc.accountNumber,
                                type: "string",
                                sortable: true,
                                filterable: false,
                                cell: (acc) => acc.accountNumber
                            },
                            {
                                header: "NGÀY TẠO",
                                accessor: (acc) => acc.createdAt,
                                type: "string",
                                sortable: true,
                                filterable: false,
                                cell: (acc) => formatDate(acc.createdAt)
                            },
                            {
                                header: "TRẠNG THÁI",
                                accessor: (acc) => acc.isActive,
                                type: "boolean",
                                sortable: false,
                                filterable: true,
                                cell: (acc) => (
                                    <StatusBadge
                                        status={acc.isActive}
                                        activeText="ĐANG HOẠT ĐỘNG"
                                        inactiveText="KHÔNG HOẠT ĐỘNG"
                                        activeColor="green"
                                        inactiveColor="red"
                                    />
                                )
                            },
                            {
                                header: "STATUS",
                                accessor: (acc) => acc.status,
                                type: "boolean",
                                sortable: false,
                                filterable: true,
                                cell: (acc) => (
                                    <StatusBadge
                                        status={acc.status}
                                        activeText="ACTIVE"
                                        inactiveText="INACTIVE"
                                        activeColor="green"
                                        inactiveColor="red"
                                    />
                                )
                            },
                            {
                                header: "Actions",
                                accessor: (acc) => acc.id,
                                cell: (acc) => (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleOpenEdit(acc)}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenDelete(acc)}
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

            <AccountModal
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                onSuccess={handleModalSuccess}
                account={selectedAccount}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
                itemName={selectedAccount?.accountNumber || ""}
                description="Bạn có chắc chắn muốn xóa tài khoản này không? Hành động này không thể hoàn tác."
                loading={loading}
            />
        </div>
    );
};

export default AccountsPage;
