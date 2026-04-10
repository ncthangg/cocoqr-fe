import React from "react";
import { Header } from "../../public/components/header";
import { Footer } from "../../public/components/footer";
import { BookOpen, UserPlus, Link, QrCode, Share2, CheckCircle2 } from "lucide-react";

//#region Types
interface GuideStep {
    icon: React.ReactNode;
    title: string;
    description: string;
}
//#endregion

//#region Constants
const GUIDE_STEPS: GuideStep[] = [
    {
        icon: <UserPlus className="w-8 h-8 text-primary" />,
        title: "Bước 1: Đăng nhập",
        description: "Bạn chỉ cần đăng nhập bằng Google hoặc tài khoản cá nhân để chúng tôi có thể lưu lại các tài khoản ngân hàng của riêng bạn."
    },
    {
        icon: <Link className="w-8 h-8 text-primary" />,
        title: "Bước 2: Kết nối tài khoản",
        description: "Thêm số tài khoản ngân hàng hoặc ví điện tử (Momo, Zalopay...) mà bạn muốn nhận tiền. Hệ thống hỗ trợ hơn 50 ngân hàng tại Việt Nam."
    },
    {
        icon: <QrCode className="w-8 h-8 text-primary" />,
        title: "Bước 3: Tạo mã QR",
        description: "Nhập số tiền và nội dung chuyển khoản. Bạn có thể tùy chỉnh màu sắc, logo để mã QR trông thật chuyên nghiệp và cá tính."
    },
    {
        icon: <Share2 className="w-8 h-8 text-primary" />,
        title: "Bước 4: Chia sẻ & Sử dụng",
        description: "Tải mã QR về máy hoặc đưa cho bạn bè quét. Tiền sẽ được chuyển thẳng vào tài khoản của bạn một cách nhanh chóng và chính xác."
    }
];
//#endregion

//#region Sub-components
const HeroSection: React.FC = React.memo(() => (
    <div className="text-center mb-2xl space-y-md select-none cursor-default">
        <div className="inline-flex items-center gap-sm px-md py-xs rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-bold tracking-widest uppercase">Hướng dẫn</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            Cách sử dụng <span className="text-primary">CocoQR</span>
        </h1>
        <p className="text-foreground-secondary text-lg mx-auto max-w-4xl opacity-80">
            Chỉ với vài thao tác đơn giản, bạn đã có thể bắt đầu nhận tiền qua mã QR một cách chuyên nghiệp.
            Tiết kiệm thời gian, tránh sai sót số tài khoản.
        </p>
    </div>
));

const StepCard: React.FC<GuideStep> = React.memo(({ icon, title, description }) => (
    <div className="group p-lg rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden select-none cursor-default">
        <div className="absolute top-0 right-0 p-md opacity-[0.03] group-hover:scale-125 transition-transform duration-500">
            {icon}
        </div>

        <div className="flex flex-col gap-md relative z-10">
            <div className="p-md rounded-xl bg-primary/5 w-fit group-hover:bg-primary/10 transition-colors">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold text-foreground mb-sm">{title}</h3>
                <p className="text-foreground-secondary leading-relaxed opacity-90">
                    {description}
                </p>
            </div>
        </div>
    </div>
));

const StatusBanner: React.FC = React.memo(() => (
    <div className="mt-2xl p-xl rounded-3xl bg-surface-muted/50 border border-border flex flex-col md:flex-row items-center gap-lg select-none cursor-default">
        <div className="p-lg rounded-full bg-success/10 text-success shrink-0 backdrop-blur-sm">
            <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="text-center md:text-left">
            <h4 className="text-lg font-bold text-foreground mb-xs">Mọi thứ đã sẵn sàng!</h4>
            <div className="text-foreground-secondary opacity-80">
                <p>Mã QR được tạo ra hoàn toàn tuân thủ tiêu chuẩn <span className="font-bold text-primary">VietQR</span>,</p>
                <p>đảm bảo mọi ứng dụng ngân hàng và ví điện tử đều có thể quét và nhận diện ngay lập tức.</p>
            </div>
        </div>
    </div>
));
//#endregion

const GuidePage: React.FC = () => {
    //#region Render
    return (
        <div className="flex flex-col h-screen w-full bg-bg font-primary overflow-hidden">
            <div className="shrink-0 z-50 border-b border-border/50">
                <Header />
            </div>

            <div className="flex-1 overflow-y-auto scroll-smooth">
                <div className="min-h-full flex flex-col">
                    <main className="flex-1 max-w-6xl mx-auto px-lg py-2xl w-full flex flex-col justify-center gap-2xl">
                        <HeroSection />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                            {GUIDE_STEPS.map((step, index) => (
                                <StepCard key={index} {...step} />
                            ))}
                        </div>

                        <StatusBanner />
                    </main>

                    <div className="shrink-0 w-full border-t border-border shadow-sm">
                        <Footer />
                    </div>
                </div>
            </div>
        </div>
    );
    //#endregion
};

export default GuidePage;
