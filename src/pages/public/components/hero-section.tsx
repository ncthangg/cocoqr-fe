import React, { useState, useCallback, memo } from "react";
import QRDisplay from "@/components/UICustoms/QR/QRDisplay";
import { QRType } from "@/models/enum";
import { HeroQRForm } from "./hero-qr-form";
import type { PostQrRes } from "@/models/entity.model";

export const HeroSection: React.FC = memo(() => {
    //#region States
    const [qrResult, setQrResult] = useState<PostQrRes | null>(null);
    //#endregion

    //#region Handlers
    const handleReset = useCallback(() => setQrResult(null), []);
    const handleQrCreated = useCallback((res: PostQrRes) => setQrResult(res), []);
    //#endregion

    //#region Render
    return (
        <section
            id="hero"
            className="relative w-full min-h-[calc(100vh-73px)] pt-2xl lg:pt-[10vh] pb-2xl flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden bg-bg snap-start snap-always"
        >
            {/* Background Decorative Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-surface),transparent_70%)]" />

            <div className="relative mx-auto flex max-w-6xl w-full flex-col gap-2xl px-lg z-10">

                {/* Headline Section */}
                <div className="flex flex-col items-center text-center gap-md animate-in fade-in slide-in-from-top-4 duration-700 select-none cursor-default">
                    <span className="inline-block rounded-full bg-primary/10 px-md py-xs text-sm font-bold uppercase tracking-[0.2em] text-primary">
                        Nhanh - An toàn - Tiện lợi
                    </span>
                    <h1 className="text-4xl font-primary font-black tracking-tighter text-foreground md:text-5xl leading-tight">
                        Tạo mã QR thanh toán{" "}
                        <span className="text-primary italic">nhanh chóng</span>
                    </h1>
                    <p className="max-w-4xl text-lg font-primary font-medium text-foreground-secondary leading-relaxed opacity-80">
                        Chỉ với vài bước đơn giản, bạn có thể tạo mã
                        <span className="text-primary font-bold"> QR thanh toán </span>
                        cho mọi ngân hàng tại
                        <span className="text-primary font-bold"> Việt Nam</span>.
                        Nhận tiền dễ dàng, mọi lúc mọi nơi.
                    </p>
                </div>

                {/* Form & Result Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl w-full animate-in fade-in zoom-in duration-1000 items-stretch">

                    {/* Left: Input Form */}
                    <div className="flex flex-col h-full">
                        <HeroQRForm
                            onQrCreated={handleQrCreated}
                            onReset={handleReset}
                        />
                    </div>

                    {/* Right: Result Visualization */}
                    <div className="flex flex-col h-full">
                        <div className="flex items-center shrink-0 h-11 mb-md select-none">
                            <h2 className="text-2xl font-secondary font-black text-foreground tracking-tight cursor-default">
                                Kết quả mã QR
                            </h2>
                        </div>
                        <div className="flex-1 bg-surface-muted/30 rounded-3xl border border-border/40 overflow-hidden shadow-inner">
                            <QRDisplay
                                type={QRType.PUBLIC}
                                qrData={qrResult?.qrData}
                                transactionRef={qrResult?.transactionRef}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
    //#endregion
});
