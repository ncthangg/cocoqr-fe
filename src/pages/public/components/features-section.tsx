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
        <section id="features" className="w-full min-h-[calc(100vh-73px)] snap-start snap-always py-16 flex flex-col justify-center bg-card">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <span className="mb-3 inline-block text-sm font-semibold tracking-wide text-primary">
                        Tại sao chọn QR Pay?
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                        Tính năng nổi bật
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Giải pháp tạo mã QR thanh toán toàn diện, phục vụ cá nhân và doanh nghiệp.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => (
                        <Card
                            key={feature.title}
                            className="group border-border/60 bg-background transition-shadow hover:shadow-lg"
                        >
                            <CardContent className="flex flex-col gap-4 p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">
                                    {feature.title}
                                </h3>
                                <p className="leading-relaxed text-muted-foreground">
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
