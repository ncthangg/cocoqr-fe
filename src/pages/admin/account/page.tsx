import React, { useState, useEffect, useCallback } from "react";
import { Eye, Wallet } from "lucide-react";
import { toast } from "react-toastify";
import { accountApi } from "@/services/account-api.service";
import { providerApi } from "@/services/provider-api.service";
import type { AccountRes, ProviderRes } from "@/models/entity.model";
import type { PagingVM } from "@/models/entity.model";
import AccountModal from "./components/AccountModal";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import { resolveAvatarPreview } from "@/utils/imageConvertUtils";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";
import ActionButton from "@/components/UICustoms/ActionButton";
import { StatCard } from "@/components/UICustoms/StatCard";
import { formatDate } from "@/utils/dateTimeUtils";

const AccountsPage: React.FC = () => {
    const [accounts, setAccounts] = useState<AccountRes[]>([]);
    const [allProviders, setAllProviders] = useState<ProviderRes[]>([]);
    const [hasFetchedProviders, setHasFetchedProviders] = useState(false);
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
        fetchAccounts(paging.pageNumber, paging.pageSize, sortState?.field, sortState?.dir, debouncedSearch, providerFilter, activeFilter, false, statusFilter);
    }, [fetchAccounts, paging.pageNumber, paging.pageSize, sortState, debouncedSearch, providerFilter, activeFilter, statusFilter]);

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

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Account Management</h1>
                    <p className="text-sm text-foreground-muted font-medium">Lưu trữ và quản lý thông tin các ngân hàng, ví điện tử của bạn.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 shrink-0">
                    <StatCard
                        label="Tổng tài khoản"
                        value={paging.totalItems}
                        icon={<Wallet className="w-5 h-5 text-primary" />}
                        color="blue"
                    />
                </div>
            </div>

            <div className="bg-bg border border-border rounded-lg shadow-sm flex flex-col min-h-0 border-b-0">
                <div className="shrink-0 border-b border-border">
                    <TableToolbar
                        value={searchValue}
                        onChange={setSearchValue}
                        placeholder="Search accounts..."
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

                <div className="min-h-0 flex-1 overflow-hidden">
                    <DataTable
                        loading={loading}
                        data={accounts}
                        sortState={sortState ? {
                            index: ["accountHolder", "bankCode", "accountNumber", "createdAt", "isActive", "status"]
                                .indexOf(sortState.field), dir: sortState.dir
                        } : null}
                        filterState={{
                            ...(activeFilter !== undefined ? { 4: activeFilter } : {}),
                            ...(statusFilter !== undefined ? { 5: statusFilter } : {}),
                        }}
                        onSortChange={(index, dir) => {
                            const columns = ["accountHolder", "bankCode", "accountNumber", "createdAt", "isActive", "status", "Thao t�c"];
                            const field = columns[index];
                            if (!dir) setSortState(null);
                            else setSortState({ field, dir });
                        }}
                        onFilterChange={(index, value) => {
                            if (index === 4) setActiveFilter(value as boolean | undefined);
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
                                maxWidth: "320px",
                                truncate: true,
                                cell: (acc) => <span className="font-semibold uppercase">{acc.accountHolder}</span>
                            },
                            {
                                header: "NGÂN HÀNG / VÍ",
                                accessor: (acc) => acc.bankCode,
                                type: "string",
                                sortable: true,
                                filterable: false,
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
                                                <span className="text-danger font-bold text-xs animate-pulse">
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
                accountId={selectedAccount?.id || null}
                onStatusChanged={handleAccountStatusChanged}
            />
        </div>
    );
};

export default AccountsPage;
