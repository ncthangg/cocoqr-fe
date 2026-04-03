import React from "react";

export function FormField({ label, icon, children, required }: {
    label: string; icon?: React.ReactNode; children: React.ReactNode; required?: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-foreground-muted uppercase tracking-wider">
                {icon}{label}
                {required && <span className="text-red-500">*</span>}
            </span>
            {children}
        </div>
    );
}
