import React from "react";
import { Header } from "../../public/components/header";
import { Footer } from "../../public/components/footer";
import { Sparkles, Bot, Github, MousePointer2, Heart, Code2 } from "lucide-react";

//#region Types
interface AIContributor {
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
    tag: string;
}
//#endregion

//#region Constants
const CONTRIBUTORS: AIContributor[] = [
    {
        name: "Antigravity",
        description: "Chuyên gia đảm nhiệm phần Frontend UI/UX, giúp tối ưu hóa giao diện và hiện thực hóa các tương tác phức tạp một cách mượt mà.",
        icon: Sparkles,
        color: "text-purple-500",
        tag: "Frontend Development"
    },
    {
        name: "GitHub Copilot",
        description: "Người cộng sự đắc lực trong việc xây dựng hệ thống lõi Backend, xử lý logic nghiệp vụ và quản lý dữ liệu hiệu quả.",
        icon: Github,
        color: "text-zinc-400",
        tag: "Backend Engineering"
    },
    {
        name: "Cursor",
        description: "Trình soạn thảo mã nguồn tối ưu cho việc gỡ lỗi (debug), kiểm thử (testing) và tái cấu trúc mã nguồn (refactor) liên tục.",
        icon: MousePointer2,
        color: "text-blue-500",
        tag: "Debug & Refactor"
    },
    {
        name: "ChatGPT",
        description: "Chuyên gia sáng tạo nội dung và lên kế hoạch, giúp truyền tải thông điệp của dự án một cách chuyên nghiệp và tinh tế.",
        icon: Bot,
        color: "text-emerald-500",
        tag: "Content & Strategy"
    }
];
//#endregion

//#region Sub-components
const HeroSection: React.FC = React.memo(() => (
    <div className="flex flex-col items-center text-center space-y-xl select-none py-xl">
        <div className="relative">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-pulse border border-primary/20 shadow-2xl">
                <Heart className="w-16 h-16 text-primary" fill="currentColor" />
            </div>
            <div className="absolute -top-2 -right-2 p-md bg-surface-elevated rounded-xl border border-border shadow-md z-10">
                <Sparkles className="w-6 h-6 text-warning animate-spin-slow" />
            </div>
        </div>

        <div className="space-y-md max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                Tri ân những <span className="text-primary">"Người bạn"</span> ẩn danh
            </h1>
            <p className="text-lg text-foreground-secondary opacity-80 leading-relaxed">
                Dự án <strong>CocoQR</strong> là sự kết hợp tuyệt vời giữa con người và trí tuệ nhân tạo. <br />
                Dưới đây là lời cảm ơn dành cho những công cụ AI đã giúp tôi hoàn thiện hệ thống này.
            </p>
        </div>
    </div>
));

const ContributorCard: React.FC<{ contributor: AIContributor }> = ({ contributor: item }) => (
    <div className="group relative p-xl rounded-3xl bg-surface-elevated border border-border-strong hover:border-primary/50 transition-all duration-300 hover:shadow-2xl overflow-hidden flex flex-col h-full">
        <div className="absolute top-0 right-0 p-xl opacity-5 group-hover:opacity-10 transition-opacity">
            <item.icon className="w-24 h-24" />
        </div>

        <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-lg">
                <div className={`p-md rounded-2xl bg-surface border border-border group-hover:bg-primary/5 transition-colors`}>
                    <item.icon className={`w-8 h-8 ${item.color}`} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 bg-primary/10 px-md py-xs rounded-full">
                    {item.tag}
                </span>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-md group-hover:text-primary transition-colors">
                {item.name}
            </h3>

            <p className="text-foreground-secondary leading-relaxed text-base flex-1">
                {item.description}
            </p>
        </div>
    </div>
);
//#endregion

const ThankToPage: React.FC = () => {
    return (
        <div className="flex flex-col h-screen w-full bg-bg font-primary overflow-hidden">
            <div className="shrink-0 z-50 border-b border-border/50">
                <Header />
            </div>

            <div className="flex-1 overflow-y-auto scroll-smooth">
                <div className="min-h-full flex flex-col">
                    <main className="flex-1 w-full max-w-6xl mx-auto px-lg flex flex-col justify-center gap-2xl py-2xl">
                        <HeroSection />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                            {CONTRIBUTORS.map((contributor) => (
                                <ContributorCard key={contributor.name} contributor={contributor} />
                            ))}
                        </div>

                        <div className="mt-2xl p-2xl rounded-3xl bg-surface border border-border-subtle flex flex-col items-center text-center space-y-md">
                            <div className="flex items-center gap-sm">
                                <Code2 className="w-5 h-5 text-primary" />
                                <span className="text-sm font-bold text-primary uppercase tracking-widest">Coding with AI</span>
                            </div>
                            <p className="text-foreground-muted italic max-w-4xl">
                                "Tòa không chơi với AI, tòa không hiểu được đâu!"
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
};

export default ThankToPage;
