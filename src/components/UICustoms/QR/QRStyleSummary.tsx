import React from 'react';
import { Palette, Image as ImageIcon } from 'lucide-react';
import type { StyleConfig } from './types';

interface QRStyleSummaryProps {
    style: StyleConfig;
}

const QRStyleSummary: React.FC<QRStyleSummaryProps> = ({ style }) => {
    return (
        <div className="flex flex-col gap-sm mb-md animate-in fade-in slide-in-from-right-4 duration-500 w-full">
            <h4 className="text-[10px] font-black text-foreground-muted uppercase tracking-widest mb-xs flex items-center gap-1.5">
                <Palette className="w-3 h-3" /> Thông số tùy chỉnh
            </h4>
            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 px-2 py-1.5 bg-surface-muted/50 rounded-lg border border-border/40">
                    <div className="w-3 h-3 rounded-full border border-border/60" style={{ backgroundColor: style.bgColor }} />
                    <span className="text-[10px] font-bold text-foreground-secondary truncate max-w-[60px] uppercase">{style.bgColor}</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 bg-surface-muted/50 rounded-lg border border-border/40">
                    <div className="w-3 h-3 rounded-full border border-border/60" style={{ backgroundColor: style.pointColor }} />
                    <span className="text-[10px] font-bold text-foreground-secondary truncate max-w-[60px] uppercase">{style.pointColor}</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 bg-surface-muted/50 rounded-lg border border-border/40">
                    <div className="w-3 h-3 rounded-full border border-border/60" style={{ backgroundColor: style.eyeColor }} />
                    <span className="text-[10px] font-bold text-foreground-secondary truncate max-w-[60px] uppercase">{style.eyeColor}</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 bg-surface-muted/50 rounded-lg border border-border/40">
                    <span className="text-[9px] font-black text-primary uppercase">
                        {style.pattern === 'default' ? 'Vuông' : style.pattern === 'rounded' ? 'Bo góc' : 'Chấm'}
                    </span>
                </div>
                {style.logo && (
                    <div className="col-span-2 flex items-center gap-2 px-2 py-1.5 bg-primary/5 rounded-lg border border-primary/10">
                        <ImageIcon className="w-3 h-3 text-primary" />
                        <span className="text-[9px] font-black text-primary uppercase">Đã chèn Logo</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRStyleSummary;
