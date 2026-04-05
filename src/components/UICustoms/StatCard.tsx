import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    prefix?: string;
    isText?: boolean;
    className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
    label, 
    value, 
    icon, 
    color, 
    prefix, 
    isText,
    className
}) => {
    const colorClasses: Record<string, string> = {
        blue: "bg-primary/10 text-primary border-primary/20",
        green: "bg-success/10 text-success border-success/20",
        amber: "bg-warning/10 text-warning border-primary/20",
        purple: "bg-primary/20 text-primary border-primary/30",
        red: "bg-danger/10 text-danger border-danger/20",
    };

    return (
        <div className={cn("p-md bg-surface rounded-2xl border border-border shadow-sm flex items-center gap-md group hover:border-primary transition-all duration-300", className)}>
            <div className={cn("p-sm rounded-2xl border transition-all duration-300 group-hover:scale-110", colorClasses[color] || colorClasses.blue)}>
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-primary font-bold text-foreground-muted uppercase tracking-widest">{label}</span>
                <div className="flex items-baseline gap-xs">
                    <span className={cn("text-xl font-secondary font-black text-foreground", isText && "text-base")}>{value}</span>
                    {prefix && <span className="text-xs font-primary font-bold text-foreground-muted">{prefix}</span>}
                </div>
            </div>
        </div>
    );
};
