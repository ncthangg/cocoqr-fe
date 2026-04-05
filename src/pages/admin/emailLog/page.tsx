import React, { useEffect, useState, useCallback, useMemo } from "react";
import { emailLogApi } from "@/services/email-log-api.service";
import type { GetEmailLogReq } from "@/models/entity.request.model";
import type { PagingVM, GetEmailLogRes, GetEmailLogByIdRes } from "@/models/entity.model";
import { SmtpSettingType, EmailLogStatus, EmailDirection } from "@/models/enum";
import { toast } from "react-toastify";
import { DataTable, type Column } from "@/components/UICustoms/Table/data-table";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDateTime } from "@/utils/dateTimeUtils";
import { Mail, Calendar, Settings, Eye, ArrowRightLeft } from "lucide-react";
import { StatCard } from "@/components/UICustoms/StatCard";
import EmailDetailModal from "./components/EmailDetailModal";
import ActionButton from "@/components/UICustoms/ActionButton";
import { TagBadge } from "@/components/UICustoms/TagBadge";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";
import { getSmtpTypeOptions } from "@/pages/admin/smtpSettings/utils";
import FilterField from "@/components/UICustoms/FilterField";
import RefreshButton from "@/components/UICustoms/RefreshButton";

/* ─── Static data ───────────────────────────────────────────── */

const statusOptions = [
    { label: "Success", value: EmailLogStatus.SUCCESS },
    { label: "Failed", value: EmailLogStatus.FAIL },
];

const directionOptions = [
    { label: "Incoming", value: EmailDirection.INCOMING },
    { label: "Outgoing", value: EmailDirection.OUTGOING },
];

const SMTP_TYPE_COLOR_MAP: Record<string, "blue" | "purple" | "amber" | "indigo" | "cyan"> = {
    ADMIN: "indigo",
    SYSTEM: "purple",
    SUPPORT: "amber",
    CONTACT: "cyan",
};

/* ─── Component ─────────────────────────────────────────────── */

