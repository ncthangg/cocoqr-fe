type Column<T> = {
    header: string
    render: (row: T) => React.ReactNode
}

type DataTableProps<T> = {
    data: T[]
    columns: Column<T>[]
    loading?: boolean
}

export function DataTable<T>({ data, columns, loading }: DataTableProps<T>) {
    return (
        <div className="bg-surface border border-border rounded-lg shadow-sm">
            <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                    <tr>
                        {columns.map((col, i) => (
                            <th key={i} className="px-6 py-3 text-left text-xs uppercase">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="text-center py-8">
                                Loading...
                            </td>
                        </tr>
                    ) : (
                        data.map((row, i) => (
                            <tr key={i} className="border-b hover:bg-muted/20">
                                {columns.map((col, j) => (
                                    <td key={j} className="px-6 py-4">
                                        {col.render(row)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}