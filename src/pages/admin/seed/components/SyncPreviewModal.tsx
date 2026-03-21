import React, { useEffect, useState } from "react";
import { X, Plus, Pencil, Trash2, Minus, ArrowRight, FileText, Database, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import Button from "@/components/UICustoms/Button";
import { toast } from "react-toastify";
import { SyncAction } from "@/models/entity.model";
import type { SyncPreviewRes, SyncDiffItem } from "@/models/entity.model";

interface SyncPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSyncSuccess: () => void;
    title: string;
    headerIcon?: React.ReactNode;
    fetchPreview: () => Promise<SyncPreviewRes>;
    executeSync: () => Promise<string>;
    syncSuccessMessage?: string;
    syncErrorMessage?: string;
}

const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    [SyncAction.Insert]: {
        label: "Thêm mới",
        color: "text-emerald-600",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        icon: <Plus className="w-3.5 h-3.5" />,
    },
    [SyncAction.Update]: {
        label: "Cập nhật",
        color: "text-blue-600",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        icon: <Pencil className="w-3.5 h-3.5" />,
    },
    [SyncAction.Delete]: {
        label: "Xoá",
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        icon: <Trash2 className="w-3.5 h-3.5" />,
    },
    [SyncAction.Unchanged]: {
        label: "Không đổi",
        color: "text-foreground-muted",
        bg: "bg-surface-muted/30",
        border: "border-border",
        icon: <Minus className="w-3.5 h-3.5" />,
    },
};

