import React, { memo } from "react";
import { Home, Zap, Mail, type LucideIcon } from "lucide-react";

//#region Types
interface NavItem {
    href: string;
    icon: LucideIcon;
    label: string;
}
//#endregion

//#region Constants
const NAV_ITEMS: NavItem[] = [
    { href: "#hero", icon: Home, label: "Trang chủ" },
    { href: "#features", icon: Zap, label: "Tính năng" },
    { href: "#contact", icon: Mail, label: "Liên hệ" },
];
//#endregion

//#region Sub-components
const NavLink: React.FC<NavItem> = memo(({ href, icon: Icon, label }) => (
    <a
        href={href}
        className="group relative flex items-center justify-center p-md rounded-xl text-foreground-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
        title={label}
    >
        <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
        <span className="absolute right-full mr-md px-md py-sm rounded-xl bg-surface-elevated border border-border-strong text-xs font-black uppercase tracking-widest text-foreground whitespace-nowrap opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none shadow-2xl select-none cursor-default z-50">
            {label}
        </span>
    </a>
));
//#endregion

const FloatingNav: React.FC = () => {
    //#region Render
    return (
        <div className="fixed bottom-lg right-lg z-50 flex flex-col gap-sm">
            <nav className="flex flex-col gap-xs p-xs bg-surface/80 backdrop-blur-2xl border border-border/60 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-700">
                {NAV_ITEMS.map((item) => (
                    <NavLink key={item.href} {...item} />
                ))}
            </nav>
        </div>
    );
    //#endregion
};

export default memo(FloatingNav);
