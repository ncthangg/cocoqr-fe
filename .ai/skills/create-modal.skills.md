---
name: create-modal
description: Blueprint for accessible, animated modals using project design tokens.
---
# Create Modal Skill

## Prerequisites
- Follow `.ai/rules/modal.rules.md` strictly.
- Use `modal-overlay` + `modal-content` CSS classes (globals.css). Never inline overlay/content styles.
- Size with `max-w-modal-sm|md|lg|xl|2xl|3xl|4xl`. Never use raw `max-w-2xl` etc.

## Template
```tsx
import React, { useCallback } from "react";
import { X } from "lucide-react";

interface ExampleModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExampleModal: React.FC<ExampleModalProps> = ({ isOpen, onClose }) => {
    const handleOverlayClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content max-w-modal-lg flex flex-col overflow-hidden"
                 onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-bold">Title</h2>
                    <button onClick={onClose} className="text-foreground-muted hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {/* Body */}
                <div className="p-5 overflow-y-auto custom-scrollbar">{/* content */}</div>
                {/* Footer */}
                <div className="p-4 border-t border-border flex justify-end gap-sm">
                    <button onClick={onClose} className="btn-secondary">Hủy</button>
                    <button className="btn-primary">Xác nhận</button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ExampleModal);
```

## Checklist
- [ ] Props: `isOpen` + `onClose`
- [ ] Overlay: `modal-overlay` class, `handleOverlayClick` with `useCallback`
- [ ] Content: `modal-content` + `max-w-modal-*`, `stopPropagation`
- [ ] Early return `null` when `!isOpen`
- [ ] Close icon: `<X />` from `lucide-react`
- [ ] Export with `React.memo`
- [ ] Cleanup `keydown` listeners in `useEffect` return
- [ ] Reuse components from `components/UICustoms/`
