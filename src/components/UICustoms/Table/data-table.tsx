import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
} from "@/components/ui/table"
import { DataTableColumnHeader } from "./data-table-column-header"

type ColumnType = "string" | "boolean" | "number"

export type Column<T> = {
    header: string
    accessor: (row: T) => any
    cell?: (row: T) => React.ReactNode

    type?: ColumnType

    sortable?: boolean
    filterable?: boolean
    filterOptions?: { label: string, value: any }[]
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
    pageSize = 10
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
        <div className="relative h-full flex flex-col w-full [&>div]:flex-1 [&>div]:overflow-auto">
            <Table>
                <TableHeader className="sticky top-0 z-10 bg-surface shadow-sm outline outline-1 outline-border">
                    <TableRow className="bg-surface hover:bg-surface border-none">
                        {showIndex && (
                            <TableHead className="px-6 py-2 align-top h-auto border-b-0 w-[60px] text-center">
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
                                className="px-6 py-2 align-top h-auto border-b-0"
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
                                Đang tải dữ liệu...
                            </TableCell>
                        </TableRow>
                    ) : !Array.isArray(data) || data.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length + (showIndex ? 1 : 0)}
                                className="h-32 text-center text-foreground-muted"
                            >
                                Không có dữ liệu
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row, i) => (
                            <TableRow key={i} className="hover:bg-surface/50 border-border transition-colors">
                                {showIndex && (
                                    <TableCell className="h-16 px-6 py-3 text-base text-center font-medium">
                                        {(pageNumber - 1) * pageSize + i + 1}
                                    </TableCell>
                                )}
                                {columns.map((col, j) => (
                                    <TableCell key={j} className="h-16 px-6 py-3 text-base">
                                        {col.cell ? col.cell(row) : (col.accessor(row) as React.ReactNode)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}