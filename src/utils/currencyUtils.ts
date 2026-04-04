/**
 * Format string/number to VND currency input style (with dots as thousands separator)
 * Example: "300000" -> "300.000"
 */
export const formatVNDInput = (val: string | number | undefined | null) => {
    if (val === undefined || val === null || val === "") return "";
    const strVal = String(val);
    const num = parseInt(strVal.replace(/\D/g, ""), 10);
    if (isNaN(num)) return "0";
    return new Intl.NumberFormat("vi-VN").format(num);
};

/**
 * Format string/number to full VND currency display style
 * Example: "300000" -> "300.000 ₫"
 */
export const formatVNDDisplay = (val: string | number | undefined | null) => {
    if (val === undefined || val === null || val === "") return "";
    const strVal = String(val);
    const num = parseInt(strVal.replace(/\D/g, ""), 10);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
};
