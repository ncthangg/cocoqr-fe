"use client"

import { Mail, Phone, Send } from "lucide-react"
import { Card, CardContent } from "../../../components/UICustoms/Card"
import Button from "../../../components/UICustoms/Button"

export function ContactSection() {
    return (
        <section id="contact" className="relative w-full min-h-[calc(100vh-73px)] snap-start snap-always py-16 flex flex-col justify-center bg-bg">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <span className="mb-3 inline-block text-sm font-semibold tracking-wide text-primary">
                        Liên hệ
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                        Hỗ trợ & liên hệ
                    </h2>
                    <p className="mt-4 text-foreground-muted">
                        Bạn cần hỗ trợ hoặc có thắc mắc? Liên hệ với chúng tôi qua các kênh bên dưới.
                    </p>
                </div>

                <div className="grid items-start gap-8 lg:grid-cols-5">
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <Card className="group border-border/60 bg-bg transition-shadow hover:shadow-lg">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-btn-primary-text">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground-muted">Email</p>
                                    <a
                                        href="mailto:ncthang2206.work@gmail.com"
                                        className="font-semibold text-foreground transition-colors hover:text-primary"
                                    >
                                        ncthang2206.work@gmail.com
                                    </a>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="group border-border/60 bg-bg transition-shadow hover:shadow-lg">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-btn-primary-text">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground-muted">Hotline</p>
                                    <a
                                        href="tel:0335991255"
                                        className="font-semibold text-foreground transition-colors hover:text-primary"
                                    >
                                        0335 991 255
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="group border-border/60 bg-bg transition-shadow hover:shadow-lg lg:col-span-3">
                        <CardContent className="p-6">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                }}
                                className="flex flex-col gap-5"
                            >
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="name" className="text-sm font-medium">Họ và tên</label>
                                        <input id="name" className="input" placeholder="Nguyễn Văn A" required />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                                        <input id="email" className="input" type="email" placeholder="email@example.com" required />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="message" className="text-sm font-medium">Nội dung</label>
                                    <textarea
                                        id="message"
                                        className="input"
                                        placeholder="Nhập nội dung cần hỗ trợ..."
                                        rows={4}
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="medium"
                                    className="btn-primary w-full gap-2 sm:w-auto sm:self-end"
                                >
                                    <Send className="h-4 w-4" />
                                    Gửi liên hệ
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
