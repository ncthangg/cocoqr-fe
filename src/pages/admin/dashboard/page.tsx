import React from "react";
import { Users, QrCode, Landmark, Layers } from "lucide-react";
import { StatCard } from "@/components/UICustoms/StatCard";
import { authApi } from "@/services/auth-api.service";

const AdminDashboardPage: React.FC = () => {
    const [isLoading, setIsLoading] = React.useState(false);

    const handleFetchOnce = async () => {
        setIsLoading(true);
        try {
            const result = await authApi.me();
            console.log("Single fetch result:", result);
        } catch (error) {
            console.error("Single fetch failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFetchTenTimes = async () => {
        setIsLoading(true);
        try {
            const requests = Array.from({ length: 10 }).map(() => authApi.me());
            const results = await Promise.all(requests);
            console.log("Batch fetch results:", results);
        } catch (error) {
            console.error("Batch fetch failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-xl">
            <div className="flex items-center justify-between">
                <div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Tổng quan hệ thống</h1>
                        <p className="text-sm text-foreground-muted font-medium">Chào mừng trở lại với bảng điều khiển quản trị CocoQR.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
                <StatCard
                    label="Người dùng"
                    value="1,234"
                    icon={<Users className="w-5 h-5" />}
                    color="blue"
                />
                <StatCard
                    label="QR đang hoạt động"
                    value="567"
                    icon={<QrCode className="w-5 h-5" />}
                    color="green"
                />
                <StatCard
                    label="Ngân hàng"
                    value="48"
                    icon={<Landmark className="w-5 h-5" />}
                    color="amber"
                />
                <StatCard
                    label="Provider"
                    value="12"
                    icon={<Layers className="w-5 h-5" />}
                    color="purple"
                />
            </div>

            <div className="mt-8 p-6 border border-border rounded-2xl bg-surface/50 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Hành động gỡ lỗi</h2>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={handleFetchOnce}
                        disabled={isLoading}
                        className={`
                            px-6 py-2.5 rounded-xl font-semibold transition-all duration-300
                            ${isLoading
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-secondary text-secondary-foreground hover:shadow-lg hover:shadow-secondary/25 active:scale-95"
                            }
                        `}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                Đang tải...
                            </span>
                        ) : (
                            "Gọi API 1 lần"
                        )}
                    </button>

                    <button
                        onClick={handleFetchTenTimes}
                        disabled={isLoading}
                        className={`
                            px-6 py-2.5 rounded-xl font-semibold transition-all duration-300
                            ${isLoading
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25 active:scale-95"
                            }
                        `}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                Đang tải...
                            </span>
                        ) : (
                            "Gọi API 10 lần"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
