import React, { memo } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterFieldBaseProps {
    label: string;
    icon: React.ReactNode;
    className?: string;
    colSpan?: string;
}

interface FilterInputProps extends FilterFieldBaseProps {
    type: "input";
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

interface FilterSelectProps extends FilterFieldBaseProps {
    type: "select";
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
    placeholder?: string;
}

type FilterFieldProps = FilterInputProps | FilterSelectProps;

const FilterField: React.FC<FilterFieldProps> = (props) => {
    const { label, icon, className, colSpan } = props;

    const hasValue = !!props.value;

    const handleClear = () => {
        props.onChange("");
    };

    return (
        <div className={cn("space-y-1", colSpan, className)}>
            <label className="text-xs font-bold text-foreground-muted uppercase flex items-center gap-2">
                {icon} {label}
            </label>
            <div className="relative">
                {props.type === "select" ? (
                    <select
                        className="select w-full border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent pr-8 appearance-none"
                        value={props.value}
                        onChange={(e) => props.onChange(e.target.value)}
                    >
                        <option value="">{props.placeholder ?? "Tất cả"}</option>
                        {props.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        placeholder={props.placeholder ?? ""}
                        className="input pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={props.value}
                        onChange={(e) => props.onChange(e.target.value)}
                    />
                )}
                {hasValue && (
                    <button
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-primary p-0.5"
                        aria-label={`Clear ${label}`}
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default memo(FilterField);
