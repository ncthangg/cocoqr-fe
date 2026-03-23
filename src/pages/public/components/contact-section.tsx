import { Mail, Phone, Send, User, AlignLeft } from "lucide-react"
import { Card, CardContent } from "../../../components/UICustoms/Card"
import Button from "../../../components/UICustoms/Button"

export function ContactSection() {
    return (
        <section
            id="contact"
            className="relative w-full min-h-[calc(100vh-var(--header-height,73px))] py-2xl flex flex-col justify-center bg-bg snap-start snap-always"
        >
            <div className="mx-auto max-w-6xl px-lg">
                <div className="mx-auto mb-xl w-full text-center animate-in fade-in duration-300">
                    <span className="mb-sm inline-block text-sm font-semibold tracking-wide text-primary">
                        Liên hệ
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        Hỗ trợ & liên hệ
                    </h2>
                    <p className="mt-md w-full text-foreground-muted">
                        Bạn cần hỗ trợ hoặc có thắc mắc? Liên hệ với chúng tôi qua các kênh bên dưới.
                    </p>
                </div>

                <div className="grid items-start gap-xl lg:grid-cols-5">
                    <div className="flex flex-col gap-lg lg:col-span-2">
                        <Card className="group border-border/60 bg-bg transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
                            <CardContent className="flex items-center gap-md p-lg">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-btn-primary-text">
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

                        <Card className="group border-border/60 bg-bg transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
                            <CardContent className="flex items-center gap-md p-lg">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-btn-primary-text">
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

                    <Card className="group border-border/60 bg-bg transition-all duration-300 hover:shadow-md lg:col-span-3">
                        <CardContent className="p-lg">
                            <form
                                onSubmit={(e) => e.preventDefault()}
                                className="flex flex-col gap-md"
                            >
                                <div className="grid gap-md sm:grid-cols-2">
                                    <div className="flex flex-col gap-sm">
                                        <label
                                            htmlFor="contact-name"
                                            className="text-sm font-medium text-foreground flex items-center gap-xs"
                                        >
                                            <User className="w-4 h-4" />
                                            Họ và tên
                                        </label>
                                        <input
                                            id="contact-name"
                                            name="fullName"
                                            className="input"
                                            placeholder="Nguyễn Văn A"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-sm">
                                        <label
                                            htmlFor="contact-email"
                                            className="text-sm font-medium text-foreground flex items-center gap-xs"
                                        >
                                            <Mail className="w-4 h-4" />
                                            Email
                                        </label>
                                        <input
                                            id="contact-email"
                                            name="email"
                                            type="email"
                                            className="input"
                                            placeholder="email@example.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-sm">
                                    <label
                                        htmlFor="contact-message"
                                        className="text-sm font-medium text-foreground flex items-center gap-xs"
                                    >
                                        <AlignLeft className="w-4 h-4" />
                                        Nội dung
                                    </label>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        className="input"
                                        placeholder="Nhập nội dung cần hỗ trợ..."
                                        rows={4}
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="medium"
                                    className="btn-primary w-full gap-sm sm:w-auto sm:self-end group transition-all duration-300"
                                >
                                    <Send className="h-4 w-4 group-hover:translate-x-0.5 transition-all duration-300" />
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
