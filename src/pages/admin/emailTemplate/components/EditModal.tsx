import React, { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { emailTemplateApi } from "@/services/email-template-api.service";
import { toast } from "react-toastify";
import type { EmailTemplateRes } from "@/models/entity.model";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdated: (res: EmailTemplateRes) => void;
    template: EmailTemplateRes | null;
}

const EmailTemplateEditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onUpdated, template }) => {
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (template && isOpen) {
            setSubject(template.subject);
            setBody(template.body);
            setDescription(template.description || "");
            setIsActive(template.isActive);
        }
    }, [template, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!template) return;

        if (!subject.trim()) {
            toast.warning("Vui lòng nhập Subject");
            return;
        }
        if (!body.trim() || body === "<p><br></p>") {
            toast.warning("Vui lòng nhập nội dung template");
            return;
        }

        try {
            setSubmitting(true);
            await emailTemplateApi.update(template.id, {
                templateKey: template.templateKey,
                subject: subject.trim(),
                body,
                description: description.trim() || null,
                isActive,
            });
            toast.success("Cập nhật template thành công!");

            const updatedTemplate: EmailTemplateRes = {
                ...template,
                subject: subject.trim(),
                body,
                description: description.trim() || null,
                isActive,
                updatedAt: new Date().toISOString()
            };

            onUpdated(updatedTemplate);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Không thể cập nhật template.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !template) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
            <div
                className="bg-surface border border-border max-w-modal-lg w-full rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-border flex justify-between items-center bg-bg/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Save className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Chỉnh sửa Template</h3>
                            <p className="text-xs text-foreground-muted font-primary font-medium">{template.templateKey}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-border rounded-full transition-colors text-foreground-muted hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
                    {/* Template Key (readonly) */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                            Template Key
                        </label>
                        <input
                            type="text"
                            value={template.templateKey}
                            readOnly
                            className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl text-foreground-muted font-primary text-sm cursor-not-allowed"
                        />
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="Tiêu đề email..."
                            className="input px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                            Mô tả <span className="text-foreground-muted/60 normal-case">(tùy chọn)</span>
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Mô tả ngắn về template này..."
                            className="input px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    {/* Body - ReactQuill */}
                    <div className="space-y-2 email-editor-container">
                        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                            Nội dung Template
                        </label>
                        <ReactQuill
                            theme="snow"
                            value={body}
                            onChange={setBody}
                            placeholder="Soạn nội dung email template..."
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

                    {/* Is Active */}
                    <div className="flex items-center justify-between p-4 bg-bg rounded-xl border border-border">
                        <div>
                            <p className="text-sm font-bold text-foreground">Trạng thái</p>
                            <p className="text-xs text-foreground-muted">Template sẽ {isActive ? "được sử dụng" : "bị tắt"} khi gửi email.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsActive(!isActive)}
                            className={`relative w-12 h-7 rounded-full transition-all duration-300 ${isActive ? 'bg-primary' : 'bg-border'}`}
                        >
                            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${isActive ? 'left-6' : 'left-1'}`} />
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-4 border-t border-border flex justify-end gap-3 bg-bg/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 border border-border text-foreground font-bold rounded-xl hover:bg-border/50 transition-all"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit as any}
                        disabled={submitting}
                        className="flex items-center gap-2 px-8 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(EmailTemplateEditModal);
