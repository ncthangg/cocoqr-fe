import React, { useEffect, useState, useCallback } from "react";
import { providerApi } from "../../../services/provider-api.service";
import type { ProviderRes } from "../../../models/entity.model";
import { Edit, Wallet } from "lucide-react";
import { toast } from "react-toastify";
import ProviderModal from "./components/ProviderModal";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";

import { resolveAvatarPreview } from "../../../utils/imageConvertUtils";
import ActionButton from "@/components/UICustoms/ActionButton";
import { StatCard } from "@/components/UICustoms/StatCard";

const ProviderPage: React.FC = () => {
    const [allProviders, setAllProviders] = useState<ProviderRes[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
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
            toast.error("Kh�ng th? t?i d? li?u provider.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const handleOpenEditModal = (provider: ProviderRes) => {
        setSelectedProvider(provider);
        setIsProviderModalOpen(true);
    };

    const handleModalSuccess = (updatedProvider?: ProviderRes) => {
        if (updatedProvider) {
            setAllProviders(prev =>
                prev.map(p => p.id === updatedProvider.id ? updatedProvider : p)
            );
        } else {
            fetchProviders();
        }
    };

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Provider Management</h1>
                    <p className="text-sm text-foreground-muted font-medium">Lưu trữ và quản lý thông tin các ngân hàng, ví điện tử của bạn.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 shrink-0">
                    <StatCard
                        label="Tổng phương thức"
                        value={allProviders.length}
                        icon={<Wallet className="w-5 h-5 text-primary" />}
                        color="blue"
                    />
                </div>
            </div>

            <div className="bg-bg border border-border rounded-lg shadow-sm flex flex-col min-h-0 border-b-0">

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
                                    <div className="w-10 h-10 bg-surface-muted border border-border rounded flex items-center justify-center text-xs font-bold text-foreground-secondary">
                                        {provider.code}
                                    </div>
                                )
                            },
                            {
                                header: "Provider Code",
                                accessor: (provider) => provider.code,
                                type: "string",
                                cell: (provider) => <span className="font-semibold uppercase">{provider.code}</span>
                            },
                            {
                                header: "Provider Name",
                                accessor: (provider) => provider.name,
                                type: "string",
                                cell: (provider) => <span className="font-medium">{provider.name}</span>
                            },
                            {
                                header: "IsActive",
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
                                header: "Thao tác",
                                accessor: (provider) => provider.id,
                                cell: (provider) => (
                                    <div className="flex items-center gap-sm">
                                        <ActionButton
                                            icon={<Edit className="w-4 h-4" />}
                                            onClick={() => handleOpenEditModal(provider)}
                                            color="blue"
                                            title="Chỉnh sửa"
                                        />
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
        </div>
    );
};

export default ProviderPage;
