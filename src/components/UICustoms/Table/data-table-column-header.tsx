import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import type { Column } from "./data-table"

type DataTableColumnHeaderProps<T> = {
    column: Column<T>
    filterValue: any
    onFilterChange: (value: any) => void
    sortDirection: "asc" | "desc" | null
    onSortToggle: () => void
}

export function DataTableColumnHeader<T>({
    column,
    filterValue,
    onFilterChange,
    sortDirection,
    onSortToggle
}: DataTableColumnHeaderProps<T>) {

    // If neither sortable nor filterable, just display the header label
    if (!column.sortable && !column.filterable) {
        return (
            <div className={`
                text-sm font-bold text-foreground-muted py-xs flex items-center h-full gap-xs
                ${column.header === "STT" ? "justify-center" : ""}
                ${column.truncate || column.maxWidth ? "min-w-0 truncate" : ""}
            `}>
                {column.header}
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between gap-xs w-full py-xs min-w-0">
            {/* Sort trigger — shrinks to give room to the filter select */}
            <div
                className={`
                    flex items-center gap-xs text-sm font-bold text-foreground-muted
                    min-w-0 flex-1
                    ${column.sortable ? "cursor-pointer select-none hover:text-foreground transition-colors" : ""}
                    ${column.truncate || column.maxWidth ? "overflow-hidden" : ""}
                `}
                onClick={() => { if (column.sortable) onSortToggle() }}
                title={column.sortable ? "Nhấn để sắp xếp" : undefined}
            >
                <span className={column.truncate || column.maxWidth ? "truncate" : ""}>
                    {column.header}
                </span>
                {column.sortable && (
                    <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                        {sortDirection === "asc" ? (
                            <ArrowUp className="w-3 h-3 text-foreground" />
                        ) : sortDirection === "desc" ? (
                            <ArrowDown className="w-3 h-3 text-foreground" />
                        ) : (
                            <ChevronsUpDown className="w-3 h-3 opacity-50" />
                        )}
                    </span>
                )}
            </div>

            {/* Filter select — fixed shrink-0 so it doesn't crowd the header */}
            {column.filterable && (
                <div onClick={e => e.stopPropagation()} className="font-normal shrink-0">
                    <select
                        className="select h-7 w-[110px] px-xs text-xs rounded-md border border-border focus-visible:ring-1 focus-visible:ring-primary/40 shadow-sm"
                        value={filterValue === undefined ? "all" : String(filterValue)}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === "all") {
                                onFilterChange(undefined);
                                return;
                            }
                            if (column.type === "boolean") {
                                onFilterChange(val === "true");
                            } else {
                                onFilterChange(val);
                            }
                        }}
                    >
                        <option value="all">Tất cả</option>
                        {column.filterOptions ? (
                            column.filterOptions.map((opt, i) => (
                                <option key={i} value={String(opt.value)}>{opt.label}</option>
                            ))
                        ) : column.type === "boolean" ? (
                            <>
                                <option value="true">Có / Bật</option>
                                <option value="false">Không / Tắt</option>
                            </>
                        ) : null}
                    </select>
                </div>
            )}
        </div>
    )
}
