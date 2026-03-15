type StatusBadgeProps = {
    status: boolean | undefined | null
    activeText?: string
    inactiveText?: string
    activeColor?: string
    inactiveColor?: string
}

export function StatusBadge({ status, activeText = "Active", inactiveText = "Inactive" }: StatusBadgeProps) {
    function cn(...classes: (string | undefined | false | null)[]): string {
        return classes.filter(Boolean).join(' ');
    }

    return (
        <span
            className={cn(
                "px-2 py-0.5 rounded-full text-xs font-semibold",
                status
                    ? "bg-success/10 text-success"
                    : "bg-danger/10 text-danger"
            )}
        >
            {status ? activeText : inactiveText}
        </span>
    )
}