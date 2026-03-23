type StatusBadgeProps = {
    status: boolean | undefined | null
    icon?: React.ReactNode
    activeText?: string
    inactiveText?: string
    activeColor?: string
    inactiveColor?: string
}

export function StatusBadge({ status, icon, activeText = "Active", inactiveText = "Inactive" }: StatusBadgeProps) {
    function cn(...classes: (string | undefined | false | null)[]): string {
        return classes.filter(Boolean).join(' ');
    }

    return (
        <span
            className={cn(
                "px-sm py-2xs rounded-full text-xs font-semibold",
                status
                    ? "bg-success/10 text-success"
                    : "bg-danger/10 text-danger"
            )}
        >
            {icon && <span className="mr-xs inline-block align-middle w-3 h-3">{icon}</span>}
            {status ? activeText : inactiveText}
        </span>
    );
}