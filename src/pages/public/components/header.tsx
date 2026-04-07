import Button from "../../../components/UICustoms/Button"
import { useAppDispatch, useAppSelector } from "../../../store/redux.hooks"
import { openAuthModal } from "../../../store/slices/auth.slice"
import ThemeToggle from "../../../components/UICustoms/ThemeToggle"
import Logo from "../../../components/UICustoms/Logo"

export function Header() {
    //#region States
    const dispatch = useAppDispatch()
    const { isRoleSelectionModalOpen } = useAppSelector((state) => state.auth)
    //#endregion

    //#region Render
    return (
        <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-lg py-md">
                <div className="flex items-center gap-xl lg:gap-2xl">
                    <a href="#hero" className="flex items-center shrink-0 gap-sm">
                        <Logo />
                    </a>
                    <nav className={`hidden items-center gap-lg md:flex ${isRoleSelectionModalOpen ? 'pointer-events-none opacity-50' : ''}`}>
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
                    <ThemeToggle />
                    <div className="hidden md:block">
                        <Button
                            size="large"
                            variant="primary"
                            onClick={() => dispatch(openAuthModal())}
                            disabled={isRoleSelectionModalOpen}
                        >
                            Đăng nhập
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
    //#endregion
}
