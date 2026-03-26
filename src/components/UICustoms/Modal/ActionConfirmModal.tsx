import React, { useCallback } from "react";
import { Info, X } from "lucide-react";
import Button from "../Button";

interface ActionConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    title: string;
    description?: React.ReactNode;
    loading?: boolean;
    confirmText?: string;
    cancelText?: string;
    icon?: React.ReactNode;
    confirmButtonClass?: string;
    variant?: "primary" | "danger" | "amber";
}

const ActionConfirmModal: React.FC<ActionConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    loading = false,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    icon = <Info className="w-5 h-5" />,
    confirmButtonClass,
    variant = "primary"
}) => {
    const finalConfirmClass = confirmButtonClass || (
        variant === "danger"
            ? "btn-danger"
            : variant === "primary"
                ? "btn-primary"
                : "btn-amber"
    );

    const handleOverlayClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    }, [onClose]);

    const handleStopPropagation = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            onClick={handleOverlayClick}
        >
            <div
                className="modal-content max-w-modal-lg relative flex flex-col overflow-hidden rounded-2xl p-lg md:p-xl shadow-lg bg-surface"
                onClick={handleStopPropagation}
            >
                <div className="flex justify-between items-center pb-md border-b border-border">
                    <div className="flex items-center gap-sm text-primary">
                        {icon}
                        <h2 className="text-lg font-bold">{title}</h2>
                    </div>
                    <button onClick={onClose} className="text-foreground-muted hover:text-foreground transition-colors" disabled={loading}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-xl border-b border-border/50">
                    {description}
                </div>

                <div className="p-md border-t border-border flex justify-end gap-sm bg-surface-muted/20">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="bg-bg border border-border text-foreground hover:bg-surface-muted px-md py-sm"
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        className={finalConfirmClass}
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ActionConfirmModal);
