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
                text: "var(--color-text)",
                primary: "var(--color-primary)",
            },
            borderRadius: {
                DEFAULT: "8px",
            },
            fontFamily: {
                primary: ["Inter", "sans-serif"],
                secondary: ["Roboto", "sans-serif"],
            },
            fontSize: {
                sm: "12px",
                base: "14px",
                lg: "16px",
                xl: "20px",
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
