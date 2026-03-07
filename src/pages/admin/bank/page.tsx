import React, { useEffect, useState, useCallback } from "react";
import { bankApi } from "../../../services/bank-api.service";
import type { BankRes, PagingVM } from "../../../models/entity.model";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import Button from "../../../components/UICustoms/Button";
import { toast } from "react-toastify";
import BankModal from "./components/BankModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import { resolveAvatarPreview } from "../../../utils/imageConvertUtils";

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

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchValue);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchValue]);

    const fetchBanks = useCallback(async (page: number, size: number, search: string) => {
        try {
            setLoading(true);
            const res = await bankApi.getAll(page, size, false, search);
            if (res) {
                setBanks(res.list || []);
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
        fetchBanks(paging.pageNumber, paging.pageSize, debouncedSearch);
    }, [fetchBanks, paging.pageNumber, paging.pageSize, debouncedSearch]);

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

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground">Bank Management</h1>
                <Button
                    className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleOpenCreateModal}
                >
                    <Plus className="w-4 h-4" /> Add Bank
                </Button>
            </div>

            <div className="bg-surface border border-border rounded-lg shadow-sm">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search banks..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-3">Logo</th>
                                <th className="px-6 py-3">Code</th>
                                <th className="px-6 py-3">Short Name</th>
                                <th className="px-6 py-3">Bank Name</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        Loading banks...
                                    </td>
                                </tr>
                            ) : banks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        No banks found.
                                    </td>
                                </tr>
                            ) : (
                                banks.map((bank) => (
                                    <tr key={bank.id} className="border-b border-border hover:bg-muted/20">
                                        <td className="px-6 py-4">
                                            {bank.logoUrl ? (
                                                <img src={resolveAvatarPreview(bank.logoUrl ?? null)} alt={bank.shortName} className="w-10 h-10 object-contain rounded" />
                                            ) : (
                                                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                                    #N/A
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium">{bank.bankCode}</td>
                                        <td className="px-6 py-4">{bank.shortName}</td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={bank.bankName}>{bank.bankName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${bank.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {bank.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
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
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-border flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing <span className="font-medium">{banks.length > 0 ? (paging.pageNumber - 1) * paging.pageSize + 1 : 0}</span> to <span className="font-medium">{Math.min(paging.pageNumber * paging.pageSize, paging.totalItems)}</span> of <span className="font-medium">{paging.totalItems}</span> entries
                    </div>
                    <div className="flex gap-2">
                        <Button
                            className="px-3 py-1 bg-surface border border-border text-foreground hover:bg-muted disabled:opacity-50"
                            onClick={() => handlePageChange(paging.pageNumber - 1)}
                            disabled={paging.pageNumber <= 1 || loading}
                        >
                            Previous
                        </Button>
                        <Button
                            className="px-3 py-1 bg-surface border border-border text-foreground hover:bg-muted disabled:opacity-50"
                            onClick={() => handlePageChange(paging.pageNumber + 1)}
                            disabled={paging.pageNumber >= paging.totalPages || loading}
                        >
                            Next
                        </Button>
                    </div>
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
                onSuccess={handleModalSuccess}
                bankId={selectedBank?.id || ""}
                bankName={selectedBank?.bankName || ""}
            />
        </div>
    );
};

export default BankPage;
