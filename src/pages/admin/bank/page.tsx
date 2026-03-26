import React, { useEffect, useState, useCallback, useMemo, lazy, Suspense } from "react";
import { bankApi } from "@/services/bank-api.service";
import type { BankRes, PagingVM } from "@/models/entity.model";
import { Edit, Wallet } from "lucide-react";
import { toast } from "react-toastify";
import ActionButton from "@/components/UICustoms/ActionButton";
import { resolveAvatarPreview } from "@/utils/imageConvertUtils";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import type { Column } from "@/components/UICustoms/Table/data-table";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";
import { StatCard } from "@/components/UICustoms/StatCard";
import { useDebounce } from "@/hooks/useDebounce";

const BankModal = lazy(() => import("./components/BankModal"));

const BankPage: React.FC = () => {
    const [banks, setBanks] = useState<BankRes[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [paging, setPaging] = useState<PagingVM<BankRes>>({
        list: [],
        pageSize: 10,
        pageNumber: 1,
        totalPages: 1,
        totalItems: 0
    });

    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [selectedBank, setSelectedBank] = useState<BankRes | null>(null);

    const [searchValue, setSearchValue] = useState<string>("");
    const debouncedSearch = useDebounce(searchValue, 500);
    const [sortState, setSortState] = useState<{ field: string, dir: "asc" | "desc" } | null>(null);
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);



    const fetchBanks = useCallback(async (page: number, size: number, search?: string, sortField?: string, sortDir?: "asc" | "desc", isActive?: boolean) => {
        try {
            setLoading(true);

            const res = await bankApi.getAll(page, size, sortField ?? null, sortDir ?? null, isActive ?? null, search ?? null);

            if (res) {
                let list = res.list || [];

                setBanks(list);
                setPaging(res);
            }
        } catch (error) {
            console.error("Error fetching banks:", error);
            toast.error("Không thể tải dữ liệu ngân hàng.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBanks(paging.pageNumber, paging.pageSize, debouncedSearch, sortState?.field, sortState?.dir, statusFilter);
    }, [fetchBanks, paging.pageNumber, paging.pageSize, debouncedSearch, sortState, statusFilter]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= paging.totalPages) {
            setPaging(prev => ({ ...prev, pageNumber: newPage }));
        }
    };

    const handleOpenEditModal = (bank: BankRes) => {
        setSelectedBank(bank);
        setIsBankModalOpen(true);
    };

    const handleModalSuccess = (updatedBank?: BankRes) => {
        if (updatedBank) {
            setBanks(prev =>
                prev.map(b => b.id === updatedBank.id ? updatedBank : b)
            );
        } else {
            fetchBanks(paging.pageNumber, paging.pageSize, debouncedSearch, sortState?.field, sortState?.dir, statusFilter);
        }
    };

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Quản lý Ngân hàng</h1>
                    <p className="text-sm text-foreground-muted font-medium">Quản lý danh mục các ngân hàng và đối tác Napas được hỗ trợ.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 shrink-0">
                    <StatCard
                        label="Tổng ngân hàng"
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
                        placeholder="Tìm kiếm ngân hàng..."
                        onResetPage={() => handlePageChange(1)}
                    />
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                    <DataTable
                        loading={loading}
                        data={banks}
                        sortState={useMemo(() => sortState ? {
                            index: ["bankCode", "shortName", "bankName", "Trạng thái"]
                                .indexOf(sortState.field) + 1, dir: sortState.dir
                        } : null, [sortState])}
                        filterState={useMemo(() => statusFilter !== undefined ? { 4: statusFilter } : {}, [statusFilter])}
                        onSortChange={useCallback((index: number, dir: "asc" | "desc" | null) => {
                            const columns = ["logo", "bankCode", "shortName", "bankName", "Trạng thái", "Thao tác"];
                            const field = columns[index];
                            if (!dir) setSortState(null);
                            else setSortState({ field, dir });
                        }, [])}
                        onFilterChange={useCallback((index: number, value: any) => {
                            if (index === 4) setStatusFilter(value);
                        }, [])}
                        onResetPage={useCallback(() => handlePageChange(1), [paging.totalPages])}
                        showIndex
                        pageNumber={paging.pageNumber}
                        pageSize={paging.pageSize}
                        columns={useMemo<Column<BankRes>[]>(() => [
                            {
                                header: "Logo",
                                accessor: (bank) => bank.logoUrl,
                                cell: (bank) => bank.logoUrl ? (
                                    <img src={resolveAvatarPreview(bank.logoUrl ?? null)} alt={bank.shortName} className="w-10 h-10 object-contain rounded bg-white p-1 border border-border" />
                                ) : (
                                    <div className="w-10 h-10 bg-surface-muted border border-border rounded flex items-center justify-center text-xs font-bold text-foreground-secondary">
                                        {bank.bankCode}
                                    </div>
                                )
                            },
                            {
                                header: "MÃ NH",
                                accessor: (bank) => bank.napasBin,
                                type: "string",
                                sortable: true,
                                filterable: false,
                                cell: (bank) => <span className="font-medium">{bank.napasBin}</span>
                            },
                            {
                                header: "Tên viết tắt",
                                accessor: (bank) => bank.shortName,
                                type: "string",
                                sortable: true,
                                filterable: false,
                                cell: (bank) => bank.shortName
                            },
                            {
                                header: "Tên ngân hàng",
                                accessor: (bank) => bank.bankName,
                                type: "string",
                                sortable: true,
                                filterable: false,
                                cell: (bank) => bank.bankName
                            },
                            {
                                header: "Trạng thái",
                                accessor: (bank) => bank.isActive,
                                type: "boolean",
                                sortable: false,
                                filterable: true,
                                cell: (bank) => (
                                    <StatusBadge
                                        status={bank.isActive}
                                        activeText="HOẠT ĐỘNG"
                                        inactiveText="BẢO TRÌ"
                                        activeColor="green"
                                        inactiveColor="red"
                                    />
                                )
                            },
                            {
                                header: "Thao tác",
                                accessor: (bank) => bank.id,
                                cell: (bank) => (
                                    <div className="flex items-center gap-sm">
                                        <ActionButton
                                            icon={<Edit className="w-4 h-4" />}
                                            onClick={() => handleOpenEditModal(bank)}
                                            color="blue"
                                            title="Chỉnh sửa"
                                        />
                                        {/* <ActionButton
                                            icon={<Trash2 className="w-4 h-4" />}
                                            onClick={() => handleOpenDeleteModal(bank)}
                                            color="red"
                                            title="Xóa"
                                        /> */}
                                    </div>
                                )
                            }
                        ], [handleOpenEditModal])}
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

            {isBankModalOpen && (
                <Suspense fallback={null}>
                    <BankModal
                        isOpen={isBankModalOpen}
                        onClose={() => setIsBankModalOpen(false)}
                        onSuccess={handleModalSuccess}
                        bank={selectedBank}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default BankPage;
