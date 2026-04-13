import React, { useState, useEffect, useCallback, memo } from "react";
import type { GetUserBaseRes, GetEmailLogRes, GetEmailLogByIdRes, PagingVM, EmailTemplateRes } from "@/models/entity.model";
import { emailLogApi } from "@/services/email-log-api.service";
import { adminContactApi } from "@/services/admin-contact-api.service";
import { emailTemplateApi } from "@/services/email-template-api.service";
import type { AdminPostContactReq } from "@/models/entity.request.model";
import { SmtpSettingType, EmailLogStatus } from "@/models/enum";
import {
    X,
    Mail,
    Plus,
    History,
    Send,
    Calendar,
    User,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Search,
    Info,
    Settings,
    RefreshCw,
    Clock
} from "lucide-react";
import { formatDateTime } from "@/utils/dateTimeUtils";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";
import { cn } from "@/lib/utils";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

//#region Types
interface UserEmailModalProps {
    isOpen: boolean;
    onClose: void | (() => void);
    user: GetUserBaseRes | null;
}

interface LogItemProps {
    log: GetEmailLogRes;
    isActive: boolean;
    isFetchingDetail: boolean;
    onClick: (id: string) => void;
}
//#endregion

//#region Sub-components
const LogItem = memo(({ log, isActive, isFetchingDetail, onClick }: LogItemProps) => (
    <div
        onClick={() => onClick(log.id)}
        className={cn(
            "p-4 hover:bg-primary/5 transition-colors group cursor-pointer border-l-4",
            isActive ? "bg-primary/5 border-l-primary" : "border-l-transparent"
        )}
    >
        <div className="flex justify-between items-start mb-1 gap-2">
            <span className="text-sm font-bold text-foreground line-clamp-2">{log.subject}</span>
            <div className="shrink-0 mt-0.5">
                {isFetchingDetail ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                ) : log.status === EmailLogStatus.SUCCESS || log.status === 'SENT' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : log.status === EmailLogStatus.PENDING ? (
                    <Clock className="w-5 h-5 text-amber-500" />
                ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                )}
            </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-foreground-muted font-bold mt-2">
            <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDateTime(log.createdAt)}
            </span>
            <span className="px-1.5 py-0.5 bg-border/50 rounded text-foreground uppercase border border-border/20">
                {log.smtpType}
            </span>
        </div>
    </div>
));

const DetailView = memo(({ log, onBack }: { log: GetEmailLogByIdRes; onBack: () => void }) => (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="p-4 border-b border-border flex justify-between items-center bg-bg/10">
            <div className="flex items-center gap-2 font-bold text-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>Chi tiết Email</span>
            </div>
            <button onClick={onBack} className="p-1.5 lg:hidden hover:bg-border rounded-full text-foreground-muted">
                <X className="w-4 h-4" />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-muted/30 p-5 rounded-2xl border border-border">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5"><Settings className="w-3 h-3 text-primary" />SMTP</p>
                    <p className="text-sm font-bold text-foreground">{log.smtpType}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5"><User className="w-3 h-3 text-primary" />Người nhận</p>
                    <p className="text-sm font-bold text-foreground truncate">{log.recipientFullName || "Khách"} ({log.toEmail})</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary" />Thời gian gửi</p>
                    <p className="text-sm font-bold text-foreground">{formatDateTime(log.createdAt)}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5"><Info className="w-3 h-3 text-primary" />Trạng thái</p>
                    <div className="flex items-center gap-2">
                        <StatusBadge
                            status={log.status}
                            size="lg"
                            icon={log.status === EmailLogStatus.PENDING ? <Clock className="w-5 h-5" /> : undefined}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider pl-1">Tiêu đề</p>
                <div className="p-4 bg-bg rounded-xl border border-border font-extrabold text-foreground shadow-sm">
                    {log.subject}
                </div>
            </div>

            <div className="space-y-2 flex-1 flex flex-col">
                <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider pl-1">Nội dung</p>
                <div
                    className="flex-1 p-5 bg-bg rounded-xl border border-border text-sm text-foreground leading-relaxed shadow-sm min-h-[250px] overflow-auto prose-content"
                    dangerouslySetInnerHTML={{ __html: log.body || '' }}
                />
            </div>

            {log.errorMessage && (
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                        <AlertCircle className="w-3 h-3" /> Lỗi gửi Email
                    </p>
                    <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20 text-sm text-red-500 font-medium">
                        {log.errorMessage}
                    </div>
                </div>
            )}
        </div>
    </div>
));
//#endregion

