import React, { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { EmailTemplateKey } from "@/models/enum";
import { emailTemplateApi } from "@/services/email-template-api.service";
import { toast } from "react-toastify";
import type { EmailTemplateRes } from "@/models/entity.model";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

/** All known keys for dropdown */
const ALL_TEMPLATE_KEYS = Object.values(EmailTemplateKey);

interface CreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (res: EmailTemplateRes) => void;
    existingKeys: string[];
}

const EmailTemplateCreateModal: React.FC<CreateModalProps> = ({ isOpen, onClose, onCreated, existingKeys }) => {
    const [templateKey, setTemplateKey] = useState<string>("");
    const [customKey, setCustomKey] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const availableKeys = ALL_TEMPLATE_KEYS.filter(k => !existingKeys.includes(k));

    const resetForm = () => {
        setTemplateKey("");
        setCustomKey("");
        setSubject("");
        setBody("");
        setDescription("");
        setIsActive(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalKey = templateKey === "__custom__" ? customKey.trim() : templateKey;

        if (!finalKey) {
            toast.warning("Vui lòng chọn hoặc nhập Template Key");
            return;
        }
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
            const res = await emailTemplateApi.create({
                templateKey: finalKey,
                subject: subject.trim(),
                body,
                description: description.trim() || null,
                isActive,
            });
            toast.success("Tạo template thành công!");
            resetForm();

            const newTemplate: EmailTemplateRes = {
                id: res?.id || (typeof res === 'string' ? res : Date.now().toString()),
                templateKey: finalKey,
                subject: subject.trim(),
                body,
                description: description.trim() || null,
                isActive,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            onCreated(newTemplate);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Không thể tạo template.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

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
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Plus className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Tạo Email Template</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-border rounded-full transition-colors text-foreground-muted hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
                    {/* Template Key */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                            Template Key
                        </label>
                        <select
                            value={templateKey}
                            onChange={(e) => setTemplateKey(e.target.value)}
                            className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                            required
                        >
                            {availableKeys.map(key => (
                                <option key={key} value={key}>{key}</option>
                            ))}
                            <option value="__custom__">🔧 Nhập key tùy chỉnh...</option>
                        </select>
                        {templateKey === "__custom__" && (
                            <input
                                type="text"
                                value={customKey}
                                onChange={e => setCustomKey(e.target.value)}
                                placeholder="vd: order_shipped"
                                className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-foreground placeholder:text-foreground-muted outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm mt-2"
                                required
                            />
                        )}
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
                            className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-foreground placeholder:text-foreground-muted outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
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
                            className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-foreground placeholder:text-foreground-muted outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
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
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Tạo Template
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(EmailTemplateCreateModal);
