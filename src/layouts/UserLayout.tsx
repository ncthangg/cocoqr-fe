import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { RouteConstant } from "../constants/route.constant";
import { useAuthContext } from "../auth/AuthContext";
import { Bell, ChevronDown, LogOut, UserIcon } from "lucide-react";
import Button from "../components/UICustoms/Button";
import { toast } from "react-toastify";
import { authApi } from "../services/auth-api.service";

const UserLayout: React.FC = () => {
    const { logout, user } = useAuthContext();
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const initials = useMemo(() => {
        if (!user?.fullName) return "US";
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
        if (user) {
            toast.info(`Email: ${user.email}`, { toastId: "user-profile-info" });
        }
        setProfileMenuOpen(false);
    };

    const handleLogout = async () => {
        logout();
        await authApi.signOut();
        setProfileMenuOpen(false);
    };

    return (
        <div className="user-layout min-h-screen flex flex-col">
            <header className="p-4 border-b border-border bg-surface flex justify-between items-center">
                <nav>
                    <ul className="flex gap-4 list-none m-0 p-0">
                        <li><Link to={RouteConstant.USER} className="font-bold no-underline text-[#007bff]">Dashboard</Link></li>
                        <li><Link to={RouteConstant.ACCOUNTS} className="no-underline text-[#333]">Accounts</Link></li>
                        <li><Link to={RouteConstant.QR_HISTORY} className="no-underline text-[#333]">QR History</Link></li>
                    </ul>
                </nav>
                <div className="flex items-center space-x-4">
                    <div className="relative" ref={profileMenuRef}>
                        <div className="flex items-center space-x-4">
                            <Button
                                onClick={() => { }}
                                icon={<Bell className="w-5 h-5 text-gray-500" />}
                                aria-label="Thông báo"
                                className="bg-transparent border-none"
                            />
                            <button
                                type="button"
                                onClick={handleToggleMenu}
                                className="flex items-center space-x-3 rounded-full border border-transparent px-2 py-1 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <div className="hidden sm:flex flex-col text-left">
                                    <span className="text-sm font-medium text-gray-900">
                                        {user?.fullName || "User"}
                                    </span>
                                    <span className="text-xs text-gray-500">{user?.email}</span>
                                </div>

                                {user?.pictureUrl ? (
                                    <img
                                        src={user.pictureUrl}
                                        alt={user.fullName}
                                        className="w-9 h-9 rounded-full border border-blue-200 object-cover"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                                        <span className="text-sm font-semibold text-blue-700">{initials}</span>
                                    </div>
                                )}
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-60 rounded-lg border border-gray-200 bg-white shadow-xl z-[60]">
                                <button
                                    type="button"
                                    onClick={handleViewProfile}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
            </header >
            <main className="p-8 flex-1">
                <Outlet />
            </main>
            <footer className="p-4 border-t border-border text-center bg-surface">
                <p>&copy; 2026 MyWallet - User Panel</p>
            </footer>
        </div >
    );
};

export default UserLayout;
