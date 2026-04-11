import React, { memo, useState, useCallback } from "react";
import { Copy, CheckCircle2, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/UICustoms/Card";
import { toast } from "react-toastify";

//#region Types
interface ContactInfoCardProps {
    icon: LucideIcon;
    label: string;
    value: string;
    href: string;
}
//#endregion

const ContactInfoCardInner: React.FC<ContactInfoCardProps> = ({ icon: Icon, label, value, href }) => {
    //#region States
    const [copied, setCopied] = useState(false);
    //#endregion

    //#region Handlers
    const handleCopy = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(value);
        setCopied(true);
        toast.info(`Đã sao chép ${label.toLowerCase()}`);
        setTimeout(() => setCopied(false), 2000);
    }, [value, label]);
    //#endregion

    //#region Render
    return (
        <Card
            className="group border-border/60 bg-bg transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.02] cursor-pointer overflow-hidden select-none"
            onClick={handleCopy}
            title={`Click để sao chép ${label}`}
        >
            <CardContent className="flex items-center gap-lg p-lg">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20">
                    <Icon className="h-6 w-6 transition-transform group-hover:scale-110" />
                </div>

                <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-foreground-muted uppercase tracking-widest mb-1 opacity-70">
                        {label}
                    </p>
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="truncate block text-lg font-black text-foreground transition-colors hover:text-primary tracking-tight"
                    >
                        {value}
                    </a>
                </div>

                <div
                    className={`p-sm rounded-xl transition-all duration-300 flex items-center justify-center ${copied
                            ? "bg-success/10 text-success shadow-inner"
                            : "text-foreground-muted opacity-0 group-hover:opacity-100 bg-surface-muted"
                        }`}
                >
                    {copied ? <CheckCircle2 className="w-5 h-5 animate-in zoom-in" /> : <Copy className="w-5 h-5" />}
                </div>
            </CardContent>
        </Card>
    );
    //#endregion
}

export const ContactInfoCard = memo(ContactInfoCardInner);