const UserEmailModal: React.FC<UserEmailModalProps> = ({ isOpen, onClose, user }) => {
    //#region States & Hooks
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [fetchingDetailId, setFetchingDetailId] = useState<string | null>(null);
    const [logs, setLogs] = useState<GetEmailLogRes[]>([]);
    const [isFormView, setIsFormView] = useState(false);
    const [selectedLog, setSelectedLog] = useState<GetEmailLogByIdRes | null>(null);

    const [subjectFilter, setSubjectFilter] = useState("");
    const debouncedSubject = useDebounce(subjectFilter, 500);
    const [paging, setPaging] = useState<PagingVM<GetEmailLogRes>>({
        list: [],
        pageSize: 10,
        pageNumber: 1,
        totalPages: 1,
        totalItems: 0
    });

    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [smtpType, setSmtpType] = useState<keyof typeof SmtpSettingType | "">("");
    const [submitting, setSubmitting] = useState(false);

    const [templates, setTemplates] = useState<EmailTemplateRes[]>([]);
    const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("");

    useEffect(() => {
        if (isOpen) {
            emailTemplateApi.getAll().then(res => setTemplates(Array.isArray(res) ? res : []));
        }
    }, [isOpen]);
    //#endregion

    //#region Data Fetching
    const fetchHistory = useCallback(async (page: number, size: number, subj: string, showSoftLoading = false) => {
        if (!user) return;
        try {
            if (showSoftLoading) setIsRefreshing(true);
            else setLoading(true);

            const res = await emailLogApi.getAll({
                pageNumber: page,
                pageSize: size,
                recipientUserId: user.id,
                subject: subj || null,
                sortField: "sentAt",
                sortDirection: "desc"
            });
            if (res) {
                setLogs(res.list || []);
                setPaging(res);
            }
        } catch (error) {
            console.error("Error fetching email history", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [user]);

    // Initial fetch when opening or user changes
    useEffect(() => {
        if (isOpen && user) {
            fetchHistory(paging.pageNumber, paging.pageSize, debouncedSubject, logs.length > 0);
        }
    }, [isOpen, user, fetchHistory, paging.pageNumber, paging.pageSize, debouncedSubject]);

    // Reset view on open
    useEffect(() => {
        if (isOpen) {
            setIsFormView(false);
            setSelectedLog(null);
            setSubjectFilter("");
            setSmtpType("");
            setSelectedTemplateKey("");
            setPaging(prev => ({ ...prev, pageNumber: 1 }));
        }
    }, [isOpen]);
    //#endregion

    //#region Handlers
    const handleOnClose = useCallback(() => {
        if (typeof onClose === 'function') onClose();
    }, [onClose]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= paging.totalPages) {
            setPaging(prev => ({ ...prev, pageNumber: newPage }));
        }
    };

    const handleViewDetail = async (id: string) => {
        if (selectedLog?.id === id) {
            setIsFormView(false);
            return;
        }
        if (fetchingDetailId === id) return;

        try {
            setFetchingDetailId(id);
            const detail = await emailLogApi.getById(id);
            setSelectedLog(detail);
            setIsFormView(false);
        } catch (err) {
            console.error(err);
        } finally {
            setFetchingDetailId(null);
        }
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setSubmitting(true);
            const payload: AdminPostContactReq = {
                fullName: user.fullName,
                email: user.email,
                subject,
                content,
                smtpType: smtpType || null,
                templateKey: selectedTemplateKey || null,
            };

            await adminContactApi.post(payload);
            setSubject("");
            setContent("");
            setSmtpType("");
            setIsFormView(false);
            // Non-intrusive refresh
            fetchHistory(1, paging.pageSize, debouncedSubject, true);
        } finally {
            setSubmitting(false);
        }
    };
    //#endregion

    //#region Render Helpers
    const isReady = isOpen && user;
    if (!isOpen) return null;
    //#endregion

    return (
        <div className="modal-overlay" onClick={handleOnClose}>
            <div
                className="modal-content max-w-modal-4xl h-[80vh] flex flex-col animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-border flex justify-between items-center bg-bg/50">
                    {!user ? (
                        <div className="flex items-center gap-4 animate-pulse">
                            <div className="w-12 h-12 bg-border rounded-xl" />
                            <div className="space-y-2">
                                <div className="w-32 h-5 bg-border rounded" />
                                <div className="w-48 h-3 bg-border rounded" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Mail className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Email cho {user.fullName}</h3>
                                <p className="text-xs text-foreground-muted font-medium">{user.email}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleOnClose}
                        className="p-2 hover:bg-border rounded-full transition-colors text-foreground-muted hover:text-foreground"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Email History */}
                    <div className={cn(
                        "flex-col w-full lg:w-1/3 border-r border-border bg-bg/30",
                        isFormView ? "hidden lg:flex" : "flex"
                    )}>
                        <div className="p-4 border-b border-border flex justify-between items-center bg-surface/50">
                            <div className="flex items-center gap-2 font-bold text-foreground overflow-hidden">
                                <History className="w-4 h-4 text-primary shrink-0" />
                                <span className="truncate">Lịch sử Email</span>
                                {isRefreshing && <RefreshCw className="w-3 h-3 animate-spin text-primary" />}
                            </div>
                            <button
                                onClick={() => { setIsFormView(true); setSelectedLog(null); }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Tạo Mail
                            </button>
                        </div>

                        <div className="p-3 border-b border-border/50 bg-bg/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none z-10" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tiêu đề..."
                                    value={subjectFilter}
                                    onChange={(e) => {
                                        setSubjectFilter(e.target.value);
                                        setPaging(prev => ({ ...prev, pageNumber: 1 }));
                                    }}
                                    className="input !pl-9 pr-9 py-2 text-xs rounded-lg"
                                />
                                {subjectFilter && (
                                    <button
                                        onClick={() => {
                                            setSubjectFilter("");
                                            setPaging(prev => ({ ...prev, pageNumber: 1 }));
                                        }}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-muted text-foreground-muted hover:text-foreground transition-all duration-200 z-10"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 flex flex-col relative">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-foreground-muted gap-3 p-8 text-center animate-in fade-in">
                                    <div className="p-4 bg-border/20 rounded-full">
                                        <Mail className="w-12 h-12 opacity-20" />
                                    </div>
                                    <p className="font-medium">Chưa có lịch sử gửi email.</p>
                                </div>
                            ) : (
                                <div className={cn(
                                    "divide-y divide-border flex-1 transition-opacity duration-200",
                                    isRefreshing ? "opacity-50" : "opacity-100"
                                )}>
                                    {logs.map((log) => (
                                        <LogItem
                                            key={log.id}
                                            log={log}
                                            isActive={selectedLog?.id === log.id}
                                            isFetchingDetail={fetchingDetailId === log.id}
                                            onClick={handleViewDetail}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-3 border-border bg-surface shrink-0">
                            <TablePagination
                                pageNumber={paging.pageNumber}
                                pageSize={paging.pageSize}
                                totalItems={paging.totalItems}
                                totalPages={paging.totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>

                    {/* Right Panel: Content View */}
                    <div className={cn(
                        "flex-1 bg-surface relative",
                        isFormView || selectedLog ? "flex" : "hidden lg:flex"
                    )}>
                        {!isReady ? (
                            <div className="flex-1 flex flex-col justify-center items-center gap-4">
                                <Loader2 className="w-10 h-10 text-primary animate-spin opacity-20" />
                            </div>
                        ) : !isFormView && !selectedLog ? (
                            <div className="flex-1 flex flex-col justify-center items-center text-foreground-muted gap-3 p-8 text-center bg-surface-muted/20 animate-in fade-in">
                                <Mail className="w-16 h-16 opacity-10" />
                                <p className="font-medium text-sm max-w-[250px]">Chọn một email bên trái để xem chi tiết, hoặc tạo thư mới.</p>
                            </div>
                        ) : isFormView ? (
                            <div className="flex flex-col flex-1 h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="p-4 border-b border-border flex justify-between items-center bg-bg/10">
                                    <div className="flex items-center gap-2 font-bold text-foreground">
                                        <Send className="w-4 h-4 text-primary" />
                                        <span>Gửi Email Mới</span>
                                    </div>
                                    <button onClick={() => setIsFormView(false)} className="px-3 py-1.5 lg:hidden text-xs btn-ghost">Đóng</button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                                    <form onSubmit={handleSendEmail} className="space-y-6 max-w-full mx-auto">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-2">
                                                    <User className="w-3 h-3 text-primary" /> Người nhận
                                                </label>
                                                <div className="px-4 py-3 bg-bg/50 border border-border rounded-xl text-foreground font-semibold">
                                                    {user?.fullName}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-2">
                                                    <Mail className="w-3 h-3 text-primary" /> Email
                                                </label>
                                                <div className="px-4 py-3 bg-bg/50 border border-border rounded-xl text-foreground font-semibold">
                                                    {user?.email}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="smtpType" className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-2">
                                                <Settings className="w-3 h-3 text-primary" /> Loại SMTP
                                            </label>
                                            <select
                                                id="smtpType"
                                                value={smtpType}
                                                onChange={(e) => setSmtpType(e.target.value as keyof typeof SmtpSettingType | "")}
                                                className="select w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50"
                                            >
                                                <option value="">Mặc định (hệ thống tự chọn)</option>
                                                {Object.keys(SmtpSettingType).map(key => (
                                                    <option key={key} value={key}>{key}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex justify-between">
                                                Chọn Mẫu Email (Template)
                                                <span className="text-[10px] font-medium opacity-60 normal-case">(Tùy chọn)</span>
                                            </label>
                                            <select
                                                value={selectedTemplateKey}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setSelectedTemplateKey(val);
                                                    if (val) {
                                                        const tpl = templates.find(t => t.templateKey === val);
                                                        if (tpl) {
                                                            setSubject(tpl.subject);
                                                            setContent(tpl.body);
                                                        }
                                                    }
                                                }}
                                                className="select w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 appearance-none"
                                            >
                                                <option value="">Không sử dụng mẫu</option>
                                                {templates.filter(t => t.isActive).map(t => (
                                                    <option key={t.id} value={t.templateKey}>{t.subject} ({t.templateKey})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="subject" className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                                                Tiêu đề
                                            </label>
                                            <input
                                                id="subject"
                                                type="text"
                                                required
                                                placeholder="Nhập tiêu đề email..."
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="input px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50"
                                            />
                                        </div>

                                        <div className="space-y-2 email-editor-container">
                                            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                                                Nội dung
                                            </label>
                                            <ReactQuill
                                                theme="snow"
                                                value={content}
                                                onChange={setContent}
                                                placeholder="Nhập nội dung email..."
                                                modules={{
                                                    toolbar: [
                                                        [{ 'header': [1, 2, 3, false] }],
                                                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                        ['link', 'clean']
                                                    ]
                                                }}
                                            />
                                        </div>

                                        <div className="pt-4 flex justify-end gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setIsFormView(false)}
                                                className="px-6 py-2.5 border border-border text-foreground font-bold rounded-xl hover:bg-border/50 transition-all lg:hidden"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="flex items-center gap-3 px-8 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                            >
                                                {submitting ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Send className="w-5 h-5" />
                                                )}
                                                Gửi Email
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ) : selectedLog ? (
                            <DetailView log={selectedLog} onBack={() => setSelectedLog(null)} />
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(UserEmailModal);
