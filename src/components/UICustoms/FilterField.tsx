import React, { memo } from "react";
import { X, ChevronDown, Calendar } from "lucide-react";
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
    inputType?: string; // e.g. "text", "date", "number"
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
        <div className={cn("space-y-1.5", colSpan, className)}>
            <label className="text-[10px] font-black text-foreground-muted uppercase tracking-wider flex items-center gap-1.5 ml-0.5">
                <span className="opacity-70">{icon}</span>
                {label}
            </label>
            <div className="relative group">
                {props.type === "select" ? (
                    <div className="relative">
                        <select
                            className={cn(
                                "select pr-9 appearance-none",
                                hasValue ? "text-foreground font-semibold !border-primary/50" : "text-foreground-muted font-medium"
                            )}
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
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-muted group-hover:text-primary transition-colors">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <input
                            type={props.inputType ?? "text"}
                            placeholder={props.placeholder ?? ""}
                            className={cn(
                                "input",
                                props.inputType === "date" ? "pr-9" : "",
                                hasValue ? "text-foreground font-semibold !border-primary/50" : "text-foreground-muted font-medium"
                            )}
                            value={props.value}
                            onChange={(e) => props.onChange(e.target.value)}
                        />
                        {(props.inputType === "date") && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-muted group-hover:text-primary transition-colors">
                                <Calendar className="w-4 h-4 opacity-40" />
                            </div>
                        )}
                    </div>
                )}

                {hasValue && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClear();
                        }}
                        className={cn(
                            "absolute top-1/2 -translate-y-1/2 text-foreground-muted hover:text-danger hover:bg-danger/10 p-1 rounded-full transition-all duration-200",
                            props.type === "select" ? "right-8" : "right-2"
                        )}
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
