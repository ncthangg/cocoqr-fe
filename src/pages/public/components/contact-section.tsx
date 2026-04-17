import React, { useState, useCallback, useRef, memo } from "react";
import { Mail, Phone, Send, User, AlignLeft, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/UICustoms/Card";
import Button from "@/components/UICustoms/Button";
import { contactApi } from "@/services/contact-api.service";
import { toast } from "react-toastify";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { ContactInfoCard } from "./contact-info-card";
import { Footer } from "./footer";

//#region Constants
const QUILL_MODULES = {
    toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'clean']
    ]
};

const CONTACT_EMAIL = "ncthang2206.work@gmail.com";
const CONTACT_PHONE = "0335 991 255";
//#endregion

//#region Sub-components
const ContactLabel = memo(({ htmlFor, icon: Icon, children }: { htmlFor?: string; icon: any; children: React.ReactNode }) => (
    <label
        htmlFor={htmlFor}
        className="text-xs font-bold text-foreground-muted uppercase tracking-[0.2em] flex items-center gap-2 select-none cursor-default opacity-70"
    >
        <Icon className="w-3.5 h-3.5" />
        {children}
    </label>
));
//#endregion

export function ContactSection() {
    //#region States & Refs
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
    });
    const [content, setContent] = useState("");
    const lastSubmitTimeRef = useRef<number>(0);
    //#endregion

    //#region Handlers
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        const now = Date.now();
        if (now - lastSubmitTimeRef.current < 15000) {
            toast.warning("Vui lòng đợi 15 giây trước khi thực hiện gửi liên hệ tiếp theo.");
            return;
        }

        const strippedContent = content.replace(/<[^>]*>?/gm, "").trim();
        if (!strippedContent || content === '<p><br></p>') {
            toast.warning("Vui lòng nhập nội dung liên hệ");
            return;
        }

        lastSubmitTimeRef.current = now;

        try {
            setLoading(true);
            await contactApi.post({
                ...formData,
                subject: "Liên hệ từ trang chủ",
                content: content
            });
            setFormData({ fullName: "", email: "" });
            setContent("");
        } finally {
            setLoading(false);
        }
    }, [content, formData]);
    //#endregion

    //#region Render
    return (
        <section
            id="contact"
            className="relative w-full min-h-[calc(100vh-73px)] flex flex-col bg-bg snap-start snap-always"
        >
            <div className="flex-1 flex flex-col justify-center py-2xl">
                <div className="mx-auto max-w-6xl w-full px-lg">

                    {/* Section Header */}
                    <div className="mx-auto mb-2xl w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-700 select-none cursor-default">
                        <div className="inline-flex items-center gap-sm px-md py-xs rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <span className="text-sm font-bold tracking-widest uppercase">Liên hệ</span>
                        </div>
                        <h2 className="text-4xl font-primary font-black tracking-tighter text-foreground md:text-5xl">
                            Hỗ trợ & liên hệ
                        </h2>
                        <p className="mt-md max-w-4xl text-lg font-primary font-medium text-foreground-secondary mx-auto leading-relaxed opacity-80">
                            Bạn cần hỗ trợ hoặc có thắc mắc về dịch vụ QR Code? Đừng ngần ngại để lại lời nhắn cho chúng tôi.
                        </p>
                    </div>

                    <div className="grid items-start gap-xl lg:grid-cols-5">
                        {/* Info Side */}
                        <div className="flex flex-col gap-lg lg:col-span-2">
                            <ContactInfoCard
                                icon={Mail}
                                label="Email"
                                value={CONTACT_EMAIL}
                                href={`mailto:${CONTACT_EMAIL}`}
                            />
                            <ContactInfoCard
                                icon={Phone}
                                label="Hotline"
                                value={CONTACT_PHONE}
                                href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
                            />
                        </div>

                        {/* Form Side */}
                        <Card className="border-border/60 bg-bg shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all duration-500 lg:col-span-3 overflow-hidden rounded-3xl">
                            <CardContent className="p-xl">
                                <form onSubmit={handleSubmit} className="flex flex-col gap-xl">
                                    <div className="grid gap-lg sm:grid-cols-2">
                                        <div className="flex flex-col gap-sm">
                                            <ContactLabel htmlFor="contact-name" icon={User}>
                                                Họ và tên
                                            </ContactLabel>
                                            <input
                                                id="contact-name"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className="input px-lg py-sm rounded-2xl"
                                                placeholder="Nguyễn Văn A"
                                                required
                                                autoComplete="name"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-sm">
                                            <ContactLabel htmlFor="contact-email" icon={Mail}>
                                                Email liên hệ
                                            </ContactLabel>
                                            <input
                                                id="contact-email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="input px-lg py-sm rounded-2xl"
                                                placeholder="email@example.com"
                                                required
                                                autoComplete="email"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-sm email-editor-container">
                                        <ContactLabel icon={AlignLeft}>
                                            Nội dung lời nhắn
                                        </ContactLabel>
                                        <div className="rounded-2xl overflow-hidden border border-border/60 focus-within:border-primary transition-colors">
                                            <ReactQuill
                                                theme="snow"
                                                value={content}
                                                onChange={setContent}
                                                placeholder="Nhập nội dung bạn cần hỗ trợ..."
                                                modules={QUILL_MODULES}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full h-14 gap-3 sm:w-auto sm:self-end group transition-all duration-300 rounded-2xl px-12 shadow-lg ${loading ? 'opacity-70' : 'btn-primary shadow-primary/20 hover:scale-[1.02]'}`}
                                    >
                                        {loading ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            <>
                                                <span className="font-bold text-lg tracking-tight">Gửi liên hệ ngay</span>
                                                <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Sticky Footer for Landing Style */}
            <div className="shrink-0 w-full border-t border-border shadow-sm">
                <Footer />
            </div>
        </section>
    );
}
