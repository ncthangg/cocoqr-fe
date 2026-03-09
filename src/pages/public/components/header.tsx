import { useState } from "react"
import { QrCode } from "lucide-react"
import Button from "../../../components/UICustoms/Button"
import { useAppDispatch } from "../../../store/redux.hooks"
import { openAuthModal } from "../../../store/slices/auth.slice"

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const dispatch = useAppDispatch()

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-8 lg:gap-12">
                    <a href="#hero" className="flex items-center shrink-0 gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                            <QrCode className="h-5 w-5 text-btn-primary-text" />
                        </div>
                        <span className="text-xl font-bold text-primary">QR Pay</span>
                    </a>

                    <nav className="hidden items-center gap-6 md:flex">
                        <a href="#features" className="text-sm font-bold text-foreground transition-colors">
                            Tính năng
                        </a>
                        <a href="#contact" className="text-sm font-bold text-foreground transition-colors">
                            Liên hệ
                        </a>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                        <Button
                            size="large"
                            className="btn btn-primary"
                            onClick={() => dispatch(openAuthModal())}
                        >
                            Đăng nhập
                        </Button>
                    </div>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="border-t border-border bg-surface px-6 pb-4 pt-2 md:hidden">
                    <nav className="flex flex-col gap-3">
                        <Button
                            size="small"
                            className="btn-primary w-full mt-2"
                            onClick={() => {
                                dispatch(openAuthModal())
                                setMobileMenuOpen(false)
                            }}
                        >
                            Đăng nhập
                        </Button>
                    </nav>
                </div>
            )}
        </header>
    )
}
