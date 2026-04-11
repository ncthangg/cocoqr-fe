import React from "react";
import { Header } from "../../public/components/header";
import { Footer } from "../../public/components/footer";
import {
    BookOpen,
    QrCode,
    Download,
    Palette,
    LogIn,
    Library,
    ArrowRight,
    CheckCircle2,
    Image as ImageIcon
} from "lucide-react";

//#region Types
interface GuideStep {
    icon: React.ReactNode;
    title: string;
    description: string;
    imageUrl?: string;
}

interface GuideMethodProps {
    title: string;
    description: string;
    steps: GuideStep[];
    badge: string;
    badgeColor: string;
}
//#endregion

//#region Constants
const METHOD_ONE_STEPS: GuideStep[] = [
    {
        icon: <QrCode className="w-6 h-6" />,
        title: "Bước 1: Tạo mã QR",
        description: "Nhập thông tin ngân hàng và số tiền bạn muốn nhận.",
        imageUrl: "https://res.cloudinary.com/dyy8nd8sd/image/upload/v1775892031/public-step2_wxsld8.webp"
    },
    {
        icon: <Palette className="w-6 h-6" />,
        title: "Bước 2: Tùy chỉnh (Customize)",
        description: "Thay đổi màu sắc, thêm logo cá nhân để mã QR trông chuyên nghiệp hơn.",
        imageUrl: "https://res.cloudinary.com/dyy8nd8sd/image/upload/v1775892030/public-step3_vtffgb.webp"
    },
    {
        icon: <Download className="w-6 h-6" />,
        title: "Bước 3: Tải về sử dụng",
        description: "Lưu mã QR về thiết bị của bạn và bắt đầu nhận tiền ngay lập tức.",
        imageUrl: "https://res.cloudinary.com/dyy8nd8sd/image/upload/v1775893353/public-step4_nvrtjb.webp"
    }
];

const METHOD_TWO_STEPS: GuideStep[] = [
    {
        icon: <LogIn className="w-6 h-6" />,
        title: "Bước 1: Đăng nhập",
        description: "Sử dụng tài khoản Google để đồng bộ dữ liệu trên mọi thiết bị.",
        imageUrl: "https://res.cloudinary.com/dyy8nd8sd/image/upload/v1775892032/login-screen_ayp6g9.webp"
    },
    {
        icon: <QrCode className="w-6 h-6" />,
        title: "Bước 2: Tạo mã QR",
        description: "Thiết kế mã QR với đầy đủ các tính năng nâng cao tùy chọn.",
        imageUrl: "https://res.cloudinary.com/dyy8nd8sd/image/upload/v1775892029/private-step1_djro6t.webp"
    },
    {
        icon: <Library className="w-6 h-6" />,
        title: "Bước 3: Tùy chỉnh (Customize)",
        description: "Thay đổi màu sắc, thêm logo cá nhân để mã QR trông chuyên nghiệp hơn.",
        imageUrl: "https://res.cloudinary.com/dyy8nd8sd/image/upload/v1775892027/private-step3_jjj5pc.webp"
    },
    {
        icon: <Library className="w-6 h-6" />,
        title: "Bước 4: Lưu vào Thư viện",
        description: "Lưu lại mẫu thiết kế để tái sử dụng nhanh chóng mà không cần nhập lại thông tin.",
        imageUrl: "https://res.cloudinary.com/dyy8nd8sd/image/upload/v1775892027/private-step4_m9v9o5.webp"
    }
];
//#endregion

