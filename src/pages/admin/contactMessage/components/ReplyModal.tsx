import React, { useState, useEffect, useCallback } from "react";
import { X, Mail, Send, Loader2 } from "lucide-react";
import { adminContactApi } from "@/services/admin-contact-api.service";
import { emailTemplateApi } from "@/services/email-template-api.service";
import type { ContactMessageRes, EmailTemplateRes } from "@/models/entity.model";
import { SmtpSettingType } from "@/models/enum";
import { toast } from "react-toastify";
import { getSmtpTypeOptions } from "@/pages/admin/smtpSettings/utils";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface ReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: ContactMessageRes | null;
    onSuccess?: () => void;
}

const ReplyModal: React.FC<ReplyModalProps> = ({ isOpen, onClose, message, onSuccess }) => {
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [smtpType, setSmtpType] = useState<keyof typeof SmtpSettingType | "">("");
    const [submitting, setSubmitting] = useState(false);

    // Template states
    const [templates, setTemplates] = useState<EmailTemplateRes[]>([]);
    const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("");

    useEffect(() => {
        if (isOpen) {
            emailTemplateApi.getAll().then(res => setTemplates(Array.isArray(res) ? res : []));
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setSubject("");
            setContent("");
            setSmtpType("");
            setSelectedTemplateKey("");
        }
    }, [isOpen]);

    const handleOverlayClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    }, [onClose]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message) return;

        if (!subject.trim()) {
            toast.warning("Vui lòng nhập Subject");
            return;
        }

        if (!content.trim() || content === "<p><br></p>") {
            toast.warning("Vui lòng nhập nội dung email");
            return;
        }

        try {
            setSubmitting(true);
            await adminContactApi.post({
                fullName: message.fullName,
                email: message.email,
                subject: subject.trim(),
                content: content,
                smtpType: smtpType ? (smtpType as SmtpSettingType) : null,
                templateKey: selectedTemplateKey || null
            });
            toast.success("Đã gửi email reply thành công!");
            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Lỗi khi gửi email. Vui lòng thử lại sau.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !message) return null;

    const smtpOptions = getSmtpTypeOptions();

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
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Mail className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Trả lời liên hệ</h3>
                            <p className="text-xs text-foreground-muted font-medium">Gửi email qua SMTP server</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-border rounded-full transition-colors text-foreground-muted hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleReply} className="flex flex-col flex-1 min-h-0">
                    <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                        {/* Summary / To */}
                        <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-2">
                            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Người nhận</p>
                            <div>
                                <p className="font-bold text-foreground">{message.fullName}</p>
                                <p className="text-sm font-medium text-blue-500 break-all">{message.email}</p>
                            </div>
                        </div>

                        {/* Template Dropdown */}
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
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-border rounded-xl text-foreground font-medium outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                            >
                                <option value="">Không sử dụng mẫu</option>
                                {templates.filter(t => t.isActive).map(t => (
                                    <option key={t.id} value={t.templateKey}>{t.subject} ({t.templateKey})</option>
                                ))}
                            </select>
                        </div>

                        {/* SMTP Type options */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex justify-between">
                                Kiểu Email
                                <span className="text-[10px] font-medium opacity-60 normal-case">(Tùy chọn)</span>
                            </label>
                            <select
                                value={smtpType}
                                onChange={e => setSmtpType(e.target.value as any)}
                                className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-foreground font-medium outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                            >
                                <option value="">Mặc định (Từ Contact configs hoặc default SMTP)</option>
                                {smtpOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Subject Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                                Tiêu đề (Subject)
                            </label>
                            <input
                                type="text"
                                required
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="Nhập tiêu đề email..."
                                className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-foreground placeholder:text-foreground-muted font-medium outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>

                        {/* Body Composer */}
                        <div className="space-y-2 email-editor-container flex-1 min-h-[300px] flex flex-col">
                            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                                Nội dung
                            </label>
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                placeholder="Viết câu trả lời..."
                                className="flex-1 flex flex-col"
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, 3, false] }],
                                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                        ['link', 'image', 'clean']
                                    ]
                                }}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-border bg-bg/50 flex justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-border text-foreground font-bold rounded-xl hover:bg-border/50 transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleReply as any}
                            disabled={submitting}
                            className="flex items-center gap-2 px-8 py-2.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 active:scale-95"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Gửi Trả lời
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default React.memo(ReplyModal);
