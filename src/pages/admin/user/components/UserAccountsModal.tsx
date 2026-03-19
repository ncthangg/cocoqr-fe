import React, { useEffect, useState, useCallback } from "react";
import { accountApi } from "../../../../services/account-api.service";
import { providerApi } from "../../../../services/provider-api.service";
import type { AccountRes, GetUserBaseRes, PagingVM, ProviderRes } from "../../../../models/entity.model";
import { toast } from "react-toastify";
import { X, Wallet, Eye } from "lucide-react";
import { resolveAvatarPreview } from "@/utils/imageConvertUtils";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import { formatDate } from "@/utils/dateTimeUtils";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";
import ActionButton from "@/components/UICustoms/ActionButton";
import AccountModal from "@/pages/admin/account/components/AccountModal";

interface UserAccountsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: GetUserBaseRes | null;
}

const UserAccountsModal: React.FC<UserAccountsModalProps> = ({ isOpen, onClose, user }) => {
    const [accounts, setAccounts] = useState<AccountRes[]>([]);
    const [allProviders, setAllProviders] = useState<ProviderRes[]>([]);
    const [hasFetchedProviders, setHasFetchedProviders] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
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
    const [providerFilter, setProviderFilter] = useState<string | undefined>(undefined);
    const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);

    // Modal state
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<AccountRes | null>(null);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchValue);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchValue]);

    const fetchProviders = useCallback(async () => {
        if (hasFetchedProviders) return;
        try {
            const res = await providerApi.getAll();
            if (res) {
                setAllProviders(res || []);
                setHasFetchedProviders(true);
            }
        } catch (error) {
            console.error("Error fetching providers:", error);
        }
    }, [hasFetchedProviders]);

    const fetchUserAccounts = useCallback(async (
        userId: string,
        page: number,
        size: number,
        sortField?: string,
        sortDir?: "asc" | "desc",
        search?: string,
        providerId?: string,
        isActive?: boolean,
        status?: boolean
    ) => {
        try {
            setLoading(true);
            const res = await accountApi.getAllByAdmin(
                page,
                size,
                sortField ?? null,
                sortDir ?? null,
                userId,
                providerId ?? null,
                search ?? null,
                isActive ?? null,
                null, // isDeleted
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
        if (isOpen && user) {
            fetchUserAccounts(user.id, paging.pageNumber, paging.pageSize, sortState?.field, sortState?.dir, debouncedSearch, providerFilter, activeFilter, statusFilter);
        } else {
            setAccounts([]);
            setSearchValue("");
            setProviderFilter(undefined);
            setActiveFilter(undefined);
            setStatusFilter(undefined);
            setSortState(null);
            setPaging(prev => ({ ...prev, pageNumber: 1 }));
        }
    }, [isOpen, user, fetchUserAccounts, paging.pageNumber, paging.pageSize, sortState, debouncedSearch, providerFilter, activeFilter, statusFilter]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= paging.totalPages) {
            setPaging(prev => ({ ...prev, pageNumber: newPage }));
        }
    };

    const handleOpenView = (acc: AccountRes) => {
        setSelectedAccount(acc);
        setIsAccountModalOpen(true);
    };

    const handleAccountStatusChanged = (id: string, newStatus: boolean) => {
        setAccounts(prev =>
            prev.map(acc => acc.id === id ? { ...acc, status: newStatus } : acc)
        );
    };

    if (!isOpen || !user) return null;

    return (
        <div
            className="modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="modal-content max-w-modal-4xl relative flex flex-col overflow-hidden rounded-2xl bg-bg shadow-2xl h-[80vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30 shrink-0">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-primary" />
                        Danh sách tài khoản: {user.fullName} - {user.email}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="shrink-0 border-b border-border">
                    <TableToolbar
                        value={searchValue}
                        onChange={setSearchValue}
                        placeholder="Tìm kiếm tài khoản..."
                        handleOpenCreateModal={null}
                        onResetPage={() => handlePageChange(1)}
                        filterValue={providerFilter !== undefined ? String(providerFilter) : ""}
                        filterOptions={allProviders.map(p => ({
                            label: p.code,
                            value: p.id
                        }))}
                        filterPlaceholder="Chọn loại tài khoản..."
                        onFilterChange={(val) => setProviderFilter(val === undefined ? undefined : String(val))}
                        onFetchOptions={fetchProviders}
                    />
                </div>

                {/* Table Content */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    <DataTable
                        loading={loading}
                        data={accounts}
                        sortState={sortState ? {
                            index: ["accountHolder", "providerId", "bankCode", "accountNumber", "createdAt", "isActive", "status"]
                                .indexOf(sortState.field),
                            dir: sortState.dir
                        } : null}
                        filterState={{
                            ...(activeFilter !== undefined ? { 4: activeFilter } : {}),
                            ...(statusFilter !== undefined ? { 5: statusFilter } : {}),
                        }}
                        onSortChange={(index, dir) => {
                            const columns = ["accountHolder", "providerId", "bankCode", "accountNumber", "createdAt", "isActive", "status"];
                            const field = columns[index];
                            if (!field || !dir) setSortState(null);
                            else setSortState({ field, dir });
                        }}
                        onFilterChange={(index, value) => {
                            if (index === 4) setActiveFilter(value as boolean | undefined);
                            if (index === 5) setStatusFilter(value as boolean | undefined);
                            handlePageChange(1);
                        }}
                        onResetPage={() => handlePageChange(1)}
                        showIndex
                        pageNumber={paging.pageNumber}
                        pageSize={paging.pageSize}
                        columns={[
                            {
                                header: "TÊN TÀI KHOẢN",
                                accessor: (acc) => acc.accountHolder,
                                sortable: true,
                                maxWidth: "280px",
                                truncate: true,
                                cell: (acc) => <span className="font-semibold uppercase text-xs">{acc.accountHolder}</span>
                            },
                            {
                                header: "NGÂN HÀNG / VÍ",
                                accessor: (acc) => acc.bankCode,
                                sortable: true,
                                cell: (acc) => (
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            {(acc.bankLogoUrl || acc.providerLogoUrl) ? (
                                                <img
                                                    src={resolveAvatarPreview(acc.bankLogoUrl ?? acc.providerLogoUrl ?? null)}
                                                    alt={acc.bankShortName || acc.providerName}
                                                    className="w-10 h-10 object-contain rounded bg-white p-1 border border-border"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-surface-muted border border-border rounded flex items-center justify-center text-xs font-bold text-foreground-secondary">
                                                    {acc.bankCode}
                                                </div>
                                            )}
                                            {(acc.bankCode && acc.bankName) ? acc.bankName : acc.providerName}
                                            {(acc.bankIsActive === false || acc.providerIsActive === false) && (
                                                <span className="text-red-500 font-bold text-xs animate-pulse">
                                                    (Đang bảo trì)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            },
                            {
                                header: "SỐ TÀI KHOẢN",
                                accessor: (acc) => acc.accountNumber,
                                sortable: true,
                                cell: (acc) => <span className="font-mono text-xs">{acc.accountNumber}</span>
                            },
                            {
                                header: "NGÀY TẠO",
                                accessor: (acc) => acc.createdAt,
                                sortable: true,
                                cell: (acc) => <span className="text-xs">{formatDate(acc.createdAt)}</span>
                            },
                            {
                                header: "TRẠNG THÁI",
                                accessor: (acc) => acc.isActive,
                                type: "boolean",
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
                                header: "Thao tác",
                                accessor: (acc) => acc.id,
                                cell: (acc) => (
                                    <div className="flex items-center gap-3">
                                        <ActionButton
                                            icon={<Eye className="w-4 h-4" />}
                                            onClick={() => handleOpenView(acc)}
                                            color="blue"
                                            title="Xem chi tiết"
                                        />
                                    </div>
                                )
                            }
                        ]}
                    />
                </div>

                {/* Pagination */}
                <div className="shrink-0 border-t border-border">
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
                accountId={selectedAccount?.id || null}
                onStatusChanged={handleAccountStatusChanged}
            />
        </div>
    );
};

export default UserAccountsModal;
