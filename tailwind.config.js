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

                primary: "var(--color-primary)",

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
                DEFAULT: "8px",
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
            },
            spacing: {
                sm: "8px",
                md: "16px",
                lg: "24px",
            },
            maxWidth: {
                'modal-sm': '400px',
                'modal-md': '600px',
                'modal-lg': '800px',
                'modal-xl': '1000px',
            }
        },
    },
    plugins: [],
}
