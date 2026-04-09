import React, { useEffect, useState, useCallback, useMemo, lazy, Suspense } from "react";
import { qrStyleLibApi } from "@/services/qrStyleLib-api.service";
import { Edit, Palette, FileJson, Trash2, Pin, PinOff, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import ActionButton from "@/components/UICustoms/ActionButton";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import type { Column } from "@/components/UICustoms/Table/data-table";

import { StatCard } from "@/components/UICustoms/StatCard";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";
import RefreshButton from "@/components/UICustoms/RefreshButton";
import { QRStyleType } from "@/models/enum";
import type { QrStyleLibraryRes } from "@/models/entity.model";

const QrStyleLibModal = lazy(() => import("./components/QrStyleLibModal"));

const QrStyleLibPage: React.FC = () => {
    //#region States
    const [data, setData] = useState<QrStyleLibraryRes[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<QrStyleLibraryRes | null>(null);

    const [isDeleting, setIsDeleting] = useState(false);
    const [isPinning, setIsPinning] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<QrStyleLibraryRes | null>(null);
    //#endregion

    //#region Data Fetching
    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const res = await qrStyleLibApi.getAll({
                isActive: true,
                type: QRStyleType.USER
            });
            if (res) {
                setData(res || []);
            }
        } catch (error) {
            console.error("Error fetching QR styles:", error);
            toast.error("Không thể tải dữ liệu QR Style.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);
    //#endregion

    //#region Handlers
    const handleOpenCreateModal = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: QrStyleLibraryRes) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        fetchItems();
    };

    const handlePin = async (item: QrStyleLibraryRes) => {
        if (isPinning) return;
        try {
            setIsPinning(true);
            const isPinningNew = !item.isDefault;

            if (isPinningNew) {
                const existingDefault = data.find(a => a.isDefault && a.id !== item.id);
                if (existingDefault) {
                    await qrStyleLibApi.put(existingDefault.id, {
                        ...existingDefault,
                        isDefault: false
                    });
                }
            }

            await qrStyleLibApi.put(item.id, {
                ...item,
                isDefault: !item.isDefault
            });

            toast.success(item.isDefault ? "Đã bỏ mặc định" : "Đã đặt làm mặc định");
            fetchItems();
        } catch (error) {
            console.error("Error pinning QR style:", error);
            toast.error("Không thể thay đổi trạng thái mặc định.");
        } finally {
            setIsPinning(false);
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete || isDeleting) return;
        try {
            setIsDeleting(true);
            await qrStyleLibApi.delete(itemToDelete.id);
            toast.success("Đã xóa QR Style thành công.");
            setItemToDelete(null);
            fetchItems();
        } catch (error) {
            console.error("Error deleting QR style:", error);
            toast.error("Không thể xóa QR Style.");
        } finally {
            setIsDeleting(false);
        }
    };
    //#endregion

    //#region Render
    const pinnedCount = data.filter(a => a.isDefault).length;

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Thư viện QR Cá nhân</h1>
                    <p className="text-sm text-foreground-muted font-medium">Tùy chỉnh và quản lý các phong cách thiết kế mã QR của riêng bạn.</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                        <StatCard
                            label="Tổng cộng"
                            value={data.length}
                            icon={<Palette className="w-5 h-5 text-primary" />}
                            color="blue"
                        />

                        <StatCard
                            label="Style mặc định"
                            value={pinnedCount}
                            prefix="/1"
                            icon={<Pin className="w-5 h-5 text-amber-500 fill-amber-500" />}
                            color="amber"
                        />
                    </div>
                    <RefreshButton
                        onRefresh={fetchItems}
                        loading={loading}
                        className="rounded-full"
                    />
                </div>
            </div>

            <div className="bg-bg border border-border rounded-lg shadow-sm flex flex-col min-h-0 border-b-0">
                <div className="shrink-0 border-b border-border">
                    <TableToolbar
                        handleOpenCreateModal={handleOpenCreateModal}
                    />
                </div>

                <div className="flex-1 overflow-hidden">
                    <DataTable
                        loading={loading}
                        data={data}
                        sortState={null}
                        onSortChange={useCallback(() => { }, [])}
                        onFilterChange={useCallback(() => { }, [])}
                        showIndex
                        columns={useMemo<Column<QrStyleLibraryRes>[]>(() => [
                            {
                                header: "Tên Style",
                                accessor: (item) => item.name,
                                type: "string",
                                width: "30%",
                                cell: (item) => (
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{item.name}</span>
                                        {item.isDefault && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-tight">Mặc định</span>
                                            </div>
                                        )}
                                    </div>
                                )
                            },
                            {
                                header: "Style Config",
                                accessor: (item) => item.styleJson,
                                cell: (item) => (
                                    <div className="flex items-center gap-2 text-xs text-foreground-secondary font-primary bg-surface-muted/30 px-sm py-xs rounded-lg max-w-[200px] truncate border border-border/40" title={item.styleJson}>
                                        <FileJson className="w-3.5 h-3.5 text-foreground-muted" />
                                        <span>JSON: {item.styleJson.length} chars</span>
                                    </div>
                                )
                            },

                            {
                                header: "Ngày tạo",
                                accessor: (item) => item.createdAt,
                                cell: (item) => (
                                    <span className="text-xs text-foreground-muted">
                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "—"}
                                    </span>
                                )
                            },
                            {
                                header: "Thao tác",
                                accessor: (item) => item.id,
                                cell: (item) => (
                                    <div className="flex items-center gap-sm">
                                        <ActionButton
                                            icon={item.isDefault ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                                            onClick={() => handlePin(item)}
                                            color={item.isDefault ? "amber" : "blue"}
                                            title={item.isDefault ? "Bỏ mặc định" : "Đặt làm mặc định"}
                                            disabled={isPinning}
                                        />
                                        <ActionButton
                                            icon={<Edit className="w-4 h-4" />}
                                            onClick={() => handleOpenEditModal(item)}
                                            color="blue"
                                            title="Chỉnh sửa"
                                        />
                                        <ActionButton
                                            icon={<Trash2 className="w-4 h-4" />}
                                            onClick={() => setItemToDelete(item)}
                                            color="red"
                                            title="Xóa"
                                            disabled={isDeleting}
                                        />
                                    </div>
                                )
                            }
                        ], [handlePin, isPinning, handleOpenEditModal, isDeleting])}
                    />
                </div>
            </div>

            {isModalOpen && (
                <Suspense fallback={null}>
                    <QrStyleLibModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={handleModalSuccess}
                        item={selectedItem}
                    />
                </Suspense>
            )}

            <ActionConfirmModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleDelete}
                title="Xác nhận xóa QR Style"
                description={
                    <div className="flex flex-col gap-3">
                        <p>Bạn có chắc chắn muốn xóa style <span className="font-bold text-foreground">"{itemToDelete?.name}"</span>?</p>
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-danger/5 border border-danger/10">
                            <AlertCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
                            <p className="text-xs text-danger/80">Hành động này không thể hoàn tác.</p>
                        </div>
                    </div>
                }
                loading={isDeleting}
                confirmText="Xóa vĩnh viễn"
                variant="danger"
            />
        </div>
    );
    //#endregion
};

export default QrStyleLibPage;
