import React, { useEffect, useState, useCallback, useMemo } from "react";
import { emailTemplateApi } from "@/services/email-template-api.service";
import type { EmailTemplateRes } from "@/models/entity.model";
import { toast } from "react-toastify";
import { DataTable, type Column } from "@/components/UICustoms/Table/data-table";
import { formatDateTime } from "@/utils/dateTimeUtils";
import { FileText, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { StatCard } from "@/components/UICustoms/StatCard";
import EmailTemplateDetailModal from "./components/DetailModal";
import EmailTemplateCreateModal from "./components/CreateModal";
import EmailTemplateEditModal from "./components/EditModal";
import ActionButton from "@/components/UICustoms/ActionButton";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";
import RefreshButton from "@/components/UICustoms/RefreshButton";

const EmailTemplatePage: React.FC = () => {
    const [templates, setTemplates] = useState<EmailTemplateRes[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal states
    const [detailTemplate, setDetailTemplate] = useState<EmailTemplateRes | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editTemplate, setEditTemplate] = useState<EmailTemplateRes | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Confirm states
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateRes | null>(null);

    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true);
            const res = await emailTemplateApi.getAll();
            if (res) {
                setTemplates(res);
            }
        } catch {
            toast.error("Không thể tải danh sách email templates.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

    const handleView = useCallback((tpl: EmailTemplateRes) => {
        setDetailTemplate(tpl);
        setIsDetailOpen(true);
    }, []);

    const handleEdit = useCallback((tpl: EmailTemplateRes) => {
        setEditTemplate(tpl);
        setIsEditOpen(true);
    }, []);

    const handleOpenConfirmDelete = (tpl: EmailTemplateRes) => {
        setSelectedTemplate(tpl);
        setIsConfirmOpen(true);
    }

    const handleDelete = useCallback(async () => {
        if (!selectedTemplate) return;
        try {
            setDeletingId(selectedTemplate.id);
            await emailTemplateApi.delete(selectedTemplate.id);
            toast.success("Đã xóa template.");
            setTemplates(prev => prev.filter(t => t.id !== selectedTemplate.id));
            setIsConfirmOpen(false);
            setSelectedTemplate(null);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message || "Không thể xóa template.");
        } finally {
            setDeletingId(null);
        }
    }, [selectedTemplate]);

    const handleCreated = useCallback((res: EmailTemplateRes | null | undefined) => {
        if (res && res.id) {
            setTemplates(prev => [res, ...prev]);
        } else {
            fetchTemplates();
        }
        setIsCreateOpen(false);
    }, [fetchTemplates]);

    const handleUpdated = useCallback((res: EmailTemplateRes | null | undefined) => {
        if (res && res.id) {
            setTemplates(prev => prev.map(t => t.id === res.id ? res : t));
        } else {
            fetchTemplates();
        }
        setIsEditOpen(false);
    }, [fetchTemplates]);

    const existingKeys = useMemo(() => templates.map(t => t.templateKey), [templates]);

    const activeCount = useMemo(() => templates.filter(t => t.isActive).length, [templates]);

    const columns = useMemo<Column<EmailTemplateRes>[]>(() => [
        {
            header: "Template Key",
            accessor: (tpl: EmailTemplateRes) => tpl.templateKey,
            type: "string",
            cell: (tpl: EmailTemplateRes) => (
                <span className="font-mono text-sm font-bold text-foreground bg-surface-muted px-2 py-1 rounded-md border border-border">
                    {tpl.templateKey}
                </span>
            )
        },
        {
            header: "Subject",
            accessor: (tpl: EmailTemplateRes) => tpl.subject,
            type: "string",
            cell: (tpl: EmailTemplateRes) => (
                <span className="font-semibold text-foreground line-clamp-1">{tpl.subject}</span>
            )
        },
        {
            header: "Mô tả",
            accessor: (tpl: EmailTemplateRes) => tpl.description || "",
            type: "string",
            cell: (tpl: EmailTemplateRes) => (
                <span className="text-foreground-muted text-sm line-clamp-1">{tpl.description || "—"}</span>
            )
        },
        {
            header: "Trạng thái",
            accessor: (tpl: EmailTemplateRes) => tpl.isActive ? "active" : "inactive",
            type: "string",
            cell: (tpl: EmailTemplateRes) => (
                <StatusBadge
                    status={tpl.isActive}
                    activeText="Hoạt động"
                    inactiveText="Tắt"
                    size="sm"
                />
            )
        },
        {
            header: "Cập nhật",
            accessor: (tpl: EmailTemplateRes) => tpl.updatedAt || tpl.createdAt || "",
            type: "string",
            cell: (tpl: EmailTemplateRes) => (
                <span className="text-xs font-medium text-foreground-muted">
                    {formatDateTime(tpl.updatedAt || tpl.createdAt || '')}
                </span>
            )
        },
        {
            header: "Thao tác",
            accessor: (tpl: EmailTemplateRes) => tpl.id,
            type: "string",
            cell: (tpl: EmailTemplateRes) => (
                <div className="flex items-center gap-2">
                    <ActionButton
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => handleView(tpl)}
                        color="blue"
                        title="Xem chi tiết"
                    />
                    <ActionButton
                        icon={<Pencil className="w-4 h-4" />}
                        onClick={() => handleEdit(tpl)}
                        color="amber"
                        title="Chỉnh sửa"
                    />
                    <ActionButton
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => handleOpenConfirmDelete(tpl)}
                        color="red"
                        title="Xóa"
                        disabled={deletingId === tpl.id}
                    />
                </div>
            )
        }
    ], [handleView, handleEdit, handleOpenConfirmDelete, deletingId]);

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Email Templates</h1>
                    <p className="text-sm text-foreground-muted font-medium">Quản lý các mẫu email được sử dụng bởi hệ thống.</p>
                </div>
                <div className="flex items-center gap-3">
                    <StatCard
                        label="Tổng"
                        value={templates.length}
                        icon={<FileText className="w-5 h-5 text-primary" />}
                        color="blue"
                    />
                    <StatCard
                        label="Hoạt động"
                        value={activeCount}
                        icon={<FileText className="w-5 h-5 text-green-500" />}
                        color="green"
                    />
                    <RefreshButton
                        onRefresh={fetchTemplates}
                        loading={loading}
                        className="rounded-full"
                    />
                </div>
            </div>

            {/* Actions bar */}
            <div className="flex items-center justify-end gap-3 shrink-0 px-1">
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/20"
                >
                    <Plus className="w-4 h-4" /> Tạo Template
                </button>
            </div>

            {/* Table */}
            <div className="bg-bg border border-border rounded-lg shadow-sm flex flex-col min-h-0 flex-1">
                <div className="min-h-0 flex-1 overflow-hidden">
                    <DataTable
                        loading={loading}
                        data={templates}
                        columns={columns}
                        showIndex
                    />
                </div>
            </div>

            {/* Modals */}
            <EmailTemplateDetailModal
                isOpen={isDetailOpen}
                onClose={() => { setIsDetailOpen(false); setDetailTemplate(null); }}
                template={detailTemplate}
            />
            <EmailTemplateCreateModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreated={handleCreated}
                existingKeys={existingKeys}
            />
            <EmailTemplateEditModal
                isOpen={isEditOpen}
                onClose={() => { setIsEditOpen(false); setEditTemplate(null); }}
                onUpdated={handleUpdated}
                template={editTemplate}
            />

            <ActionConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => { setIsConfirmOpen(false); setSelectedTemplate(null); }}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                description={
                    <div>
                        Bạn có chắc chắn muốn xóa template <span className="font-bold text-danger">{selectedTemplate?.templateKey}</span>?
                        Hành động này không thể hoàn tác.
                    </div>
                }
                variant="danger"
                loading={deletingId === selectedTemplate?.id}
                icon={<Trash2 className="w-5 h-5" />}
            />
        </div>
    );
};

export default EmailTemplatePage;
