import clsx from "clsx";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import Spinner from "./Snipper";

type ButtonSize = "small" | "medium" | "large";
type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size" | "value" | "onClick" | "type" | "disabled" | "className"> {
    value?: ReactNode;
    children?: ReactNode;
    onClick?: () => void;
    size?: ButtonSize;
    width?: string;
    height?: string;
    variant?: ButtonVariant;
    icon?: ReactNode;
    className?: string;
    disabled?: boolean;
    loading?: boolean;
    type?: "button" | "submit" | "reset";
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline",
    danger: "btn-danger",
    ghost: "btn-ghost",
};

export default function Button({
    value,
    children,
    onClick,
    size = "medium",
    width,
    height,
    variant,
    icon,
    className,
    disabled = false,
    loading = false,
    type = "button",
    ...rest
}: ButtonProps) {

    const sizeClasses: Record<ButtonSize, string> = {
        small: "px-sm py-xs text-sm",
        medium: "px-md py-sm text-base",
        large: "px-lg py-md text-lg",
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
                variant && variantClasses[variant],
                sizeClasses[size],
                width,
                height,
                className,
                (disabled || loading) && "opacity-50 cursor-not-allowed"
            )}
            {...rest}
        >
            {loading && <Spinner size={size === "small" ? "sm" : size === "medium" ? "md" : "lg"} />}
            {!loading && icon && <span className="text-lg">{icon}</span>}
            {children || value}
        </button>
    );
}
