import React, { useEffect, useState, useCallback, useMemo } from "react";
import { adminContactApi } from "@/services/admin-contact-api.service";
import type { ContactMessageRes } from "@/models/entity.model";
import { toast } from "react-toastify";
import { DataTable, type Column } from "@/components/UICustoms/Table/data-table";
import { formatDateTime } from "@/utils/dateTimeUtils";
import { Mail, Eye, Inbox, MailOpen, Search, Reply, Trash2, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/UICustoms/StatCard";
import { useDebounce } from "@/hooks/useDebounce";
import { ContactMessageStatus } from "@/models/enum";
import ContactDetailModal from "./components/DetailModal";
import ReplyModal from "./components/ReplyModal";
import ActionButton from "@/components/UICustoms/ActionButton";
import { TagBadge } from "@/components/UICustoms/TagBadge";
import FilterField from "@/components/UICustoms/FilterField";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";
import RefreshButton from "@/components/UICustoms/RefreshButton";

/* ─── Static data ───────────────────────────────────────────── */

const READ_FILTER_OPTIONS = [
    { label: "Chưa trả lời", value: "unread" },
    { label: "Đã trả lời", value: "read" },
    { label: "Bỏ qua", value: "ignored" },
];

/* ─── Component ─────────────────────────────────────────────── */

const ContactMessagePage: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessageRes[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [searchName, setSearchName] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [readFilter, setReadFilter] = useState("");

    const debouncedName = useDebounce(searchName, 400);
    const debouncedEmail = useDebounce(searchEmail, 400);

    // Detail modal
    const [detailMessage, setDetailMessage] = useState<ContactMessageRes | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [fetchingId, setFetchingId] = useState<string | null>(null);

    // Reply modal
    const [replyMessage, setReplyMessage] = useState<ContactMessageRes | null>(null);
    const [isReplyOpen, setIsReplyOpen] = useState(false);

    // Confirm ignore
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [ignoringId, setIgnoringId] = useState<string | null>(null);

    /* ─── Data fetching ───────────────────────────────────────── */

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

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    /* ─── Handlers ────────────────────────────────────────────── */

    const handleView = useCallback(
        async (msg: ContactMessageRes) => {
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
        },
        []
    );

    const handleOpenReply = useCallback((msg: ContactMessageRes) => {
        setReplyMessage(msg);
        setIsReplyOpen(true);
    }, []);

    const handleIgnore = useCallback(async () => {
        if (!ignoringId) return;
        try {
            await adminContactApi.patchIgnore(ignoringId);
            toast.success("Đã bỏ qua liên hệ.");
            fetchMessages();
            setIsConfirmOpen(false);
            setIgnoringId(null);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Lỗi khi cập nhật trạng thái.");
            throw err;
        }
    }, [ignoringId, fetchMessages]);

    const handleOpenConfirmIgnore = (id: string) => {
        setIgnoringId(id);
        setIsConfirmOpen(true);
    }

    const handleCloseDetail = useCallback(() => {
        setIsDetailOpen(false);
        setDetailMessage(null);
    }, []);

    const handleCloseReply = useCallback(() => {
        setIsReplyOpen(false);
        setReplyMessage(null);
    }, []);

    /* ─── Derived state ───────────────────────────────────────── */

    const filtered = useMemo(() => {
        return messages.filter((m) => {
            if (debouncedName && !m.fullName?.toLowerCase().includes(debouncedName.toLowerCase())) return false;
            if (debouncedEmail && !m.email?.toLowerCase().includes(debouncedEmail.toLowerCase())) return false;
            if (readFilter === "read" && m.status !== ContactMessageStatus.REPLIED) return false;
            if (readFilter === "unread" && m.status !== ContactMessageStatus.NEW) return false;
            if (readFilter === "ignored" && m.status !== ContactMessageStatus.IGNORED) return false;
            return true;
        });
    }, [messages, debouncedName, debouncedEmail, readFilter]);

    const totalCount = messages.length;
    const newCount = useMemo(() => messages.filter((m) => m.status === ContactMessageStatus.NEW).length, [messages]);

    /* ─── Columns ─────────────────────────────────────────────── */

    const columns = useMemo<Column<ContactMessageRes>[]>(
        () => [
            {
                header: "Người gửi",
                accessor: (m) => m.fullName || "",
                type: "string",
                cell: (m) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{m.fullName}</span>
                        <span className="text-xs text-foreground-muted">{m.email}</span>
                    </div>
                ),
            },
            {
                header: "Nội dung",
                accessor: (m) => m.content,
                type: "string",
                cell: (m) => {
                    const plainText = m.content ? m.content.replace(/<[^>]+>/g, "") : "";
                    return (
                        <span className="line-clamp-2 text-sm text-foreground-muted max-w-sm" title={plainText}>
                            {plainText || "—"}
                        </span>
                    );
                },
            },
            {
                header: "Trạng thái",
                accessor: (m) => m.status,
                type: "string",
                cell: (m) => {
                    switch (m.status) {
                        case ContactMessageStatus.REPLIED:
                            return <TagBadge label="Đã trả lời" color="green" size="sm" icon={<CheckCircle2 className="w-3 h-3" />} />;
                        case ContactMessageStatus.IGNORED:
                            return <TagBadge label="Bỏ qua" color="gray" size="sm" icon={<Trash2 className="w-3 h-3" />} />;
                        default:
                            return <TagBadge label="Mới" color="blue" size="sm" icon={<Mail className="w-3 h-3" />} />;
                    }
                },
            },
            {
                header: "Thời gian",
                accessor: (m) => m.createdAt,
                type: "string",
                cell: (m) => <span className="text-xs font-medium text-foreground-muted">{formatDateTime(m.createdAt)}</span>,
            },
            {
                header: "Thao tác",
                accessor: (m) => m.id,
                type: "string",
                cell: (m) => (
                    <div className="flex items-center gap-2">
                        <ActionButton
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => handleView(m)}
                            color="blue"
                            title="Xem chi tiết"
                            disabled={fetchingId === m.id}
                        />
                        {m.status === ContactMessageStatus.NEW && (
                            <>
                                <ActionButton
                                    icon={<Reply className="w-4 h-4" />}
                                    onClick={() => handleOpenReply(m)}
                                    color="amber"
                                    title="Trả lời"
                                />
                                <ActionButton
                                    icon={<Trash2 className="w-4 h-4" />}
                                    onClick={() => handleOpenConfirmIgnore(m.id)}
                                    color="gray"
                                    title="Bỏ qua"
                                />
                            </>
                        )}
                    </div>
                ),
            },
        ],
        [handleView, handleOpenReply, fetchingId]
    );

    /* ─── Render ──────────────────────────────────────────────── */

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Liên hệ</h1>
                    <p className="text-sm text-foreground-muted font-medium">Quản lý tin nhắn liên hệ từ người dùng.</p>
                </div>
                <div className="flex items-center gap-3">
                    <StatCard label="Tổng" value={totalCount} icon={<Mail className="w-5 h-5 text-primary" />} color="blue" />
                    <StatCard label="Chưa trả lời" value={newCount} icon={<Inbox className="w-5 h-5 text-amber-500" />} color="amber" />
                    <RefreshButton
                        onRefresh={fetchMessages}
                        loading={loading}
                        className="rounded-full"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-bg border border-border rounded-lg shadow-sm flex flex-col min-h-0 flex-1">
                {/* Filters */}
                <div className="p-4 border-b border-border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FilterField
                            type="input"
                            label="Tên"
                            icon={<Search className="w-3 h-3" />}
                            value={searchName}
                            onChange={setSearchName}
                            placeholder="Lọc theo tên..."
                        />
                        <FilterField
                            type="input"
                            label="Email"
                            icon={<Mail className="w-3 h-3" />}
                            value={searchEmail}
                            onChange={setSearchEmail}
                            placeholder="Lọc theo email..."
                        />
                        <FilterField
                            type="select"
                            label="Trạng thái"
                            icon={<MailOpen className="w-3 h-3" />}
                            value={readFilter}
                            onChange={setReadFilter}
                            options={READ_FILTER_OPTIONS}
                            placeholder="Tất cả"
                        />
                    </div>
                </div>

                {/* Table body */}
                <div className="min-h-0 flex-1 overflow-hidden">
                    <DataTable loading={loading} data={filtered} columns={columns} showIndex />
                </div>
            </div>

            <ContactDetailModal
                isOpen={isDetailOpen}
                onClose={handleCloseDetail}
                message={detailMessage}
                onReply={handleOpenReply}
                onIgnore={async (id) => {
                    setIgnoringId(id);
                    await adminContactApi.patchIgnore(id);
                    fetchMessages();
                }}
            />
            <ReplyModal isOpen={isReplyOpen} onClose={handleCloseReply} message={replyMessage} onSuccess={fetchMessages} />

            <ActionConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleIgnore}
                title="Bỏ qua liên hệ"
                description="Bạn có chắc chắn muốn bỏ qua liên hệ này? Trạng thái sẽ được cập nhật thành đã bỏ qua."
                variant="danger"
                icon={<Trash2 className="w-5 h-5" />}
                confirmText="Bỏ qua"
            />
        </div>
    );
};

export default ContactMessagePage;
