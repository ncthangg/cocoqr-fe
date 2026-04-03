import { Mail, Phone, Send, User, AlignLeft, Copy, CheckCircle2, Loader2 } from "lucide-react"
import { Card, CardContent } from "../../../components/UICustoms/Card"
import Button from "../../../components/UICustoms/Button"
import { useState } from "react"
import { contactApi } from "@/services/contact-api.service"
import { toast } from "react-toastify"
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"

interface ContactInfoCardProps {
    icon: React.ElementType
    label: string
    value: string
    href: string
}

function ContactInfoCard({ icon: Icon, label, value, href }: ContactInfoCardProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault()
        navigator.clipboard.writeText(value)
        setCopied(true)
        toast.info(`Đã sao chép ${label.toLowerCase()}`)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card
            className="group border-border/60 bg-bg transition-all duration-300 hover:shadow-md hover:scale-[1.01] cursor-pointer"
            onClick={handleCopy}
            title={`Click để sao chép ${label}`}
        >
            <CardContent className="flex items-center gap-md p-lg">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-btn-primary-text">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-foreground-muted">{label}</p>
                    <a
                        href={href}
                        onClick={(e) => e.stopPropagation()}
                        className="truncate block font-semibold text-foreground transition-colors hover:text-primary"
                    >
                        {value}
                    </a>
                </div>
                <div className={`p-2 rounded-lg transition-all duration-300 ${copied ? 'bg-green-500/10 text-green-500' : 'text-foreground-muted opacity-0 group-hover:opacity-100'}`}>
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </div>
            </CardContent>
        </Card>
    )
}

export function ContactSection() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
    })
    const [content, setContent] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!content.trim() || content === '<p><br></p>') {
            toast.warning("Vui lòng nhập nội dung liên hệ")
            return
        }

        try {
            setLoading(true)
            await contactApi.post({
                ...formData,
                subject: "Liên hệ từ trang chủ", // Default subject as BE will cover logic
                content: content
            })
            toast.success("Gửi liên hệ thành công")
            setFormData({ fullName: "", email: "" })
            setContent("")
        } catch (error: any) {
            console.error("Contact Error:", error)
            toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi gửi liên hệ. Vui lòng thử lại sau.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section
            id="contact"
            className="relative w-full min-h-[calc(100vh-var(--header-height,73px))] py-20 flex flex-col justify-center bg-bg"
        >
            <div className="mx-auto max-w-6xl px-6">
                <div className="mx-auto mb-12 w-full text-center animate-in fade-in duration-500">
                    <span className="mb-2 inline-block text-sm font-bold uppercase tracking-widest text-primary">
                        Liên hệ
                    </span>
                    <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
                        Hỗ trợ & liên hệ
                    </h2>
                    <p className="mt-4 w-full text-foreground-muted font-medium max-w-2xl mx-auto leading-relaxed">
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
                                            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-foreground-muted outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
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
                                            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-foreground-muted outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
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
                                        modules={{
                                            toolbar: [
                                                ['bold', 'italic', 'underline', 'strike'],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                ['link', 'clean']
                                            ]
                                        }}
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
        </section>
    )
}
