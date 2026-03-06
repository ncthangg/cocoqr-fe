import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { RouteConstant } from "../constants/route.constant";
import Button from "../components/UICustoms/Button";
import { Bell, ChevronDown, LogOut, UserIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/redux.hooks";
import { useAuth } from "../auth/useAuth";
import { clearCredentials, openAuthModal } from "../store/slices/auth.slice";
import { toast } from "react-toastify";
import { Footer } from "../pages/public/ui/footer";
import { authApi } from "../services/auth-api.service";

const PublicLayout: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { isAuthenticated } = useAuth();
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    //#region Process
    const initials = useMemo(() => {
        if (!user?.fullName) return "SS";
        return user.fullName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((fullName) => fullName[0])
            .join("")
            .toUpperCase();
    }, [user?.fullName]);
    //#endregion

    //#region Fetch Effect
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
    //#endregion

    //#region Button Click
    const handleLoginClick = () => {
        dispatch(openAuthModal());
    };

    const handleToggleMenu = () => {
        setProfileMenuOpen((prev) => !prev);
    };

    const handleViewProfile = () => {
        if (user) {
            toast.info(`Email: ${user.email}`, { toastId: "profile-info" });
        }
        setProfileMenuOpen(false);
    };

    const handleLogout = async () => {
        dispatch(clearCredentials());
        await authApi.signOut();
        setProfileMenuOpen(false);
    };
    //#endregion

    return (
        <div className="main-layout min-h-screen flex flex-col">
            <header className="p-4 border-b border-border flex justify-between items-center">
                <nav>
                    <ul className="flex gap-4 list-none">
                        <li><Link to={RouteConstant.CREATE_QR}>CreateQR</Link></li>
                        <li><Link to={RouteConstant.ACCOUNTS}>Accounts</Link></li>
                        <li><Link to={RouteConstant.QR_HISTORY}>QRHistory</Link></li>
                    </ul>
                </nav>
                <div className="flex items-center space-x-4">
                    {(isAuthenticated && user) ? (
                        <div className="relative" ref={profileMenuRef}>
                            <div className="flex items-center space-x-4">
                                <Button
                                    onClick={() => { }}
                                    icon={<Bell className="w-5 h-5" />}
                                    aria-label="Thông báo"
                                />
                                <button
                                    type="button"
                                    onClick={handleToggleMenu}
                                    className="flex items-center space-x-3 rounded-full border border-transparent px-2 py-1 hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                                >
                                    <div className="hidden sm:flex flex-col text-left">
                                        <span className="text-sm font-medium text-text-primary">
                                            {user.fullName}
                                        </span>
                                        <span className="text-xs text-text-subtle">{user.email}</span>
                                    </div>

                                    {user.pictureUrl ? (
                                        <img
                                            src={user.pictureUrl}
                                            alt={user.fullName}
                                            className="w-9 h-9 rounded-full border border-brand-200 object-cover"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center border border-brand-200">
                                            <span className="text-sm font-semibold text-brand-700">{initials}</span>
                                        </div>
                                    )}
                                    <ChevronDown className="w-4 h-4 text-text-subtle" />
                                </button>
                            </div>

                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-60 rounded-lg border border-surface-subtle bg-surface-base shadow-xl z-[60]">
                                    <button
                                        type="button"
                                        onClick={handleViewProfile}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-surface-muted"
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
                    ) : (
                        <Button
                            onClick={handleLoginClick}
                            value="Signin"
                        />
                    )}
                </div>
            </header>
            <main className="p-8 flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
