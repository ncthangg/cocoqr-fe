import React from "react";
import { cn } from "@/lib/utils";
import { EmailLogStatus } from "@/models/enum";

type StatusBadgeProps = {
    status: boolean | string | undefined | null;
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

    const getStatusStyle = () => {
        // Case 1: Boolean
        if (typeof status === 'boolean') {
            return status
                ? "bg-success/10 text-success border border-success/20"
                : "bg-danger/10 text-danger border border-danger/20";
        }

        // Case 2: String/Enum
        if (typeof status === 'string') {
            const upStatus = status.toUpperCase();
            if (upStatus === EmailLogStatus.SUCCESS || upStatus === 'SENT') {
                return "bg-success/10 text-success border border-success/20";
            }
            if (upStatus === EmailLogStatus.PENDING) {
                return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            }
            if (upStatus === EmailLogStatus.FAIL || upStatus === 'FAILED') {
                return "bg-danger/10 text-danger border border-danger/20";
            }
        }

        // Default
        return "bg-border/20 text-foreground-muted border border-border/10";
    };

    const getStatusText = () => {
        if (typeof status === 'boolean') {
            return status ? activeText : inactiveText;
        }
        if (typeof status === 'string') {
            switch (status.toUpperCase()) {
                case EmailLogStatus.SUCCESS:
                case 'SENT':
                    return activeText === "Active" ? "Thành công" : activeText;
                case EmailLogStatus.PENDING:
                    return inactiveText === "Inactive" ? "Đang chờ" : inactiveText;
                case EmailLogStatus.FAIL:
                case 'FAILED':
                    return inactiveText === "Inactive" ? "Thất bại" : inactiveText;
                default:
                    return status;
            }
        }
        return inactiveText;
    };

    return (
        <span
            className={cn(
                "rounded-full inline-flex items-center gap-1.5 transition-all duration-200 shadow-sm whitespace-nowrap",
                sizeClasses[size],
                getStatusStyle(),
                className
            )}
        >
            {icon && <span className={cn(
                size === 'sm' ? "w-2.5 h-2.5" : size === 'lg' ? "w-5 h-5" : "w-3.5 h-3.5"
            )}>{icon}</span>}
            {getStatusText()}
        </span>
    );
}