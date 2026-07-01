import React, { memo, useCallback, useEffect, useState } from "react";
import type { GetUserBaseRes, EmailTemplateRes } from "@/models/entity.model";
import { adminContactApi } from "@/services/admin-contact-api.service";
import { emailTemplateApi } from "@/services/email-template-api.service";
import type { AdminPostContactReq } from "@/models/entity.request.model";
import { cn } from "@/lib/utils";
import { Loader2, Mail, Send, User, X } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface UserEmailModalProps {
    isOpen: boolean;
    onClose: void | (() => void);
    user: GetUserBaseRes | null;
}

const EMPTY_HTML = "<p><br></p>";

const UserEmailModal: React.FC<UserEmailModalProps> = ({ isOpen, onClose, user }) => {
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [templates, setTemplates] = useState<EmailTemplateRes[]>([]);
    const [selectedTemplateKey, setSelectedTemplateKey] = useState("");
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setSubject("");
        setContent("");
        setSelectedTemplateKey("");
        setLoadingTemplates(true);

        emailTemplateApi
            .getAll()
            .then((res) => setTemplates(Array.isArray(res) ? res : []))
            .catch(() => setTemplates([]))
            .finally(() => setLoadingTemplates(false));
    }, [isOpen]);

    const handleOnClose = useCallback(() => {
        if (typeof onClose === "function") onClose();
    }, [onClose]);

    const handleTemplateChange = (templateKey: string) => {
        setSelectedTemplateKey(templateKey);
        const template = templates.find((item) => item.templateKey === templateKey);

        if (!template) {
            setSubject("");
            setContent("");
            return;
        }

        setSubject(template.subject);
        setContent(template.body);
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || submitting) return;

        const normalizedContent = content.trim();
        if (!subject.trim() || !normalizedContent || normalizedContent === EMPTY_HTML) return;

        try {
            setSubmitting(true);
            const payload: AdminPostContactReq = {
                contactMessageId: null,
                fullName: user.fullName,
                email: user.email,
                subject: subject.trim(),
                content,
                templateKey: selectedTemplateKey || null,
                htmlBody: content,
            };

            await adminContactApi.post(payload);
            handleOnClose();
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleOnClose}>
            <div
                className="modal-content max-w-modal-3xl max-h-[88vh] flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-border flex justify-between items-center bg-bg/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">Gửi email</h3>
                            <p className="text-xs text-foreground-muted font-medium">{user ? `${user.fullName} - ${user.email}` : "Đang tải người nhận"}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleOnClose}
                        className="p-2 hover:bg-border rounded-full transition-colors text-foreground-muted hover:text-foreground"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSendEmail} className="flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-2">
                                    <User className="w-3 h-3 text-primary" /> Người nhận
                                </label>
                                <div className="px-4 py-3 bg-bg/50 border border-border rounded-xl text-foreground font-semibold">
                                    {user?.fullName || "-"}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-2">
                                    <Mail className="w-3 h-3 text-primary" /> Email
                                </label>
                                <div className="px-4 py-3 bg-bg/50 border border-border rounded-xl text-foreground font-semibold break-all">
                                    {user?.email || "-"}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex justify-between">
                                Mail hệ thống
                                {loadingTemplates && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                            </label>
                            <select
                                value={selectedTemplateKey}
                                onChange={(e) => handleTemplateChange(e.target.value)}
                                className="select w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50"
                                disabled={loadingTemplates}
                            >
                                <option value="">Không sử dụng mẫu</option>
                                {templates.filter((template) => template.isActive).map((template) => (
                                    <option key={template.id} value={template.templateKey}>
                                        {template.subject} ({template.templateKey})
                                    </option>
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
                                        [{ header: [1, 2, 3, false] }],
                                        ["bold", "italic", "underline", "strike", "blockquote"],
                                        [{ list: "ordered" }, { list: "bullet" }],
                                        ["link", "clean"],
                                    ],
                                }}
                            />
                        </div>
                    </div>

                    <div className="p-4 border-t border-border bg-bg/50 flex justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={handleOnClose}
                            className="px-6 py-2.5 border border-border text-foreground font-bold rounded-xl hover:bg-border/50 transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !user || !subject.trim() || !content.trim() || content.trim() === EMPTY_HTML}
                            className={cn(
                                "flex items-center gap-3 px-8 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95",
                                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                            )}
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Gửi Email
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(UserEmailModal);
