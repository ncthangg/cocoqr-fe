import React from 'react';
import { Image as ImageIcon, Circle, Maximize, LayoutGrid, Type } from 'lucide-react';
import type { StyleConfig } from './types';

interface QRStyleSummaryProps {
    style: StyleConfig;
}

const QRStyleSummary: React.FC<QRStyleSummaryProps> = ({ style }) => {
    return (
        <div className="flex flex-col gap-4 mb-6 animate-in fade-in slide-in-from-right-4 duration-500 w-full">
            <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-muted/50 border border-border/40 rounded-xl shadow-sm">
                    <LayoutGrid className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.15em]">THÔNG SỐ</span>
                </div>
                <div className="h-px bg-gradient-to-r from-border/50 to-transparent flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
                {[
                    { label: 'Màu nền', value: style.bgColor, icon: <Maximize size={10} />, isColor: true },
                    { label: 'Điểm ảnh', value: style.pointColor, icon: <LayoutGrid size={10} />, isColor: true },
                    { label: 'Mắt QR', value: style.eyeColor, icon: <Circle size={10} />, isColor: true },
                    {
                        label: 'Hình dạng',
                        value: style.pattern === 'default' ? 'Vuông' : style.pattern === 'rounded' ? 'Bo góc' : 'Chấm',
                        icon: <Type size={10} />,
                        isColor: false
                    },
                ].map((item, idx) => (
                    <div key={idx} className="group flex flex-col gap-1.5 p-2.5 rounded-2xl bg-surface-muted/30 border border-border/40 hover:border-primary/20 hover:bg-surface-muted/50 transition-all duration-300">
                        <div className="flex items-center gap-1.5 text-foreground-muted/60 group-hover:text-primary/60 transition-colors">
                            {item.icon}
                            <span className="text-[8px] font-bold uppercase tracking-wider">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {item.isColor ? (
                                <>
                                    <div className="w-3 h-3 rounded-full border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: item.value }} />
                                    <span className="text-[9px] font-mono font-bold text-foreground-secondary uppercase tracking-tight">{item.value}</span>
                                </>
                            ) : (
                                <span className="text-[9px] font-black text-primary uppercase tracking-tight">{item.value}</span>
                            )}
                        </div>
                    </div>
                ))}

                {style.logo && (
                    <div className="col-span-2 flex items-center justify-between p-3 rounded-2xl bg-primary/5 border border-primary/10 mt-1 hover:bg-primary/10 transition-colors group">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-3 h-3 text-primary" />
                                <span className="text-[9px] font-black text-primary uppercase">Có Logo</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRStyleSummary;
