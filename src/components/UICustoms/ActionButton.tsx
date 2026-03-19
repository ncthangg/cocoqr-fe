import React from "react";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
    icon: React.ReactNode;
    onClick: () => void;
    color: 'blue' | 'red' | 'amber' | 'gray';
    title: string;
    className?: string;
    disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
    icon, 
    onClick, 
    color, 
    title, 
    className,
    disabled = false 
}) => {
    const colors = {
        blue: "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-primary/20",
        red: "bg-danger/10 text-danger hover:bg-danger hover:text-white border-danger/20",
        amber: "bg-warning/10 text-warning hover:bg-warning hover:text-white border-warning/20",
        gray: "bg-surface-muted text-foreground-muted hover:bg-foreground hover:text-bg border-border"
    };

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            title={title}
            disabled={disabled}
            className={cn(
                "p-sm rounded-xl border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed", 
                colors[color],
                className
            )}
        >
            {icon}
        </button>
    );
};

export default ActionButton;
