import React, { memo, useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/UICustoms/Card";
import { toast } from "react-toastify";

interface ContactInfoCardProps {
    icon: React.ElementType;
    label: string;
    value: string;
    href: string;
}

function ContactInfoCardInner({ icon: Icon, label, value, href }: ContactInfoCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        navigator.clipboard.writeText(value);
        setCopied(true);
        toast.info(`Đã sao chép ${label.toLowerCase()}`);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card
            className="group border-border/60 bg-bg transition-all duration-300 hover:shadow-md hover:scale-[1.01] cursor-pointer"
            onClick={handleCopy}
            title={`Click để sao chép ${label}`}
        >
            <CardContent className="flex items-center gap-md p-lg">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-btn-primary-text">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-foreground-muted">{label}</p>
                    <a
                        href={href}
                        onClick={(e) => e.stopPropagation()}
                        className="truncate block font-semibold text-foreground transition-colors hover:text-primary"
                    >
                        {value}
                    </a>
                </div>
                <div
                    className={`p-2 rounded-lg transition-all duration-300 ${
                        copied ? "bg-green-500/10 text-green-500" : "text-foreground-muted opacity-0 group-hover:opacity-100"
                    }`}
                >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </div>
            </CardContent>
        </Card>
    );
}

export const ContactInfoCard = memo(ContactInfoCardInner);
