import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import { bankApi } from "@/services/bank-api.service";
import type { BankRes } from "@/models/entity.model";
import { resolveAvatarPreview } from "@/utils/imageConvertUtils";

interface BankSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectBank: (bankCode: string, bankName: string, logoUrl?: string) => void;
}

const BankSelectionModal: React.FC<BankSelectionModalProps> = ({ isOpen, onClose, onSelectBank }) => {
    const [loading, setLoading] = useState(false);
    const [banks, setBanks] = useState<BankRes[]>([]);

    // Pagination & Sorting state
    const [paging, setPaging] = useState({ pageNumber: 1, pageSize: 10, totalPages: 1, totalItems: 0 });
    const [sortState, setSortState] = useState<{ field: string, dir: "asc" | "desc" } | null>(null);
    const [searchValue, setSearchValue] = useState("");

    const fetchBanks = async () => {
        try {
            setLoading(true);
            const sortField = sortState?.field || null;
            const sortDir = sortState?.dir || null;

            const res = await bankApi.getAll(
                paging.pageNumber,
                paging.pageSize,
                sortField,
                sortDir,
                true, // Only active banks
                searchValue || null
            );

            if (res) {
                setBanks(res.list ?? []);
                setPaging({
                    pageNumber: res.pageNumber,
                    pageSize: res.pageSize,
                    totalPages: res.totalPages,
                    totalItems: res.totalItems
                });
            }
        } catch (error) {
            console.error("Error fetching banks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchBanks();
        } else {
            // Reset state when modal is closed
            setSearchValue("");
            setSortState(null);
            setPaging({ pageNumber: 1, pageSize: 10, totalPages: 1, totalItems: 0 });
            setBanks([]);
        }
    }, [isOpen, paging.pageNumber, paging.pageSize, sortState, searchValue]);

    if (!isOpen) return null;

    const handlePageChange = (newPage: number, newPageSize?: number) => {
        setPaging(prev => ({
            ...prev,
            pageNumber: newPage,
            pageSize: newPageSize || prev.pageSize
        }));
    };

    return (
        <div
            className="modal-overlay bg-black/60 px-4 py-6"
            onClick={onClose}
        >
            <div
                className="relative flex flex-col overflow-hidden rounded-2xl shadow-2xl bg-surface mx-auto w-[1000px] h-[800px] max-w-[95vw] max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 border-b border-border flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-xl text-text-primary">Chọn ngân hàng</h3>
                    <button onClick={onClose} className="text-text-subtle hover:text-text-primary transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="p-5 shrink-0 border-b border-border">
                        <TableToolbar
                            value={searchValue}
                            onChange={setSearchValue}
                            placeholder="Tìm kiếm ngân hàng (Mã, Tên)..."
                            onResetPage={() => handlePageChange(1)}
                        />
                    </div>

                    <div className="flex-1 min-h-[400px] overflow-auto p-5 relative">
                        <div className="min-w-[800px] h-full">
                            <DataTable
                                loading={loading}
                                data={banks}
                                sortState={sortState ? {
                                    index: ["bankCode", "shortName", "bankName"]
                                        .indexOf(sortState.field) + 1, dir: sortState.dir
                                } : null}
                                onSortChange={(index, dir) => {
                                    const columns = ["logo", "bankCode", "shortName", "bankName", "actions"];
                                    const field = columns[index];
                                    if (!dir) setSortState(null);
                                    else setSortState({ field, dir });
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
                                        header: "Mã NH",
                                        accessor: (bank) => bank.bankCode,
                                        type: "string",
                                        sortable: true,
                                        filterable: false,
                                        cell: (bank) => <span className="font-medium">{bank.bankCode}</span>
                                    },
                                    {
                                        header: "Tên viết tắt",
                                        accessor: (bank) => bank.shortName,
                                        type: "string",
                                        sortable: true,
                                        filterable: false,
                                        cell: (bank) => <span className="font-semibold">{bank.shortName}</span>
                                    },
                                    {
                                        header: "Tên ngân hàng",
                                        accessor: (bank) => bank.bankName,
                                        type: "string",
                                        sortable: true,
                                        filterable: false,
                                        cell: (bank) => (
                                            <div className="max-w-[300px] truncate" title={bank.bankName}>
                                                {bank.bankName}
                                            </div>
                                        )
                                    },
                                    {
                                        header: "Thao tác",
                                        accessor: (bank) => bank.id,
                                        cell: (bank) => (
                                            <button
                                                onClick={() => onSelectBank(bank.bankCode, bank.bankName, bank.logoUrl)}
                                                className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary-dark transition-colors rounded-lg font-medium text-sm whitespace-nowrap"
                                            >
                                                Chọn
                                            </button>
                                        )
                                    }
                                ]}
                            />
                        </div>
                    </div>

                    <div className="shrink-0 border-t border-border p-3">
                        <TablePagination
                            pageNumber={paging.pageNumber}
                            pageSize={paging.pageSize}
                            totalPages={paging.totalPages}
                            totalItems={paging.totalItems}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankSelectionModal;
