import { QrCode } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t border-border bg-surface">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-lg px-lg py-xl md:flex-row md:justify-between">
                <div className="flex items-center gap-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <QrCode className="h-4 w-4 text-btn-primary-text" />
                    </div>
                    <span className="text-lg font-bold text-foreground">QR Pay</span>
                </div>

                <div className="flex items-center gap-md">
                    <a
                        href="#"
                        className="text-foreground-muted transition-colors hover:text-foreground"
                        aria-label="Facebook"
                    >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                        </svg>
                    </a>
                    <a
                        href="#"
                        className="text-foreground-muted transition-colors hover:text-foreground"
                        aria-label="YouTube"
                    >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                    </a>
                    <a
                        href="#"
                        className="text-foreground-muted transition-colors hover:text-foreground"
                        aria-label="Zalo"
                    >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.27c-.202.37-.596.62-1.038.62H7.144c-.442 0-.836-.25-1.038-.62a1.165 1.165 0 0 1 .06-1.194l5.176-7.87H7.5a.75.75 0 0 1 0-1.5h9a1.165 1.165 0 0 1 .978 1.814l-5.176 7.87h4.554a.75.75 0 0 1 0 1.5h-.023c.032-.084.06-.173.06-.266v-.334z" />
                        </svg>
                    </a>
                </div>

                <p className="text-sm text-foreground-muted">
                    &copy; {new Date().getFullYear()} QR Pay. All rights reserved.
                </p>
            </div>
        </footer>
    )
}
