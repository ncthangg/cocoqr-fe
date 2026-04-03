import React from "react";

export function InfoRow({ label, value, icon, mono }: {
    label: string; value?: string; icon?: React.ReactNode; mono?: boolean;
}) {
    return (
        <div className="bg-bg/50 border border-border rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                {icon}{label}
            </span>
            <span className={`text-sm text-foreground truncate ${mono ? "font-mono" : "font-semibold"}`}>
                {value || <span className="text-foreground-muted italic font-normal text-xs">Chưa cấu hình</span>}
            </span>
        </div>
    );
}
