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

    // If neither sortable nor filterable, just display the header normally
    if (!column.sortable && !column.filterable) {
        return <div className={`text-sm font-bold text-foreground-muted py-1 flex items-center h-full ${column.header === "STT" ? "justify-center" : ""}`}>{column.header}</div>
    }

    return (
        <div className="flex items-center justify-between gap-2 w-full py-1">
            <div
                className={`flex items-center gap-1 text-sm font-bold text-foreground-muted flex-1 ${column.sortable ? "cursor-pointer select-none hover:text-foreground transition-colors" : ""}`}
                onClick={() => { if (column.sortable) onSortToggle() }}
                title={column.sortable ? "Nhấn để sắp xếp" : undefined}
            >
                {column.header}
                {column.sortable && (
                    <div className="w-4 h-4 ml-1 flex items-center justify-center">
                        {sortDirection === "asc" ? (
                            <ArrowUp className="w-3 h-3 text-foreground" />
                        ) : sortDirection === "desc" ? (
                            <ArrowDown className="w-3 h-3 text-foreground" />
                        ) : (
                            <ChevronsUpDown className="w-3 h-3 opacity-50" />
                        )}
                    </div>
                )}
            </div>

            {column.filterable && (
                <div onClick={e => e.stopPropagation()} className="font-normal shrink-0">
                    <select
                        className="h-8 max-w-[150px] px-2 text-xs rounded-md border border-input bg-surface text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={filterValue === undefined ? "all" : String(filterValue)}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === "all") {
                                onFilterChange(undefined);
                                return;
                            }
                            // Convert type based on column type
                            if (column.type === "boolean") {
                                onFilterChange(val === "true");
                            } else {
                                onFilterChange(val); // By default, pass as string/any
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
                                <option value="true">True (Có/Bật)</option>
                                <option value="false">False (Không/Tắt)</option>
                            </>
                        ) : null}
                    </select>
                </div>
            )}
        </div>
    )
}
