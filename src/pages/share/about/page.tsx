import React, { useCallback } from "react";
import { Header } from "../../public/components/header";
import { Footer } from "../../public/components/footer";
import { Coffee, Code2 } from "lucide-react";

//#region Types
interface SocialLink {
    label: string;
    iconUrl: string;
    href: string;
    alt: string;
}

interface TechGroup {
    title: string;
    items: string[];
}
//#endregion

//#region Constants
const SOCIAL_LINKS: SocialLink[] = [
    { label: "Facebook", iconUrl: "https://img.icons8.com/bubbles/100/000000/facebook-new.png", href: "https://facebook.com/ncthangdoubleg", alt: "facebook" },
    { label: "LinkedIn", iconUrl: "https://img.icons8.com/bubbles/100/000000/linkedin.png", href: "https://www.linkedin.com/in/nguyenthang2206", alt: "linkedin" },
    { label: "Instagram", iconUrl: "https://img.icons8.com/bubbles/100/000000/instagram.png", href: "https://instagram.com/n_cthan_g", alt: "instagram" },
    { label: "Portfolio", iconUrl: "https://img.icons8.com/bubbles/100/000000/resume.png", href: "https://thangnc.cocome.online", alt: "portfolio" },
];

const TECH_STACK: TechGroup[] = [
    { title: "Frontend", items: ["React", "TypeScript", "Tailwind CSS", "Vite"] },
    { title: "Backend", items: [".NET 8 / C#", "SQL Server", "RESTful API"] },
    { title: "Hosting", items: ["VPS hosting", "Docker Container"] },
    { title: "Cloud / DevOps", items: ["GitHub Actions", "DigitalOcean", "Cloudinary"] },
];
//#endregion

//#region Sub-components
interface HeroSectionProps {
    hasError: boolean;
    onError: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = React.memo(({ hasError, onError }) => (
    <div className="flex flex-col items-center text-center space-y-xl select-none">
        <div className="relative">
            <div className="avatar-wrap cursor-pointer overflow-hidden !w-40 !h-40">
                <div className="avatar-inner">
                    {hasError ? (
                        <span className="text-5xl select-none">👋</span>
                    ) : (
                        <img
                            src="/avt.JPG"
                            alt="Nguyễn Chiến Thắng"
                            onError={onError}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
            </div>
            <div className="absolute -bottom-1 -right-1 p-[3px] bg-surface-elevated rounded-lg border border-border shadow-md z-20 pointer-events-none overflow-hidden flex items-center justify-center">
                <img src="https://img.icons8.com/color/48/000000/net-framework.png" alt=".NET" className="w-7 h-7" />
            </div>
        </div>

        <div className="space-y-md flex flex-col items-center max-w-6xl w-full">
            <h1 className="text-3xl font-black text-foreground tracking-tight leading-none cursor-default">
                Chào bạn, tôi là <span className="text-primary tracking-tighter">Nguyễn Chiến Thắng</span>.
            </h1>

            <div className="p-2xl rounded-3xl bg-surface-elevated border border-border-strong flex flex-col items-center text-center relative overflow-hidden group max-w-4xl shadow-xl">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>

                <div className="flex items-center gap-sm mb-lg">
                    <Coffee className="w-6 h-6 text-primary animate-bounce overflow-visible" />
                    <span className="text-sm font-bold text-primary uppercase tracking-widest cursor-default">Connect with me</span>
                </div>

                <div className="grid grid-cols-4 gap-lg w-full">
                    {SOCIAL_LINKS.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-sm p-lg bg-surface rounded-2xl border border-border hover:border-primary/30 hover:bg-primary/10 transition-all group/link"
                        >
                            <img src={link.iconUrl} alt={link.alt} className="w-14 h-14 group-hover/link:scale-110 transition-transform" />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    </div>
));

const StorySection: React.FC = React.memo(() => (
    <div className="md:col-span-3 space-y-lg select-none cursor-default">
        <h2 className="text-2xl font-bold text-foreground">Câu chuyện về sự ra đời</h2>
        <div className="space-y-md text-foreground-secondary leading-relaxed text-base">
            <p>
                <strong>CocoQR</strong> ra đời từ một tình huống hết sức quen thuộc: Mỗi khi cần chuyển khoản cho bạn bè
                hoặc thanh toán, tôi thường phải đọc số tài khoản, tìm ngân hàng... rất mất thời gian
                và thi thoảng còn nhầm lẫn số.
            </p>
            <p>
                Tôi tự hỏi: Tại sao không tạo ra nơi mà bất kỳ ai cũng có thể tự tạo cho mình
                mã QR thanh toán <strong>đẹp, cá tính</strong> chỉ trong 2 giây?
            </p>
            <p>
                Dự án phi lợi nhuận này được xây dựng với tất cả sự tâm huyết về trải nghiệm người dùng.
            </p>
        </div>
    </div>
));

const TechSection: React.FC = React.memo(() => (
    <div className="md:col-span-2 space-y-lg select-none cursor-default">
        <div className="p-xl rounded-3xl bg-surface border border-border space-y-lg">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-sm">
                <Code2 className="w-5 h-5 text-primary" />
                Hệ sinh thái công nghệ
            </h3>

            <div className="grid grid-cols-2 gap-md">
                {TECH_STACK.map((group) => (
                    <div key={group.title} className="space-y-sm">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider">{group.title}</p>
                        <ul className="space-y-xs text-base text-foreground-secondary opacity-80">
                            {group.items.map((item) => (
                                <li key={item}>• {item}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    </div>
));
//#endregion

const AboutPage: React.FC = () => {
    //#region States
    const [imgError, setImgError] = React.useState(false);
    //#endregion

    //#region Handlers
    const handleImageError = useCallback(() => {
        setImgError(true);
    }, []);
    //#endregion

    //#region Render
    return (
        <div className="flex flex-col h-screen w-full bg-bg font-primary overflow-hidden">
            <div className="shrink-0 z-50 border-b border-border/50">
                <Header />
            </div>

            <div className="flex-1 overflow-y-auto scroll-smooth">
                <div className="min-h-full flex flex-col">
                    <main className="flex-1 w-full max-w-6xl mx-auto px-lg flex flex-col justify-center gap-2xl py-2xl">
                        <HeroSection
                            hasError={imgError}
                            onError={handleImageError}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2xl items-center border-t border-border/50 pt-2xl">
                            <StorySection />
                            <TechSection />
                        </div>

                        <div className="text-center select-none cursor-default">
                            <p className="text-2xl font-serif italic text-foreground-muted opacity-40">
                                "Make it simple but significant."
                            </p>
                        </div>
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

export default AboutPage;
