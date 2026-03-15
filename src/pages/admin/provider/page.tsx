import React, { useEffect, useState, useCallback } from "react";
import { providerApi } from "../../../services/provider-api.service";
import type { ProviderRes } from "../../../models/entity.model";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import ProviderModal from "./components/ProviderModal";
import DeleteConfirmModal from "@/components/UICustoms/Modal/DeleteConfirmModal";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";

import { resolveAvatarPreview } from "../../../utils/imageConvertUtils";

const ProviderPage: React.FC = () => {
    const [allProviders, setAllProviders] = useState<ProviderRes[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Modal state
    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<ProviderRes | null>(null);

    const fetchProviders = useCallback(async () => {
        try {
            setLoading(true);
            const res = await providerApi.getAll();
            if (res) {
                setAllProviders(res || []);
            }
        } catch (error) {
            console.error("Error fetching providers:", error);
            toast.error("Failed to fetch provider data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const handleOpenCreateModal = () => {
        setSelectedProvider(null);
        setIsProviderModalOpen(true);
    };

    const handleOpenEditModal = (provider: ProviderRes) => {
        setSelectedProvider(provider);
        setIsProviderModalOpen(true);
    };

    const handleOpenDeleteModal = (provider: ProviderRes) => {
        setSelectedProvider(provider);
        setIsDeleteModalOpen(true);
    };

    const handleModalSuccess = () => {
        fetchProviders();
    };

    const handleDeleteProvider = async () => {
        if (!selectedProvider) return;
        try {
            setLoading(true);
            await providerApi.delete(selectedProvider.id);
            toast.success("Provider deleted successfully!");
            handleModalSuccess();
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Error deleting provider:", error);
            toast.error("Failed to delete provider.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold text-foreground">Provider Management</h1>
            </div>

            <div className="bg-bg border border-border rounded-lg shadow-sm flex flex-col min-h-0 border-b-0">
                <div className="shrink-0 border-b border-border">
                    <TableToolbar
                        value={null}
                        onChange={null}
                        placeholder="Search providers..."
                        handleOpenCreateModal={handleOpenCreateModal}
                    />
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                    <DataTable
                        loading={loading}
                        data={allProviders}
                        sortState={null}
                        onSortChange={() => { }}
                        onFilterChange={() => { }}
                        showIndex
                        columns={[
                            {
                                header: "Logo",
                                accessor: (provider) => provider.logoUrl,
                                cell: (provider) => provider.logoUrl ? (
                                    <img src={resolveAvatarPreview(provider.logoUrl ?? null)} alt={provider.name} className="w-10 h-10 object-contain rounded bg-white p-1 border border-border" />
                                ) : (
                                    <div className="w-10 h-10 bg-surface-muted border border-border rounded flex items-center justify-center text-xs font-bold text-text-secondary">
                                        {provider.code}
                                    </div>
                                )
                            },
                            {
                                header: "Provider Code",
                                accessor: (provider) => provider.code,
                                type: "string",
                                cell: (provider) => <span className="text-muted-foreground">{provider.code}</span>
                            },
                            {
                                header: "Provider Name",
                                accessor: (provider) => provider.name,
                                type: "string",
                                cell: (provider) => <span className="font-medium">{provider.name}</span>
                            },
                            {
                                header: "Trạng thái",
                                accessor: (provider) => provider.isActive,
                                type: "boolean",
                                cell: (provider) =>
                                    <StatusBadge
                                        status={provider.isActive}
                                        activeText="ĐANG HOẠT ĐỘNG"
                                        inactiveText="BẢO TRÌ"
                                        activeColor="green"
                                        inactiveColor="red"
                                    />
                            },
                            {
                                header: "Actions",
                                accessor: (provider) => provider.id,
                                cell: (provider) => (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleOpenEditModal(provider)}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenDeleteModal(provider)}
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
            </div>

            <ProviderModal
                isOpen={isProviderModalOpen}
                onClose={() => setIsProviderModalOpen(false)}
                onSuccess={handleModalSuccess}
                provider={selectedProvider}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteProvider}
                itemName={selectedProvider?.name || ""}
                loading={loading}
            />
        </div>
    );
};

export default ProviderPage;
