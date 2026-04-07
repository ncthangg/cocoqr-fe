import React from "react";
import { resolveAvatarPreview } from "@/utils/imageConvertUtils";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
    /** URL of the logo image */
    logoUrl?: string | null;
    /** Display name for alt text and fallback */
    name?: string;
    /** Short code (e.g. VCB, MOMO) for initials fallback */
    code?: string;
    /** Predefined sizes for the logo container */
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "none";
    /** Custom classes for the container */
    className?: string;
    /** Whether to show a shadow (light theme only by default via shadow-sm) */
    shadow?: "none" | "sm" | "md" | "lg";
    /** Whether to show a border */
    border?: boolean;
    /** If true, the background will be transparent instead of white when a logo exists */
    transparent?: boolean;
}

/**
 * BrandLogo component for displaying bank or provider logos consistently.
 * Handles theme-compatible white backgrounds for brand images and muted backgrounds for placeholders.
 */
const BrandLogo: React.FC<BrandLogoProps> = ({
    logoUrl,
    name,
    code,
    size = "md",
    className,
    shadow = "sm",
    border = true,
    transparent = false,
}) => {
    // Standardized size mapping
    const sizeClasses = {
        xs: "w-6 h-6 rounded-md p-0.5",
        sm: "w-10 h-10 rounded-xl p-1",
        md: "w-16 h-16 rounded-2xl p-2",
        lg: "w-24 h-24 rounded-2xl p-3",
        xl: "w-32 h-32 rounded-2xl p-4",
        none: "",
    };

    const textSizes = {
        xs: "text-[8px]",
        sm: "text-[10px]",
        md: "text-sm",
        lg: "text-lg",
        xl: "text-2xl",
        none: "",
    };

    const shadowClasses = {
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
    };

    // Fallback logic: use code (max 4 chars) or name (max 2 chars)
    const initials = code
        ? code.substring(0, 3).toUpperCase()
        : (name || "BK").substring(0, 3).toUpperCase();

    return (
        <div
            className={cn(
                "flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300",
                // Brand logos usually require white background to look correct
                !transparent && logoUrl ? "bg-white" : "bg-transparent",
                size !== "none" && sizeClasses[size],
                shadow !== "none" && shadowClasses[shadow],
                border && "border border-border",
                className
            )}
        >
            {logoUrl ? (
                <img
                    src={resolveAvatarPreview(logoUrl)}
                    alt={name || "Brand"}
                    className="w-full h-full object-contain mix-blend-normal animate-in fade-in duration-500"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-full bg-surface-muted rounded-md flex items-center justify-center">
                    <span className={cn(
                        "font-black text-foreground tracking-tighter uppercase whitespace-nowrap",
                        size !== "none" && textSizes[size]
                    )}>
                        {initials}
                    </span>
                </div>
            )}
        </div>
    );
};

export default React.memo(BrandLogo);
