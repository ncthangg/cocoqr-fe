import React, { memo, useCallback, useMemo } from "react";
import { BookUser, X, Pin } from "lucide-react";
import type { AccountRes, PagingVM, ProviderRes } from "@/models/entity.model";
import { DataTable, type Column } from "@/components/UICustoms/Table/data-table";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import ActionButton from "@/components/UICustoms/ActionButton";
import BrandLogo from "@/components/UICustoms/BrandLogo";
import { cn } from "@/lib/utils";
import RefreshButton from "@/components/UICustoms/RefreshButton";

interface AccountDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    accounts: AccountRes[];
    loading: boolean;
    paging: PagingVM<AccountRes>;
    selectedAccountId: string | null;
    searchValue: string;
    onSearchChange: (val: string) => void;
    providerFilter: string | undefined;
    onProviderFilterChange: (val: string | undefined) => void;
    allProviders: ProviderRes[];
    onFetchProviders: () => void;
    onSelectAccount: (acc: AccountRes) => void;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    handlePinAccount: (acc: AccountRes) => void;
    onRefresh: () => void;
    refreshLoading: boolean;
}

const AccountDrawer: React.FC<AccountDrawerProps> = ({
    isOpen,
    onClose,
    accounts,
    loading,
    paging,
    selectedAccountId,
    searchValue,
    onSearchChange,
    providerFilter,
    onProviderFilterChange,
    allProviders,
    onFetchProviders,
    onSelectAccount,
    onPageChange,
    onPageSizeChange,
    handlePinAccount,
    onRefresh,
    refreshLoading,
}) => {
    const handleResetPage = useCallback(() => onPageChange(1), [onPageChange]);

    const filterValue = providerFilter !== undefined ? String(providerFilter) : "";

    const filterOptions = useMemo(
        () => allProviders.map((p) => ({ label: p.name, value: p.id })),
        [allProviders]
    );

    const handleFilterChange = useCallback(
        (val: string | undefined) => onProviderFilterChange(val === undefined ? undefined : String(val)),
        [onProviderFilterChange]
    );

    const selectedRowPredicate = useCallback(
        (acc: AccountRes) => selectedAccountId === acc.id,
        [selectedAccountId]
    );

    const columns = useMemo<Column<AccountRes>[]>(
        () => [
            {
                header: "THÔNG TIN TÀI KHOẢN",
                accessor: (acc) => acc.accountHolder,
                type: "string",
                cell: (acc) => (
                    <div className="flex items-center gap-md py-1">
                        <BrandLogo
                            logoUrl={acc.bankLogoUrl ?? acc.providerLogoUrl}
                            name={acc.bankShortName || acc.providerName}
                            code={acc.bankCode || acc.providerCode}
                            size="sm"
                        />
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-foreground text-sm uppercase truncate max-w-[200px]">
                                    {acc.accountHolder}
                                </span>
                                {(acc.bankIsActive === false || acc.providerIsActive === false) && (
                                    <span className="px-1.5 py-0.5 bg-danger/10 text-danger font-bold text-[9px] uppercase rounded-md animate-pulse border border-danger/20 shrink-0">
                                        BẢO TRÌ
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-foreground-muted truncate">
                                {acc.bankCode && acc.bankName ? acc.bankName : acc.providerName}
                                {" · "}
                                <span className="font-primary font-semibold text-foreground">{acc.accountNumber}</span>
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                header: "GHIM",
                accessor: (acc) => acc.isPinned,
                type: "boolean",
                cell: (acc) => (
                    <div className="flex justify-center w-full">
                        <ActionButton
                            icon={<Pin className={cn("w-4 h-4", acc.isPinned && "fill-amber-500 text-amber-500")} />}
                            onClick={() => {
                                handlePinAccount(acc);
                            }}
                            color={acc.isPinned ? "amber" : "gray"}
                            title={acc.isPinned ? "Bỏ ghim" : "Ghim"}
                        />
                    </div>
                ),
            },
        ],
        [handlePinAccount]
    );

    const pageSizeOptions = useMemo(() => [5, 10, 20], []);

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            {/* Panel */}
            <div
                className={cn(
                    "fixed left-0 top-0 h-full z-50 bg-surface shadow-lg flex flex-col transition-all duration-300 ease-in-out border-r border-border",
                    isOpen
                        ? "w-[var(--drawer-width,560px)] translate-x-0 opacity-100"
                        : "w-[var(--drawer-width,560px)] -translate-x-full opacity-0 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-lg border-b border-border/60 bg-surface-elevated shrink-0">
                    <div className="flex items-center gap-md">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <BookUser className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground text-base">Tài khoản của bạn</h3>
                            <p className="text-xs text-foreground-muted">Chọn để điền nhanh thông tin</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <RefreshButton
                            onRefresh={onRefresh}
                            loading={refreshLoading}
                            className="rounded-full"
                        />
                        <button
                            onClick={onClose}
                            className="p-sm rounded-lg hover:bg-surface-muted text-foreground-muted hover:text-foreground transition-colors"
                            aria-label="Đóng danh sách"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="shrink-0 p-md border-b border-border/40 bg-surface-muted/5">
                    <TableToolbar
                        value={searchValue}
                        onChange={onSearchChange}
                        placeholder="Tìm kiếm tài khoản..."
                        onResetPage={handleResetPage}
                        filterValue={filterValue}
                        filterOptions={filterOptions}
                        filterPlaceholder="Chọn loại tài khoản..."
                        onFilterChange={handleFilterChange}
                        onFetchOptions={onFetchProviders}
                    />
                </div>

                {/* Table */}
                <div className="min-h-0 flex-1 overflow-hidden relative">
                    <DataTable
                        loading={loading}
                        data={accounts}
                        onRowClick={onSelectAccount}
                        selectedRowPredicate={selectedRowPredicate}
                        columns={columns}
                    />
                </div>

                {/* Pagination */}
                <div className="shrink-0 border-t border-border/40">
                    <TablePagination
                        pageNumber={paging.pageNumber}
                        pageSize={paging.pageSize}
                        totalItems={paging.totalItems}
                        totalPages={paging.totalPages}
                        loading={loading}
                        onPageChange={onPageChange}
                        onPageSizeChange={onPageSizeChange}
                        pageSizeOptions={pageSizeOptions}
                    />
                </div>
            </div>
        </>
    );
};

export default memo(AccountDrawer);
