import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { RouteConstant } from "../constants/route.constant";
import { useAuthContext } from "../auth/AuthContext";
import { Bell, ChevronDown, LogOut, QrCode, UserIcon } from "lucide-react";
import Button from "../components/UICustoms/Button";
import { authApi } from "../services/auth-api.service";
import ProfileModal from "../components/UICustoms/Modal/ProfileModal";

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
                    <header className="p-4 border-b border-border bg-[#343a40] text-white flex justify-between items-center">
                        <div className="flex items-center gap-8 lg:gap-12">
                            <Link to={RouteConstant.ADMIN} className="flex items-center shrink-0 gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                                    <QrCode className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <span className="text-xl font-bold text-white">Dashboard</span>
                            </Link>

                            <nav className="hidden items-center gap-6 md:flex">
                                <Link to={RouteConstant.ADMIN_USERS} className="text-sm font-bold text-white transition-colors hover:text-foreground">
                                    User
                                </Link>
                                <Link to={RouteConstant.ADMIN_ROLES} className="text-sm font-bold text-white transition-colors hover:text-foreground">
                                    Role
                                </Link>
                                <Link to={RouteConstant.ADMIN_PROVIDERS} className="text-sm font-bold text-white transition-colors hover:text-foreground">
                                    Provider
                                </Link>
                                <Link to={RouteConstant.ADMIN_BANKS} className="text-sm font-bold text-white transition-colors hover:text-foreground">
                                    Bank
                                </Link>
                                <Link to={RouteConstant.ADMIN_ACCOUNTS} className="text-sm font-bold text-white transition-colors hover:text-foreground">
                                    Account
                                </Link>
                                <Link to={RouteConstant.ADMIN_HISTORY} className="text-sm font-bold text-white transition-colors hover:text-foreground">
                                    History
                                </Link>
                                <Link to={RouteConstant.ADMIN_SEED} className="text-sm font-bold text-white transition-colors hover:text-foreground">
                                    Seed
                                </Link>
                            </nav>
                        </div>


                        <div className="flex items-center gap-4">
                            <div className="relative" ref={profileMenuRef}>
                                <div className="flex items-center space-x-4 text-white">
                                    <Button
                                        onClick={() => { }}
                                        icon={<Bell className="w-5 h-5 text-white" />}
                                        aria-label="Thông báo"
                                        className="bg-transparent border-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleToggleMenu}
                                        className="flex items-center space-x-3 rounded-full border border-transparent px-2 py-1 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                                    >
                                        <div className="hidden sm:flex flex-col text-left">
                                            <span className="text-sm font-medium text-white">
                                                {user?.fullName || "Admin"}
                                            </span>
                                            <span className="text-xs text-gray-300">{user?.email}</span>
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
                <footer className="shrink-0 p-4 border-t border-border text-center bg-[#343a40] text-white">
                    <p>&copy; 2026 MyWallet - Administration</p>
                </footer>
            </div>

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={user}
                roles={roles}
            />
        </>
    );
};

export default AdminLayout;
