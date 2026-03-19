import React from "react";
import { AlertTriangle, X } from "lucide-react";
import Button from "../Button";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    title?: string;
    itemName: string;
    description?: string;
    loading?: boolean;
    confirmText?: string;
    cancelText?: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Xác nhận xóa",
    itemName,
    description = "Hành động này không thể hoàn tác. Dữ liệu liên quan có thể bị ảnh hưởng.",
    loading = false,
    confirmText = "Xóa",
    cancelText = "Hủy"
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
        >
            <div
                className="modal-content max-w-modal-lg relative flex flex-col overflow-hidden rounded-2xl p-lg md:p-xl shadow-lg bg-surface"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center pb-md border-b border-border">
                    <div className="flex items-center gap-sm text-danger">
                        <AlertTriangle className="w-5 h-5" />
                        <h2 className="text-lg font-bold">{title}</h2>
                    </div>
                    <button onClick={onClose} className="text-foreground-muted hover:text-foreground transition-colors" disabled={loading}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-lg">
                    <p className="text-foreground">
                        Bạn có chắc chắn muốn xóa <strong>{itemName}</strong>?
                    </p>
                    {description && (
                        <p className="text-sm text-foreground-muted mt-sm">
                            {description}
                        </p>
                    )}
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
                        className="bg-danger text-white hover:bg-danger/90 px-md py-sm border-transparent"
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
