import React, { useCallback } from "react";
import { Mail, X, Settings, User, Calendar, Info, ArrowRightLeft, FileText } from "lucide-react";
import type { GetEmailLogByIdRes } from "@/models/entity.model";
import { formatDateTime } from "@/utils/dateTimeUtils";
import { EmailLogStatus, EmailDirection } from "@/models/enum";
import { TagBadge } from "@/components/UICustoms/TagBadge";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface EmailDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    log: GetEmailLogByIdRes | null;
}

const EmailDetailModal: React.FC<EmailDetailModalProps> = ({ isOpen, onClose, log }) => {
    //#region Handlers
    const handleOverlayClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    }, [onClose]);
    //#endregion

    //#region Render
    if (!isOpen || !log) return null;

    const isSuccess = log.status === EmailLogStatus.SUCCESS || log.status === "SENT";

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-surface border border-border max-w-modal-lg w-full rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header / Top Bar */}
                <div className="p-4 border-b border-border flex justify-between items-center bg-bg/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                            Chi tiết Email
                            {/* Move status to top bar */}
                            <span className={`px-2 py-0.5 mt-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${isSuccess
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                                }`}>
                                {log.status || "Failed"}
                            </span>
                        </h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Sent At</span>
                            <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                {formatDateTime(log.createdAt)}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-border hidden sm:block" />
                        <button
                            onClick={onClose}
                            className="p-2 sm:-mr-2 hover:bg-border rounded-full transition-colors text-foreground-muted hover:text-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Direction</p>
                            <div className="flex items-center">
                                <TagBadge
                                    label={log.emailDirection || EmailDirection.OUTGOING}
                                    color={log.emailDirection === EmailDirection.INCOMING ? "blue" : "purple"}
                                    size="lg"
                                    icon={<ArrowRightLeft className="w-3 h-3" />}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Template</p>
                            <div className="flex items-center">
                                <TagBadge
                                    label={log.templateKey || "N/A"}
                                    color="gray"
                                    size="lg"
                                    icon={<FileText className="w-3 h-3" />}
                                    className="font-primary text-[10px]"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">SMTP Type</p>
                            <div className="flex items-center">
                                <TagBadge
                                    label={log.smtpType}
                                    color={log.smtpType === 'ADMIN' ? 'indigo' : log.smtpType === 'SYSTEM' ? 'purple' : log.smtpType === 'SUPPORT' ? 'amber' : 'blue'}
                                    size="lg"
                                    icon={<Settings className="w-3 h-3" />}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Recipient</p>
                            <p className="text-sm font-semibold flex items-center gap-2 truncate">
                                <User className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="truncate">{log.recipientFullName || "Unknown"} ({log.toEmail})</span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Subject</p>
                        <div className="p-3 bg-bg rounded-lg border border-border font-bold text-foreground">
                            {log.subject}
                        </div>
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col">
                        <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider pl-1">Message Body</p>
                        <div className="email-editor-container readonly flex-1">
                            <ReactQuill
                                theme="snow"
                                value={log.body}
                                readOnly={true}
                                modules={{ toolbar: false }}
                                className="!border-none"
                            />
                        </div>
                    </div>

                    {log.errorMessage && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                                <Info className="w-3 h-3" /> Error Message
                            </p>
                            <div className="p-4 bg-red-500/5 rounded-lg border border-red-500/20 text-sm text-red-500 font-medium">
                                {log.errorMessage}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border flex justify-end bg-bg/50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
    //#endregion
};

export default React.memo(EmailDetailModal);
