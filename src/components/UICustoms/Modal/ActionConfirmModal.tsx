import React from "react";
import { Info, X } from "lucide-react";
import Button from "../Button";

interface ActionConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    title: string;
    description?: string;
    loading?: boolean;
    confirmText?: string;
    cancelText?: string;
    icon?: React.ReactNode;
    confirmButtonClass?: string;
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
    confirmButtonClass = "btn-primary px-4 py-2"
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay bg-black/60 px-4 py-6"
        >
            <div
                className="modal-content max-w-modal-lg relative flex flex-col overflow-hidden rounded-2xl p-6 md:p-8 shadow-2xl bg-surface"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center pb-4 border-b border-border">
                    <div className="flex items-center gap-2 text-primary">
                        {icon}
                        <h2 className="text-lg font-bold">{title}</h2>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" disabled={loading}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {description && (
                        <p className="text-foreground">
                            {description}
                        </p>
                    )}
                </div>

                <div className="p-5 border-t border-border flex justify-end gap-3 bg-muted/20">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="bg-background border border-border text-foreground hover:bg-muted px-4 py-2"
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        className={confirmButtonClass}
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ActionConfirmModal;
