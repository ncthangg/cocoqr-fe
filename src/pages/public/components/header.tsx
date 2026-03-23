import { QrCode } from "lucide-react"
import Button from "../../../components/UICustoms/Button"
import { useAppDispatch } from "../../../store/redux.hooks"
import { openAuthModal } from "../../../store/slices/auth.slice"

export function Header() {
    const dispatch = useAppDispatch()

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-lg py-md">
                <div className="flex items-center gap-xl lg:gap-2xl">
                    <a href="#hero" className="flex items-center shrink-0 gap-sm">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                            <QrCode className="h-5 w-5 text-btn-primary-text" />
                        </div>
                        <span className="text-xl font-bold text-primary">QR Pay</span>
                    </a>

                    <nav className="hidden items-center gap-lg md:flex">
                        <a
                            href="#features"
                            className="text-sm font-bold text-foreground transition-colors hover:text-primary"
                        >
                            Tính năng
                        </a>
                        <a
                            href="#contact"
                            className="text-sm font-bold text-foreground transition-colors hover:text-primary"
                        >
                            Liên hệ
                        </a>
                    </nav>
                </div>

                <div className="flex items-center gap-md">
                    <div className="hidden md:block">
                        <Button
                            size="large"
                            className="btn-primary transition-all duration-300"
                            onClick={() => dispatch(openAuthModal())}
                        >
                            Đăng nhập
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
