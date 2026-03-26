import React, { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { X } from "lucide-react";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import { bankApi } from "@/services/bank-api.service";
import type { BankRes } from "@/models/entity.model";
import { resolveAvatarPreview } from "@/utils/imageConvertUtils";
import Button from "@/components/UICustoms/Button";

interface BankSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectBank: (napasBin: string, bankCode: string, bankShortName: string, bankName: string, bankLogoUrl: string | null, isActive: boolean) => void;
    allowInactiveSelection?: boolean;
}

const BankSelectionModal: React.FC<BankSelectionModalProps> = ({ isOpen, onClose, onSelectBank, allowInactiveSelection = true }) => {
    const [loading, setLoading] = useState(false);
    const [banks, setBanks] = useState<BankRes[]>([]);

    // Pagination & Sorting state
    const [paging, setPaging] = useState({ pageNumber: 1, pageSize: 10, totalPages: 1, totalItems: 0 });
    const [sortState, setSortState] = useState<{ field: string, dir: "asc" | "desc" } | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearch = useDebounce(searchValue, 500);

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
                null, // Fetch all banks to show maintenance status
                debouncedSearch || null
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
        }
    }, [isOpen, paging.pageNumber, paging.pageSize, sortState, debouncedSearch]);

    const handlePageChange = (newPage: number, newPageSize?: number) => {
        setPaging(prev => ({
            ...prev,
            pageNumber: newPage,
            pageSize: newPageSize || prev.pageSize
        }));
    };

    const handleOverlayClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    }, [onClose]);

    const handleStopPropagation = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            onClick={handleOverlayClick}
        >
            <div
                className="relative flex flex-col overflow-hidden rounded-2xl shadow-lg bg-surface mx-auto w-[1000px] h-[800px] max-w-[95vw] max-h-[90vh]"
                onClick={handleStopPropagation}
            >
                <div className="p-md border-b border-border flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-xl text-foreground">Chọn ngân hàng</h3>
                    <button type="button" onClick={onClose} className="text-foreground-muted hover:text-foreground transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="p-md shrink-0 border-b border-border">
                        <TableToolbar
                            value={searchValue}
                            onChange={setSearchValue}
                            placeholder="Tìm kiếm ngân hàng (Mã, Tên)..."
                            onResetPage={() => handlePageChange(1)}
                        />
                    </div>

                    <div className="flex-1 min-h-[400px] overflow-auto p-md relative">
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
                                            <img src={resolveAvatarPreview(bank.logoUrl ?? null)} alt={bank.shortName} className="w-10 h-10 object-contain rounded bg-bg p-xs border border-border" />
                                        ) : (
                                            <div className="w-10 h-10 bg-surface-muted border border-border rounded flex items-center justify-center text-xs font-bold text-foreground-secondary">
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
                                            <Button
                                                value={bank.isActive ? "Chọn" : "Chọn (Bảo trì)"}
                                                onClick={() => {
                                                    onSelectBank(bank.napasBin, bank.bankCode, bank.shortName, bank.bankName, bank.logoUrl ?? null, bank.isActive)
                                                }}
                                                type="button"
                                                size="medium"
                                                width="w-full"
                                                className={bank.isActive ? "btn-primary" : "bg-warning hover:bg-warning/80 text-white border-none"}
                                                disabled={!bank.isActive && !allowInactiveSelection}
                                            />
                                        )
                                    }
                                ]}
                            />
                        </div>
                    </div>

                    <div className="shrink-0 border-t border-border p-sm">
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
