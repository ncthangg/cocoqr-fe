import { Button } from "@/components/ui/button"

type TablePaginationProps = {
    pageNumber: number
    pageSize: number
    totalItems: number
    totalPages: number
    loading?: boolean
    onPageChange: (page: number) => void
    onPageSizeChange?: (size: number) => void
    pageSizeOptions?: number[]
}

export function TablePagination({
    pageNumber,
    pageSize,
    totalItems,
    totalPages,
    loading,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100]
}: TablePaginationProps) {
    const from = totalItems === 0 ? 0 : (pageNumber - 1) * pageSize + 1
    const to = Math.min(pageNumber * pageSize, totalItems)

    return (
        <div className="p-md border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-md hidden sm:flex">
                <div className="text-sm text-foreground-muted whitespace-nowrap">
                    Showing <span className="font-medium">{from}</span> to{" "}
                    <span className="font-medium">{to}</span> of{" "}
                    <span className="font-medium">{totalItems}</span> entries
                </div>

                {onPageSizeChange && (
                    <div className="flex items-center gap-sm">
                        <select
                            className="select h-8 px-sm text-xs rounded-md border border-border focus-visible:ring-1 focus-visible:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            disabled={loading || (pageSizeOptions.length > 0 && totalItems <= pageSizeOptions[0])}
                        >
                            {pageSizeOptions.map((size) => {
                                // Disable larger sizes if total items fit within the minimum page size
                                const minSize = pageSizeOptions[0] || 10;
                                const isOptionDisabled = totalItems <= minSize && size > minSize;
                                return (
                                    <option key={size} value={size} disabled={isOptionDisabled}>
                                        {size} / trang
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-md w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-sm text-sm text-foreground">
                    <span className="whitespace-nowrap">Trang {pageNumber} / {totalPages || 1}</span>
                </div>

                <div className="flex items-center gap-sm">
                    <Button
                        type="button"
                        variant="outline"
                        size="default"
                        onClick={() => onPageChange(pageNumber - 1)}
                        disabled={pageNumber <= 1 || loading}
                    >
                        Trước
                    </Button>

                    <div className="flex items-center gap-xs hidden md:flex">
                        {Array.from({ length: totalPages }).map((_, idx) => {
                            const page = idx + 1;
                            // Logic to truncate pages if there are too many (Show first, last, current, and adjacent)
                            if (
                                totalPages > 5 &&
                                page !== 1 &&
                                page !== totalPages &&
                                Math.abs(page - pageNumber) > 1
                            ) {
                                if (page === 2 || page === totalPages - 1) {
                                    return <span key={page} className="px-1 text-foreground-muted">...</span>;
                                }
                                return null;
                            }

                            return (
                                <Button
                                    key={page}
                                    type="button"
                                    variant={page === pageNumber ? "default" : "outline"}
                                    size="icon"
                                    className="w-10 h-10"
                                    onClick={() => onPageChange(page)}
                                    disabled={loading}
                                >
                                    {page}
                                </Button>
                            );
                        })}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="default"
                        onClick={() => onPageChange(pageNumber + 1)}
                        disabled={pageNumber >= totalPages || loading}
                    >
                        Sau
                    </Button>
                </div>
            </div>
        </div>
    )
}