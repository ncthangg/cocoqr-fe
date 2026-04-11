import Logo from "@/components/UICustoms/Logo";

//#region Constants
const SOCIAL_LINKS = [
    { label: "Facebook", iconUrl: "https://img.icons8.com/bubbles/100/000000/facebook-new.png", href: "https://facebook.com/ncthangdoubleg", alt: "facebook" },
    { label: "LinkedIn", iconUrl: "https://img.icons8.com/bubbles/100/000000/linkedin.png", href: "https://www.linkedin.com/in/nguyenthang2206", alt: "linkedin" },
    { label: "Instagram", iconUrl: "https://img.icons8.com/bubbles/100/000000/instagram.png", href: "https://instagram.com/n_cthan_g", alt: "instagram" },
    { label: "Portfolio", iconUrl: "https://img.icons8.com/bubbles/100/000000/resume.png", href: "https://thangnc.cocome.online", alt: "portfolio" },
] as const;
//#endregion

export function Footer() {
    //#region Render
    return (
        <footer className="border-t border-border bg-surface select-none cursor-default">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-xl px-lg py-xl md:flex-row md:justify-between">

                {/* Brand & Logo */}
                <div className="flex items-center gap-md">
                    <a href="#hero" className="flex items-center shrink-0 gap-sm hover:opacity-80 transition-opacity">
                        <Logo />
                    </a>
                    <span className="text-2xl font-black text-foreground tracking-tight">CocoQR</span>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-md">
                    {SOCIAL_LINKS.map(({ label, href, iconUrl, alt }) => (
                        <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-all hover:scale-110 active:scale-95 p-xs"
                            aria-label={label}
                        >
                            <img
                                src={iconUrl}
                                alt={alt}
                                className="w-12 h-12 drop-shadow-sm"
                            />
                        </a>
                    ))}
                </div>

                {/* Copyright */}
                <p className="text-base font-medium text-foreground-muted opacity-80">
                    &copy; {new Date().getFullYear()} COCO QR. All rights reserved.
                </p>
            </div>
        </footer>
    );
    //#endregion
}
