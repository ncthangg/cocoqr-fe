import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { RouteConstant } from "@/constants/route.constant";
import { lazy, Suspense } from "react";

const AdminLayout = lazy(() => import("@/layouts/AdminLayout"))
const UserLayout = lazy(() => import("@/layouts/UserLayout"))

import RequireAuth from "@/auth/RequireAuth";
import RequireRole from "@/auth/RequireRole";
import AuthenModal from "@/components/Modals/AuthenModal";
import RoleSelectionModal from "@/components/Modals/RoleSelectionModal";

const RootRoute = lazy(() => import("@/router/RootRoute"))
const ErrorPage = lazy(() => import("@/pages/ErrorPage/ErrorPage"));
import { UnauthorizedProvider } from "@/auth/UnauthorizedContext";

const CreatePaymentPage = lazy(() => import("@/pages/user/qr/page"))
const AccountsPage = lazy(() => import("@/pages/user/account/page"))
const QrHistoryPage = lazy(() => import("@/pages/user/history/page"))
const UserQrStyleLibPage = lazy(() => import("@/pages/user/qrStyleLib/page"))

const AdminDashboardPage = lazy(() => import("@/pages/admin/dashboard/page"))
const BankPage = lazy(() => import("@/pages/admin/bank/page"))
const UserPage = lazy(() => import("@/pages/admin/user/page"))
const RolePage = lazy(() => import("@/pages/admin/role/page"))
const AccountPage = lazy(() => import("@/pages/admin/account/page"))
const HistoryPage = lazy(() => import("@/pages/admin/history/page"))
const ProviderPage = lazy(() => import("@/pages/admin/provider/page"))
const SeedPage = lazy(() => import("@/pages/admin/seed/page"))
const AdminQrStyleLibPage = lazy(() => import("@/pages/admin/qrStyleLib/page"))
const EmailLogPage = lazy(() => import("@/pages/admin/emailLog/page"))
const SmtpSettingsPage = lazy(() => import("@/pages/admin/smtpSettings/page"))
const EmailTemplatePage = lazy(() => import("@/pages/admin/emailTemplate/page"))
const ContactMessagePage = lazy(() => import("@/pages/admin/contactMessage/page"))

const GuidePage = lazy(() => import("@/pages/share/guide/page"))
const CommitmentPage = lazy(() => import("@/pages/share/commitment/page"))
const AboutPage = lazy(() => import("@/pages/share/about/page"))
const ThankToPage = lazy(() => import("@/pages/share/thankto/page"))

const RootWrapper = () => (
    <UnauthorizedProvider>
        <Suspense fallback={null}>
            <Outlet />
        </Suspense>
        <AuthenModal />
        <RoleSelectionModal />
    </UnauthorizedProvider>
);

export const router = createBrowserRouter([
    {
        path: RouteConstant.HOME,
        element: <RootWrapper />,
        errorElement: <ErrorPage />,
        children: [
            // ─── PUBLIC ROUTES ──────────────────────────────────────────────
            { index: true, element: <RootRoute /> },
            { path: RouteConstant.GUIDE, element: <GuidePage /> },
            { path: RouteConstant.COMMITMENT, element: <CommitmentPage /> },
            { path: RouteConstant.ABOUT, element: <AboutPage /> },
            { path: RouteConstant.THANK_TO, element: <ThankToPage /> },

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
                    { path: RouteConstant.ADMIN_EMAIL_LOG, element: <EmailLogPage /> },
                    { path: RouteConstant.ADMIN_SMTP_SETTINGS, element: <SmtpSettingsPage /> },
                    { path: RouteConstant.ADMIN_EMAIL_TEMPLATES, element: <EmailTemplatePage /> },
                    { path: RouteConstant.ADMIN_CONTACT_MESSAGES, element: <ContactMessagePage /> },
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
