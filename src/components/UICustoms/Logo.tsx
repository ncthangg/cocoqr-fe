import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    size?: number | string;
    variant?: "auto" | "dark" | "light";
}

const Logo = ({ className = "h-9 w-9", size, variant = "auto" }: LogoProps) => {
    const dimension = typeof size === "number" ? `${size}px` : size;
    const style = dimension ? { width: dimension, height: dimension } : undefined;

    if (variant === "dark") {
        return (
            <img
                src="/qr-code-dark.svg"
                alt="CocoQR"
                className={cn(className, "select-none cursor-default")}
                style={style}
            />
        );
    }

    if (variant === "light") {
        return (
            <img
                src="/qr-code-light.svg"
                alt="CocoQR"
                className={cn(className, "select-none cursor-default")}
                style={style}
            />
        );
    }

    return (
        <>
            <img
                src="/qr-code-dark.svg"
                alt="CocoQR"
                className={cn(className, "dark:hidden")}
                style={style}
            />
            <img
                src="/qr-code-light.svg"
                alt="CocoQR"
                className={cn(className, "hidden dark:block")}
                style={style}
            />
        </>
    );
};

export default Logo;