import React, { useEffect, useState, useCallback, useMemo } from "react";
import { adminContactApi } from "@/services/admin-contact-api.service";
import type { ContactMessageRes } from "@/models/entity.model";
import { toast } from "react-toastify";
import { DataTable, type Column } from "@/components/UICustoms/Table/data-table";
import { formatDateTime } from "@/utils/dateTimeUtils";
import { Mail, RefreshCw, Eye, Inbox, MailOpen, Search, X, Reply } from "lucide-react";
import { StatCard } from "@/components/UICustoms/StatCard";
import { useDebounce } from "@/hooks/useDebounce";
import { ContactMessageStatus } from "@/models/enum";
import ContactDetailModal from "./components/DetailModal";
import ReplyModal from "./components/ReplyModal";
import ActionButton from "@/components/UICustoms/ActionButton";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";

const ContactMessagePage: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessageRes[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [searchName, setSearchName] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [readFilter, setReadFilter] = useState<string>("");

    const debouncedName = useDebounce(searchName, 400);
    const debouncedEmail = useDebounce(searchEmail, 400);

    // Detail modal
    const [detailMessage, setDetailMessage] = useState<ContactMessageRes | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [fetchingId, setFetchingId] = useState<string | null>(null);

    // Reply modal
    const [replyMessage, setReplyMessage] = useState<ContactMessageRes | null>(null);
    const [isReplyOpen, setIsReplyOpen] = useState(false);

    const fetchMessages = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminContactApi.getAll();
            setMessages(Array.isArray(data) ? data : []);
        } catch {
            toast.error("Không thể tải danh sách liên hệ.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMessages(); }, [fetchMessages]);

    const handleView = useCallback(async (msg: ContactMessageRes) => {
        try {
            setFetchingId(msg.id);
            const detail = await adminContactApi.getById(msg.id);
            setDetailMessage(detail);
            setIsDetailOpen(true);
        } catch {
            toast.error("Không thể tải chi tiết liên hệ.");
        } finally {
            setFetchingId(null);
        }
    }, []);

    // Client-side filtering
    const filtered = useMemo(() => {
        return messages.filter(m => {
            if (debouncedName && !m.fullName?.toLowerCase().includes(debouncedName.toLowerCase())) return false;
            if (debouncedEmail && !m.email?.toLowerCase().includes(debouncedEmail.toLowerCase())) return false;
            if (readFilter === "read" && m.status !== ContactMessageStatus.REPLIED) return false;
            if (readFilter === "unread" && m.status === ContactMessageStatus.REPLIED) return false;
            return true;
        });
    }, [messages, debouncedName, debouncedEmail, readFilter]);

    const totalCount = messages.length;
    const newCount = useMemo(() => messages.filter(m => m.status === ContactMessageStatus.NEW).length, [messages]);

    const columns = useMemo<Column<ContactMessageRes>[]>(() => [
        {
            header: "Người gửi",
            accessor: (m: ContactMessageRes) => m.fullName || "",
            type: "string",
            cell: (m: ContactMessageRes) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{m.fullName}</span>
                    <span className="text-xs text-foreground-muted">{m.email}</span>
                </div>
            )
        },
        {
            header: "Nội dung",
            accessor: (m: ContactMessageRes) => m.content,
            type: "string",
            cell: (m: ContactMessageRes) => {
                const plainText = m.content ? m.content.replace(/<[^>]+>/g, '') : '';
                return <span className="line-clamp-2 text-sm text-foreground-muted max-w-sm" title={plainText}>{plainText || "—"}</span>;
            }
        },
        {
            header: "Trạng thái",
            accessor: (m: ContactMessageRes) => m.status === ContactMessageStatus.REPLIED ? "read" : "unread",
            type: "string",
            cell: (m: ContactMessageRes) => (
                <StatusBadge
                    status={m.status === ContactMessageStatus.REPLIED}
                    activeText="Đã trả lời"
                    inactiveText="Chưa trả lời"
                    size="sm"
                />
            )
        },
        {
            header: "Thời gian",
            accessor: (m: ContactMessageRes) => m.createdAt,
            type: "string",
            cell: (m: ContactMessageRes) => (
                <span className="text-xs font-medium text-foreground-muted">{formatDateTime(m.createdAt)}</span>
            )
        },
        {
            header: "Thao tác",
            accessor: (m: ContactMessageRes) => m.id,
            type: "string",
            cell: (m: ContactMessageRes) => (
                <div className="flex items-center gap-2">
                    <ActionButton
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => handleView(m)}
                        color="blue"
                        title="Xem chi tiết"
                        disabled={fetchingId === m.id}
                    />
                    <ActionButton
                        icon={<Reply className="w-4 h-4" />}
                        onClick={() => {
                            setReplyMessage(m);
                            setIsReplyOpen(true);
                        }}
                        color="amber"
                        title="Trả lời"
                    />
                </div>
            )
        }
    ], [handleView, fetchingId]);

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Liên hệ</h1>
                    <p className="text-sm text-foreground-muted font-medium">Quản lý tin nhắn liên hệ từ người dùng.</p>
                </div>
                <div className="flex items-center gap-3">
                    <StatCard
                        label="Tổng cộng"
                        value={totalCount}
                        icon={<Mail className="w-5 h-5 text-primary" />}
                        color="blue"
                    />
                    <StatCard
                        label="Chưa trả lời"
                        value={newCount}
                        icon={<Inbox className="w-5 h-5 text-amber-500" />}
                        color="amber"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-bg border border-border rounded-lg shadow-sm flex flex-col min-h-0 flex-1">
                {/* Filters */}
                <div className="p-4 border-b border-border">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Name search */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground-muted uppercase flex items-center gap-2">
                                <Search className="w-3 h-3" /> Tên
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Lọc theo tên..."
                                    className="w-full bg-surface border border-border rounded-md pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    value={searchName}
                                    onChange={e => setSearchName(e.target.value)}
                                />
                                {searchName && (
                                    <button onClick={() => setSearchName("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-primary p-0.5">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Email search */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground-muted uppercase flex items-center gap-2">
                                <Mail className="w-3 h-3" /> Email
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Lọc theo email..."
                                    className="w-full bg-surface border border-border rounded-md pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    value={searchEmail}
                                    onChange={e => setSearchEmail(e.target.value)}
                                />
                                {searchEmail && (
                                    <button onClick={() => setSearchEmail("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-primary p-0.5">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Read filter */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground-muted uppercase flex items-center gap-2">
                                <MailOpen className="w-3 h-3" /> Trạng thái
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pr-8 appearance-none"
                                    value={readFilter}
                                    onChange={e => setReadFilter(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="unread">Chưa trả lời</option>
                                    <option value="read">Đã trả lời</option>
                                </select>
                                {readFilter && (
                                    <button onClick={() => setReadFilter("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-primary p-0.5">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Reload */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground-muted uppercase">&nbsp;</label>
                            <button
                                onClick={fetchMessages}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-bold text-foreground-muted hover:text-foreground hover:bg-border/50 transition-colors w-full justify-center"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                Tải lại
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table body */}
                <div className="min-h-0 flex-1 overflow-hidden">
                    <DataTable
                        loading={loading}
                        data={filtered}
                        columns={columns}
                        showIndex
                    />
                </div>
            </div>

            <ContactDetailModal
                isOpen={isDetailOpen}
                onClose={() => { setIsDetailOpen(false); setDetailMessage(null); }}
                message={detailMessage}
            />
            {/* Reply Modal */}
            <ReplyModal
                isOpen={isReplyOpen}
                onClose={() => { setIsReplyOpen(false); setReplyMessage(null); }}
                message={replyMessage}
                onSuccess={fetchMessages}
            />
        </div>
    );
};

export default ContactMessagePage;
