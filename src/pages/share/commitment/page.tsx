import React from "react";
import { Header } from "../../public/components/header";
import { Footer } from "../../public/components/footer";
import { ShieldCheck, Heart, Zap, Globe, Lock, Info, PenIcon, Check } from "lucide-react";

//#region Types
interface CommitmentItem {
    icon: React.ReactNode;
    title: string;
    description: string;
}
//#endregion

//#region Constants
const COMMITMENT_DATA = [
    {
        icon: <ShieldCheck className="w-8 h-8 text-success" />,
        title: "Bảo mật tuyệt đối",
        description: "Hệ thống không bao giờ biết đến hay lưu trữ mật khẩu ngân hàng hay số dư của bạn. CocoQR chỉ lưu thông tin số tài khoản và tên để giúp bạn tạo mã QR nhanh hơn."
    },
    {
        icon: <PenIcon className="w-8 h-8 text-danger" />,
        title: "Tùy chỉnh phong cách QR",
        description: "Bạn có thể tùy chỉnh phong cách QR theo sở thích của mình. Mỗi QR được tạo ra đều mang đậm dấu ấn cá nhân của bạn."
    },
    {
        icon: <Heart className="w-8 h-8 text-danger" />,
        title: "Miễn phí mãi mãi",
        description: "Các tính năng cơ bản như tạo mã QR, lưu kho số tài khoản sẽ luôn miễn phí. CocoQR muốn giúp mọi người chuyển tiền dễ dàng hơn."
    },
    {
        icon: <Zap className="w-8 h-8 text-warning" />,
        title: "Nhanh chóng & Chính xác",
        description: "Dựa trên tiêu chuẩn VietQR (Napas), mã được tạo ra đảm bảo quét là khớp ngay thông tin, không sợ chuyển nhầm số tài khoản."
    }
];
//#endregion

//#region Sub-components
const HeroSection: React.FC = React.memo(() => (
    <div className="text-center mb-2xl space-y-md select-none cursor-default">
        <div className="inline-flex items-center gap-sm px-md py-xs rounded-full bg-success/10 text-success border border-success/20 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm font-bold tracking-widest uppercase">Tin cậy</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            Lời cam kết từ <span className="text-primary">CocoQR</span>
        </h1>
        <p className="text-foreground-secondary text-lg mx-auto max-w-4xl opacity-80">
            Tôi hiểu rằng thông tin tài chính là nhạy cảm. Vì vậy, minh bạch và an toàn là ưu tiên số một của tôi.
        </p>
    </div>
));

const CommitmentCard: React.FC<CommitmentItem> = React.memo(({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center p-xl rounded-3xl bg-surface border border-border/60 hover:border-primary/20 transition-all group select-none cursor-default">
        <div className="p-lg rounded-2xl bg-surface-muted group-hover:bg-primary/5 transition-colors mb-lg scale-110">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-foreground mb-md">{title}</h3>
        <p className="text-foreground-secondary text-sm leading-relaxed italic opacity-90">
            "{description}"
        </p>
    </div>
));

const ExplanationSection: React.FC = React.memo(() => (
    <div className="mt-2xl space-y-xl select-none cursor-default">
        <div className="p-xl rounded-3xl bg-gradient-to-br from-primary/10 via-surface to-surface border border-primary/10">
            <div className="flex flex-col md:flex-row gap-xl items-center">
                <div className="shrink-0">
                    <Lock className="w-16 h-16 text-primary/40" />
                </div>
                <div className="space-y-md">
                    <h3 className="text-2xl font-bold text-foreground flex items-center gap-sm">
                        Giải thích về cách CocoQR hoạt động
                    </h3>
                    <div className="text-foreground-secondary leading-relaxed space-y-sm">
                        <p>
                            <span className="text-primary font-bold">CocoQR</span> không phải là <span className="text-primary font-bold">ngân hàng</span>.
                        </p>
                        <p>
                            Chúng tôi chỉ là một <span className="text-primary font-bold underline decoration-primary/20">"người phiên dịch"</span>.
                        </p>
                        <p>
                            Chỉ cần số tài khoản của bạn, chúng tôi chuyển nó thành một hình ảnh đặc biệt <span className="text-primary font-bold"> "Mã QR" </span>
                            dựa trên tiêu chuẩn quốc gia <span className="text-primary font-bold">VietQR</span>.
                        </p>
                        <p>
                            Khi người khác quét hình ảnh này, ứng dụng ngân hàng của họ sẽ tự động điền các thông tin đó vào lệnh chuyển tiền.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
));

const TrustBadges: React.FC = React.memo(() => (
    <div className="flex flex-wrap justify-center gap-md mt-lg select-none">
        {[
            { icon: <Info className="w-4 h-4" />, text: "Không can thiệp giao dịch" },
            { icon: <Check className="w-4 h-4" />, text: "Không sai lệch dữ liệu" },
            { icon: <Lock className="w-4 h-4" />, text: "Không lưu trữ thông tin" },
            { icon: <Globe className="w-4 h-4" />, text: "Mọi ngân hàng đều hỗ trợ" }
        ].map((badge, idx) => (
            <div key={idx} className="flex items-center gap-xs text-xs font-bold text-foreground-muted uppercase tracking-wider bg-surface p-sm rounded-xl border border-border shadow-sm">
                {badge.icon}
                {badge.text}
            </div>
        ))}
    </div>
));
//#endregion

const CommitmentPage: React.FC = () => {
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

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-xl">
                            {COMMITMENT_DATA.map((item, index) => (
                                <CommitmentCard key={index} {...item} />
                            ))}
                        </div>

                        <ExplanationSection />
                        <TrustBadges />
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

export default CommitmentPage;
