import React, { useCallback } from "react";
import { X, Mail, Eye, FileText, Calendar } from "lucide-react";
import type { EmailTemplateRes } from "@/models/entity.model";
import { formatDateTime } from "@/utils/dateTimeUtils";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: EmailTemplateRes | null;
}

const EmailTemplateDetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, template }) => {
    const handleOverlayClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    }, [onClose]);

    if (!isOpen || !template) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-surface border border-border max-w-modal-lg w-full rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-border flex justify-between items-center bg-bg/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Eye className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Chi tiết Template</h3>
                            <p className="text-xs text-foreground-muted font-medium">{template.templateKey}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <StatusBadge
                            status={template.isActive}
                            activeText="Hoạt động"
                            inactiveText="Tắt"
                            size="lg"
                        />
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-border rounded-full transition-colors text-foreground-muted hover:text-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-3 h-3 text-primary" />Template Key
                            </p>
                            <p className="text-sm font-bold text-foreground font-mono bg-surface-muted px-3 py-2 rounded-lg border border-border">
                                {template.templateKey}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 text-primary" />Cập nhật lần cuối
                            </p>
                            <p className="text-sm font-bold text-foreground">
                                {template.updatedAt ? formatDateTime(template.updatedAt) : formatDateTime(template.createdAt || '')}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider pl-1 flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-primary" />Subject
                        </p>
                        <div className="p-4 bg-bg rounded-xl border border-border font-bold text-foreground shadow-sm">
                            {template.subject}
                        </div>
                    </div>

                    {template.description && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider pl-1">Mô tả</p>
                            <div className="p-4 bg-bg rounded-xl border border-border text-sm text-foreground-muted font-medium">
                                {template.description}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 flex-1 flex flex-col">
                        <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider pl-1">Nội dung Template</p>
                        <div className="email-editor-container readonly flex-1">
                            <ReactQuill
                                theme="snow"
                                value={template.body}
                                readOnly={true}
                                modules={{ toolbar: false }}
                                className="!border-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
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
};

export default React.memo(EmailTemplateDetailModal);
