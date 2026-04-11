import Button from "../../../components/UICustoms/Button"
import { useAppDispatch, useAppSelector } from "../../../store/redux.hooks"
import { openAuthModal } from "../../../store/slices/auth.slice"
import ThemeToggle from "../../../components/UICustoms/ThemeToggle"
import { Link } from "react-router-dom"
import { RouteConstant } from "../../../constants/route.constant"
import Logo from "@/components/UICustoms/Logo"
import React from "react"

export function Header() {
    //#region States
    const dispatch = useAppDispatch()
    const { isRoleSelectionModalOpen } = useAppSelector((state) => state.auth)
    //#endregion

    //#region Handlers
    const handleLoginClick = React.useCallback(() => {
        dispatch(openAuthModal())
    }, [dispatch])
    //#endregion

    //#region Render
    return (
        <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md select-none cursor-default">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-lg py-md">
                <div className="flex items-center gap-xl lg:gap-2xl">
                    <Link to={RouteConstant.HOME} className="flex items-center shrink-0 gap-sm hover:opacity-80 transition-opacity">
                        <Logo />
                    </Link>
                    <nav className={`hidden items-center gap-xl md:flex ${isRoleSelectionModalOpen ? 'pointer-events-none opacity-50' : ''}`}>
                        <Link 
                            to={RouteConstant.COMMITMENT} 
                            className="text-base font-bold text-foreground transition-all hover:text-primary hover:scale-105"
                        >
                            Cam kết
                        </Link>
                        <Link 
                            to={RouteConstant.GUIDE} 
                            className="text-base font-bold text-foreground transition-all hover:text-primary hover:scale-105"
                        >
                            Hướng dẫn
                        </Link>
                        <Link 
                            to={RouteConstant.ABOUT} 
                            className="text-base font-bold text-foreground transition-all hover:text-primary hover:scale-105"
                        >
                            Về tôi
                        </Link>
                        <Link 
                            to={RouteConstant.THANK_TO} 
                            className="text-base font-bold text-foreground transition-all hover:text-primary hover:scale-105"
                        >
                            Thanks to
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-md">
                    <ThemeToggle />
                    <div className="hidden md:block">
                        <Button
                            size="large"
                            variant="primary"
                            onClick={handleLoginClick}
                            disabled={isRoleSelectionModalOpen}
                            className="px-8 font-bold text-base"
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
