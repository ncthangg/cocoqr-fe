import { Plus, Search, X } from "lucide-react"
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
    filterPlaceholder?: string | null
    onFetchOptions?: (() => void) | null
}

export function TableToolbar({
    value,
    onChange,
    placeholder = "Search...",
    handleOpenCreateModal,
    onResetPage,
    filterOptions,
    filterValue,
    onFilterChange,
    filterPlaceholder,
    onFetchOptions
}: TableToolbarProps) {
    const showSearch = value !== undefined && value !== null && !!onChange;

    return (
        <div className="p-md border-b border-border flex items-center justify-between gap-md">
            {showSearch ? (
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted z-10" />

                    <Input
                        value={value ?? ""}
                        placeholder={placeholder || "Search..."}
                        onChange={(e) => {
                            if (onChange) onChange(e.target.value)
                            if (onResetPage) onResetPage()
                        }}
                        className="input h-12 !pl-12 !pr-10 w-full text-base"
                    />

                    {value && onChange && (
                         <button
                            type="button"
                            onClick={() => {
                                onChange("");
                                if (onResetPage) onResetPage();
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-muted text-foreground-muted hover:text-foreground transition-all duration-200 z-10"
                            title="Xóa tìm kiếm"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex-1"></div>
            )}

            {filterOptions && onFilterChange && (
                <div className="shrink-0 flex items-center gap-2">
                    <select
                        className="select h-12 w-[180px] px-md text-base rounded-md border border-border-strong shadow-sm focus-visible:ring-1 focus-visible:ring-primary/40 cursor-pointer"
                        value={filterValue ?? ""}
                        onMouseDown={() => onFetchOptions?.()}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                                onFilterChange(undefined as any);
                            } else {
                                onFilterChange(val);
                            }
                            if (onResetPage) onResetPage();
                        }}
                    >
                        {filterPlaceholder && (
                            <option value="" disabled hidden>{filterPlaceholder}</option>
                        )}
                        <option value="">TẤT CẢ</option>
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