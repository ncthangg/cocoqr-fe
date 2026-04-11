import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { X, Save, Loader2 } from "lucide-react";
import { emailTemplateApi } from "@/services/email-template-api.service";
import { toast } from "react-toastify";
import type { EmailTemplateRes } from "@/models/entity.model";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useModalForm } from "@/hooks/useModalForm";

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdated: (res: EmailTemplateRes) => void;
    template: EmailTemplateRes | null;
}

const EmailTemplateEditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onUpdated, template }) => {
    const [submitting, setSubmitting] = useState(false);

    const initialValues = useMemo(() => {
        if (!template) return undefined;
        return {
            subject: template.subject,
            body: template.body,
            description: template.description || "",
            isActive: template.isActive
        };
    }, [template]);

    const {
        register,
        watch,
        setValue,
        getValues,
        formState: { errors },
        isSubmitDisabled
    } = useModalForm({
        isOpen,
        defaultValues: {
            subject: "",
            body: "",
            description: "",
            isActive: true
        },
        values: initialValues
    });

    const formData = watch();

    //#region Handlers
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!template) return;

        const values = getValues();
        if (!values.subject.trim()) {
            toast.warning("Vui lòng nhập Subject");
            return;
        }
        if (!values.body.trim() || values.body === "<p><br></p>") {
            toast.warning("Vui lòng nhập nội dung template");
            return;
        }

        try {
            setSubmitting(true);
            await emailTemplateApi.update(template.id, {
                templateKey: template.templateKey,
                subject: values.subject.trim(),
                body: values.body,
                description: values.description.trim() || null,
                isActive: values.isActive,
            });

            const updatedTemplate: EmailTemplateRes = {
                ...template,
                subject: values.subject.trim(),
                body: values.body,
                description: values.description.trim() || null,
                isActive: values.isActive,
                updatedAt: new Date().toISOString()
            };

            onUpdated(updatedTemplate);
        } finally {
            setSubmitting(false);
        }
    };
    //#endregion

    //#region Render
    if (!template) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300",
                !isOpen ? "invisible opacity-0" : "visible opacity-100"
            )}
            onClick={onClose}
        >
            <div
                key={template.id}
                className={cn(
                    "bg-surface border border-border max-w-modal-lg w-full rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 transform",
                    !isOpen ? "scale-95 opacity-0" : "scale-100 opacity-100"
                )}
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
                            placeholder="Tiêu đề email..."
                            className={cn(
                                "input px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50",
                                errors.subject ? "border-danger/50" : "border-border/40"
                            )}
                            {...register("subject", { required: true })}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                            Mô tả <span className="text-foreground-muted/60 normal-case">(tùy chọn)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Mô tả ngắn về template này..."
                            className="input px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50"
                            {...register("description")}
                        />
                    </div>

                    {/* Body - ReactQuill */}
                    <div className="space-y-2 email-editor-container">
                        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                            Nội dung Template
                        </label>
                        <ReactQuill
                            theme="snow"
                            value={formData.body}
                            onChange={(val) => setValue("body", val, { shouldDirty: true, shouldValidate: true })}
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
                            <p className="text-xs text-foreground-muted">Template sẽ {formData.isActive ? "được sử dụng" : "bị tắt"} khi gửi email.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setValue("isActive", !formData.isActive, { shouldDirty: true })}
                            className={`relative w-12 h-7 rounded-full transition-all duration-300 ${formData.isActive ? 'bg-primary' : 'bg-border'}`}
                        >
                            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${formData.isActive ? 'left-6' : 'left-1'}`} />
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
                        onClick={handleSubmit}
                        disabled={submitting || isSubmitDisabled}
                        className="flex items-center gap-2 px-8 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
    //#endregion
};

export default React.memo(EmailTemplateEditModal);