const DiffItemRow: React.FC<{ item: SyncDiffItem }> = ({ item }) => {
    const config = ACTION_CONFIG[item.action] || ACTION_CONFIG[SyncAction.Unchanged];
    const [expanded, setExpanded] = useState(false);
    const hasDiffs = item.diffs && item.diffs.length > 0;

    return (
        <div className={`rounded-xl border ${config.border} overflow-hidden transition-all`}>
            <button
                type="button"
                onClick={() => hasDiffs && setExpanded(!expanded)}
                className={`w-full flex items-center gap-sm px-md py-sm ${config.bg} ${hasDiffs ? "cursor-pointer hover:opacity-80" : "cursor-default"} transition-all`}
            >
                {/* Action badge */}
                <span className={`inline-flex items-center gap-xs px-sm py-2xs rounded-lg text-[10px] font-bold uppercase tracking-widest ${config.color} ${config.bg} border ${config.border} shrink-0`}>
                    {config.icon}
                    {config.label}
                </span>

                {/* Item info */}
                <span className="text-sm font-bold text-foreground truncate">{item.code}</span>
                <span className="text-xs text-foreground-secondary truncate hidden sm:block">{item.name}</span>

                {/* Expand indicator */}
                <span className="ml-auto shrink-0">
                    {hasDiffs && (
                        expanded
                            ? <ChevronDown className="w-4 h-4 text-foreground-muted" />
                            : <ChevronRight className="w-4 h-4 text-foreground-muted" />
                    )}
                </span>
            </button>

            {/* Diff details */}
            {expanded && hasDiffs && (
                <div className="border-t border-border bg-bg">
                    <div className="divide-y divide-border">
                        {item.diffs!.map((diff, idx) => (
                            <div key={idx} className="flex items-center gap-sm px-lg py-sm text-xs">
                                <span className="font-bold text-foreground-secondary w-28 shrink-0 uppercase tracking-widest">{diff.field}</span>
                                <span className="text-red-500/80 line-through truncate max-w-[180px]" title={diff.oldValue}>{diff.oldValue || "—"}</span>
                                <ArrowRight className="w-3 h-3 text-foreground-muted shrink-0" />
                                <span className="text-emerald-600 font-semibold truncate max-w-[180px]" title={diff.newValue}>{diff.newValue || "—"}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const SyncPreviewModal: React.FC<SyncPreviewModalProps> = ({
    isOpen,
    onClose,
    onSyncSuccess,
    title,
    headerIcon,
    fetchPreview: fetchPreviewFn,
    executeSync,
    syncSuccessMessage = "Đồng bộ thành công!",
    syncErrorMessage = "Đồng bộ thất bại.",
}) => {
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [preview, setPreview] = useState<SyncPreviewRes | null>(null);
    const [filter, setFilter] = useState<SyncAction | "all">("all");

    useEffect(() => {
        if (isOpen) {
            loadPreview();
        } else {
            setPreview(null);
            setFilter("all");
        }
    }, [isOpen]);

    const loadPreview = async () => {
        try {
            setLoading(true);
            const res = await fetchPreviewFn();
            setPreview(res);
        } catch (error) {
            console.error("Error fetching sync preview:", error);
            toast.error("Không thể tải dữ liệu xem trước.");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        try {
            setSyncing(true);
            await executeSync();
            toast.success(syncSuccessMessage);
            onSyncSuccess();
            onClose();
        } catch (error) {
            console.error("Error syncing:", error);
            toast.error(syncErrorMessage);
        } finally {
            setSyncing(false);
        }
    };

    if (!isOpen) return null;

    const filteredChanges = preview?.changes?.filter(c => filter === "all" || c.action === filter) || [];
    const hasChanges = preview && (preview.summary.toInsert > 0 || preview.summary.toUpdate > 0 || preview.summary.toDelete > 0);

    return (
        <div
            className="modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget && !syncing) onClose(); }}
        >
            <div
                className="modal-content max-w-modal-xl bg-surface-elevated relative flex flex-col overflow-hidden max-h-[85vh]"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-lg py-md border-b border-border bg-surface-muted/30 shrink-0">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-sm">
                        {headerIcon || <RefreshCw className="w-5 h-5 text-primary" />}
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng"
                        disabled={syncing}
                        className="p-xs rounded-full text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-all disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-md">
                            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm text-foreground-muted font-medium">Đang phân tích dữ liệu...</p>
                        </div>
                    ) : preview ? (
                        <div className="p-lg flex flex-col gap-lg">
                            {/* Source Info */}
                            <div className="flex items-center gap-md p-md bg-surface-muted/20 rounded-xl border border-border text-xs text-foreground-secondary">
                                <FileText className="w-4 h-4 text-primary shrink-0" />
                                <span>Nguồn: <strong className="text-foreground">{preview.sourceFile}</strong></span>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline">Cập nhật: <strong className="text-foreground">{new Date(preview.fileLastModified).toLocaleString("vi-VN")}</strong></span>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-sm">
                                <SummaryCard label="File nguồn" value={preview.summary.totalInFile} icon={<FileText className="w-4 h-4" />} color="text-foreground" bg="bg-surface-muted/40" />
                                <SummaryCard label="Database" value={preview.summary.totalInDb} icon={<Database className="w-4 h-4" />} color="text-foreground" bg="bg-surface-muted/40" />
                                <SummaryCard label="Thêm mới" value={preview.summary.toInsert} icon={<Plus className="w-4 h-4" />} color="text-emerald-600" bg="bg-emerald-500/10" />
                                <SummaryCard label="Cập nhật" value={preview.summary.toUpdate} icon={<Pencil className="w-4 h-4" />} color="text-blue-600" bg="bg-blue-500/10" />
                                <SummaryCard label="Xoá" value={preview.summary.toDelete} icon={<Trash2 className="w-4 h-4" />} color="text-red-500" bg="bg-red-500/10" />
                                <SummaryCard label="Không đổi" value={preview.summary.unchanged} icon={<Minus className="w-4 h-4" />} color="text-foreground-muted" bg="bg-surface-muted/30" />
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex items-center gap-xs flex-wrap">
                                <FilterTab label="Tất cả" count={preview.changes.length} active={filter === "all"} onClick={() => setFilter("all")} />
                                {preview.summary.toInsert > 0 && <FilterTab label="Thêm" count={preview.summary.toInsert} active={filter === SyncAction.Insert} onClick={() => setFilter(SyncAction.Insert)} color="text-emerald-600" />}
                                {preview.summary.toUpdate > 0 && <FilterTab label="Sửa" count={preview.summary.toUpdate} active={filter === SyncAction.Update} onClick={() => setFilter(SyncAction.Update)} color="text-blue-600" />}
                                {preview.summary.toDelete > 0 && <FilterTab label="Xoá" count={preview.summary.toDelete} active={filter === SyncAction.Delete} onClick={() => setFilter(SyncAction.Delete)} color="text-red-500" />}
                                {preview.summary.unchanged > 0 && <FilterTab label="Không đổi" count={preview.summary.unchanged} active={filter === SyncAction.Unchanged} onClick={() => setFilter(SyncAction.Unchanged)} color="text-foreground-muted" />}
                            </div>

                            {/* Changes List */}
                            <div className="flex flex-col gap-xs max-h-[320px] overflow-y-auto pr-xs custom-scrollbar">
                                {filteredChanges.length > 0 ? (
                                    filteredChanges.map((item, idx) => (
                                        <DiffItemRow key={`${item.code}-${idx}`} item={item} />
                                    ))
                                ) : (
                                    <div className="text-center py-lg text-foreground-muted text-sm">
                                        Không có thay đổi nào phù hợp với bộ lọc.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="px-lg py-md border-t border-border flex items-center justify-between bg-surface-muted/20 shrink-0">
                    <div className="text-xs text-foreground-muted">
                        {hasChanges ? (
                            <span className="flex items-center gap-xs">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                Có thay đổi cần đồng bộ
                            </span>
                        ) : preview ? (
                            <span className="flex items-center gap-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Dữ liệu đã đồng bộ
                            </span>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-sm">
                        <Button type="button" variant="ghost" size="medium" onClick={onClose} disabled={syncing}>
                            Đóng
                        </Button>
                        {hasChanges && (
                            <Button
                                type="button"
                                variant="primary"
                                size="medium"
                                onClick={handleSync}
                                loading={syncing}
                                disabled={syncing || loading}
                            >
                                Xác nhận đồng bộ
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub-components ---

const SummaryCard: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string; bg: string }> = ({ label, value, icon, color, bg }) => (
    <div className={`flex flex-col items-center gap-xs p-sm rounded-xl border border-border ${bg} transition-all`}>
        <div className={`${color}`}>{icon}</div>
        <span className={`text-2xl font-extrabold ${color} tabular-nums`}>{value}</span>
        <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest">{label}</span>
    </div>
);

const FilterTab: React.FC<{ label: string; count: number; active: boolean; onClick: () => void; color?: string }> = ({ label, count, active, onClick, color = "text-foreground" }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-sm py-xs rounded-lg text-xs font-bold transition-all border ${active
            ? "bg-primary/10 border-primary/40 text-primary shadow-sm"
            : "bg-surface-muted/20 border-border text-foreground-secondary hover:bg-surface-muted/50"
            }`}
    >
        <span className={active ? "text-primary" : color}>{label}</span>
        <span className="ml-xs opacity-60">({count})</span>
    </button>
);

export default SyncPreviewModal;
