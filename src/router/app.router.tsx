import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { RouteConstant } from "../constants/route.constant";
import CreatePaymentPage from "../pages/user/qr/CreatePaymentPage";
import AccountsPage from "../pages/user/account/AccountsPage";
import QrHistoryPage from "../pages/user/history/QrHistoryPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import PublicLayout from "../layouts/PublicLayout";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
import RequireAuth from "../auth/RequireAuth";
import RequireRole from "../auth/RequireRole";
import AuthenModal from "../components/Modals/AuthenModal";
import HomePage from "../pages/public/page";

const RootWrapper = () => (
    <>
        <AuthenModal />
        <Outlet />
    </>
);

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootWrapper />,
        errorElement: <ErrorPage />,
        children: [
            // ─── PUBLIC ROUTES ──────────────────────────────────────────────
            { index: true, element: <HomePage /> },

            /// ─── TEST ──────────────────────────────────
            {
                element: <PublicLayout />,
                children: [
                    { path: RouteConstant.CREATE_QR, element: <CreatePaymentPage /> },
                    { path: RouteConstant.ACCOUNTS, element: <AccountsPage /> },
                    { path: RouteConstant.QR_HISTORY, element: <QrHistoryPage /> },
                ],
            },
            ///

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
