import { Eye, EyeOff, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import Button from "./Button";

interface KeyTextProps {
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
    id?: string;
    name?: string;
    readOnly?: boolean; // nếu muốn chỉ đọc
    multiline?: boolean; // nếu muốn sử dụng textarea
    rows?: number; // số dòng cho textarea
    maxRows?: number; // số dòng tối đa khi auto-resize
    autoResize?: boolean; // có tự động resize không
    onCopy?: () => void;
    onView?: () => void;
    disabled?: boolean;
}

export default function KeyText({
    value,
    onChange,
    placeholder,
    className = "",
    required = false,
    id,
    name,
    readOnly = false,
    multiline = false,
    rows = 3,
    maxRows = 20,
    autoResize = true,
    onView,
    onCopy,
    disabled = false,
}: KeyTextProps) {
    //#region State
    // Kiểm tra xem có phải là content thật hay chỉ là placeholder
    const isRealContent = Boolean(value && !value.includes("Secret content - click view to decrypt") && !value.includes("Đang giải mã"));
    const [showKey, setShowKey] = useState(!readOnly);
    //#endregion

    //#region Fetch Effect
    // Sync showKey với isRealContent để icon hiển thị đúng
    useEffect(() => {
        if (readOnly) {
            setShowKey(isRealContent);
        }
    }, [isRealContent, readOnly]);
    //#endregion

    //#region Process
    // Xử lý trường hợp value là undefined hoặc null
    const safeValue = value ?? "";
    const hasValue = safeValue.length > 0;

    // Tạo mask text để hiển thị khi ẩn
    const getMaskedText = (text: string) => {
        // Thay thế TẤT CẢ ký tự (bao gồm space, tab, newline) bằng ●
        // Giống như password input, không hiển thị bất kỳ ký tự nào
        // Sử dụng split và map để đảm bảo thay thế tất cả ký tự
        return text.split('').map(() => '●').join('');
    };

    // Padding right để chừa chỗ cho buttons
    // Chỉ cần padding khi readOnly và có value (có toggle + copy buttons)
    // Khi edit (không readOnly): không có buttons nên không cần padding
    const paddingRight = hasValue && readOnly ? "pr-20" : "";

    // Styles chung cho input và textarea
    const baseInputStyles = `w-full rounded-md border border-border-subtle px-3 py-2 font-mono text-sm resize-y bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${paddingRight} ${className}`;

    // Khi không readOnly, luôn hiển thị giá trị thực (không mask)
    const displayValueForEdit = !readOnly ? safeValue : (isRealContent ? safeValue : (hasValue ? getMaskedText(safeValue) : safeValue));

    // Auto-calculate rows dựa trên content length (sau khi displayValueForEdit được định nghĩa)
    const calculateRows = () => {
        if (!multiline || !autoResize) return rows;

        const content = displayValueForEdit;
        if (!content) return rows;

        // Ước tính số dòng dựa trên độ dài content
        // Giả sử mỗi dòng ~80 ký tự (có thể điều chỉnh)
        const estimatedLines = Math.ceil(content.length / 80);
        const newlineCount = (content.match(/\n/g) || []).length;

        // Lấy max của estimated lines và newline count, tối thiểu là rows prop, tối đa maxRows
        const calculatedRows = Math.max(rows, Math.max(estimatedLines, newlineCount + 1));
        return Math.min(calculatedRows, maxRows);
    };

    const dynamicRows = calculateRows();

    // Handler cho textarea khi ẩn: không cho phép thay đổi
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // Chỉ cho phép onChange khi đang hiện (isRealContent = true) hoặc khi không readOnly
        if ((isRealContent || !readOnly) && onChange) {
            onChange(e as React.ChangeEvent<HTMLTextAreaElement>);
        }
    };
    //#endregion

    //#region Handle Click
    const handleViewClick = () => {
        setShowKey(!showKey);
        onView?.();
    };
    //#endregion

    return (
        <div className="relative">
            {multiline ? (
                <textarea
                    value={displayValueForEdit}
                    onChange={handleTextareaChange}
                    placeholder={placeholder}
                    className={`${baseInputStyles} ${readOnly ? 'cursor-default' : ''} ${readOnly && !showKey ? 'select-none' : ''}`.trim()}
                    required={required}
                    id={id}
                    name={name}
                    readOnly={readOnly}
                    rows={dynamicRows}
                    tabIndex={readOnly && !showKey ? -1 : undefined}
                />
            ) : (
                <input
                    type={readOnly ? (showKey ? "text" : "password") : "text"}
                    value={safeValue}
                    onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
                    placeholder={placeholder}
                    className={baseInputStyles}
                    required={required}
                    id={id}
                    name={name}
                    readOnly={readOnly}
                />
            )}

            {hasValue && readOnly && (
                <div className={`absolute right-2 flex items-center gap-1 ${multiline ? 'top-2' : 'top-1/2 transform -translate-y-1/2'}`}>
                    {/* Toggle hide/show - chỉ hiển thị khi readOnly */}
                    <Button
                        type="button"
                        onClick={handleViewClick}
                        icon={showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                        className="btn-primary"
                        size="small"
                        aria-label={showKey ? "Ẩn key" : "Hiện key"}
                        disabled={disabled}
                    />

                    {/* Copy key - chỉ hiển thị khi readOnly */}
                    <Button
                        type="button"
                        onClick={onCopy}
                        icon={<Copy size={18} />}
                        className="btn-primary"
                        size="small"
                        aria-label="Copy key"
                        disabled={disabled}
                    />
                </div>
            )}
        </div>
    );
}
