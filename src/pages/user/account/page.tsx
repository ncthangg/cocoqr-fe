import React, { useState, useEffect, useCallback } from "react";
import { Edit, Trash2, Pin } from "lucide-react";
import { toast } from "react-toastify";
import { accountApi } from "@/services/account-api.service";
import { providerApi } from "@/services/provider-api.service";
import type { AccountRes, PagingVM, ProviderRes } from "@/models/entity.model";
import type { PutAccountReq } from "@/models/entity.request.model";
import AccountModal from "./components/AccountModal";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import { useAuthContext } from "@/auth/AuthContext";
import { resolveAvatarPreview } from "@/utils/imageConvertUtils";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";
import { formatDate } from "@/utils/dateTimeUtils";

const AccountsPage: React.FC = () => {
    const { user } = useAuthContext();
    const userId = user?.userId || "";

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
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
    const [providerFilter, setProviderFilter] = useState<string | undefined>(undefined);

    // Modals state
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
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
                setAllProviders(res || []);
            }
        } catch (error) {
            console.error("Error fetching providers:", error);
        }
    }, []);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const fetchAccounts = useCallback(async (page: number, size: number,
        currentUserId: string,
        search?: string,
        sortField?: string, sortDir?: "asc" | "desc",
        isActive?: boolean,
        providerId?: string) => {
        if (!currentUserId) return;
        try {
            setLoading(true);
            const res = await accountApi.getAll(
                page,
                size,
                sortField ?? null,
                sortDir ?? null,
                currentUserId,
                providerId ?? null,
                search ?? null,
                isActive ?? null
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
        if (userId) {
            fetchAccounts(paging.pageNumber, paging.pageSize, userId, debouncedSearch, sortState?.field, sortState?.dir, statusFilter, providerFilter);
        }
    }, [fetchAccounts, paging.pageNumber, paging.pageSize, userId, debouncedSearch, sortState, statusFilter, providerFilter]);

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

    const handleOpenPin = (acc: AccountRes) => {
        setSelectedAccount(acc);
        setIsPinModalOpen(true);
    };

    const handleModalSuccess = () => {
        fetchAccounts(paging.pageNumber, paging.pageSize, userId, debouncedSearch, sortState?.field, sortState?.dir, statusFilter, providerFilter);
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
            setSelectedAccount(null);
        }
    };

    const handlePinAccount = async () => {
        if (!selectedAccount) return;

        const isCurrentlyPinned = selectedAccount.isPinned;

        // Thêm kiểm tra giới hạn 5 tài khoản ghim nếu hành động là "Ghim"
        if (!isCurrentlyPinned) {
            const currentPinnedCount = accounts.filter(acc => acc.isPinned).length;
            if (currentPinnedCount >= 5) {
                toast.warning("Bạn chỉ có thể ghim tối đa 5 tài khoản.");
                setIsPinModalOpen(false);
                setSelectedAccount(null);
                return;
            }
        }

        try {
            setLoading(true);
            const req: PutAccountReq = {
                providerId: selectedAccount.providerId,
                bankCode: selectedAccount.bankCode ?? "",
                bankName: selectedAccount.bankName ?? "",
                accountHolder: selectedAccount.accountHolder ?? "",
                accountNumber: selectedAccount.accountNumber ?? "",
                isPinned: !isCurrentlyPinned, // Toggle trạng thái
                isActive: selectedAccount.isActive,
            };
            await accountApi.put(selectedAccount.id, req);
            //toast.success(isCurrentlyPinned ? "Bỏ ghim tài khoản thành công!" : "Ghim tài khoản thành công!");
            handleModalSuccess();
            setIsPinModalOpen(false);
        } catch (error) {
            console.error("Error toggling pin status:", error);
            toast.error(isCurrentlyPinned ? "Bỏ ghim tài khoản thất bại." : "Ghim tài khoản thất bại.");
        } finally {
            setLoading(false);
            setSelectedAccount(null);
        }
    };

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold text-foreground">Quản lý tài khoản</h1>
            </div>

            <div className="bg-bg border border-border rounded-lg shadow-sm flex flex-col min-h-0 border-b-0">
                <div className="shrink-0 border-b border-border">
                    <TableToolbar
                        value={searchValue}
                        onChange={setSearchValue}
                        placeholder="Tìm kiếm tài khoản..."
                        handleOpenCreateModal={handleOpenAdd}
                        onResetPage={() => handlePageChange(1)}
                        filterValue={providerFilter !== undefined ? String(providerFilter) : ""}
                        filterOptions={allProviders.map(p => ({
                            label: p.code,
                            value: p.id
                        }))}
                        filterPlaceholder="Chọn loại tài khoản..."
                        onFilterChange={(val) => setProviderFilter(val === undefined ? undefined : String(val))}
                    />
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                    <DataTable
                        loading={loading}
                        data={accounts}
                        sortState={sortState ? {
                            index: ["accountHolder", "providerId", "bankCode", "accountNumber", "createdAt", "isActive"]
                                .indexOf(sortState.field), dir: sortState.dir
                        } : null}
                        filterState={{
                            ...(statusFilter !== undefined ? { 5: statusFilter } : {}),
                            ...(providerFilter !== undefined ? { 1: providerFilter } : {})
                        }}
                        onSortChange={(index, dir) => {
                            const columns = ["accountHolder", "providerId", "bankCode", "accountNumber", "createdAt", "isActive", "actions"];
                            const field = columns[index];
                            if (!dir) setSortState(null);
                            else setSortState({ field, dir });
                        }}
                        onFilterChange={(index, value) => {
                            if (index === 1) setProviderFilter(value as string | undefined);
                            if (index === 5) setStatusFilter(value as boolean | undefined);
                        }}
                        onResetPage={() => handlePageChange(1)}
                        showIndex
                        pageNumber={paging.pageNumber}
                        pageSize={paging.pageSize}
                        columns={[
                            {
                                header: "TÊN TÀI KHOẢN",
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
                                cell: (acc) =>
                                    <span className="inline-flex items-center gap-2">
                                        {acc.bankLogoUrl ? (
                                            <img src={resolveAvatarPreview(acc.bankLogoUrl ?? null)} alt={acc.bankShortName || ""} className="w-10 h-10 object-contain rounded bg-white p-1 border border-border" />
                                        ) : (
                                            <div className="w-10 h-10 bg-surface-muted border border-border rounded flex items-center justify-center text-xs font-bold text-text-secondary">
                                                {acc.bankCode}
                                            </div>
                                        )}
                                        {acc.bankName && acc.providerName && acc.bankName !== acc.providerName ? acc.bankName : acc.providerName}
                                    </span>
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
                                        activeText="Đang hoạt động"
                                        inactiveText="Đã khóa"
                                        activeColor="green"
                                        inactiveColor="red"
                                    />
                                )
                            },
                            {
                                header: "Thao tác",
                                accessor: (acc) => acc.id,
                                cell: (acc) => (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleOpenPin(acc)}
                                            className={`${acc.isPinned ? 'text-amber-500 hover:text-amber-700' : 'text-foreground-muted hover:text-amber-500'} transition-colors`}
                                            title={acc.isPinned ? "Bỏ ghim tài khoản" : "Ghim tài khoản"}
                                        >
                                            <Pin className={`w-4 h-4 ${acc.isPinned ? 'fill-amber-500' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenEdit(acc)}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Sửa"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenDelete(acc)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                            title="Xóa"
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

            <ActionConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
                title="Xác nhận xóa"
                description={`Bạn có chắc chắn muốn xóa tài khoản "${selectedAccount?.accountNumber || selectedAccount?.bankCode}" không? Hành động này không thể hoàn tác.`}
                loading={loading}
                confirmButtonClass="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                confirmText="Xóa"
            />

            <ActionConfirmModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onConfirm={handlePinAccount}
                title={selectedAccount?.isPinned ? "Xác nhận bỏ ghim tài khoản" : "Xác nhận ghim tài khoản"}
                description={`Bạn có chắc chắn muốn ${selectedAccount?.isPinned ? 'bỏ ghim' : 'ghim'} tài khoản "${selectedAccount?.accountNumber || selectedAccount?.bankCode}" không?`}
                loading={loading}
                confirmText={selectedAccount?.isPinned ? "Bỏ ghim" : "Ghim"}
            />
        </div >
    );
};

export default AccountsPage;
