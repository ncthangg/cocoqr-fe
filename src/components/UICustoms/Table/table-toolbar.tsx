import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Button from "@/components/UICustoms/Button"

type TableToolbarProps = {
    value?: string | null
    onChange?: ((value: string) => void) | null
    placeholder?: string | null
    handleOpenCreateModal?: (() => void) | null
    onResetPage?: (() => void) | null
    filterOptions?: { label: string, value: any }[] | null
    filterValue?: string | null
    onFilterChange?: ((value: string) => void) | null
}

export function TableToolbar({
    value,
    onChange,
    placeholder = "Search...",
    handleOpenCreateModal,
    onResetPage,
    filterOptions,
    filterValue,
    onFilterChange
}: TableToolbarProps) {
    const showSearch = value !== undefined && value !== null && !!onChange;

    return (
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
            {showSearch ? (
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />

                    <Input
                        value={value}
                        placeholder={placeholder || "Search..."}
                        onChange={(e) => {
                            if (onChange) onChange(e.target.value)
                            if (onResetPage) onResetPage()
                        }}
                        className="h-12 pl-10 w-full text-base bg-surface text-foreground"
                    />
                </div>
            ) : (
                <div className="flex-1"></div>
            )}

            {filterOptions && onFilterChange && (
                <div className="shrink-0 flex items-center gap-2">
                    <select
                        className="h-12 w-[180px] px-3 text-base rounded-md border border-input bg-surface text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                        value={filterValue || ""}
                        onChange={(e) => {
                            onFilterChange(e.target.value);
                            if (onResetPage) onResetPage();
                        }}
                    >
                        <option value="">Tất cả</option>
                        {filterOptions.map((opt, i) => (
                            <option key={i} value={String(opt.value)}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {handleOpenCreateModal && (
                <Button
                    size="large"
                    className="btn-primary shrink-0 flex items-center gap-2"
                    onClick={handleOpenCreateModal}
                >
                    <Plus className="w-5 h-5" /> Thêm mới
                </Button>
            )}
        </div>
    )
}