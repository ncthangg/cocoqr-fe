import React from "react";
import { Users, QrCode, Landmark, Layers } from "lucide-react";
import { StatCard } from "@/components/UICustoms/StatCard";

const AdminDashboardPage: React.FC = () => {
    return (
        <div className="flex flex-col gap-xl">
            <div className="flex items-center justify-between">
                <div>
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Tổng quan hệ thống</h1>
                    <p className="text-sm text-foreground-muted font-medium">Chào mừng trở lại với bảng điều khiển quản trị MyWallet.</p>
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
        </div>
    );
};

export default AdminDashboardPage;
