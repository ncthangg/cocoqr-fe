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
import { Mail, Calendar, Settings, Eye, X, ArrowRightLeft } from "lucide-react";
import { StatCard } from "@/components/UICustoms/StatCard";
import EmailDetailModal from "./components/EmailDetailModal";
import ActionButton from "@/components/UICustoms/ActionButton";
import { TagBadge } from "@/components/UICustoms/TagBadge";
import { getSmtpTypeOptions } from "@/pages/admin/smtpSettings/utils";

const EmailLogPage: React.FC = () => {
    const [logs, setLogs] = useState<GetEmailLogRes[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [paging, setPaging] = useState<PagingVM<GetEmailLogRes>>({
        list: [],
        pageSize: 10,
        pageNumber: 1,
        totalPages: 1,
        totalItems: 0
    });

    // Filter states
    const [typeFilter, setTypeFilter] = useState<SmtpSettingType | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [directionFilter, setDirectionFilter] = useState<string>("");
    const [subjectSearch, setSubjectSearch] = useState<string>("");

    const debouncedSubject = useDebounce(subjectSearch, 500);

    const fetchLogs = useCallback(async (
        page: number,
        size: number,
        type?: SmtpSettingType,
        status?: string,
        subject?: string,
        direction?: string
    ) => {
        try {
            setLoading(true);
            const params: GetEmailLogReq = {
                pageNumber: page,
                pageSize: size,
                type: type ?? null,
                status: status || null,
                subject: subject || null,
                direction: direction || null,
                sortField: "sentAt",
                sortDirection: "desc"
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
    }, []);

    useEffect(() => {
        fetchLogs(
            paging.pageNumber,
            paging.pageSize,
            typeFilter,
            statusFilter,
            debouncedSubject,
            directionFilter
        );
    }, [fetchLogs, paging.pageNumber, paging.pageSize, typeFilter, statusFilter, debouncedSubject, directionFilter]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= paging.totalPages) {
            setPaging(prev => ({ ...prev, pageNumber: newPage }));
        }
    };

    const typeOptions = getSmtpTypeOptions();

    const [selectedLog, setSelectedLog] = useState<GetEmailLogByIdRes | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fetchingDetailId, setFetchingDetailId] = useState<string | null>(null);

    const handleOpenModal = async (log: GetEmailLogRes) => {
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
    };

    const columns = useMemo<Column<GetEmailLogRes>[]>(() => [
        {
            header: "Subject",
            accessor: (log) => log.subject,
            type: "string",
            cell: (log) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{log.subject}</span>
                </div>
            )
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
            )
        },
        {
            header: "SmtpType",
            accessor: (log: GetEmailLogRes) => log.smtpType,
            type: "string",
            cell: (log: GetEmailLogRes) => {
                const typeMap: Record<string, 'blue' | 'purple' | 'green' | 'amber' | 'indigo' | 'cyan' | 'pink'> = {
                    'ADMIN': 'indigo',
                    'SYSTEM': 'purple',
                    'SUPPORT': 'amber',
                    'CONTACT': 'cyan'
                };
                const color = typeMap[log.smtpType?.toUpperCase() || ''] || 'gray';
                return (
                    <TagBadge 
                        label={log.smtpType} 
                        color={color as any} 
                        size="sm" 
                    />
                );
            }
        },
        {
            header: "TemplateKey",
            accessor: (log) => log.templateKey || "None",
            type: "string",
            cell: (log) => (
                <TagBadge 
                    label={log.templateKey || "None"} 
                    color="gray" 
                    size="sm" 
                    className="font-mono"
                />
            )
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
            )
        },
        {
            header: "Status",
            accessor: (log) => log.status,
            type: "string",
            cell: (log) => (
                <div className="flex flex-col items-start gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${log.status === EmailLogStatus.SUCCESS || log.status === "SENT"
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}>
                        {log.status || "Failed"}
                    </span>
                    {log.errorMessage && (
                        <span className="text-[10px] text-red-500 font-medium line-clamp-1 max-w-[120px]" title={log.errorMessage}>
                            {log.errorMessage}
                        </span>
                    )}
                </div>
            )
        },
        {
            header: "Sent At",
            accessor: (log) => log.createdAt,
            type: "string",
            cell: (log) => <span className="text-xs font-medium">{formatDateTime(log.createdAt)}</span>
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
            )
        }
    ], [fetchingDetailId]);

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Email Logs</h1>
                    <p className="text-sm text-foreground-muted font-medium">Theo dõi lịch sử gửi email của hệ thống.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 shrink-0">
                    <StatCard
                        label="Tổng cộng"
                        value={paging.totalItems}
                        icon={<Mail className="w-5 h-5 text-primary" />}
                        color="blue"
                    />
                </div>
            </div>

            <div className="bg-bg border border-border rounded-lg shadow-sm flex flex-col min-h-0">
                <div className="p-4 border-b border-border space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Status Filter */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground-muted uppercase flex items-center gap-2">
                                <Mail className="w-3 h-3" /> Status
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pr-8 appearance-none"
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setPaging(prev => ({ ...prev, pageNumber: 1 }));
                                    }}
                                >
                                    <option value="">All Statuses</option>
                                    <option value={EmailLogStatus.SUCCESS}>Success</option>
                                    <option value={EmailLogStatus.FAIL}>Failed</option>
                                </select>
                                {statusFilter && (
                                    <button
                                        onClick={() => { setStatusFilter(""); setPaging(prev => ({ ...prev, pageNumber: 1 })); }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-primary p-0.5"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Direction Filter */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground-muted uppercase flex items-center gap-2">
                                <ArrowRightLeft className="w-3 h-3" /> Direction
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pr-8 appearance-none"
                                    value={directionFilter}
                                    onChange={(e) => {
                                        setDirectionFilter(e.target.value);
                                        setPaging(prev => ({ ...prev, pageNumber: 1 }));
                                    }}
                                >
                                    <option value="">All Directions</option>
                                    <option value={EmailDirection.INCOMING}>Incoming</option>
                                    <option value={EmailDirection.OUTGOING}>Outgoing</option>
                                </select>
                                {directionFilter && (
                                    <button
                                        onClick={() => { setDirectionFilter(""); setPaging(prev => ({ ...prev, pageNumber: 1 })); }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-primary p-0.5"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground-muted uppercase flex items-center gap-2">
                                <Settings className="w-3 h-3" /> SmtpType
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pr-8 appearance-none"
                                    value={typeFilter || ""}
                                    onChange={(e) => {
                                        setTypeFilter(e.target.value as SmtpSettingType || undefined);
                                        setPaging(prev => ({ ...prev, pageNumber: 1 }));
                                    }}
                                >
                                    <option value="">Tất cả</option>
                                    {typeOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {typeFilter && (
                                    <button
                                        onClick={() => { setTypeFilter(undefined); setPaging(prev => ({ ...prev, pageNumber: 1 })); }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-primary p-0.5"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Subject Search Filter */}
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-bold text-foreground-muted uppercase flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Search Subject
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm theo tiêu đề..."
                                    className="w-full bg-surface border border-border rounded-md pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    value={subjectSearch}
                                    onChange={(e) => {
                                        setSubjectSearch(e.target.value);
                                        setPaging(prev => ({ ...prev, pageNumber: 1 }));
                                    }}
                                />
                                {subjectSearch && (
                                    <button
                                        onClick={() => { setSubjectSearch(""); setPaging(prev => ({ ...prev, pageNumber: 1 })); }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-primary p-0.5"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                    <DataTable
                        loading={loading}
                        data={logs}
                        columns={columns}
                        showIndex
                        pageNumber={paging.pageNumber}
                        pageSize={paging.pageSize}
                    />
                </div>

                <div className="shrink-0 border-t border-border">
                    <TablePagination
                        pageNumber={paging.pageNumber}
                        pageSize={paging.pageSize}
                        totalItems={paging.totalItems}
                        totalPages={paging.totalPages}
                        loading={loading}
                        onPageChange={handlePageChange}
                        onPageSizeChange={(newSize) => {
                            setPaging(prev => ({ ...prev, pageSize: newSize, pageNumber: 1 }));
                        }}
                    />
                </div>
            </div>

            {/* Email Detail Modal */}
            <EmailDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                log={selectedLog}
            />
        </div>
    );
};

export default EmailLogPage;
