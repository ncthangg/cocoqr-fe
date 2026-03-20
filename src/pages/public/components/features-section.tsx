import { Card, CardContent } from "../../../components/UICustoms/Card"
import { Zap, Bookmark, Building2, ShieldCheck } from "lucide-react"

const features = [
    {
        icon: Zap,
        title: "Tạo QR siêu nhanh",
        description:
            "Chỉ cần nhập thông tin tài khoản, mã QR thanh toán được tạo tức thì chỉ trong vài giây.",
    },
    {
        icon: Bookmark,
        title: "Lưu tài khoản thường dùng",
        description:
            "Lưu trữ thông tin tài khoản ngân hàng để tạo QR nhanh hơn cho lần sau.",
    },
    {
        icon: Building2,
        title: "Hỗ trợ nhiều ngân hàng",
        description:
            "Tương thích với hầu hết các ngân hàng tại Việt Nam như Vietcombank, Techcombank, MB Bank, v.v.",
    },
    {
        icon: ShieldCheck,
        title: "Bảo mật tuyệt đối",
        description:
            "Thông tin của bạn được mã hóa và bảo vệ an toàn, không chia sẻ với bên thứ ba.",
    },
]

export function FeaturesSection() {
    return (
        <section id="features" className="w-full min-h-[calc(100vh-var(--header-height,73px))] py-2xl flex flex-col justify-center bg-bg relative overflow-hidden snap-start snap-always">
            <div className="mx-auto max-w-6xl px-lg">
                <div className="mx-auto mb-xl w-full text-center animate-in fade-in duration-300">
                    <span className="mb-sm inline-block text-sm font-semibold tracking-wide text-primary">
                        Tại sao chọn QR Pay?
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        Tính năng nổi bật
                    </h2>
                    <p className="mt-md w-full text-foreground-muted">
                        Giải pháp tạo mã QR thanh toán toàn diện, phục vụ cá nhân và doanh nghiệp.
                    </p>
                </div>

                <div className="grid gap-lg sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => (
                        <Card
                            key={feature.title}
                            className="group border-border/60 bg-bg transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
                        >
                            <CardContent className="flex flex-col gap-md p-lg">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-btn-primary-text">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">
                                    {feature.title}
                                </h3>
                                <p className="text-base leading-relaxed text-foreground-muted">
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
