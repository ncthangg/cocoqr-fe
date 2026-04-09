import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Sparkles } from 'lucide-react';
import Button from '../Button';
import { qrStyleLibApi } from '@/services/qrStyleLib-api.service';
import { QRStyleType } from "@/models/enum";
import { toast } from 'react-toastify';
import { type StyleConfig } from './types';
import { cn } from '@/lib/utils';

interface SaveStyleModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentStyle: StyleConfig;
}

const SaveStyleModal: React.FC<SaveStyleModalProps> = ({ isOpen, onClose, currentStyle }) => {
    const [styleName, setStyleName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSaveStyle = async () => {
        const trimmedName = styleName.trim();
        if (!trimmedName) {
            toast.error("Vui lòng nhập tên phong cách");
            return;
        }

        setIsSaving(true);
        try {
            const req = {
                name: trimmedName,
                styleJson: JSON.stringify(currentStyle),
                isDefault: false,
                type: QRStyleType.USER,
                isActive: true
            };
            await qrStyleLibApi.post(req);
            toast.success("Đã lưu phong cách mới thành công ✨");
            setStyleName("");
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="absolute inset-x-0 bottom-0 top-0 z-[120] flex items-end sm:items-center justify-center p-sm sm:p-lg">
            {/* Ultra-smooth Backdrop */}
            <div
                className="absolute inset-0 bg-background/20 backdrop-blur-md animate-in fade-in duration-500"
                onClick={onClose}
            />

            <div className={cn(
                "relative w-full max-w-modal-sm bg-surface/90 backdrop-blur-xl border border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-[2.5rem] p-lg sm:p-xl animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500 ease-out-expo flex flex-col items-center text-center",
                isSaving && "pointer-events-none opacity-80"
            )}>
                {/* Visual Accent */}
                <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>

                <h4 className="text-xl font-black text-foreground mb-2 tracking-tight">Lưu thiết kế của bạn</h4>
                <p className="text-[11px] text-foreground-muted mb-8 uppercase tracking-[0.2em] font-bold leading-relaxed">
                    Thiết kế này sẽ được lưu vào <br /><span className="text-primary/80">Thư viện phong cách cá nhân</span>
                </p>

                <div className="w-full relative group mb-8">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Ví dụ: Studio Dark Gold..."
                        value={styleName}
                        onChange={(e) => setStyleName(e.target.value)}
                        className="w-full h-14 bg-surface-muted/50 border-2 border-border/40 rounded-2xl px-5 text-sm font-bold placeholder:text-foreground-muted/50 focus:border-primary/50 focus:bg-surface-muted/80 transition-all outline-none text-center"
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveStyle()}
                    />
                    <div className="absolute -bottom-1 left-4 right-4 h-1 bg-primary/10 rounded-full scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                </div>

                <div className="flex gap-3 w-full">
                    <Button
                        variant="primary"
                        className="flex-[2] h-12 rounded-2xl text-[11px] font-black shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
                        onClick={handleSaveStyle}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <div className="flex items-center gap-2">
                                <Save size={16} /> LƯU NGAY
                            </div>
                        )}
                    </Button>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-surface-muted/50 text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-all active:scale-90"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default SaveStyleModal;
