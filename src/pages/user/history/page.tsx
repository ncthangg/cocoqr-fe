import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { Eye, Wallet } from "lucide-react";
import { toast } from "react-toastify";
import { qrApi } from "@/services/qr-api.service";
import { providerApi } from "@/services/provider-api.service";
import type { QrRes, PagingVM, ProviderRes } from "@/models/entity.model";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import type { Column } from "@/components/UICustoms/Table/data-table";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import { formatDateTime } from "@/utils/dateTimeUtils";
import { resolveAvatarPreview } from "@/utils/imageConvertUtils";
import { StatCard } from "@/components/UICustoms/StatCard";
import ActionButton from "@/components/UICustoms/ActionButton";
import { useDebounce } from "@/hooks/useDebounce";

const HistoryDetailModal = lazy(() => import("./components/HistoryDetailModal"));

const UserHistoryPage: React.FC = () => {
    const [records, setRecords] = useState<QrRes[]>([]);
    const [allProviders, setAllProviders] = useState<ProviderRes[]>([]);
    const [hasFetchedProviders, setHasFetchedProviders] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paging, setPaging] = useState<PagingVM<QrRes>>({
        list: [],
        pageSize: 10,
        pageNumber: 1,
        totalPages: 1,
        totalItems: 0,
    });

    const [searchValue, setSearchValue] = useState("");
    const debouncedSearch = useDebounce(searchValue, 500);
    const [sortState, setSortState] = useState<{ field: string; dir: "asc" | "desc" } | null>(null);
    const [providerFilter, setProviderFilter] = useState<string | undefined>(undefined);

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);



    const fetchProviders = useCallback(async () => {
        if (hasFetchedProviders) return;
        try {
            const res = await providerApi.getAll();
            if (res) { setAllProviders(res || []); setHasFetchedProviders(true); }
        } catch (err) { console.error("Error fetching providers:", err); }
    }, [hasFetchedProviders]);

    const fetchRecords = useCallback(async (
        page: number, size: number,
        search?: string, sortField?: string, sortDir?: "asc" | "desc", providerId?: string
    ) => {
        try {
            setLoading(true);
            const res = await qrApi.getAll(page, size, sortField ?? null, sortDir ?? null, providerId ?? null, search ?? null);
            if (res) { setRecords(res.list || []); setPaging(res); }
        } catch (err) {
            console.error("Error fetching QR history:", err);
            toast.error("Không thể tải lịch sử QR.");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchRecords(paging.pageNumber, paging.pageSize, debouncedSearch, sortState?.field, sortState?.dir, providerFilter);
    }, [fetchRecords, paging.pageNumber, paging.pageSize, debouncedSearch, sortState, providerFilter]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= paging.totalPages)
            setPaging(prev => ({ ...prev, pageNumber: newPage }));
    };

    const handleViewDetail = (rec: QrRes) => {
        setSelectedId(rec.id);
        setIsDetailOpen(true);
    };

    return (
        <div className="flex flex-col gap-8 flex-1 min-h-0">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Lịch sử tạo QR</h1>
                    <p className="text-sm text-foreground-muted font-medium">Theo dõi và xem lại toàn bộ lịch sử các mã QR thanh toán đã được tạo.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 shrink-0">
                    <StatCard
                        label="Tổng qr"
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
                        placeholder="Tìm kiếm theo 'tên tài khoản, số tài khoản, mã ngân hàng, số napas của ngân hàng'"
                        onResetPage={() => handlePageChange(1)}
                        filterValue={providerFilter !== undefined ? String(providerFilter) : ""}
                        filterOptions={allProviders.map(p => ({ label: p.name, value: p.id }))}
                        filterPlaceholder="Chọn loại tài khoản..."
                        onFilterChange={(val) => setProviderFilter(val === undefined ? undefined : String(val))}
                        onFetchOptions={fetchProviders}
                    />
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                    <DataTable
                        loading={loading}
                        data={records}
                        showIndex
                        pageNumber={paging.pageNumber}
                        pageSize={paging.pageSize}
                        sortState={useMemo(() => sortState ? {
                            index: ["accountHolderSnapshot", "bankCodeSnapshot", "accountNumberSnapshot", "receiverType", "qrMode", "qrStatus", "createdAt"].indexOf(sortState.field),
                            dir: sortState.dir
                        } : null, [sortState])}
                        onSortChange={useCallback((index: number, dir: "asc" | "desc" | null) => {
                            const cols = ["accountHolderSnapshot", "bankCodeSnapshot", "accountNumberSnapshot", "receiverType", "qrMode", "qrStatus", "createdAt"];
                            if (!dir) setSortState(null);
                            else setSortState({ field: cols[index], dir });
                        }, [])}
                        onResetPage={useCallback(() => handlePageChange(1), [handlePageChange])}
                        columns={useMemo<Column<QrRes>[]>(() => [
                            {
                                header: "TÊN TÀI KHOẢN",
                                accessor: (r) => r.accountHolderSnapshot,
                                type: "string",
                                sortable: true,
                                cell: (r) => <span className="font-semibold uppercase">{r.accountHolderSnapshot || "—"}</span>
                            },
                            {
                                header: "NGÂN HÀNG / VÍ",
                                accessor: (r) => r.bankCodeSnapshot || r.providerName,
                                type: "string",
                                cell: (r) => (
                                    <div className="flex items-center gap-3">
                                        {(r.bankLogoUrl || r.providerLogoUrl) ? (
                                            <div className="w-10 h-10 bg-white rounded-xl border border-border flex items-center justify-center p-1.5 shadow-sm">
                                                <img
                                                    src={resolveAvatarPreview(r.bankLogoUrl ?? r.providerLogoUrl ?? null)}
                                                    alt={r.bankShortName || r.providerName}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-[10px] font-black text-primary uppercase">
                                                {r.bankCodeSnapshot?.substring(0, 3) || r.providerCode?.substring(0, 3)}
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground text-sm leading-tight">
                                                {(r.bankCodeSnapshot && r.bankNameSnapshot) ? r.bankNameSnapshot : r.providerName}
                                            </span>
                                            <span className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest mt-0.5">
                                                {r.bankCodeSnapshot || r.providerCode}
                                            </span>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                header: "SỐ TÀI KHOẢN",
                                accessor: (r) => r.accountNumberSnapshot,
                                type: "string",
                                cell: (r) => <span className="font-semibold">{r.accountNumberSnapshot || "—"}</span>
                            },
                            {
                                header: "LOẠI GIAO DỊCH",
                                accessor: (r) => r.receiverType,
                                type: "string",
                                cell: (r) =>
                                    <span className="font-semibold">
                                        {r.receiverType}
                                    </span>
                            },
                            {
                                header: "LOẠI QR",
                                accessor: (r) => r.qrMode,
                                type: "string",
                                cell: (r) =>
                                    <span className="font-semibold text-primary">
                                        {r.qrMode}
                                    </span>
                            },
                            {
                                header: "TRẠNG THÁI",
                                accessor: (r) => r.qrStatus,
                                type: "string",
                                cell: (r) =>
                                    <span className="font-semibold text-primary">
                                        {r.qrStatus}
                                    </span>
                            },
                            {
                                header: "NGÀY TẠO",
                                accessor: (r) => r.createdAt,
                                type: "string",
                                sortable: true,
                                filterable: false,
                                cell: (r) => formatDateTime(r.createdAt)
                            },
                            {
                                header: "Chi tiết",
                                accessor: (r) => r.id,
                                cell: (r) => (
                                    <ActionButton
                                        icon={<Eye className="w-4 h-4" />}
                                        onClick={() => handleViewDetail(r)}
                                        color="blue"
                                        title="Xem chi tiết"
                                    />
                                )
                            }
                        ], [handleViewDetail])}
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
                        onPageSizeChange={(newSize) => setPaging(prev => ({ ...prev, pageSize: newSize, pageNumber: 1 }))}
                    />
                </div>
            </div>

            {isDetailOpen && (
                <Suspense fallback={null}>
                    <HistoryDetailModal
                        isOpen={isDetailOpen}
                        onClose={() => { setIsDetailOpen(false); setSelectedId(null); }}
                        historyId={selectedId}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default UserHistoryPage;
