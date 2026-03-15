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
                border: "var(--color-border)",

                foreground: "var(--color-text-primary)",
                "foreground-muted": "var(--color-text-secondary)",

                success: "var(--color-success)",
                warning: "var(--color-warning)",
                danger: "var(--color-danger)",

                "btn-primary-bg": "var(--color-btn-primary-bg)",
                "btn-primary-text": "var(--color-btn-primary-text)",

                "btn-secondary-bg": "var(--color-btn-secondary-bg)",
                "btn-secondary-text": "var(--color-btn-secondary-text)",

                "btn-outline-border": "var(--color-btn-outline-border)",
                "btn-outline-text": "var(--color-btn-outline-text)",
            },
            borderRadius: {
                sm: "var(--radius-sm)",
                md: "var(--radius-md)",
                lg: "var(--radius-lg)",
                DEFAULT: "var(--radius-md)"
            },
            boxShadow: {
                sm: "var(--shadow-sm)",
                md: "var(--shadow-md)",
            },
            fontFamily: {
                primary: ["Inter", "sans-serif"],
                secondary: ["Roboto", "sans-serif"],
            },
            fontSize: {
                sm: ["12px", "18px"],
                base: ["14px", "22px"],
                lg: ["16px", "24px"],
                xl: ["20px", "28px"],
                "2xl": ["24px", "32px"],
                "3xl": ["30px", "36px"],
            },
            spacing: {
                xs: "4px",
                sm: "8px",
                md: "16px",
                lg: "24px",
                xl: "32px"
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
            }
        },
    },
    plugins: [],
}
