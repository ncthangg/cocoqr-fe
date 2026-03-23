import { Loader } from "lucide-react";
import clsx from "clsx";

type SpinnerProps = {
    size?: "sm" | "md" | "lg";
    className?: string;
};

/**
 * Standard inline spinner, primarily used for buttons or small loading contexts.
 */
export function Spinner({ size = "md", className = "" }: SpinnerProps) {
    const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };

    return (
        <div
            className={clsx(
                sizes[size],
                "border-4 border-surface-muted border-t-primary rounded-full animate-spin",
                className
            )}
        ></div>
    );
}

type DataLoaderProps = {
    size?: "sm" | "md" | "lg" | "xl";
    text?: string | null;
    className?: string;
};

/**
 * Component for full-page or section loading, with an icon circle and optional text.
 */
export function DataLoader({ 
    size = "lg", 
    text = "Đang tải dữ liệu...", 
    className = "" 
}: DataLoaderProps) {
    const iconSizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8", xl: "w-12 h-12" };
    const containerSizes = { sm: "w-8 h-8", md: "w-12 h-12", lg: "w-16 h-16", xl: "w-24 h-24" };

    return (
        <div className={clsx("flex flex-col items-center justify-center gap-sm", className)}>
            <div className={clsx(containerSizes[size], "rounded-full bg-surface-muted flex items-center justify-center shrink-0")}>
                <Loader className={clsx(iconSizes[size], "text-foreground-muted animate-spin")} />
            </div>
            {text && <p className="text-foreground-muted font-medium text-sm">{text}</p>}
        </div>
    );
}

export default Spinner;
