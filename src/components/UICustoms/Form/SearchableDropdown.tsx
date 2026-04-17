import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Spinner } from '@/components/UICustoms/Snipper';
import { cn } from '@/lib/utils';

//#region Types
export interface SearchableDropdownOption {
    id: string;
    disabled?: boolean;
}

interface SearchableDropdownProps<T extends SearchableDropdownOption> {
    /** Currently selected value (option id) */
    value: string;
    /** Placeholder text when no value is selected */
    placeholder: string;
    /** Label text displayed above the dropdown */
    label: string;
    /** Unique ID for accessibility pairing */
    id?: string;
    /** All available options */
    options: T[];
    /** Called once when the dropdown is first opened — use for lazy fetching */
    onFetch: () => Promise<void> | void;
    /** Called when an option is selected */
    onSelect: (option: T) => void;
    /** Render the trigger display content (what shows when dropdown is closed) */
    renderValue: (option: T | undefined) => React.ReactNode;
    /** Render each option row in the dropdown list */
    renderOption: (option: T, isSelected: boolean) => React.ReactNode;
    /** Client-side filter predicate — receives the option and lowercase search query */
    filterFn?: (option: T, query: string) => boolean;
    /** Search input placeholder */
    searchPlaceholder?: string;
    /** Whether to show the search input */
    searchable?: boolean;
    /** Empty state text when filter returns no results */
    emptyText?: string;
    /** Optional error-state class on the trigger (e.g. border-danger) */
    hasError?: boolean;
    /** Error message text displayed below the trigger */
    errorMessage?: string;
    /** Extra className for the root container */
    className?: string;
    /** Max height of the dropdown list */
    maxHeight?: string;
}
//#endregion

function SearchableDropdown<T extends SearchableDropdownOption>({
    value,
    placeholder,
    label,
    id,
    options,
    onFetch,
    onSelect,
    renderValue,
    renderOption,
    filterFn,
    searchPlaceholder = "Tìm kiếm...",
    searchable = true,
    emptyText = "Không tìm thấy kết quả",
    hasError = false,
    errorMessage,
    className,
    maxHeight = "240px",
}: SearchableDropdownProps<T>) {
    //#region State
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [search, setSearch] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const fieldId = id ?? `dropdown-${label.toLowerCase().replace(/\s+/g, '-')}`;
    //#endregion

    //#region Effects — click outside to close
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    //#endregion

    //#region Handlers
    const handleOpen = useCallback(async () => {
        if (isOpen) {
            setIsOpen(false);
            return;
        }

        setIsOpen(true);
        setSearch("");

        if (!hasFetched) {
            setIsLoading(true);
            try {
                await onFetch();
            } finally {
                setIsLoading(false);
                setHasFetched(true);
            }
        }

        setTimeout(() => inputRef.current?.focus(), 50);
    }, [isOpen, hasFetched, onFetch]);

    const handleSelect = useCallback((option: T) => {
        if (option.disabled) return;
        onSelect(option);
        setIsOpen(false);
    }, [onSelect]);

    const handleSearchClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    }, []);
    //#endregion

    //#region Derived
    const selectedOption = useMemo(
        () => options.find(o => o.id === value),
        [options, value]
    );

    const filtered = useMemo(() => {
        if (!search || !filterFn) return options;
        const q = search.toLowerCase();
        return options.filter(o => filterFn(o, q));
    }, [options, search, filterFn]);
    //#endregion

    //#region Render
    return (
        <div
            className={cn("flex flex-col gap-sm relative", className)}
            ref={containerRef}
            onKeyDown={handleKeyDown}
        >
            {/* Label */}
            <label
                htmlFor={fieldId}
                className="text-sm font-medium text-foreground-secondary"
            >
                {label}
            </label>

            {/* Trigger */}
            <div
                id={fieldId}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                tabIndex={0}
                className={cn(
                    "input cursor-pointer flex items-center justify-between h-11 pr-3 transition-all duration-200",
                    hasError && "border-danger focus:border-danger focus:ring-danger",
                    isOpen && "border-primary ring-1 ring-primary/20"
                )}
                onClick={handleOpen}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpen();
                    }
                }}
            >
                <span className="truncate w-full text-left text-sm">
                    {value ? (
                        renderValue(selectedOption)
                    ) : (
                        <span className="text-foreground-muted">{placeholder}</span>
                    )}
                </span>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 text-foreground-muted flex-shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </div>

            {/* Error message */}
            {hasError && errorMessage && (
                <p className="text-xs text-danger font-medium animate-in fade-in duration-200">
                    {errorMessage}
                </p>
            )}

            {/* Dropdown panel */}
            {isOpen && (
                <div
                    role="listbox"
                    className="absolute top-full left-0 right-0 mt-xs z-dropdown bg-surface border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                >
                    {/* Search bar */}
                    {searchable && (
                        <div className="p-sm border-b border-border">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    name={`${fieldId}-search`}
                                    className="input !pl-xl text-sm"
                                    placeholder={searchPlaceholder}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onClick={handleSearchClick}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    )}

                    {/* Loading state */}
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-sm py-lg">
                            <Spinner size="sm" />
                            <span className="text-sm text-foreground-muted font-medium">
                                Đang tải dữ liệu...
                            </span>
                        </div>
                    ) : (
                        /* Options list */
                        <ul
                            className="overflow-y-auto"
                            style={{ maxHeight }}
                        >
                            {filtered.length === 0 ? (
                                <li className="px-md py-sm text-sm text-foreground-muted text-center">
                                    {emptyText}
                                </li>
                            ) : (
                                filtered.map(option => (
                                    <li
                                        key={option.id}
                                        role="option"
                                        aria-selected={option.id === value}
                                        className={cn(
                                            "flex items-center gap-sm px-md py-sm cursor-pointer transition-colors hover:bg-surface-muted",
                                            option.id === value && "bg-primary/5 font-semibold",
                                            option.disabled && "opacity-50 cursor-not-allowed"
                                        )}
                                        onClick={() => handleSelect(option)}
                                    >
                                        {renderOption(option, option.id === value)}
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
    //#endregion
}

export default SearchableDropdown;
