import React, { useEffect, useState, useCallback, useMemo, lazy, Suspense } from "react";
import { providerApi } from "@/services/provider-api.service";
import type { ProviderRes } from "@/models/entity.model";
import { Edit, Wallet } from "lucide-react";
import { toast } from "react-toastify";

import { DataTable } from "@/components/UICustoms/Table/data-table";
import type { Column } from "@/components/UICustoms/Table/data-table";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";

import ActionButton from "@/components/UICustoms/ActionButton";
import { StatCard } from "@/components/UICustoms/StatCard";
import BrandLogo from "@/components/UICustoms/BrandLogo";
import RefreshButton from "@/components/UICustoms/RefreshButton";

const ProviderModal = lazy(() => import("./components/ProviderModal"));

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
            toast.error("Không thể tải dữ liệu provider.");
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
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Quản lý Provider</h1>
                    <p className="text-sm text-foreground-muted font-medium">Quản lý các đơn vị cung cấp dịch vụ thanh toán và cổng kết nối (Momo, VNPay,...).</p>
                </div>

                {/* Stats Cards */}
                <div className="flex items-center gap-3">
                    <StatCard
                        label="Tổng"
                        value={allProviders.length}
                        icon={<Wallet className="w-5 h-5 text-primary" />}
                        color="blue"
                    />
                    <RefreshButton
                        onRefresh={fetchProviders}
                        loading={loading}
                        className="rounded-full"
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
                        columns={useMemo<Column<ProviderRes>[]>(() => [
                            {
                                header: "Logo",
                                accessor: (provider) => provider.logoUrl,
                                cell: (provider) => (
                                    <BrandLogo
                                        logoUrl={provider.logoUrl}
                                        name={provider.name}
                                        code={provider.code}
                                        size="sm"
                                    />
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
                                        activeText="HOẠT ĐỘNG"
                                        inactiveText="BẢO TRÌ"

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
                        ], [handleOpenEditModal])}
                    />
                </div>
            </div>

            {isProviderModalOpen && (
                <Suspense fallback={null}>
                    <ProviderModal
                        isOpen={isProviderModalOpen}
                        onClose={() => setIsProviderModalOpen(false)}
                        onSuccess={handleModalSuccess}
                        provider={selectedProvider}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default ProviderPage;