const EmailLogPage: React.FC = () => {
    const [logs, setLogs] = useState<GetEmailLogRes[]>([]);
    const [loading, setLoading] = useState(false);
    const [paging, setPaging] = useState<PagingVM<GetEmailLogRes>>({
        list: [],
        pageSize: 10,
        pageNumber: 1,
        totalPages: 1,
        totalItems: 0,
    });

    // Filter states
    const [typeFilter, setTypeFilter] = useState<SmtpSettingType | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState("");
    const [directionFilter, setDirectionFilter] = useState("");
    const [subjectSearch, setSubjectSearch] = useState("");

    const debouncedSubject = useDebounce(subjectSearch, 500);

    // Detail modal
    const [selectedLog, setSelectedLog] = useState<GetEmailLogByIdRes | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fetchingDetailId, setFetchingDetailId] = useState<string | null>(null);

    const typeOptions = useMemo(() => getSmtpTypeOptions(), []);

    /* ─── Data fetching ───────────────────────────────────────── */

    const fetchLogs = useCallback(
        async (page: number, size: number, type?: SmtpSettingType, status?: string, subject?: string, direction?: string) => {
            try {
                setLoading(true);
                const params: GetEmailLogReq = {
                    pageNumber: page,
                    pageSize: size,
                    sortField: "sentAt",
                    sortDirection: "desc",
                    type: type ?? null,
                    status: status || null,
                    subject: subject || null,
                    direction: direction || null,
                };
                const res = await emailLogApi.getAll(params);
                if (res) {
                    setLogs(res.list || []);
                    setPaging(res);
                }
            } catch (error) {
                console.error("Error fetching email logs:", error);
                toast.error("Không thể tải email logs data.");
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchLogs(paging.pageNumber, paging.pageSize, typeFilter, statusFilter, debouncedSubject, directionFilter);
    }, [fetchLogs, paging.pageNumber, paging.pageSize, typeFilter, statusFilter, debouncedSubject, directionFilter]);

    /* ─── Handlers ────────────────────────────────────────────── */

    const handlePageChange = useCallback(
        (newPage: number) => {
            setPaging((prev) => (newPage >= 1 && newPage <= prev.totalPages ? { ...prev, pageNumber: newPage } : prev));
        },
        []
    );

    const resetPage = useCallback(() => {
        setPaging((prev) => ({ ...prev, pageNumber: 1 }));
    }, []);

    const handleOpenModal = useCallback(async (log: GetEmailLogRes) => {
        try {
            setFetchingDetailId(log.id);
            const detail = await emailLogApi.getById(log.id);
            setSelectedLog(detail);
            setIsModalOpen(true);
        } catch {
            toast.error("Không thể lấy chi tiết email");
        } finally {
            setFetchingDetailId(null);
        }
    }, []);

    const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

    const handleStatusFilterChange = useCallback(
        (val: string) => { setStatusFilter(val); resetPage(); },
        [resetPage]
    );

    const handleDirectionFilterChange = useCallback(
        (val: string) => { setDirectionFilter(val); resetPage(); },
        [resetPage]
    );

    const handleTypeFilterChange = useCallback(
        (val: string) => { setTypeFilter((val as SmtpSettingType) || undefined); resetPage(); },
        [resetPage]
    );

    const handleSubjectSearchChange = useCallback(
        (val: string) => { setSubjectSearch(val); resetPage(); },
        [resetPage]
    );

    const handlePageSizeChange = useCallback((newSize: number) => {
        setPaging((prev) => ({ ...prev, pageSize: newSize, pageNumber: 1 }));
    }, []);

    /* ─── Columns ─────────────────────────────────────────────── */

    const columns = useMemo<Column<GetEmailLogRes>[]>(
        () => [
            {
                header: "Subject",
                accessor: (log) => log.subject,
                type: "string",
                cell: (log) => <span className="font-semibold text-foreground">{log.subject}</span>,
            },
            {
                header: "ToEmail",
                accessor: (log) => log.toEmail || "",
                type: "string",
                cell: (log) => (
                    <div className="flex flex-col">
                        <span className="font-medium text-foreground">{log.toEmail}</span>
                        <span className="text-xs text-foreground-muted">{log.recipientFullName || ""}</span>
                    </div>
                ),
            },
            {
                header: "SmtpType",
                accessor: (log) => log.smtpType,
                type: "string",
                cell: (log) => {
                    const color = SMTP_TYPE_COLOR_MAP[log.smtpType?.toUpperCase() || ""] || "gray";
                    return <TagBadge label={log.smtpType} color={color} size="sm" />;
                },
            },
            {
                header: "TemplateKey",
                accessor: (log) => log.templateKey || "None",
                type: "string",
                cell: (log) => <TagBadge label={log.templateKey || "None"} color="gray" size="sm" className="font-primary" />,
            },
            {
                header: "Direction",
                accessor: (log) => log.emailDirection || "—",
                type: "string",
                cell: (log) => (
                    <TagBadge
                        label={log.emailDirection || "—"}
                        color={log.emailDirection === EmailDirection.INCOMING ? "blue" : "purple"}
                        size="sm"
                    />
                ),
            },
            {
                header: "Status",
                accessor: (log) => log.status,
                type: "string",
                cell: (log) => (
                    <div className="flex flex-col items-start gap-1">
                        <StatusBadge
                            status={log.status === EmailLogStatus.SUCCESS || log.status === "SENT"}
                            activeText={log.status || "Sent"}
                            inactiveText={log.status || "Failed"}
                            size="sm"
                        />
                        {log.errorMessage && (
                            <span className="text-xs text-danger font-medium line-clamp-1 max-w-[120px]" title={log.errorMessage}>
                                {log.errorMessage}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                header: "Sent At",
                accessor: (log) => log.createdAt,
                type: "string",
                cell: (log) => <span className="text-xs font-medium">{formatDateTime(log.createdAt)}</span>,
            },
            {
                header: "Thao tác",
                accessor: (log) => log.id,
                type: "string",
                cell: (log) => (
                    <ActionButton
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => handleOpenModal(log)}
                        color="blue"
                        title="Xem chi tiết"
                        disabled={fetchingDetailId === log.id}
                    />
                ),
            },
        ],
        [fetchingDetailId, handleOpenModal]
    );

    /* ─── Render ──────────────────────────────────────────────── */

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Email Logs</h1>
                    <p className="text-sm text-foreground-muted font-medium">Theo dõi lịch sử gửi email của hệ thống.</p>
                </div>

                <div className="flex items-center gap-3">
                    <StatCard label="Tổng" value={paging.totalItems} icon={<Mail className="w-5 h-5 text-primary" />} color="blue" />
                    <RefreshButton
                        onRefresh={() => fetchLogs(paging.pageNumber, paging.pageSize, typeFilter, statusFilter, debouncedSubject, directionFilter)}
                        loading={loading}
                        className="rounded-full"
                    />
                </div>
            </div>

            <div className="bg-bg border border-border rounded-lg shadow-sm flex flex-col min-h-0">
                {/* Filters */}
                <div className="p-4 border-b border-border space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <FilterField
                            type="select"
                            label="Status"
                            icon={<Mail className="w-3 h-3" />}
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                            options={statusOptions}
                            placeholder="All Statuses"
                        />
                        <FilterField
                            type="select"
                            label="Direction"
                            icon={<ArrowRightLeft className="w-3 h-3" />}
                            value={directionFilter}
                            onChange={handleDirectionFilterChange}
                            options={directionOptions}
                            placeholder="All Directions"
                        />
                        <FilterField
                            type="select"
                            label="SmtpType"
                            icon={<Settings className="w-3 h-3" />}
                            value={typeFilter || ""}
                            onChange={handleTypeFilterChange}
                            options={typeOptions}
                            placeholder="Tất cả"
                        />
                        <FilterField
                            type="input"
                            label="Search Subject"
                            icon={<Calendar className="w-3 h-3" />}
                            value={subjectSearch}
                            onChange={handleSubjectSearchChange}
                            placeholder="Tìm theo tiêu đề..."
                            colSpan="md:col-span-2"
                        />
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                    <DataTable loading={loading} data={logs} columns={columns} showIndex pageNumber={paging.pageNumber} pageSize={paging.pageSize} />
                </div>

                <div className="shrink-0 border-t border-border">
                    <TablePagination
                        pageNumber={paging.pageNumber}
                        pageSize={paging.pageSize}
                        totalItems={paging.totalItems}
                        totalPages={paging.totalPages}
                        loading={loading}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </div>
            </div>

            <EmailDetailModal isOpen={isModalOpen} onClose={handleCloseModal} log={selectedLog} />
        </div>
    );
};

export default EmailLogPage;
