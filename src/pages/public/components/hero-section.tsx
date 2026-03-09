import Button from "../../../components/UICustoms/Button"
import { ArrowRight } from "lucide-react"
import qrHero from "../../../assets/qr-hero.jpg"
import { openAuthModal } from "../../../store/slices/auth.slice"
import { useAppDispatch } from "../../../store/redux.hooks"

export function HeroSection() {
    const dispatch = useAppDispatch()
    return (
        <section id="hero" className="relative w-full min-h-[calc(100vh-73px)] snap-start snap-always py-12 lg:py-0 flex items-center justify-center overflow-hidden bg-bg">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-surface),transparent_70%)]" />
            <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 lg:flex-row lg:gap-16">
                <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
                    <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary">
                        Nhanh - An toàn - Tiện lợi
                    </span>
                    <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                        Tạo mã QR thanh toán{" "}
                        <span className="text-primary">nhanh chóng</span>
                    </h1>
                    <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground-muted">
                        Chỉ cần vài bước đơn giản, bạn có thể tạo mã QR thanh toán cho mọi ngân hàng tại Việt Nam. Nhận tiền dễ dàng, mọi lúc mọi nơi.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button
                            size="large"
                            className="btn-primary text-base w-full sm:w-auto"
                            onClick={() => {
                                dispatch(openAuthModal())
                            }}
                        >
                            Tạo QR ngay
                            <ArrowRight className="h-4 w-4" />

                        </Button>
                        <Button size="large"
                            className="btn-outline text-base w-full sm:w-auto"
                        >
                            Tìm hiểu thêm
                        </Button>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="relative">
                        <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl" />
                        <img
                            src={qrHero}
                            alt="Minh hoạ mã QR thanh toán trên điện thoại"
                            width={480}
                            height={480}
                            className="relative rounded-2xl shadow-xl object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
