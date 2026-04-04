import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { Server, Loader2, Plus } from "lucide-react";
import type { SmtpSettingRes } from "@/models/entity.model";
import { smtpSettingApi } from "@/services/smtp-setting-api.service";
import { SmtpPanel } from "./components/SmtpPanel";
import { CreatePanel } from "./components/CreatePanel";
import { type SmtpTypeKey, ALL_SMTP_TYPES, normaliseType } from "./utils";
import RefreshButton from "@/components/UICustoms/RefreshButton";

const SmtpSettingsPage: React.FC = () => {
    // Keyed by UPPER_CASE SmtpTypeKey — normalised on ingest
    const [settingsMap, setSettingsMap] = useState<Partial<Record<SmtpTypeKey, SmtpSettingRes>>>({});
    const [loading, setLoading]         = useState(false);
    const [editingType, setEditingType] = useState<SmtpTypeKey | null>(null);
    const [showCreate, setShowCreate]   = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const list = await smtpSettingApi.get();
            const map: Partial<Record<SmtpTypeKey, SmtpSettingRes>> = {};
            list.forEach(s => {
                // Normalise "Support" → "SUPPORT", "System" → "SYSTEM", etc.
                const key = normaliseType(s.type as string);
                if (key) map[key] = { ...s, type: key };   // store normalised type
            });
            setSettingsMap(map);
        } catch {
            toast.error("Không thể tải cài đặt SMTP.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleSaved = useCallback((updated: SmtpSettingRes) => {
        const key = normaliseType(updated.type as string) ?? (updated.type as SmtpTypeKey);
        setSettingsMap(prev => ({ ...prev, [key]: { ...updated, type: key } }));
    }, []);

    const handleCreated = useCallback((res: SmtpSettingRes) => {
        handleSaved(res);
        setShowCreate(false);
    }, [handleSaved]);

    const handleDeleted = useCallback((type: SmtpTypeKey) => {
        setSettingsMap(prev => {
            const next = { ...prev };
            delete next[type];
            return next;
        });
    }, []);

    // Types that already have a setting — shown as panels
    const configuredTypes = ALL_SMTP_TYPES.filter(t => settingsMap[t]);
    // Types not yet configured — available in the Add dropdown
    const availableTypes  = ALL_SMTP_TYPES.filter(t => !settingsMap[t]);

    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">SMTP Settings</h1>
                    <p className="text-sm text-foreground-muted font-medium">
                        Quản lý cấu hình máy chủ gửi email. Mỗi loại SMTP có một cấu hình riêng.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm font-bold text-foreground-muted">
                        <Server className="w-4 h-4" />
                        <span>{configuredTypes.length} / {ALL_SMTP_TYPES.length} configured</span>
                    </div>
                    {availableTypes.length > 0 && !showCreate && (
                        <button
                            onClick={() => { setShowCreate(true); setEditingType(null); }}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/20"
                        >
                            <Plus className="w-4 h-4" /> Thêm cấu hình
                        </button>
                    )}
                    <RefreshButton 
                        onRefresh={fetchAll}
                        loading={loading}
                        className="rounded-full"
                    />
                </div>
            </div>

            {loading && configuredTypes.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-9 h-9 text-primary animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Existing settings */}
                    {configuredTypes.map(type => (
                        <SmtpPanel
                            key={type}
                            type={type}
                            setting={settingsMap[type]!}
                            onSaved={handleSaved}
                            onDeleted={handleDeleted}
                            isEditing={editingType === type}
                            onRequestEdit={() => { setEditingType(type); setShowCreate(false); }}
                            onCancelEdit={() => setEditingType(null)}
                        />
                    ))}

                    {/* Empty state */}
                    {configuredTypes.length === 0 && !showCreate && !loading && (
                        <div className="xl:col-span-2 flex flex-col items-center justify-center py-16 text-center text-foreground-muted gap-4 border border-dashed border-border rounded-2xl">
                            <div className="p-5 bg-border/10 rounded-full">
                                <Server className="w-10 h-10 opacity-20" />
                            </div>
                            <div>
                                <p className="text-base font-semibold">Chưa có cấu hình SMTP nào.</p>
                                <p className="text-sm mt-1">Nhấn <span className="text-primary font-bold">Thêm cấu hình</span> để bắt đầu.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create new modal */}
            <CreatePanel
                isOpen={showCreate && availableTypes.length > 0}
                availableTypes={availableTypes}
                onCreated={handleCreated}
                onClose={() => setShowCreate(false)}
            />
        </div>
    );
};

export default SmtpSettingsPage;
