import React, { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import { Outlet, Link } from "react-router-dom";
import { RouteConstant } from "@/constants/route.constant";
import { useAuthContext } from "@/auth/AuthContext";
import { ChevronDown, LogOut, UserIcon } from "lucide-react";
import ThemeToggle from "@/components/UICustoms/ThemeToggle";
import { authApi } from "@/services/auth-api.service";
import Logo from "@/components/UICustoms/Logo";

const ProfileModal = lazy(() => import("@/components/UICustoms/Modal/ProfileModal"));

const AdminLayout: React.FC = () => {
    const { logout, user, roles } = useAuthContext();
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const initials = useMemo(() => {
        if (!user?.fullName) return "AD";
        return user.fullName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((name) => name[0])
            .join("")
            .toUpperCase();
    }, [user?.fullName]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleToggleMenu = () => {
        setProfileMenuOpen((prev) => !prev);
    };

    const handleViewProfile = () => {
        setProfileMenuOpen(false);
        setIsProfileModalOpen(true);
    };

    const handleLogout = async () => {
        setProfileMenuOpen(false);
        try {
            await authApi.signOut();
        } catch (e) {
            // ignore
        }
        logout();
        window.location.href = "/";
    };

    return (
        <>
            <div className="h-screen flex flex-col overflow-hidden bg-background">
                <div className="shrink-0 z-50">
                    <header className="p-4 border-b border-border bg-surface text-foreground flex justify-between items-center">
                        <div className="flex items-center gap-8 lg:gap-12">
                            <Link to={RouteConstant.ADMIN} className="flex items-center shrink-0 gap-2">
                                <Logo />
                            </Link>
                            <nav className="hidden items-center gap-6 md:flex">
                                <Link to={RouteConstant.ADMIN_CONTACT_MESSAGES} className="text-sm font-bold text-foreground transition-colors hover:text-primary">
                                    Liên hệ
                                </Link>
                                <Link to={RouteConstant.ADMIN_USERS} className="text-sm font-bold text-foreground transition-colors hover:text-primary">
                                    User
                                </Link>
                                <Link to={RouteConstant.ADMIN_ROLES} className="text-sm font-bold text-foreground transition-colors hover:text-primary">
                                    Role
                                </Link>

                                <Link to={RouteConstant.ADMIN_ACCOUNTS} className="text-sm font-bold text-foreground transition-colors hover:text-primary">
                                    Account
                                </Link>
                                <Link to={RouteConstant.ADMIN_PROVIDERS} className="text-sm font-bold text-foreground transition-colors hover:text-primary">
                                    Provider
                                </Link>
                                <Link to={RouteConstant.ADMIN_BANKS} className="text-sm font-bold text-foreground transition-colors hover:text-primary">
                                    Bank
                                </Link>

                                <Link to={RouteConstant.ADMIN_QR_STYLE_LIB} className="text-sm font-bold text-foreground transition-colors hover:text-primary">
                                    QR Style
                                </Link>
                                <Link to={RouteConstant.ADMIN_SMTP_SETTINGS} className="text-sm font-bold text-foreground transition-colors hover:text-primary">
                                    SMTP
                                </Link>
                                <Link to={RouteConstant.ADMIN_EMAIL_TEMPLATES} className="text-sm font-bold text-foreground transition-colors hover:text-primary">
                                    Templates
                                </Link>

                                <Link to={RouteConstant.ADMIN_SEED} className="text-sm font-bold text-foreground transition-colors hover:text-primary">
                                    Seed
                                </Link>
                                <Link to={RouteConstant.ADMIN_HISTORY} className="text-sm font-bold text-foreground transition-colors hover:text-primary">
                                    History
                                </Link>
                                <Link to={RouteConstant.ADMIN_EMAIL_LOG} className="text-sm font-bold text-foreground transition-colors hover:text-primary">
                                    Email Log
                                </Link>
                            </nav>
                        </div>


                        <div className="flex items-center gap-4">
                            <div className="relative" ref={profileMenuRef}>
                                <div className="flex items-center space-x-6 text-foreground">
                                    <ThemeToggle />
                                    <button
                                        type="button"
                                        onClick={handleToggleMenu}
                                        className="flex items-center space-x-3 rounded-full border border-transparent px-2 py-1 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                                    >
                                        <div className="hidden sm:flex flex-col text-left">
                                            <span className="text-sm font-medium text-foreground">
                                                {user?.fullName || "Admin"}
                                            </span>
                                            <span className="text-xs text-foreground-secondary">{user?.email}</span>
                                        </div>

                                        {user?.pictureUrl ? (
                                            <img
                                                src={user.pictureUrl}
                                                alt={user.fullName}
                                                className="w-9 h-9 rounded-full border border-yellow-200 object-cover"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center border border-yellow-200">
                                                <span className="text-sm font-semibold text-yellow-400">{initials}</span>
                                            </div>
                                        )}
                                        <ChevronDown className="w-4 h-4 text-gray-300" />
                                    </button>
                                </div>

                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-60 rounded-lg border border-gray-600 bg-white shadow-xl z-[60] text-gray-800">
                                        <button
                                            type="button"
                                            onClick={handleViewProfile}
                                            className="flex w-full gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                                        >
                                            <UserIcon className="w-4 h-4" />
                                            Thông tin tài khoản
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>
                </div>
                <main className="p-8 flex-1 overflow-auto flex flex-col min-h-0">
                    <Outlet />
                </main>
                <footer className="shrink-0 p-4 border-t border-border text-center bg-surface text-foreground">
                    <p>&copy; 2026 CocoQR - Administration</p>
                </footer>
            </div>

            {isProfileModalOpen && (
                <Suspense fallback={null}>
                    <ProfileModal
                        isOpen={isProfileModalOpen}
                        onClose={() => setIsProfileModalOpen(false)}
                        user={user}
                        roles={roles}
                    />
                </Suspense>
            )}
        </>
    );
};

export default AdminLayout;
