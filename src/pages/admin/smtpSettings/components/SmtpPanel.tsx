import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { Server, Lock, ShieldCheck, ShieldOff, Wifi, Mail, Settings, FlaskConical, Trash2, SendHorizonal, Loader2, Eye, EyeOff, Save } from "lucide-react";
import type { SmtpSettingRes } from "@/models/entity.model";
import type { PutSmtpSettingReq, TestSmtpSettingReq } from "@/models/entity.request.model";
import { smtpSettingApi } from "@/services/smtp-setting-api.service";
import { formatDateTime } from "@/utils/dateTimeUtils";
import StatusToggle from "@/components/UICustoms/Form/StatusToggle";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";
import { FormField } from "./FormField";
import { InfoRow } from "./InfoRow";
import { type SmtpTypeKey, getPanelMeta, settingToForm, inputCls } from "../utils";

export interface SmtpPanelProps {
    type:          SmtpTypeKey;
    setting:       SmtpSettingRes;
    onSaved:       (updated: SmtpSettingRes) => void;
    onDeleted:     (type: SmtpTypeKey) => void;
    isEditing:     boolean;
    onRequestEdit: () => void;
    onCancelEdit:  () => void;
}

export const SmtpPanel = React.memo(function SmtpPanel({
    type, setting, onSaved, onDeleted, isEditing, onRequestEdit, onCancelEdit,
}: SmtpPanelProps) {
    const meta = getPanelMeta(type);

    const [savingEdit, setSavingEdit]       = useState(false);
    const [testLoading, setTestLoading]     = useState(false);
    const [deleting, setDeleting]           = useState(false);
    const [showPassword, setShowPassword]   = useState(false);
    const [showTestPanel, setShowTestPanel] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [form, setForm] = useState<Omit<PutSmtpSettingReq, "type">>(settingToForm(setting));

    const [testForm, setTestForm] = useState<Omit<TestSmtpSettingReq, "type">>({
        toEmail: "", subject: "Test Email từ CocoQR",
        body:    "Đây là email kiểm tra từ hệ thống CocoQR.",
    });

    useEffect(() => { setForm(settingToForm(setting)); }, [setting]);

    useEffect(() => {
        if (!isEditing) {
            setForm(settingToForm(setting));
            setShowPassword(false);
        }
    }, [isEditing, setting]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.host.trim()) return toast.error("Host không được để trống.");
        if (!form.fromEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.fromEmail))
            return toast.error("From Email không hợp lệ.");
        if (form.port <= 0 || form.port > 65535) return toast.error("Port phải từ 1 đến 65535.");

        setSavingEdit(true);
        try {
            const res = await smtpSettingApi.put({ ...form, type });
            onSaved(res);
            toast.success(`Đã lưu cài đặt ${meta.label} thành công.`);
            onCancelEdit();
        } catch {
            toast.error("Lưu cài đặt thất bại. Vui lòng thử lại.");
        } finally {
            setSavingEdit(false);
        }
    };

    const handleTest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testForm.toEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testForm.toEmail))
            return toast.error("Email nhận không hợp lệ.");
        setTestLoading(true);
        try {
            await smtpSettingApi.test({ ...testForm, type });
            toast.success(`Email kiểm tra đã được gửi tới ${testForm.toEmail}!`);
        } catch {
            toast.error("Gửi email kiểm tra thất bại.");
        } finally {
            setTestLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await smtpSettingApi.delete(setting.id);
            toast.success(`Đã xóa cài đặt ${meta.label}.`);
            onDeleted(type);
        } catch {
            toast.error("Xóa cài đặt thất bại. Vui lòng thử lại.");
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleToggle = useCallback(
        (field: "enableSSL" | "isActive") => (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm(prev => ({ ...prev, [field]: e.target.checked })),
        []
    );

    return (
        <div className={`rounded-2xl border border-border bg-surface shadow-sm flex flex-col overflow-hidden transition-all duration-200 ${isEditing ? "ring-2 ring-primary/30" : ""}`}>
            {/* Header */}
            <div className={`px-5 py-4 border-b border-border flex items-center justify-between gap-4 ${meta.accentClass}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${meta.badgeClass}`}>
                        <Server className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-extrabold text-foreground">{meta.label}</h2>
                        <p className="text-xs text-foreground-muted font-medium">
                            Type: <span className="font-mono font-bold">{type}</span>
                        </p>
                    </div>
                </div>
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${setting.isActive
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"}`}
                >
                    {setting.isActive ? <ShieldCheck className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                    {setting.isActive ? "Active" : "Inactive"}
                </span>
            </div>

            <div className="flex-1 p-5">
                {/* ── View Mode ── */}
                {!isEditing && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <InfoRow label="Host"       value={setting.host}                                icon={<Server className="w-3 h-3" />} />
                            <InfoRow label="Port"       value={setting.port?.toString()}                    icon={<Wifi className="w-3 h-3" />} />
                            <InfoRow label="Username"   value={setting.username}                            icon={<Lock className="w-3 h-3" />} mono />
                            <div className="bg-bg/50 border border-border rounded-xl p-3 flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                                    <Lock className="w-3 h-3" />Password
                                </span>
                                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full w-fit border ${
                                    setting.hasPassword
                                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                                        : "bg-border/30 text-foreground-muted border-border"
                                }`}>
                                    {setting.hasPassword ? "✓ Đã cấu hình" : "Chưa đặt"}
                                </span>
                            </div>
                            <InfoRow label="SSL"        value={setting.enableSSL ? "Enabled" : "Disabled"} icon={<ShieldCheck className="w-3 h-3" />} />
                            <InfoRow label="From Email" value={setting.fromEmail}                           icon={<Mail className="w-3 h-3" />} />
                            <InfoRow label="From Name"  value={setting.fromName}                            icon={<Mail className="w-3 h-3" />} />
                        </div>
                        {setting.updatedAt && (
                            <p className="text-xs text-foreground-muted">
                                Cập nhật lần cuối: <span className="font-semibold">{formatDateTime(setting.updatedAt)}</span>
                            </p>
                        )}

                        <div className="flex flex-wrap gap-2 pt-1">
                            <button onClick={onRequestEdit}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/20">
                                <Settings className="w-4 h-4" /> Chỉnh sửa
                            </button>
                            <button
                                onClick={() => setShowTestPanel(v => !v)}
                                className={`flex items-center gap-2 px-4 py-2 border text-sm font-bold rounded-lg transition-all active:scale-95 ${showTestPanel
                                    ? "bg-amber-500/20 text-amber-600 border-amber-500/30"
                                    : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"}`}
                            >
                                <FlaskConical className="w-4 h-4" /> Test SMTP
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center gap-2 px-4 py-2 border border-red-500/20 bg-red-500/10 text-red-500 text-sm font-bold rounded-lg hover:bg-red-500/20 transition-all active:scale-95 ml-auto"
                            >
                                <Trash2 className="w-4 h-4" /> Xóa
                            </button>
                        </div>

                        {showTestPanel && (
                            <form onSubmit={handleTest} className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-3">
                                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                                    <FlaskConical className="w-3.5 h-3.5" /> Gửi Email Kiểm Tra
                                </p>
                                <div className="grid grid-cols-1 gap-3">
                                    <FormField label="Email nhận" icon={<Mail className="w-3 h-3" />} required>
                                        <input type="email" required placeholder="test@example.com" className={inputCls}
                                            value={testForm.toEmail}
                                            onChange={e => setTestForm(f => ({ ...f, toEmail: e.target.value }))} />
                                    </FormField>
                                    <FormField label="Tiêu đề">
                                        <input type="text" className={inputCls} value={testForm.subject ?? ""}
                                            onChange={e => setTestForm(f => ({ ...f, subject: e.target.value }))} />
                                    </FormField>
                                    <FormField label="Nội dung">
                                        <textarea rows={3} className={inputCls} value={testForm.body ?? ""}
                                            onChange={e => setTestForm(f => ({ ...f, body: e.target.value }))} />
                                    </FormField>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setShowTestPanel(false)}
                                        className="px-4 py-2 border border-border text-foreground text-sm font-bold rounded-lg hover:bg-border/50 transition-all">
                                        Đóng
                                    </button>
                                    <button type="submit" disabled={testLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-lg hover:bg-amber-600 disabled:opacity-50 active:scale-95">
                                        {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizonal className="w-4 h-4" />}
                                        Gửi Test
                                    </button>
                                </div>
                            </form>
                        )}
                        
                        <ActionConfirmModal
                            isOpen={showDeleteModal}
                            onClose={() => setShowDeleteModal(false)}
                            onConfirm={handleDelete}
                            title={`Xóa cấu hình ${meta.label}`}
                            description={
                                <div>
                                    <p className="text-foreground -mt-2">
                                        Bạn có chắc chắn muốn xóa cấu hình SMTP cho loại{" "}
                                        <span className="font-bold">{type}</span> không?
                                    </p>
                                    <p className="text-sm text-foreground-muted mt-2">
                                        Thao tác này không thể hoàn tác, email từ hệ thống sử dụng kênh này sẽ không được gửi cho đến khi được thiết lập lại.
                                    </p>
                                </div>
                            }
                            confirmText="Xóa Cấu Hình"
                            cancelText="Hủy"
                            variant="danger"
                            loading={deleting}
                            icon={<Trash2 className="w-6 h-6 text-red-500 bg-red-500/10 p-1 rounded-md" />}
                        />
                    </div>
                )}

                {/* ── Edit Form ── */}
                {isEditing && (
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="Host" icon={<Server className="w-3 h-3" />} required>
                                <input type="text" required placeholder="smtp.example.com" className={inputCls}
                                    value={form.host} onChange={e => setForm(f => ({ ...f, host: e.target.value }))} />
                            </FormField>
                            <FormField label="Port" icon={<Wifi className="w-3 h-3" />} required>
                                <input type="number" required min={1} max={65535} className={inputCls}
                                    value={form.port} onChange={e => setForm(f => ({ ...f, port: parseInt(e.target.value) || 587 }))} />
                            </FormField>
                            <FormField label="Username" icon={<Lock className="w-3 h-3" />}>
                                <input type="text" placeholder="your@email.com" className={inputCls}
                                    value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                            </FormField>
                            <FormField label="Password" icon={<Lock className="w-3 h-3" />}>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder={setting.hasPassword ? "•••••••• (để trống = giữ nguyên)" : "Nhập mật khẩu SMTP mới"}
                                        className={`${inputCls} pr-10`}
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        autoComplete="new-password"
                                    />
                                    <button type="button" onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </FormField>
                            <FormField label="From Email" icon={<Mail className="w-3 h-3" />} required>
                                <input type="email" required placeholder="noreply@example.com" className={inputCls}
                                    value={form.fromEmail} onChange={e => setForm(f => ({ ...f, fromEmail: e.target.value }))} />
                            </FormField>
                            <FormField label="From Name" icon={<Mail className="w-3 h-3" />}>
                                <input type="text" placeholder="CocoQR System" className={inputCls}
                                    value={form.fromName} onChange={e => setForm(f => ({ ...f, fromName: e.target.value }))} />
                            </FormField>
                        </div>
                        <div className="flex flex-wrap gap-4 pt-1">
                            <StatusToggle id={`enableSSL-${type}`} name={`enableSSL-${type}`}
                                label="Enable SSL" checked={form.enableSSL} onChange={handleToggle("enableSSL")} />
                            <StatusToggle id={`isActive-${type}`} name={`isActive-${type}`}
                                label="Active" checked={form.isActive} onChange={handleToggle("isActive")} />
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-border">
                            <button type="button" onClick={onCancelEdit}
                                className="px-5 py-2 border border-border text-foreground text-sm font-bold rounded-lg hover:bg-border/50 transition-all">
                                Hủy
                            </button>
                            <button type="submit" disabled={savingEdit}
                                className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95">
                                {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Lưu thay đổi
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
});
