import React, { useCallback, useState } from "react";
import { X, Mail, User, Calendar, Reply, Trash2, CheckCircle2 } from "lucide-react";
import type { ContactMessageRes } from "@/models/entity.model";
import { formatDateTime } from "@/utils/dateTimeUtils";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import { ContactMessageStatus } from "@/models/enum";
import { TagBadge } from "@/components/UICustoms/TagBadge";
import Button from "@/components/UICustoms/Button";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    message: ContactMessageRes | null;
    onReply: (msg: ContactMessageRes) => void;
    onIgnore: (id: string) => Promise<void>;
}

const ContactDetailModal: React.FC<Props> = ({ isOpen, onClose, message, onReply, onIgnore }) => {
    //#region States & Refs
    const [ignoring, setIgnoring] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    //#endregion

    //#region Handlers
    const handleOverlayClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    }, [onClose]);

    const handleConfirmIgnore = async () => {
        try {
            setIgnoring(true);
            await onIgnore(message!.id);
            setIsConfirmOpen(false);
            onClose();
        } finally {
            setIgnoring(false);
        }
    };

    const renderStatus = () => {
        if (!message) return null;
        switch (message.status) {
            case ContactMessageStatus.REPLIED:
                return <TagBadge label="Đã trả lời" color="green" size="lg" icon={<CheckCircle2 className="w-4 h-4" />} />;
            case ContactMessageStatus.IGNORED:
                return <TagBadge label="Đã bỏ qua" color="gray" size="lg" icon={<Trash2 className="w-4 h-4" />} />;
            default:
                return <TagBadge label="Mới" color="blue" size="lg" icon={<Mail className="w-4 h-4" />} />;
        }
    };
    //#endregion

    //#region Render
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
                        {renderStatus()}
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
                <div className="p-4 border-t border-border flex justify-end gap-3 bg-bg/50">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="px-6 rounded-lg"
                    >
                        Đóng
                    </Button>
                    {message.status === ContactMessageStatus.NEW && (
                        <>
                            <Button
                                onClick={() => setIsConfirmOpen(true)}
                                loading={ignoring}
                                icon={<Trash2 className="w-4 h-4" />}
                                className="px-6 bg-zinc-500 hover:bg-zinc-600 border-zinc-600 text-white rounded-lg shadow-lg shadow-zinc-500/20"
                            >
                                Bỏ qua
                            </Button>
                            <Button
                                onClick={() => {
                                    onReply(message);
                                    onClose();
                                }}
                                icon={<Reply className="w-4 h-4" />}
                                className="px-6 bg-amber-500 hover:bg-amber-600 border-amber-600 text-white rounded-lg shadow-lg shadow-amber-500/20"
                            >
                                Trả lời
                            </Button>
                        </>
                    )}
                </div>

                <ActionConfirmModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={handleConfirmIgnore}
                    title="Bỏ qua liên hệ"
                    description={
                        <div className="text-center">
                            <p className="text-foreground font-medium">Bạn có chắc chắn muốn bỏ qua liên hệ của <span className="font-bold text-primary">{message.fullName}</span>?</p>
                            <p className="text-sm text-foreground-muted mt-2">Hành động này sẽ đánh dấu liên hệ là đã bỏ qua.</p>
                        </div>
                    }
                    confirmText="Bỏ qua"
                    variant="danger"
                    loading={ignoring}
                    icon={<Trash2 className="w-5 h-5" />}
                />
            </div>
        </div>
    );
    //#endregion
};

export default React.memo(ContactDetailModal);
