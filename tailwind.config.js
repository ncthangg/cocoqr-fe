/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: "var(--color-bg)",
                surface: "var(--color-surface)",
                "surface-muted": "var(--color-surface-muted)",
                "surface-elevated": "var(--color-surface-elevated)",

                border: "var(--color-border)",
                "border-strong": "var(--color-border-strong)",
                "border-subtle": "var(--color-border-subtle)",

                primary: "var(--color-primary)",
                "primary-foreground": "var(--color-primary-foreground)",

                foreground: "var(--color-text-primary)",
                "foreground-secondary": "var(--color-text-secondary)",
                "foreground-muted": "var(--color-text-subtle)",

                success: "var(--color-success)",
                warning: "var(--color-warning)",
                danger: "var(--color-danger)",

                btn: {
                    primary: {
                        bg: "var(--color-btn-primary-bg)",
                        text: "var(--color-btn-primary-text)",
                    },
                    secondary: {
                        bg: "var(--color-btn-secondary-bg)",
                        text: "var(--color-btn-secondary-text)",
                        border: "var(--color-btn-secondary-border)",
                    }
                }
            },
            borderRadius: {
                sm: "var(--radius-sm)",
                md: "var(--radius-md)",
                lg: "var(--radius-lg)",
                xl: "var(--radius-xl)",
                "2xl": "var(--radius-2xl)",
                "3xl": "var(--radius-3xl)",
            },
            boxShadow: {
                sm: "var(--shadow-sm)",
                md: "var(--shadow-md)",
                lg: "var(--shadow-lg)",
            },
            fontFamily: {
                primary: "var(--font-primary)",
                secondary: "var(--font-secondary)",
            },
            fontSize: {
                xs: ["10px", "14px"],
                sm: ["12px", "18px"],
                base: ["14px", "22px"],
                lg: ["16px", "24px"],
                xl: ["20px", "28px"],
                "2xl": ["24px", "32px"],
                "3xl": ["30px", "36px"],
            },
            spacing: {
                "2xs": "2px",
                xs: "4px",
                sm: "8px",
                md: "16px",
                lg: "24px",
                xl: "32px",
                "2xl": "48px",
            },
            maxWidth: {
                'modal-sm': '400px',
                'modal-md': '600px',
                'modal-lg': '800px',
                'modal-xl': '1000px',
                'modal-2xl': '1200px',
                'modal-3xl': '1400px',
                'modal-4xl': '1600px',
            },
            zIndex: {
                dropdown: "40",
                modal: "50",
                toast: "60"
            },
            keyframes: {
                shimmer: {
                    '100%': { transform: 'translateX(100%)' },
                },
            },
            animation: {
                shimmer: 'shimmer 2.5s infinite',
            },
        },
    },
    plugins: [],
}
