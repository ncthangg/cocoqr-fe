import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { Eye, Wallet } from "lucide-react";
import { accountApi } from "@/services/account-api.service";
import { providerApi } from "@/services/provider-api.service";
import type { AccountRes, ProviderRes } from "@/models/entity.model";
import type { PagingVM } from "@/models/entity.model";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import type { Column } from "@/components/UICustoms/Table/data-table";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";
import ActionButton from "@/components/UICustoms/ActionButton";
import { StatCard } from "@/components/UICustoms/StatCard";
import { formatDate } from "@/utils/dateTimeUtils";
import { useDebounce } from "@/hooks/useDebounce";
import BrandLogo from "@/components/UICustoms/BrandLogo";
import RefreshButton from "@/components/UICustoms/RefreshButton";

const AccountModal = lazy(() => import("./components/AccountModal"));

const AccountsPage: React.FC = () => {
    //#region States
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
    const debouncedSearch = useDebounce(searchValue, 500);
    const [sortState, setSortState] = useState<{ field: string, dir: "asc" | "desc" } | null>(null);
    const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
    const [providerFilter, setProviderFilter] = useState<string | undefined>(undefined);

    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<AccountRes | null>(null);
    //#endregion

    //#region Data Fetching
    const fetchProviders = useCallback(async () => {
        if (hasFetchedProviders) return;
        try {
            const res = await providerApi.getAll();
            if (res) {
                setAllProviders(res);
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
            const res = await accountApi.getAllByAdmin({
                pageNumber: page,
                pageSize: size,
                sortField: sortField ?? null,
                sortDirection: sortDir ?? null,
                userId: null,
                providerId: providerId ?? null,
                searchValue: search ?? null,
                isActive: isActive ?? null,
                isDeleted: isDeleted ?? null,
                status: status !== undefined ? String(status) : null,
            });
            if (res) {
                setAccounts(res.list || []);
                setPaging(res);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts(paging.pageNumber, paging.pageSize, sortState?.field, sortState?.dir, debouncedSearch, providerFilter, activeFilter, false, statusFilter);
    }, [fetchAccounts, paging.pageNumber, paging.pageSize, sortState, debouncedSearch, providerFilter, activeFilter, statusFilter]);
    //#endregion

    //#region Handlers
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
    //#endregion

    //#region Render
    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Quản lý Tài khoản</h1>
                    <p className="text-sm text-foreground-muted font-medium">Quản lý danh sách các tài khoản ngân hàng và ví điện tử thành viên.</p>
                </div>

                {/* Stats Cards */}
                <div className="flex items-center gap-3">
                    <StatCard
                        label="Tổng tài khoản"
                        value={paging.totalItems}
                        icon={<Wallet className="w-5 h-5 text-primary" />}
                        color="blue"
                    />
                    <RefreshButton
                        onRefresh={() => fetchAccounts(paging.pageNumber, paging.pageSize, sortState?.field, sortState?.dir, debouncedSearch, providerFilter, activeFilter, false, statusFilter)}
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
                        sortState={useMemo(() => sortState ? {
                            index: ["accountHolder", "bankCode", "accountNumber", "createdAt", "isActive", "status"]
                                .indexOf(sortState.field), dir: sortState.dir
                        } : null, [sortState])}
                        filterState={useMemo(() => ({
                            ...(activeFilter !== undefined ? { 4: activeFilter } : {}),
                            ...(statusFilter !== undefined ? { 5: statusFilter } : {}),
                        }), [activeFilter, statusFilter])}
                        onSortChange={useCallback((index: number, dir: "asc" | "desc" | null) => {
                            const columnsList = ["accountHolder", "bankCode", "accountNumber", "createdAt", "isActive", "status", "Thao tác"];
                            const field = columnsList[index];
                            if (!dir) setSortState(null);
                            else setSortState({ field, dir });
                        }, [])}
                        onFilterChange={useCallback((index: number, value: any) => {
                            if (index === 4) setActiveFilter(value as boolean | undefined);
                            if (index === 5) setStatusFilter(value as boolean | undefined);
                        }, [])}
                        onResetPage={useCallback(() => handlePageChange(1), [paging.totalPages])}
                        showIndex
                        pageNumber={paging.pageNumber}
                        pageSize={paging.pageSize}
                        columns={useMemo<Column<AccountRes>[]>(() => [
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
                                            <BrandLogo
                                                logoUrl={acc.bankLogoUrl ?? acc.providerLogoUrl}
                                                name={acc.bankShortName || acc.providerName}
                                                code={acc.bankCode || acc.providerCode}
                                                size="sm"
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-foreground text-sm leading-tight truncate">
                                                    {(acc.bankCode && acc.bankName) ? acc.bankName : acc.providerName}
                                                </span>
                                                {(acc.bankIsActive === false || acc.providerIsActive === false) && (
                                                    <span className="text-danger font-bold text-[10px] animate-pulse uppercase tracking-wider">
                                                        (Đang bảo trì)
                                                    </span>
                                                )}
                                            </div>
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
                        ], [handleOpenView])}
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

            {isAccountModalOpen && (
                <Suspense fallback={null}>
                    <AccountModal
                        isOpen={isAccountModalOpen}
                        onClose={() => setIsAccountModalOpen(false)}
                        accountId={selectedAccount?.id || null}
                        onStatusChanged={handleAccountStatusChanged}
                    />
                </Suspense>
            )}
        </div>
    );
    //#endregion
};

export default AccountsPage;
