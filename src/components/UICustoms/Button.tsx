import clsx from "clsx";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import Spinner from "./Snipper";

type ButtonSize = "small" | "medium" | "large";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size" | "value" | "onClick" | "type" | "disabled" | "className"> {
    value?: ReactNode;
    children?: ReactNode;
    onClick?: () => void;
    size?: ButtonSize;
    width?: string;  // ví dụ "w-40"
    height?: string; // ví dụ "h-12"
    bgColor?: string; // bg-blue-500
    textColor?: string; // text-white
    hoverColor?: string; // hover:bg-blue-600
    icon?: ReactNode; // icon phía trước
    className?: string; // thêm class tùy chỉnh
    disabled?: boolean;
    loading?: boolean;
    type?: "button" | "submit" | "reset";
}

export default function Button({
    value,
    children,
    onClick,
    size = "medium",
    width,
    height,
    bgColor,
    textColor,
    hoverColor,
    icon,
    className,
    disabled = false,
    loading = false,
    type = "button",
    ...rest
}: ButtonProps) {

    const sizeClasses = {
        small: "px-3 py-1 text-sm",
        medium: "px-4 py-2 text-base",
        large: "px-6 py-3 text-lg",
    };

    const handleClick = () => {
        onClick?.();
    };

    return (
        <button
            type={type}
            onClick={handleClick}
            disabled={disabled || loading}
            className={clsx(
                "btn",
                sizeClasses[size],
                bgColor && bgColor,
                textColor && textColor,
                hoverColor && hoverColor,
                width,
                height,
                className,
                (disabled || loading) && "opacity-60 cursor-not-allowed"
            )}
            {...rest}
        >
            {loading && <Spinner size={size === "small" ? "sm" : size === "medium" ? "md" : "lg"} />}
            {!loading && icon && <span className="text-lg">{icon}</span>}
            {children || value}
        </button>
    );
}
