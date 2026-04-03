import React from "react";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
    status: boolean | undefined | null;
    icon?: React.ReactNode;
    activeText?: string;
    inactiveText?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function StatusBadge({ 
    status, 
    icon, 
    activeText = "Active", 
    inactiveText = "Inactive", 
    size = 'md',
    className
}: StatusBadgeProps) {
    
    const sizeClasses = {
        sm: "px-2 py-0.5 text-[10px] uppercase font-bold",
        md: "px-3 py-1 text-xs font-semibold",
        lg: "px-4 py-1.5 text-sm font-bold uppercase tracking-wider"
    };

    const statusClasses = status
        ? "bg-success/10 text-success border border-success/20"
        : "bg-danger/10 text-danger border border-danger/20";

    return (
        <span
            className={cn(
                "rounded-full inline-flex items-center gap-1.5 transition-all duration-200 shadow-sm",
                sizeClasses[size],
                statusClasses,
                className
            )}
        >
            {icon && <span className={cn(
                size === 'sm' ? "w-2.5 h-2.5" : size === 'lg' ? "w-4 h-4" : "w-3.5 h-3.5"
            )}>{icon}</span>}
            {status ? activeText : inactiveText}
        </span>
    );
}