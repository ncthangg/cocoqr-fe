import React from "react";
import { Landmark, Pencil, PlusCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import BrandLogo from "@/components/UICustoms/BrandLogo";
import type { ProviderRes } from "@/models/entity.model";

interface PreviewSectionProps {
    isBankType: boolean;
    bankCode?: string | null;
    bankName?: string | null;
    bankLogoUrl?: string | null;
    selectedProvider: ProviderRes | null;
    onOpenBankModal: () => void;
}

const PreviewSection: React.FC<PreviewSectionProps> = React.memo(({
    isBankType,
    bankCode,
    bankName,
    bankLogoUrl,
    selectedProvider,
    onOpenBankModal
}) => (
    <div className="md:col-span-2 flex flex-col items-center">
        <div
            className={cn(
                "relative w-full aspect-square max-w-[240px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-lg transition-all duration-300 group",
                isBankType
                    ? "cursor-pointer hover:border-primary hover:bg-primary/[0.03] bg-surface-muted/50 dark:bg-surface-muted/20 border-border shadow-inner"
                    : "border-border/50 bg-surface-muted/10 cursor-default"
            )}
            onClick={() => isBankType && onOpenBankModal()}
        >
            {isBankType ? (
                <>
                    {(bankCode || bankLogoUrl) ? (
                        <div className="flex flex-col items-center gap-md text-center animate-in fade-in zoom-in duration-300 w-full">
                            <BrandLogo
                                logoUrl={bankLogoUrl}
                                name={bankName ?? undefined}
                                code={bankCode ?? undefined}
                                size="xl"
                                shadow="lg"
                                className="group-hover:scale-105"
                            />
                            <div className="flex flex-col gap-xs">
                                <p className="font-bold text-foreground text-lg tracking-tight">{bankCode}</p>
                                <p className="text-[11px] text-foreground-secondary font-medium line-clamp-2 px-sm leading-relaxed uppercase opacity-80">{bankName}</p>
                            </div>
                            <div className="absolute top-md right-md bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <Pencil className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-md text-center text-foreground-muted group-hover:text-primary transition-all duration-300">
                            <div className="w-24 h-24 bg-surface-elevated rounded-2xl border border-border shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:border-primary/30 transition-all">
                                <Landmark className="w-10 h-10 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                            </div>
                            <div className="flex flex-col gap-xs">
                                <p className="font-bold text-sm">Chọn ngân hàng</p>
                                <p className="text-[10px] px-md uppercase tracking-[0.2em] font-black opacity-40 group-hover:opacity-100 transition-opacity">Required</p>
                            </div>
                        </div>
                    )}
                </>
            ) : selectedProvider ? (
                <div className="flex flex-col items-center gap-md text-center animate-in fade-in zoom-in duration-300 w-full">
                    <BrandLogo
                        logoUrl={selectedProvider.logoUrl}
                        name={selectedProvider.name}
                        code={selectedProvider.code}
                        size="xl"
                        shadow="lg"
                        className="group-hover:scale-105"
                    />
                    <div className="flex flex-col gap-xs">
                        <p className="font-bold text-foreground text-lg tracking-tight">{selectedProvider.name}</p>
                        <p className="text-[11px] text-foreground-muted uppercase tracking-[0.2em] font-black leading-relaxed">{selectedProvider.code}</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-sm text-foreground-muted text-center p-md">
                    <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center mb-2">
                        <PlusCircle className="w-6 h-6 opacity-20" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-normal">
                        Vui lòng chọn<br />"LOẠI TÀI KHOẢN"
                    </p>
                </div>
            )}
        </div>

        {isBankType && (
            <button
                type="button"
                onClick={onOpenBankModal}
                className="mt-lg flex items-center gap-sm text-sm font-bold text-primary hover:text-primary-dark transition-colors group px-md py-sm hover:bg-primary/5 rounded-full"
            >
                {bankCode ? "Thay đổi ngân hàng" : "Chọn ngân hàng"}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        )}
    </div>
));

export default PreviewSection;
