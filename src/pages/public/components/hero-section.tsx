import QRDisplay from "@/components/UICustoms/QRDisplay"
import { HeroQRForm } from "./hero-qr-form"
import { useState } from "react"
import type { PostQrRes } from "@/models/entity.model"

export function HeroSection() {
    const [qrResult, setQrResult] = useState<PostQrRes | null>(null);

    return (
        <section
            id="hero"
            className="relative w-full min-h-[calc(100vh-var(--header-height,73px))] py-2xl flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden bg-bg snap-start snap-always"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-surface),transparent_70%)]" />

            <div className="relative mx-auto flex max-w-6xl w-full flex-col gap-xl px-lg">

                {/* Headline */}
                <div className="flex flex-col items-center text-center gap-md animate-in fade-in duration-300">
                    <span className="inline-block rounded-full bg-primary/10 px-md py-xs text-xs font-semibold tracking-wide text-primary">
                        Nhanh - An toàn - Tiện lợi
                    </span>
                    <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-3xl">
                        Tạo mã QR thanh toán{" "}
                        <span className="text-primary">nhanh chóng</span>
                    </h1>
                    <p className="w-full text-base leading-relaxed text-foreground-muted">
                        Chỉ cần vài bước đơn giản, bạn có thể tạo mã QR thanh toán cho mọi ngân hàng tại Việt Nam. Nhận tiền dễ dàng, mọi lúc mọi nơi.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl w-full animate-in fade-in zoom-in duration-500 items-stretch">

                    {/* Left: QR Form */}
                    <HeroQRForm
                        onQrCreated={setQrResult}
                        onReset={() => setQrResult(null)}
                    />

                    {/* Right: QR Display */}
                    <div className="flex flex-col">
                        <div className="flex items-center shrink-0 h-11 mb-md">
                            <h2 className="text-xl font-bold text-foreground">Kết quả mã QR</h2>
                        </div>
                        <div className="flex-1">
                            <QRDisplay
                                type="public"
                                qrData={qrResult?.qrData}
                                transactionRef={qrResult?.transactionRef}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
