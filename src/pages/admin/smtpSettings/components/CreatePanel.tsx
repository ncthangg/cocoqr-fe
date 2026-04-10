import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { Plus, X, Settings, ChevronDown, Server, Wifi, Lock, Eye, EyeOff, Mail, Loader2 } from "lucide-react";
import type { SmtpSettingRes } from "@/models/entity.model";
import type { PutSmtpSettingReq } from "@/models/entity.request.model";
import { smtpSettingApi } from "@/services/smtp-setting-api.service";
import StatusToggle from "@/components/UICustoms/Form/StatusToggle";
import { FormField } from "./FormField";
import { type SmtpTypeKey, getPanelMeta, EMPTY_FORM, inputCls } from "../utils";

export interface CreatePanelProps {
    isOpen: boolean;
    availableTypes: SmtpTypeKey[];
    onCreated: (res: SmtpSettingRes) => void;
    onClose: () => void;
}

export function CreatePanel({ isOpen, availableTypes, onCreated, onClose }: CreatePanelProps) {
    //#region States & Refs
    const [selectedType, setSelectedType] = useState<SmtpTypeKey>(availableTypes[0]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState<Omit<PutSmtpSettingReq, "type">>(EMPTY_FORM);
    const dropdownRef = useRef<HTMLDivElement>(null);
    //#endregion

    //#region Side Effects
    useEffect(() => {
        if (isOpen && availableTypes.length > 0) {
            setSelectedType(availableTypes[0]);
            setForm(EMPTY_FORM);
            setShowPassword(false);
            setShowDropdown(false);
        }
    }, [isOpen, availableTypes]);

    useEffect(() => {
        const handle = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setShowDropdown(false);
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);
    //#endregion

    //#region Handlers
    const handleToggle = useCallback(
        (field: "enableSSL" | "isActive") => (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm(prev => ({ ...prev, [field]: e.target.checked })),
        []
    );

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.host.trim()) return toast.error("Host không được để trống.");
        if (!form.fromEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.fromEmail))
            return toast.error("From Email không hợp lệ.");
        if (form.port <= 0 || form.port > 65535) return toast.error("Port phải từ 1 đến 65535.");

        setSaving(true);
        try {
            const res = await smtpSettingApi.put({ ...form, type: selectedType });
            onCreated(res);
        } finally {
            setSaving(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };
    //#endregion

    //#region Render
    if (!isOpen || !availableTypes.length) return null;

    const selectedMeta = getPanelMeta(selectedType || availableTypes[0]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-surface border border-border max-w-modal-lg w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4 bg-primary/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <Plus className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-foreground">Tạo cấu hình SMTP mới</h2>
                            <p className="text-xs text-foreground-muted font-medium">Chọn loại và điền thông tin.</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-border/50 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5">
                    <form onSubmit={handleSave} className="space-y-4">
                        {/* Type Selector */}
                        <div className="space-y-1.5">
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-foreground-muted uppercase tracking-wider">
                                <Settings className="w-3 h-3" /> Loại SMTP <span className="text-red-500">*</span>
                            </span>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowDropdown(v => !v)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 bg-bg border border-border rounded-lg text-sm font-semibold text-foreground hover:border-primary/50 transition-all ${showDropdown ? "ring-2 ring-primary/50 border-primary" : ""}`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${selectedMeta.badgeClass.split(" ")[0].replace("/10", "/80")}`} />
                                        {selectedType}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-foreground-muted transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                                </button>
                                {showDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-surface border border-border rounded-xl shadow-xl overflow-hidden">
                                        {availableTypes.map(t => {
                                            const m = getPanelMeta(t);
                                            return (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => { setSelectedType(t); setShowDropdown(false); }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-left hover:bg-primary/5 transition-colors ${t === selectedType ? "bg-primary/10 text-primary" : "text-foreground"}`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.badgeClass.split(" ")[0].replace("/10", "")}`} />
                                                    {t}
                                                    <span className="text-xs text-foreground-muted font-normal ml-auto">{m.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                        placeholder="Mật khẩu SMTP"
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
                            <StatusToggle id={`enableSSL-new`} name="enableSSL-new" label="Enable SSL"
                                checked={form.enableSSL} onChange={handleToggle("enableSSL")} />
                            <StatusToggle id={`isActive-new`} name="isActive-new" label="Active"
                                checked={form.isActive} onChange={handleToggle("isActive")} />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-border">
                            <button type="button" onClick={onClose}
                                className="px-5 py-2 border border-border text-foreground text-sm font-bold rounded-lg hover:bg-border/50 transition-all">
                                Hủy
                            </button>
                            <button type="submit" disabled={saving}
                                className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Tạo cấu hình
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
    //#endregion
}

