import React from 'react';
import { Rocket, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

interface FeatureFutureProps {
    /**
     * 'full': Dùng cho toàn bộ trang (center vertically/horizontally)
     * 'section': Dùng cho một phần nhỏ trong trang hoặc component
     */
    variant?: 'full' | 'section';
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    className?: string;
}

/**
 * Component hiển thị trạng thái "Tính năng đang phát triển"
 * Mang phong cách hiện đại, premium với hiệu ứng glassmorphism và animation nhẹ.
 */
const FeatureFuture: React.FC<FeatureFutureProps> = ({
    variant = 'section',
    title = 'Tính năng đang được phát triển',
    description = 'Chúng tôi đang nỗ lực hoàn thiện tính năng này để mang lại trải nghiệm tốt nhất cho bạn. Vui lòng quay lại sau!',
    icon,
    className,
}) => {
    const isFull = variant === 'full';

    return (
        <div
            className={cn(
                'relative flex flex-col items-center justify-center overflow-hidden transition-all duration-500',
                'animate-in fade-in zoom-in duration-700 select-none cursor-default',
                isFull
                    ? 'min-h-[60vh] w-full p-2xl'
                    : 'card min-h-64 w-full bg-surface-muted/30 backdrop-blur-sm',
                className
            )}
        >
            {/* Decorative Background Elements */}
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl animate-pulse pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl animate-pulse pointer-events-none" />

            <div className="relative flex flex-col items-center text-center space-y-md">
                {/* Icon Container */}
                <div className="relative group">
                    <div className="absolute -inset-4 blur-xl bg-primary/10 rounded-full group-hover:bg-primary/20 transition-all duration-500 animate-pulse" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-border-strong bg-surface-elevated shadow-md transition-transform duration-500 group-hover:scale-110">
                        {icon || (
                            <Rocket className={cn(
                                "text-primary transition-transform duration-500",
                                isFull ? "h-10 w-10" : "h-8 w-8 text-primary"
                            )} />
                        )}
                        {/* Status dot */}
                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-warning border-2 border-surface shadow-sm animate-bounce" />
                    </div>
                    <Sparkles className="absolute -bottom-2 -left-2 h-6 w-6 text-warning/50 animate-pulse" />
                </div>

                {/* Text Content */}
                <div className="space-y-sm">
                    <h3 className={cn(
                        "font-bold text-foreground tracking-tight leading-tight",
                        isFull ? "text-3xl" : "text-xl"
                    )}>
                        {title}
                    </h3>
                    <p className={cn(
                        "text-foreground-secondary leading-relaxed mx-auto max-w-[90%]",
                        isFull ? "text-lg" : "text-sm"
                    )}>
                        {description}
                    </p>
                </div>

                {/* "Coming Soon" Label for Full Variant */}
                <div className="flex items-center gap-md pt-lg animate-in slide-in-from-bottom-2 duration-1000">
                    <span className="h-[1px] w-12 bg-border-strong/30" />
                    <span className="text-[10px] uppercase font-black tracking-[0.3em] text-foreground-muted">
                        Coming Soon
                    </span>
                    <span className="h-[1px] w-12 bg-border-strong/30" />
                </div>
            </div>

            {/* Subtle light streak animation */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
        </div>
    );
};

export default FeatureFuture;
