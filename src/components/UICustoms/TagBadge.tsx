import React from "react";
import { cn } from "@/lib/utils";

export type BadgeColor = 'blue' | 'purple' | 'green' | 'amber' | 'red' | 'gray' | 'indigo' | 'cyan' | 'pink';

interface TagBadgeProps {
    label: string | React.ReactNode;
    color?: BadgeColor;
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    className?: string;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ 
    label, 
    color = 'gray', 
    size = 'md', 
    icon,
    className 
}) => {
    const colorClasses: Record<BadgeColor, string> = {
        blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        green: "bg-green-500/10 text-green-500 border-green-500/20",
        amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        red: "bg-red-500/10 text-red-500 border-red-500/20",
        gray: "bg-surface-muted text-foreground-muted border-border",
        indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
        cyan: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
        pink: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    };

    const sizeClasses = {
        sm: "px-2 py-0.5 text-[10px] uppercase font-bold",
        md: "px-3 py-1 text-xs font-semibold",
        lg: "px-4 py-1.5 text-sm font-bold uppercase tracking-wider"
    };

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 rounded-full border transition-all duration-200 shadow-sm whitespace-nowrap",
            colorClasses[color],
            sizeClasses[size],
            className
        )}>
            {icon && <span className={cn(
                size === 'sm' ? "w-2.5 h-2.5" : size === 'lg' ? "w-4 h-4" : "w-3.5 h-3.5"
            )}>{icon}</span>}
            {label}
        </span>
    );
};
