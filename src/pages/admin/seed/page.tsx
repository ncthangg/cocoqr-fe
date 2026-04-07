import React, { useState, lazy, Suspense } from "react";
import { ShieldCheck, Landmark, Layers, ChevronRight, AlertTriangle } from "lucide-react";
import Button from "@/components/UICustoms/Button";

const BankSyncPreviewModal = lazy(() => import("./components/BankSyncPreviewModal"));
const RoleSyncPreviewModal = lazy(() => import("./components/RoleSyncPreviewModal"));
const ProviderSyncPreviewModal = lazy(() => import("./components/ProviderSyncPreviewModal"));

const SeedPage: React.FC = () => {
    //#region States
    const [isBankPreviewOpen, setIsBankPreviewOpen] = useState(false);
    const [isRolePreviewOpen, setIsRolePreviewOpen] = useState(false);
    const [isProviderPreviewOpen, setIsProviderPreviewOpen] = useState(false);
    //#endregion

    //#region Render
    return (
        <div className="flex flex-col gap-8 flex-1 min-h-0">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Cấu hình & Khởi tạo dữ liệu</h1>
                <p className="text-sm text-foreground-muted font-medium">Hệ thống đồng bộ dữ liệu gốc từ API Service hoặc các nguồn dữ liệu tin cậy.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Banks Seed Card */}
                <div className="group relative overflow-hidden bg-surface border border-border rounded-3xl p-8 hover:shadow-2xl hover:border-primary/50 transition-all duration-500 shadow-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500">
                        <Landmark className="w-48 h-48 -mr-12 -mt-12 text-primary rotate-12" />
                    </div>

                    <div className="relative flex flex-col h-full">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-primary/20">
                            <Landmark className="w-8 h-8 text-primary" />
                        </div>

                        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-primary rounded-full" />
                            Đồng bộ Ngân hàng
                        </h3>
                        <p className="text-foreground-secondary text-sm leading-relaxed mb-auto font-medium">
                            Tự động lấy danh sách hơn 50 ngân hàng tại Việt Nam (Vietqr/Napas). Xem trước và so sánh dữ liệu trước khi cập nhật.
                        </p>

                        <div className="mt-8">
                            <Button
                                onClick={() => setIsBankPreviewOpen(true)}
                                size="large"
                                width="w-full"
                                className="btn-primary"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    Xem trước & Đồng bộ
                                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Roles Seed Card */}
                <div className="group relative overflow-hidden bg-surface border border-border rounded-3xl p-8 hover:shadow-2xl hover:border-amber-500/50 transition-all duration-500 shadow-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500">
                        <ShieldCheck className="w-48 h-48 -mr-12 -mt-12 text-amber-500 rotate-12" />
                    </div>

                    <div className="relative flex flex-col h-full">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-amber-500/20">
                            <ShieldCheck className="w-8 h-8 text-amber-500" />
                        </div>

                        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
                            Đồng bộ Phân quyền
                        </h3>
                        <p className="text-foreground-secondary text-sm leading-relaxed mb-auto font-medium">
                            Thiết lập các vai trò mặc định trong hệ thống (ADMIN, USER). Xem trước so sánh trước khi đồng bộ quyền truy cập.
                        </p>

                        <div className="mt-8">
                            <Button
                                onClick={() => setIsRolePreviewOpen(true)}
                                size="large"
                                width="w-full"
                                className="group/btn relative overflow-hidden rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold h-14 transition-all active:scale-95 shadow-lg shadow-amber-500/20 border-none"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    Xem trước & Đồng bộ
                                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Providers Seed Card */}
                <div className="group relative overflow-hidden bg-surface border border-border rounded-3xl p-8 hover:shadow-2xl hover:border-violet-500/50 transition-all duration-500 shadow-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500">
                        <Layers className="w-48 h-48 -mr-12 -mt-12 text-violet-500 rotate-12" />
                    </div>

                    <div className="relative flex flex-col h-full">
                        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-violet-500/20">
                            <Layers className="w-8 h-8 text-violet-500" />
                        </div>

                        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-violet-500 rounded-full" />
                            Đồng bộ Nhà cung cấp
                        </h3>
                        <p className="text-foreground-secondary text-sm leading-relaxed mb-auto font-medium">
                            Đồng bộ danh sách nhà cung cấp dịch vụ (Ngân hàng, Ví điện tử, ...). Xem trước và kiểm tra trước khi cập nhật.
                        </p>

                        <div className="mt-8">
                            <Button
                                onClick={() => setIsProviderPreviewOpen(true)}
                                size="large"
                                width="w-full"
                                className="group/btn relative overflow-hidden rounded-2xl bg-violet-500 hover:bg-violet-600 text-white font-bold h-14 transition-all active:scale-95 shadow-lg shadow-violet-500/20 border-none"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    Xem trước & Đồng bộ
                                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Notes */}
            <div className="mt-auto p-6 bg-surface-muted/30 border border-border/50 rounded-2xl flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-sm text-foreground uppercase tracking-widest">Lưu ý bảo mật & hiệu năng</h4>
                    <p className="text-xs text-foreground-muted leading-relaxed font-medium">
                        Thao tác đồng bộ dữ liệu có thể ghi đè hoặc bổ sung bản ghi hiện tại. Vui lòng không làm mới trình duyệt khi quá trình đang diễn ra.
                        Sau khi đồng bộ thành công, bạn có thể kiểm tra dữ liệu tại các trang quản lý tương ứng.
                    </p>
                </div>
            </div>

            {/* Sync Preview Modals */}
            {isBankPreviewOpen && (
                <Suspense fallback={null}>
                    <BankSyncPreviewModal
                        isOpen={isBankPreviewOpen}
                        onClose={() => setIsBankPreviewOpen(false)}
                        onSyncSuccess={() => setIsBankPreviewOpen(false)}
                    />
                </Suspense>
            )}
            {isRolePreviewOpen && (
                <Suspense fallback={null}>
                    <RoleSyncPreviewModal
                        isOpen={isRolePreviewOpen}
                        onClose={() => setIsRolePreviewOpen(false)}
                        onSyncSuccess={() => setIsRolePreviewOpen(false)}
                    />
                </Suspense>
            )}
            {isProviderPreviewOpen && (
                <Suspense fallback={null}>
                    <ProviderSyncPreviewModal
                        isOpen={isProviderPreviewOpen}
                        onClose={() => setIsProviderPreviewOpen(false)}
                        onSyncSuccess={() => setIsProviderPreviewOpen(false)}
                    />
                </Suspense>
            )}
        </div>
    );
    //#endregion
};

export default SeedPage;
