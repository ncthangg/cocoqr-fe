import { useState } from "react"
import { QrCode, Menu, X } from "lucide-react"
import Button from "../../../components/UICustoms/Button"
import { useAppDispatch } from "../../../store/redux.hooks"
import { openAuthModal } from "../../../store/slices/auth.slice"

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const dispatch = useAppDispatch()

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <a href="#hero" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <QrCode className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold text-foreground">QR Pay</span>
                </a>

                <nav className="hidden items-center gap-8 md:flex">
                    <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                        Tính năng
                    </a>
                    <a href="#contact" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                        Liên hệ
                    </a>
                    <Button size="small" onClick={() => dispatch(openAuthModal())}>Đăng nhập</Button>
                </nav>

                <button
                    className="flex items-center justify-center md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
                >
                    {mobileMenuOpen ? (
                        <X className="h-6 w-6 text-foreground" />
                    ) : (
                        <Menu className="h-6 w-6 text-foreground" />
                    )}
                </button>
            </div>

            {mobileMenuOpen && (
                <div className="border-t border-border bg-card px-6 pb-4 pt-2 md:hidden">
                    <nav className="flex flex-col gap-3">
                        <a
                            href="#features"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Tính năng
                        </a>
                        <a
                            href="#contact"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Liên hệ
                        </a>
                        <Button size="small" className="w-full" onClick={() => {
                            dispatch(openAuthModal())
                            setMobileMenuOpen(false)
                        }}>Đăng nhập</Button>
                    </nav>
                </div>
            )}
        </header>
    )
}
