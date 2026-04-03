import React, { useCallback } from "react";
import { X, Mail, User, Calendar } from "lucide-react";
import type { ContactMessageRes } from "@/models/entity.model";
import { formatDateTime } from "@/utils/dateTimeUtils";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import { ContactMessageStatus } from "@/models/enum";
import { StatusBadge } from "@/components/UICustoms/StatusBadge";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    message: ContactMessageRes | null;
}

const ContactDetailModal: React.FC<Props> = ({ isOpen, onClose, message }) => {
    const handleOverlayClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    }, [onClose]);

    if (!isOpen || !message) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-surface border border-border max-w-modal-lg w-full rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-border flex justify-between items-center bg-bg/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Chi tiết liên hệ</h3>
                            <p className="text-xs text-foreground-muted font-medium">{message.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <StatusBadge
                            status={message.status === ContactMessageStatus.REPLIED}
                            activeText="Đã trả lời"
                            inactiveText="Mới"
                            size="lg"
                        />
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Gửi lúc</span>
                            <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                {formatDateTime(message.createdAt)}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-border hidden sm:block" />
                        <button onClick={onClose} className="p-2 hover:bg-border rounded-full transition-colors text-foreground-muted hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                                <User className="w-3 h-3 text-primary" />Họ và tên
                            </p>
                            <p className="text-sm font-bold text-foreground">{message.fullName}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-primary" />Email
                            </p>
                            <p className="text-sm font-bold text-foreground">{message.email}</p>
                        </div>
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col">
                        <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider pl-1">Nội dung</p>
                        <div className="email-editor-container readonly flex-1">
                            <ReactQuill
                                theme="snow"
                                value={message.content}
                                readOnly={true}
                                modules={{ toolbar: false }}
                                className="!border-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border flex justify-end bg-bg/50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ContactDetailModal);
