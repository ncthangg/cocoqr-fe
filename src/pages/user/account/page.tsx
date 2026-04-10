import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { Edit, Trash2, Pin, Wallet, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { accountApi } from "@/services/account-api.service";
import { providerApi } from "@/services/provider-api.service";
import type { AccountRes, PagingVM, ProviderRes } from "@/models/entity.model";
import type { PutAccountReq } from "@/models/entity.request.model";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import type { Column } from "@/components/UICustoms/Table/data-table";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";
import { formatDateTime } from "@/utils/dateTimeUtils";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/UICustoms/StatCard";
import ActionButton from "@/components/UICustoms/ActionButton";
import DeleteConfirmModal from "@/components/UICustoms/Modal/DeleteConfirmModal";
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
    const [sortState, setSortState] = useState<{ field: string, dir: "asc" | "desc" } | null>(null);
    const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
    const [providerFilter, setProviderFilter] = useState<string | undefined>(undefined);

    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const debouncedSearch = useDebounce(searchValue, 500);
    //#endregion

    //#region Data Fetching
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
        isActive?: boolean
    ) => {
        try {
            setLoading(true);
            const res = await accountApi.getAll({
                pageNumber: page,
                pageSize: size,
                sortField: sortField ?? null,
                sortDirection: sortDir ?? null,
                providerId: providerId ?? null,
                searchValue: search ?? null,
                isActive: isActive ?? null
            });
            if (res) {
                setAccounts(res.list || []);
                setPaging(res);
            }
        }
        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts(
            paging.pageNumber,
            paging.pageSize,
            sortState?.field,
            sortState?.dir,
            debouncedSearch,
            providerFilter,
            activeFilter
        );
    }, [fetchAccounts, paging.pageNumber, paging.pageSize, debouncedSearch, sortState, activeFilter, providerFilter]);
    //#endregion

    //#region fetch providers once
    useEffect(() => {
        providerApi.getAll().then(res => {
            if (res) setAllProviders(res);
        });
    }, []);
    //#endregion

    //#region Handlers
    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= paging.totalPages) {
            setPaging(prev => ({ ...prev, pageNumber: newPage }));
        }
    }, [paging.totalPages]);

    const handlePageSizeChange = useCallback((newSize: number) => {
        setPaging(prev => ({ ...prev, pageSize: newSize, pageNumber: 1 }));
    }, []);

    const handleOpenAdd = useCallback(() => {
        setSelectedAccountId(null);
        setIsAccountModalOpen(true);
    }, []);

    const handleOpenEdit = useCallback((id: string) => {
        setSelectedAccountId(id);
        setIsAccountModalOpen(true);
    }, []);

    const handleOpenDelete = useCallback((id: string) => {
        setSelectedAccountId(id);
        setIsDeleteModalOpen(true);
    }, []);

    const handleModalSuccess = useCallback((updated?: Partial<AccountRes> & { id: string }) => {
        if (updated) {
            setAccounts(prev => {
                const isExisting = prev.some(acc => acc.id === updated.id);
                if (isExisting) {
                    return prev.map(acc => acc.id === updated.id ? { ...acc, ...updated } : acc);
                }
                // Nếu là thêm mới nhưng vẫn muốn optimistic update (tùy chọn)
                return [{ ...updated } as AccountRes, ...prev];
            });
        } else {
            // Refetch lại toàn bộ danh sách
            fetchAccounts(paging.pageNumber, paging.pageSize, sortState?.field, sortState?.dir, debouncedSearch, providerFilter, activeFilter);
        }
    }, [fetchAccounts, paging.pageNumber, paging.pageSize, debouncedSearch, sortState, providerFilter, activeFilter]);

    const handleDeleteAccount = useCallback(async () => {
        if (!selectedAccountId) return;
        try {
            setLoading(true);
            await accountApi.delete(selectedAccountId);
            setIsDeleteModalOpen(false);
            // Refetch to update pagination and totals
            fetchAccounts(paging.pageNumber, paging.pageSize, sortState?.field, sortState?.dir, debouncedSearch, providerFilter, activeFilter);
        } finally {
            setLoading(false);
        }
    }, [selectedAccountId]);

    const handlePinAccount = useCallback(async (acc: AccountRes) => {
        const isCurrentlyPinned = acc.isPinned;
        try {
            const req: PutAccountReq = {
                providerId: acc.providerId,
                bankCode: acc.bankCode ?? "",
                bankName: acc.bankName ?? "",
                accountHolder: acc.accountHolder ?? "",
                accountNumber: acc.accountNumber ?? "",
                isPinned: !isCurrentlyPinned,
                isActive: acc.isActive,
            };
            await accountApi.put(acc.id, req);
            setAccounts(prev =>
                prev.map(a => a.id === acc.id ? { ...a, isPinned: !isCurrentlyPinned } : a)
            );
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message;
            toast.error(errorMsg || (isCurrentlyPinned ? "Bỏ ghim tài khoản thất bại." : "Ghim tài khoản thất bại."));
        }
    }, []);
    //#endregion

    const selectedAccount = useMemo(() => accounts.find(a => a.id === selectedAccountId) || null, [accounts, selectedAccountId]);
    const stats = useMemo(() => ({
        pinnedCount: accounts.filter(a => a.isPinned).length,
        activeCount: accounts.filter(a => a.isActive).length,
        totalItems: paging.totalItems
    }), [accounts, paging.totalItems]);

    const providerOptions = useMemo(() => allProviders.map(p => ({
        label: p.name,
        value: p.id
    })), [allProviders]);

    const sortStateValue = useMemo(() => sortState ? {
        index: ["accountHolder", "bankCode", "accountNumber", "createdAt", "isActive"]
            .indexOf(sortState.field),
        dir: sortState.dir
    } : null, [sortState]);

    const filterStateValue = useMemo(() => ({
        ...(activeFilter !== undefined ? { 4: activeFilter } : {}),
    }), [activeFilter]);

    const handleSortChange = useCallback((index: number, dir: "asc" | "desc" | null) => {
        const columns = ["accountHolder", "bankCode", "accountNumber", "createdAt", "isActive", "actions"];
        const field = columns[index];
        if (!dir) setSortState(null);
        else setSortState({ field, dir });
    }, []);

    const handleFilterChange = useCallback((index: number, value: any) => {
        if (index === 4) setActiveFilter(value as boolean | undefined);
    }, []);

    const resetPage = useCallback(() => handlePageChange(1), [handlePageChange]);

    const columns = useMemo<Column<AccountRes>[]>(() => [
        {
            header: "TÊN TÀI KHOẢN",
            accessor: (acc) => acc.accountHolder,
            maxWidth: "320px",
            cell: (acc) => (
                <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground uppercase tracking-wide truncate max-w-[200px]">{acc.accountHolder}</span>
                    {acc.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />}
                </div>
            )
        },
        {
            header: "DỊCH VỤ / NGÂN HÀNG",
            accessor: (acc) => acc.bankCode,
            cell: (acc) => (
                <div className="flex items-center gap-3">
                    <BrandLogo
                        logoUrl={acc.bankLogoUrl ?? acc.providerLogoUrl}
                        name={acc.bankShortName || acc.providerName}
                        code={acc.bankCode || acc.providerCode}
                        size="sm"
                    />
                    <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm leading-tight">
                            {(acc.bankCode && acc.bankName) ? acc.bankName : acc.providerName}
                        </span>
                        <span className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest mt-0.5">
                            {acc.bankCode || acc.providerCode}
                        </span>
                    </div>
                    {(acc.bankIsActive === false || acc.providerIsActive === false) && (
                        <span className="px-1.5 py-0.5 bg-danger/10 text-danger font-bold text-[9px] uppercase rounded-md animate-pulse ml-1 border border-danger/20">
                            Bảo trì
                        </span>
                    )}
                </div>
            )
        },
        {
            header: "SỐ TÀI KHOẢN",
            accessor: (acc) => acc.accountNumber,
            cell: (acc) => <span className="font-primary font-semibold text-foreground-secondary tracking-tight">{acc.accountNumber}</span>
        },
        {
            header: "NGÀY TẠO",
            accessor: (acc) => acc.createdAt,
            cell: (acc) => <span className="font-primary font-semibold text-foreground-secondary">{formatDateTime(acc.createdAt)}</span>
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
                    inactiveText="NGƯNG HOẠT ĐỘNG"
                />
            )
        },
        {
            header: "Thao tác",
            accessor: (acc) => acc.id,
            cell: (acc) => (
                <div className="flex items-center gap-1.5">
                    <ActionButton
                        icon={<Pin className={cn("w-3.5 h-3.5", acc.isPinned && "fill-amber-500")} />}
                        onClick={() => handlePinAccount(acc)}
                        color={acc.isPinned ? "amber" : "gray"}
                        title={acc.isPinned ? "Bỏ ghim" : "Ghim"}
                    />
                    <ActionButton
                        icon={<Edit className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenEdit(acc.id)}
                        color="blue"
                        title="Sửa"
                    />
                    <ActionButton
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenDelete(acc.id)}
                        color="red"
                        title="Xóa"
                    />
                </div>
            )
        }
    ], [handleOpenEdit, handleOpenDelete]);

    //#region Render
    return (
        <div className="flex flex-col gap-8 flex-1 min-h-0">
            <PageHeader
                totalItems={stats.totalItems}
                activeCount={stats.activeCount}
                pinnedCount={stats.pinnedCount}
                onRefresh={() => fetchAccounts(paging.pageNumber, paging.pageSize, sortState?.field, sortState?.dir, debouncedSearch, providerFilter, activeFilter)}
                loading={loading}
            />

            <div className="bg-bg border border-border rounded-lg shadow-sm flex flex-col min-h-0 border-b-0">
                <div className="shrink-0 border-b border-border">
                    <TableToolbar
                        value={searchValue}
                        onChange={setSearchValue}
                        placeholder="Tìm kiếm theo tên, số tài khoản..."
                        handleOpenCreateModal={handleOpenAdd}
                        onResetPage={resetPage}
                        filterValue={providerFilter !== undefined ? String(providerFilter) : ""}
                        filterOptions={providerOptions}
                        filterPlaceholder="Chọn loại tài khoản..."
                        onFilterChange={(val) => setProviderFilter(val === undefined ? undefined : String(val))}
                        onFetchOptions={fetchProviders}
                    />
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                    <DataTable
                        loading={loading}
                        data={accounts}
                        sortState={sortStateValue}
                        filterState={filterStateValue}
                        onSortChange={handleSortChange}
                        onFilterChange={handleFilterChange}
                        onResetPage={resetPage}
                        showIndex
                        pageNumber={paging.pageNumber}
                        pageSize={paging.pageSize}
                        columns={columns}
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
                        onPageSizeChange={handlePageSizeChange}
                    />
                </div>
            </div>

            {isAccountModalOpen && (
                <Suspense fallback={null}>
                    <AccountModal
                        isOpen={isAccountModalOpen}
                        onClose={() => setIsAccountModalOpen(false)}
                        onSuccess={handleModalSuccess}
                        accountId={selectedAccountId}
                        allProviders={allProviders}
                    />
                </Suspense>
            )}

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
                title="Xác nhận xóa tài khoản"
                description={`Thông tin số tài khoản "${selectedAccount?.accountNumber}" sẽ bị xóa vĩnh viễn khỏi hệ thống.`}
                loading={loading}
                confirmText="Xóa hoàn toàn"
                itemName={(selectedAccount?.bankCode ?? "") + " - " + (selectedAccount?.accountHolder ?? "") + " - " + (selectedAccount?.accountNumber ?? "")}
            />
        </div>
    );
};
//#endregion

// --- Subcomponents ---

const PageHeader: React.FC<{
    totalItems: number,
    activeCount: number,
    pinnedCount: number,
    onRefresh: () => void,
    loading: boolean
}> = React.memo(({ totalItems, activeCount, pinnedCount, onRefresh, loading }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-1">
        <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Quản lý Tài khoản</h1>
            <p className="text-sm text-foreground-muted font-medium">Lưu trữ và quản lý danh sách các tài khoản ngân hàng, ví điện tử cá nhân của bạn.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <StatCard
                    label="Tổng tài khoản"
                    value={totalItems}
                    icon={<Wallet className="w-5 h-5 text-primary" />}
                    color="blue"
                />
                <StatCard
                    label="Đang hoạt động"
                    value={activeCount}
                    icon={<ShieldCheck className="w-5 h-5 text-green-500" />}
                    color="green"
                />
                <StatCard
                    label="Tài khoản đã ghim"
                    value={pinnedCount}
                    prefix="/5"
                    icon={<Pin className="w-5 h-5 text-amber-500 fill-amber-500" />}
                    color="amber"
                />
            </div>
            <RefreshButton
                onRefresh={onRefresh}
                loading={loading}
                className="rounded-full"
            />
        </div>
    </div>
));

export default AccountsPage;
