import React, { useEffect, useState, useCallback } from "react";
import { bankApi } from "../../../services/bank-api.service";
import type { BankRes, PagingVM } from "../../../models/entity.model";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import BankModal from "./components/BankModal";
import DeleteConfirmModal from "@/components/UICustoms/Modal/DeleteConfirmModal";
import { resolveAvatarPreview } from "../../../utils/imageConvertUtils";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";

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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBank, setSelectedBank] = useState<BankRes | null>(null);

    const [searchValue, setSearchValue] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [sortState, setSortState] = useState<{ field: string, dir: "asc" | "desc" } | null>(null);
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchValue);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchValue]);

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
            toast.error("Failed to fetch bank data.");
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

    const handleOpenCreateModal = () => {
        setSelectedBank(null);
        setIsBankModalOpen(true);
    };

    const handleOpenEditModal = (bank: BankRes) => {
        setSelectedBank(bank);
        setIsBankModalOpen(true);
    };

    const handleOpenDeleteModal = (bank: BankRes) => {
        setSelectedBank(bank);
        setIsDeleteModalOpen(true);
    };

    const handleModalSuccess = () => {
        fetchBanks(paging.pageNumber, paging.pageSize, debouncedSearch);
    };

    const handleDeleteBank = async () => {
        if (!selectedBank) return;
        try {
            setLoading(true);
            await bankApi.delete(selectedBank.id);
            toast.success("Bank deleted successfully!");
            handleModalSuccess();
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Error deleting bank:", error);
            toast.error("Failed to delete bank.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold text-foreground">Bank Management</h1>
            </div>

            <div className="bg-bg border border-border rounded-lg shadow-sm flex flex-col min-h-0 border-b-0">
                <div className="shrink-0 border-b border-border">
                    <TableToolbar
                        value={searchValue}
                        onChange={setSearchValue}
                        placeholder="Search banks..."
                        handleOpenCreateModal={handleOpenCreateModal}
                        onResetPage={() => handlePageChange(1)}
                    />
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                    <DataTable
                        loading={loading}
                        data={banks}
                        sortState={sortState ? {
                            index: ["bankCode", "shortName", "bankName", "isActive"]
                                .indexOf(sortState.field) + 1, dir: sortState.dir
                        } : null}
                        filterState={statusFilter !== undefined ? { 4: statusFilter } : {}}
                        onSortChange={(index, dir) => {
                            const columns = ["logo", "bankCode", "shortName", "bankName", "isActive", "actions"];
                            const field = columns[index];
                            if (!dir) setSortState(null);
                            else setSortState({ field, dir });
                        }}
                        onFilterChange={(index, value) => {
                            if (index === 4) setStatusFilter(value);
                        }}
                        onResetPage={() => handlePageChange(1)}
                        showIndex
                        pageNumber={paging.pageNumber}
                        pageSize={paging.pageSize}
                        columns={[
                            {
                                header: "Logo",
                                accessor: (bank) => bank.logoUrl,
                                cell: (bank) => bank.logoUrl ? (
                                    <img src={resolveAvatarPreview(bank.logoUrl ?? null)} alt={bank.shortName} className="w-10 h-10 object-contain rounded bg-white p-1 border border-border" />
                                ) : (
                                    <div className="w-10 h-10 bg-surface-muted border border-border rounded flex items-center justify-center text-xs font-bold text-text-secondary">
                                        {bank.bankCode}
                                    </div>
                                )
                            },
                            {
                                header: "Code",
                                accessor: (bank) => bank.bankCode,
                                type: "string",
                                sortable: true,
                                filterable: false,
                                cell: (bank) => <span className="font-medium">{bank.bankCode}</span>
                            },
                            {
                                header: "Short Name",
                                accessor: (bank) => bank.shortName,
                                type: "string",
                                sortable: true,
                                filterable: false,
                                cell: (bank) => bank.shortName
                            },
                            {
                                header: "Bank Name",
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
                                        activeText="ĐANG HOẠT ĐỘNG"
                                        inactiveText="BẢO TRÌ"
                                        activeColor="green"
                                        inactiveColor="red"
                                    />
                                )
                            },
                            {
                                header: "Actions",
                                accessor: (bank) => bank.id,
                                cell: (bank) => (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleOpenEditModal(bank)}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenDeleteModal(bank)}
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

            <BankModal
                isOpen={isBankModalOpen}
                onClose={() => setIsBankModalOpen(false)}
                onSuccess={handleModalSuccess}
                bank={selectedBank}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteBank}
                itemName={selectedBank?.bankName || ""}
                loading={loading}
            />
        </div>
    );
};

export default BankPage;
