import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, Mail, Send } from "lucide-react";
import Button from "@/components/UICustoms/Button";
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
    //#region States & Refs
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [smtpType, setSmtpType] = useState<keyof typeof SmtpSettingType | "">("");
    const [submitting, setSubmitting] = useState(false);
    const [hasFetchedTemplates, setHasFetchedTemplates] = useState(false);
    const [templates, setTemplates] = useState<EmailTemplateRes[]>([]);
    const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("");
    //#endregion

    //#region Side Effects
    useEffect(() => {
        if (isOpen) {
            setSubject("");
            setContent("");
            setSmtpType("");
            setSelectedTemplateKey("");
        }
    }, [isOpen]);
    //#endregion

    //#region Handlers
    const handleFetchTemplates = async () => {
        if (hasFetchedTemplates) return;
        try {
            const res = await emailTemplateApi.getAll();
            setTemplates(Array.isArray(res) ? res : []);
            setHasFetchedTemplates(true);
        } catch (error) {
            console.error("Error fetching templates:", error);
            setHasFetchedTemplates(true);
        }
    };

    const handleReply = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
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
                contactMessageId: message.id,
                fullName: message.fullName,
                email: message.email,
                subject: subject.trim(),
                content: content,
                smtpType: smtpType ? (smtpType as SmtpSettingType) : null,
                templateKey: selectedTemplateKey || null
            });
            toast.success("Đã gửi email reply thành công!");
            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Lỗi khi gửi email. Vui lòng thử lại sau.");
        } finally {
            setSubmitting(false);
        }
    };
    //#endregion

    //#region Render
    if (!message) return null;

    const smtpOptions = getSmtpTypeOptions();

    return (
        <div
            className={cn(
                "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300",
                !isOpen ? "invisible opacity-0" : "visible opacity-100"
            )}
            onClick={onClose}
        >
            <div
                className={cn(
                    "bg-surface border border-border max-w-modal-lg w-full rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 transform",
                    !isOpen ? "scale-95 opacity-0" : "scale-100 opacity-100"
                )}
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
                                <div className="flex items-center gap-1 text-sm font-medium">
                                    <span className="text-foreground-muted">mail:</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(message.email);
                                            toast.info("Đã sao chép email");
                                        }}
                                        className="text-blue-500 hover:underline break-all transition-all text-left"
                                        title="Click để sao chép"
                                    >
                                        {message.email}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* SMTP Type options */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex justify-between">
                                    Loại Email
                                    <span className="text-[10px] font-medium opacity-60 normal-case">(Tùy chọn)</span>
                                </label>
                                <select
                                    value={smtpType}
                                    onChange={e => setSmtpType(e.target.value as any)}
                                    className="select w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 appearance-none"
                                >
                                    <option value="">Mặc định (Default System SMTP)</option>
                                    {smtpOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Template Dropdown */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex justify-between">
                                    Chọn Mẫu Email (Template)
                                    <span className="text-[10px] font-medium opacity-60 normal-case">(Tùy chọn)</span>
                                </label>
                                <select
                                    value={selectedTemplateKey}
                                    onMouseDown={handleFetchTemplates}
                                    onFocus={handleFetchTemplates}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setSelectedTemplateKey(val);
                                        if (val) {
                                            const tpl = templates.find(t => t.templateKey === val);
                                            if (tpl) {
                                                setSubject(tpl.subject);
                                                setContent(tpl.body);
                                            }
                                        } else {
                                            setSubject("");
                                            setContent("");
                                        }
                                    }}
                                    className="select w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 appearance-none"
                                >
                                    <option value="" disabled={!hasFetchedTemplates}>
                                        {hasFetchedTemplates ? "Không sử dụng mẫu" : "Đang tải danh sách mẫu..."}
                                    </option>
                                    {hasFetchedTemplates && templates.filter(t => t.isActive).map(t => (
                                        <option key={t.id} value={t.templateKey}>{t.subject} ({t.templateKey})</option>
                                    ))}
                                </select>
                            </div>
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
                                className="input px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50"
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
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleReply as any}
                            loading={submitting}
                            icon={<Send className="w-5 h-5" />}
                            className="px-8 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20"
                        >
                            Gửi
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
    //#endregion
};

export default React.memo(ReplyModal);
