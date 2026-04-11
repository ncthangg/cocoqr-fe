import React from "react";
import { Card, CardContent } from "../../../components/UICustoms/Card";
import { Zap, Bookmark, Building2, ShieldCheck, type LucideIcon } from "lucide-react";

//#region Types
interface FeatureItem {
    icon: LucideIcon;
    title: string;
    description: string;
}
//#endregion

//#region Constants
const FEATURES: FeatureItem[] = [
    {
        icon: Zap,
        title: "Tạo QR siêu nhanh",
        description: "Chỉ cần nhập thông tin tài khoản, mã QR thanh toán được tạo tức thì chỉ trong vài giây.",
    },
    {
        icon: Bookmark,
        title: "Lưu tài khoản thường dùng",
        description: "Lưu trữ thông tin tài khoản ngân hàng để tạo QR nhanh hơn cho lần sau.",
    },
    {
        icon: Building2,
        title: "Hỗ trợ nhiều ngân hàng",
        description: "Tương thích với hầu hết các ngân hàng tại Việt Nam như Vietcombank, Techcombank, MB Bank, v.v.",
    },
    {
        icon: ShieldCheck,
        title: "Bảo mật tuyệt đối",
        description: "Thông tin của bạn được mã hóa và bảo vệ an toàn, không chia sẻ với bên thứ ba.",
    },
];
//#endregion

//#region Sub-components
const FeatureCard: React.FC<FeatureItem> = React.memo(({ icon: Icon, title, description }) => (
    <Card className="group border-border/60 bg-bg transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.02] select-none cursor-default">
        <CardContent className="flex flex-col gap-md p-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/30">
                <Icon className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-secondary font-bold text-foreground tracking-tight">
                {title}
            </h3>
            <p className="text-base font-primary leading-relaxed text-foreground-secondary opacity-90">
                {description}
            </p>
        </CardContent>
    </Card>
));
//#endregion

export function FeaturesSection() {
    //#region Render
    return (
        <section id="features" className="w-full min-h-[calc(100vh-73px)] py-2xl flex flex-col justify-center bg-bg relative overflow-hidden snap-start snap-always">
            <div className="mx-auto max-w-6xl px-lg">
                <div className="mx-auto mb-xl w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-sm px-md py-xs rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <span className="text-sm font-bold tracking-widest uppercase">Tại sao chọn CocoQR?</span>
                    </div>
                    <h2 className="text-4xl font-primary font-black tracking-tighter text-foreground md:text-5xl select-none cursor-default">
                        Tính năng nổi bật
                    </h2>
                    <p className="mt-md max-w-4xl text-lg font-primary font-medium text-foreground-secondary mx-auto leading-relaxed select-none cursor-default opacity-80">
                        Giải pháp tạo mã QR thanh toán toàn diện, phục vụ cá nhân và doanh nghiệp với trải nghiệm mượt mà nhất.
                    </p>
                </div>

                <div className="grid gap-xl sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map((feature) => (
                        <FeatureCard key={feature.title} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
    //#endregion
}
