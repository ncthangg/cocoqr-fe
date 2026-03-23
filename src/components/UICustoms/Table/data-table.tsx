import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
} from "@/components/ui/table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataLoader } from "../Snipper"
import { Search } from "lucide-react"

type ColumnType = "string" | "boolean" | "number"

export type Column<T> = {
    header: string
    accessor: (row: T) => any
    cell?: (row: T) => React.ReactNode

    type?: ColumnType

    sortable?: boolean
    filterable?: boolean
    filterOptions?: { label: string, value: any }[]

    /** CSS width value, e.g. "80px", "10%" — applied to both th and td */
    width?: string
    /** CSS max-width value, e.g. "200px" — clips content; use with truncate */
    maxWidth?: string
    /** CSS min-width value, e.g. "60px" — prevents column from collapsing */
    minWidth?: string
    /** Truncate overflowing text with ellipsis (requires maxWidth or width) */
    truncate?: boolean
}

type DataTableProps<T> = {
    columns: Column<T>[]
    data: T[]
    loading?: boolean

    // Server-side filtering and sorting support
    onSortChange?: (index: number, dir: "asc" | "desc" | null) => void
    onFilterChange?: (index: number, value: any) => void

    // Controlled state
    sortState?: { index: number; dir: "asc" | "desc" } | null
    filterState?: Record<number, any>

    onResetPage?: () => void

    // Handle auto-incrementing serial number (STT) index
    showIndex?: boolean
    pageNumber?: number
    pageSize?: number

    // Click handler for rows
    onRowClick?: (row: T) => void

    // Predicate to determine if row is currently selected
    selectedRowPredicate?: (row: T) => boolean
}

/** Build inline style for a column's size constraints */
function colStyle(col: Pick<Column<unknown>, "width" | "maxWidth" | "minWidth">): React.CSSProperties {
    return {
        width: col.width,
        maxWidth: col.maxWidth,
        minWidth: col.minWidth,
    }
}

export function DataTable<T>({
    columns,
    data,
    loading,
    onSortChange,
    onFilterChange,
    sortState,
    filterState,
    onResetPage,
    showIndex = false,
    pageNumber = 1,
    pageSize = 10,
    onRowClick,
    selectedRowPredicate
}: DataTableProps<T>) {

    const handleFilterChange = (index: number, value: any) => {
        if (onFilterChange) onFilterChange(index, value)
        if (onResetPage) onResetPage()
    }

    const handleSortToggle = (index: number) => {
        if (onSortChange) {
            if (sortState?.index === index) {
                if (sortState.dir === "asc") onSortChange(index, "desc")
                else onSortChange(index, null)
            } else {
                onSortChange(index, "asc")
            }
            if (onResetPage) onResetPage()
        }
    }

    return (
        <div className="relative h-full flex flex-col w-full min-h-[150px] [&>div]:flex-1 [&>div]:overflow-auto">
            <Table>
                <TableHeader className="sticky top-0 z-20 bg-surface border-b-2 border-border-strong">
                    <TableRow className="bg-surface hover:bg-surface border-none divide-x divide-border">
                        {showIndex && (
                            <TableHead
                                className="px-lg py-sm align-top h-auto border-b-0 text-center"
                                style={{ width: "60px", minWidth: "60px", maxWidth: "60px" }}
                            >
                                <DataTableColumnHeader
                                    column={{ header: "STT", accessor: () => "" }}
                                    filterValue={undefined}
                                    onFilterChange={() => { }}
                                    sortDirection={null}
                                    onSortToggle={() => { }}
                                />
                            </TableHead>
                        )}
                        {columns.map((col, index) => (
                            <TableHead
                                key={index}
                                className="px-lg py-sm align-top h-auto border-b-0"
                                style={colStyle(col)}
                            >
                                <DataTableColumnHeader
                                    column={col}
                                    filterValue={filterState?.[index]}
                                    onFilterChange={(val) => handleFilterChange(index, val)}
                                    sortDirection={sortState?.index === index ? sortState.dir : null}
                                    onSortToggle={() => handleSortToggle(index)}
                                />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                <TableBody className="bg-bg">
                    {loading ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length + (showIndex ? 1 : 0)}
                                className="h-32 text-center text-foreground-muted"
                            >
                                <DataLoader text="Đang tải dữ liệu..." />
                            </TableCell>
                        </TableRow>
                    ) : !Array.isArray(data) || data.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length + (showIndex ? 1 : 0)}
                                className="h-32 text-center text-foreground-muted"
                            >
                                <div className="flex flex-col items-center justify-center gap-sm">
                                    <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center">
                                        <Search className="w-8 h-8 text-foreground-muted" />
                                    </div>
                                    <p>Chưa có dữ liệu.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row, i) => {
                            const isSelected = selectedRowPredicate?.(row);
                            return (
                                <TableRow
                                    key={i}
                                    className={`
                                        group transition-all duration-300 border-b border-border relative
                                        ${onRowClick ? 'cursor-pointer' : ''}
                                        ${isSelected
                                            ? 'bg-primary/[0.12] border-primary z-10'
                                            : 'hover:bg-surface-muted/50'
                                        }
                                    `}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {showIndex && (
                                        <TableCell
                                            className={`
                                                px-lg py-md text-base text-center font-medium transition-all duration-300
                                                ${isSelected ? 'text-primary' : 'text-foreground-secondary'}
                                            `}
                                            style={{ width: "60px", minWidth: "60px", maxWidth: "60px" }}
                                        >
                                            {(pageNumber - 1) * pageSize + i + 1}
                                            {isSelected && (
                                                <>
                                                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary z-20" />
                                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-20" />
                                                    <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-primary z-20" />
                                                </>
                                            )}
                                        </TableCell>
                                    )}
                                    {columns.map((col, j) => {
                                        const content = col.cell ? col.cell(row) : (col.accessor(row) as React.ReactNode)
                                        const rawValue = col.accessor(row)
                                        const titleText = col.truncate && typeof rawValue === "string" ? rawValue : undefined

                                        return (
                                            <TableCell
                                                key={j}
                                                className={`
                                                    px-lg py-md text-base transition-all duration-300 relative
                                                    ${isSelected ? 'font-bold text-primary' : ''}
                                                    ${col.maxWidth || col.width ? 'overflow-hidden' : ''}
                                                `}
                                                style={colStyle(col)}
                                            >
                                                {col.truncate ? (
                                                    <div
                                                        className="truncate"
                                                        title={titleText}
                                                    >
                                                        {content}
                                                    </div>
                                                ) : (
                                                    content
                                                )}
                                                {isSelected && (
                                                    <>
                                                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary z-20" />
                                                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-20" />
                                                        {j === 0 && !showIndex && (
                                                            <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-primary z-20" />
                                                        )}
                                                        {j === columns.length - 1 && (
                                                            <div className="absolute top-0 right-0 bottom-0 w-[2px] bg-primary z-20" />
                                                        )}
                                                    </>
                                                )}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
