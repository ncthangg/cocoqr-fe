import { Mail, Phone, Send, User, AlignLeft, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/UICustoms/Card"
import Button from "@/components/UICustoms/Button"
import { useState, useCallback, useRef } from "react"
import { contactApi } from "@/services/contact-api.service"
import { toast } from "react-toastify"
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"
import { ContactInfoCard } from "./contact-info-card"
import { Footer } from "./footer"

/* ─── Static config (module scope) ──────────────────────────── */

const QUILL_MODULES = {
    toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'clean']
    ]
};

/* ─── Component ─────────────────────────────────────────────── */

export function ContactSection() {
    //#region States
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
    })
    const [content, setContent] = useState("")
    //#endregion

    //#region Handlers
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }, [])
    const lastSubmitTimeRef = useRef<number>(0)

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()

        const now = Date.now();
        if (now - lastSubmitTimeRef.current < 15000) {
            toast.warning("Vui lòng đợi 15 giây trước khi thực hiện gửi liên hệ tiếp theo.")
            return
        }

        if (!content.trim() || content === '<p><br></p>') {
            toast.warning("Vui lòng nhập nội dung liên hệ")
            return
        }

        lastSubmitTimeRef.current = now;

        try {
            setLoading(true)
            await contactApi.post({
                ...formData,
                subject: "Liên hệ từ trang chủ",
                content: content
            })
            setFormData({ fullName: "", email: "" })
            setContent("")
        } finally {
            setLoading(false)
        }
    }, [content, formData])
    //#endregion

    //#region Render
    return (
        <section
            id="contact"
            className="relative w-full min-h-[calc(100vh-var(--header-height,73px))] flex flex-col bg-bg snap-start snap-always"
        >
            {/* Contact content — centered vertically in available space */}
            <div className="flex-1 flex flex-col justify-center py-16">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="mx-auto mb-xl w-full text-center animate-in fade-in duration-500">
                        <span className="mb-sm inline-block text-sm font-bold uppercase tracking-widest text-primary">
                            Liên hệ
                        </span>
                        <h2 className="text-3xl font-primary font-black tracking-tight text-foreground md:text-4xl">
                            Hỗ trợ & liên hệ
                        </h2>
                        <p className="mt-md w-full text-foreground-muted font-primary font-medium mx-auto leading-relaxed">
                            Bạn cần hỗ trợ hoặc có thắc mắc về dịch vụ QR Code? Đừng ngần ngại để lại lời nhắn cho chúng tôi.
                        </p>
                    </div>

                    <div className="grid items-start gap-8 lg:grid-cols-5">
                        <div className="flex flex-col gap-6 lg:col-span-2">
                            <ContactInfoCard
                                icon={Mail}
                                label="Email"
                                value="ncthang2206.work@gmail.com"
                                href="mailto:ncthang2206.work@gmail.com"
                            />
                            <ContactInfoCard
                                icon={Phone}
                                label="Hotline"
                                value="0335 991 255"
                                href="tel:0335991255"
                            />
                        </div>

                        <Card className="border-border/60 bg-bg shadow-sm hover:shadow-md transition-all duration-500 lg:col-span-3 overflow-hidden">
                            <CardContent className="p-8">
                                <form
                                    onSubmit={handleSubmit}
                                    className="flex flex-col gap-6"
                                >
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="flex flex-col gap-2">
                                            <label
                                                htmlFor="contact-name"
                                                className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-2"
                                            >
                                                <User className="w-3.5 h-3.5" />
                                                Họ và tên
                                            </label>
                                            <input
                                                id="contact-name"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className="input px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50"
                                                placeholder="Nguyễn Văn A"
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label
                                                htmlFor="contact-email"
                                                className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-2"
                                            >
                                                <Mail className="w-3.5 h-3.5" />
                                                Email liên hệ
                                            </label>
                                            <input
                                                id="contact-email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="input px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50"
                                                placeholder="email@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 email-editor-container">
                                        <label
                                            className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-2"
                                        >
                                            <AlignLeft className="w-3.5 h-3.5" />
                                            Nội dung lời nhắn
                                        </label>
                                        <ReactQuill
                                            theme="snow"
                                            value={content}
                                            onChange={setContent}
                                            placeholder="Nhập nội dung bạn cần hỗ trợ..."
                                            modules={QUILL_MODULES}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary w-full h-12 gap-3 sm:w-auto sm:self-end group transition-all duration-300 rounded-xl px-10 shadow-lg shadow-primary/20"
                                    >
                                        {loading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        )}
                                        <span className="font-bold">Gửi liên hệ ngay</span>
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Footer — pinned at bottom of this snap section */}
            <div className="shrink-0 w-full border-t border-border shadow-sm">
                <Footer />
            </div>
        </section>
    )
    //#endregion
}
