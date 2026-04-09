import React from 'react';
import { cn } from '@/lib/utils';
import Logo from '@/components/UICustoms/Logo';
import type { StyleConfig, AnimationState } from './types';

interface QRPreviewProps {
    qrPreviewRef: React.RefObject<HTMLDivElement | null>;
    originalContainerRef: React.RefObject<HTMLDivElement | null>;
    style: StyleConfig;
    qrData?: string | null;
    qrImageUrl?: string | null;
    isDefaultStyle: boolean;
    isWide: boolean;
    animState: AnimationState;
}

const QRPreview: React.FC<QRPreviewProps> = ({
    qrPreviewRef,
    originalContainerRef,
    style,
    qrData,
    qrImageUrl,
    isDefaultStyle,
    isWide,
    animState
}) => {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-sm overflow-visible transition-all duration-500",
            (!isDefaultStyle && isWide) ? "flex-[45%] min-w-[240px]" : "flex-1 w-full max-w-[300px]",
            animState !== 'closed' ? "opacity-0" : "opacity-100"
        )}>
            <div
                ref={originalContainerRef}
                className={cn(
                    "bg-surface-muted rounded-3xl flex items-center justify-center border border-border-strong border-dashed overflow-hidden relative shadow-inner group hover:border-primary/40 transition-all duration-700 shrink-0",
                    (!isDefaultStyle && isWide) ? "w-48 h-48 lg:w-44 lg:h-44 xl:w-52 xl:h-52" : "w-64 h-64 lg:w-56 lg:h-56 xl:w-64 xl:h-64"
                )}
                style={{ backgroundColor: style.borderColor, padding: 8 }}
            >
                {qrData || qrImageUrl ? (
                    <div
                        ref={qrPreviewRef}
                        className="w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-700 hover:scale-[1.05] transition-transform [&>canvas]:max-w-full [&>canvas]:max-h-full"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-sm text-foreground-muted animate-in fade-in duration-500">
                        <Logo className='w-20 h-20' variant='dark' />
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRPreview;
