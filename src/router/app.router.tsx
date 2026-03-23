import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { RouteConstant } from "../constants/route.constant";
import CreatePaymentPage from "../pages/user/qr/page";
import AccountsPage from "../pages/user/account/page";
import QrHistoryPage from "../pages/user/history/page";
import AdminDashboardPage from "../pages/admin/dashboard/page";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
import RequireAuth from "../auth/RequireAuth";
import RequireRole from "../auth/RequireRole";
import AuthenModal from "../components/Modals/AuthenModal";
import RootRoute from "./RootRoute";
import BankPage from "../pages/admin/bank/page";
import UserPage from "../pages/admin/user/page";
import RolePage from "../pages/admin/role/page";
import HistoryPage from "../pages/admin/history/page";
import AccountPage from "@/pages/admin/account/page";
import ProviderPage from "../pages/admin/provider/page";
import SeedPage from "../pages/admin/seed/page";
import AdminQrStyleLibPage from "../pages/admin/qrStyleLib/page";
import UserQrStyleLibPage from "../pages/user/qrStyleLib/page";

const RootWrapper = () => (
    <>
        <AuthenModal />
        <Outlet />
    </>
);

export const router = createBrowserRouter([
    {
        path: RouteConstant.HOME,
        element: <RootWrapper />,
        errorElement: <ErrorPage />,
        children: [
            // ─── PUBLIC ROUTES ──────────────────────────────────────────────
            { index: true, element: <RootRoute /> },

            // ─── USER ROUTES (Role = "user") ──────────────────────────────────
            {
                path: RouteConstant.USER,
                element: (
                    <RequireAuth>
                        <RequireRole roleName="user">
                            <UserLayout />
                        </RequireRole>
                    </RequireAuth>
                ),
                children: [
                    { index: true, element: <CreatePaymentPage /> },
                    { path: RouteConstant.ACCOUNTS, element: <AccountsPage /> },
                    { path: RouteConstant.QR_HISTORY, element: <QrHistoryPage /> },
                    { path: RouteConstant.USER_QR_STYLE_LIB, element: <UserQrStyleLibPage /> },
                ],
            },

            // ─── ADMIN ROUTES (Role = "admin") ────────────────────────────────
            {
                path: RouteConstant.ADMIN,
                element: (
                    <RequireAuth>
                        <RequireRole roleName="admin">
                            <AdminLayout />
                        </RequireRole>
                    </RequireAuth>
                ),
                children: [
                    { index: true, element: <AdminDashboardPage /> },
                    { path: RouteConstant.ADMIN_BANKS, element: <BankPage /> },
                    { path: RouteConstant.ADMIN_USERS, element: <UserPage /> },
                    { path: RouteConstant.ADMIN_ROLES, element: <RolePage /> },
                    { path: RouteConstant.ADMIN_ACCOUNTS, element: <AccountPage /> },
                    { path: RouteConstant.ADMIN_HISTORY, element: <HistoryPage /> },
                    { path: RouteConstant.ADMIN_PROVIDERS, element: <ProviderPage /> },
                    { path: RouteConstant.ADMIN_SEED, element: <SeedPage /> },
                    { path: RouteConstant.ADMIN_QR_STYLE_LIB, element: <AdminQrStyleLibPage /> },
                ],
            },

            // ─── FALLBACK ─────────────────────────────────────────────────────
            {
                path: "*",
                element: <Navigate to={RouteConstant.HOME} replace />,
            }
        ]
    }
]);