//#region Sub-components
const StepImage: React.FC<{ label: string; imageUrl?: string }> = React.memo(({ label, imageUrl }) => (
    <div className="w-full aspect-video rounded-xl bg-surface-muted border border-border overflow-hidden flex flex-col items-center justify-center gap-sm group-hover:border-primary/20 transition-all">
        {imageUrl ? (
            <img
                src={imageUrl}
                alt={label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
        ) : (
            <>
                <div className="flex flex-col items-center justify-center gap-sm border-2 border-dashed border-border w-full h-full rounded-xl">
                    <ImageIcon className="w-10 h-10 text-foreground-muted opacity-40" />
                    <p className="text-xs font-medium text-foreground-muted opacity-60 uppercase tracking-widest">{label}</p>
                </div>
            </>
        )}
    </div>
));

const GuideMethod: React.FC<GuideMethodProps> = React.memo(({ title, description, steps, badge, badgeColor }) => (
    <div className="flex flex-col gap-xl p-xl rounded-3xl bg-surface border border-border-strong hover:border-primary/20 transition-all duration-500 group select-none cursor-default">
        <div className="space-y-sm">
            <span className={`inline-flex px-md py-xs rounded-full text-[10px] font-bold uppercase tracking-[0.2em] ${badgeColor} border border-current opacity-80`}>
                {badge}
            </span>
            <h2 className="text-2xl font-black text-foreground tracking-tight">{title}</h2>
            <p className="text-foreground-secondary text-base leading-relaxed opacity-80">
                {description}
            </p>
        </div>

        <div className="space-y-lg">
            {steps.map((step, index) => (
                <div key={index} className="relative pl-xl border-l-2 border-border-subtle group-hover:border-primary/10 transition-colors py-sm last:border-transparent">
                    <div className="absolute -left-[11px] top-sm w-5 h-5 rounded-full bg-bg border-2 border-border-strong flex items-center justify-center group-hover:border-primary/30 transition-colors z-10 transition-transform group-hover:scale-110">
                        <div className="w-1.5 h-1.5 rounded-full bg-foreground-muted group-hover:bg-primary transition-colors" />
                    </div>

                    <div className="flex flex-col gap-md">
                        <div className="flex items-center gap-md">
                            <div className="p-sm rounded-lg bg-surface-elevated border border-border shadow-sm text-primary group-hover:scale-110 transition-transform">
                                {step.icon}
                            </div>
                            <h3 className="font-bold text-foreground">{step.title}</h3>
                        </div>
                        <p className="text-sm text-foreground-secondary leading-relaxed opacity-90 pl-1">
                            {step.description}
                        </p>

                        {/* Step Image */}
                        <div className="mt-sm">
                            <StepImage
                                label={`Hướng dẫn trực quan bước ${index + 1}`}
                                imageUrl={step.imageUrl}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
));

const HeroSection: React.FC = React.memo(() => (
    <div className="text-center space-y-md select-none cursor-default max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-sm px-md py-xs rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-bold tracking-widest uppercase">Làm quen với hệ thống</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Hướng dẫn sử dụng
        </h1>
        <p className="text-foreground-secondary text-lg opacity-80 leading-relaxed">
            Chọn một trong hai cách dưới đây để bắt đầu trải nghiệm sức mạnh của CocoQR.
            Dù bạn cần nhanh hay cần chuyên nghiệp, chúng tôi đều đáp ứng được.
        </p>
    </div>
));

const NoticeBanner: React.FC = React.memo(() => (
    <div className="p-xl rounded-3xl bg-surface-muted border border-border-strong flex flex-col md:flex-row items-center gap-lg select-none cursor-default">
        <div className="p-lg rounded-full bg-success/10 text-success shrink-0 backdrop-blur-sm border border-success/20">
            <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="text-center md:text-left space-y-xs">
            <h4 className="text-xl font-bold text-foreground">Tiêu chuẩn VietQR 2.0</h4>
            <p className="text-foreground-secondary text-base opacity-80 leading-relaxed max-w-4xl">
                Mọi mã QR được sinh ra từ CocoQR đều tuân thủ nghiêm ngặt tiêu chuẩn VietQR,
                đảm bảo tương thích hoàn toàn với tất cả các ứng dụng ngân hàng và ví điện tử tại Việt Nam.
            </p>
        </div>
    </div>
));
//#endregion

const GuidePage: React.FC = () => {
    return (
        <div className="flex flex-col h-screen w-full bg-bg font-primary overflow-hidden">
            <div className="shrink-0 z-50 border-b border-border/50">
                <Header />
            </div>

            <div className="flex-1 overflow-y-auto scroll-smooth">
                <div className="min-h-full flex flex-col">
                    <main className="flex-1 max-w-6xl mx-auto px-lg py-2xl w-full flex flex-col gap-2xl">
                        <HeroSection />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2xl items-start">
                            <GuideMethod
                                badge="Cách 1"
                                badgeColor="text-blue-500 bg-blue-500/10"
                                title="Sử dụng Nhanh"
                                description="Dành cho người dùng muốn tạo mã QR ngay lập tức mà không cần tài khoản."
                                steps={METHOD_ONE_STEPS}
                            />
                            <GuideMethod
                                badge="Cách 2"
                                badgeColor="text-primary bg-primary/10"
                                title="Sử dụng Nâng cao"
                                description="Dành cho người dùng thường xuyên, muốn quản lý và tái sử dụng các mẫu QR."
                                steps={METHOD_TWO_STEPS}
                            />
                        </div>

                        <div className="flex items-center justify-center gap-md py-xl">
                            <div className="h-px bg-border flex-1 opacity-50" />
                            <ArrowRight className="w-6 h-6 text-primary opacity-30" />
                            <div className="h-px bg-border flex-1 opacity-50" />
                        </div>

                        <NoticeBanner />
                    </main>

                    <div className="shrink-0 w-full border-t border-border shadow-sm">
                        <Footer />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuidePage;
