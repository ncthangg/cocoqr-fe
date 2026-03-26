import React from "react";
import { cn } from "@/lib/utils";

interface StatusToggleProps {
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string; // Legacy fixed label
    checkedLabel?: string;
    uncheckedLabel?: string;
    subtext?: string;
    checkedSubtext?: string;
    uncheckedSubtext?: string;
    id?: string;
    name?: string;
    disabled?: boolean;
    className?: string;
}

const StatusToggle: React.FC<StatusToggleProps> = ({
    checked,
    onChange,
    label,
    checkedLabel = "Đang hoạt động",
    uncheckedLabel = "Ngừng hoạt động",
    subtext,
    checkedSubtext,
    uncheckedSubtext,
    id = "status-toggle",
    name = "isActive",
    disabled = false,
    className
}) => {
    const displayLabel = label || (checked ? checkedLabel : uncheckedLabel);
    const displaySubtext = subtext || (checked ? checkedSubtext : uncheckedSubtext);
    
    return (
        <label 
            className={cn(
                "flex items-center gap-sm py-sm px-md rounded-xl border border-border cursor-pointer transition-all group select-none",
                checked ? "bg-success/5 border-success/30" : "bg-danger/5 border-danger/30",
                disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-surface-muted/50",
                className
            )}
        >
            <div className="relative h-6 w-11 flex-shrink-0">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    name={name}
                    id={id}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                />
                <div 
                    className={cn(
                        "w-11 h-6 rounded-full transition-all border border-border/50",
                        "bg-danger peer-checked:bg-success",
                        // Switch handle (dot)
                        "after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all",
                        "after:bg-zinc-950 dark:after:bg-white", // Light mode: black dot, Dark mode: white dot
                        "after:border after:border-border/20 shadow-sm",
                        "peer-checked:after:translate-x-full peer-checked:after:border-white"
                    )}
                />
            </div>
            <div className="flex flex-col gap-0">
                <span className={cn(
                    "text-sm font-semibold transition-colors",
                    checked ? "text-success group-hover:text-success/80" : "text-danger group-hover:text-danger/80",
                    disabled ? "" : "group-hover:text-foreground"
                )}>
                    {displayLabel}
                </span>
                {displaySubtext && (
                    <span className="text-[11px] leading-tight text-foreground-muted select-none">
                        {displaySubtext}
                    </span>
                )}
            </div>
        </label>
    );
};

export default React.memo(StatusToggle);
