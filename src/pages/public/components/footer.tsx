import { Facebook, Youtube } from "lucide-react"
import Logo from "@/components/UICustoms/Logo"

/* ─── Zalo icon (not in lucide) ─────────────────────────────── */
function ZaloIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.27c-.202.37-.596.62-1.038.62H7.144c-.442 0-.836-.25-1.038-.62a1.165 1.165 0 0 1 .06-1.194l5.176-7.87H7.5a.75.75 0 0 1 0-1.5h9a1.165 1.165 0 0 1 .978 1.814l-5.176 7.87h4.554a.75.75 0 0 1 0 1.5h-.023c.032-.084.06-.173.06-.266v-.334z" />
        </svg>
    )
}

/* ─── Social links (module scope) ───────────────────────────── */
const SOCIAL_LINKS = [
    { icon: Facebook, label: "Facebook", href: "#" },
    { icon: Youtube, label: "YouTube", href: "#" },
    { icon: ZaloIcon, label: "Zalo", href: "#" },
] as const;

/* ─── Component ─────────────────────────────────────────────── */

export function Footer() {
    //#region Render
    return (
        <footer className="border-t border-border bg-surface">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-lg px-lg py-xl md:flex-row md:justify-between">
                <div className="flex items-center gap-sm">
                    <a href="#hero" className="flex items-center shrink-0 gap-sm">
                        <Logo />
                    </a>
                    <span className="text-lg font-bold text-foreground">CocoQR</span>
                </div>

                <div className="flex items-center gap-md">
                    {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                        <a
                            key={label}
                            href={href}
                            className="text-foreground-muted transition-colors hover:text-foreground"
                            aria-label={label}
                        >
                            <Icon className="h-5 w-5" />
                        </a>
                    ))}
                </div>

                <p className="text-sm text-foreground-muted">
                    &copy; {new Date().getFullYear()} COCO QR. All rights reserved.
                </p>
            </div>
        </footer>
    )
    //#endregion
}
