import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import clsx from "clsx";

interface RefreshButtonProps {
    onRefresh: () => void | Promise<void>;
    loading?: boolean;
    cooldownMs?: number;
    className?: string;
    title?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
    onRefresh,
    loading = false,
    cooldownMs = 10000,
    className = "",
    title = "Tải lại"
}) => {
    const [cooldown, setCooldown] = useState(0);
    const isCooldownActive = cooldown > 0;

    useEffect(() => {
        if (!isCooldownActive) return;
        const timer = setInterval(() => {
            setCooldown((prev) => Math.max(0, prev - 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [isCooldownActive]);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (loading || isCooldownActive) return;

        onRefresh();
        setCooldown(cooldownMs);
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading || isCooldownActive}
            className={clsx(
                "p-2.5 rounded-xl border border-border text-foreground-muted hover:text-foreground hover:bg-border/50 transition-all duration-300 relative group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
            title={isCooldownActive ? `Đợi ${Math.ceil(cooldown / 1000)}s` : title}
        >
            <RefreshCw
                className={clsx(
                    "w-4 h-4",
                    loading ? "animate-spin" : !isCooldownActive && "group-hover:rotate-180 transition-transform duration-500"
                )}
            />

            {isCooldownActive && !loading && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white font-bold leading-none ring-2 ring-surface animate-in zoom-in duration-200">
                    {Math.ceil(cooldown / 1000)}
                </span>
            )}
        </button>
    );
};

export default React.memo(RefreshButton);
