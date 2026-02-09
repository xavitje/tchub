import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Brand Colors
                primary: {
                    DEFAULT: '#530E2F',
                    50: '#F8E8EE',
                    100: '#ECC4D3',
                    200: '#DF9FB7',
                    300: '#D27A9C',
                    400: '#C55580',
                    500: '#B83065',
                    600: '#9A2654',
                    700: '#7C1E43',
                    800: '#530E2F',
                    900: '#3D0A23',
                },
                // Neutral Colors (no pure white/black)
                light: {
                    DEFAULT: '#F4F5F7',
                    50: '#FFFFFF',
                    100: '#F9FAFB',
                    200: '#F4F5F7',
                    300: '#E5E7EB',
                    400: '#D1D5DB',
                },
                dark: {
                    DEFAULT: '#1A1C1E',
                    50: '#4B4D4F',
                    100: '#3A3C3E',
                    200: '#2A2C2E',
                    300: '#1A1C1E',
                    400: '#0F1011',
                },
                // Semantic Colors
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444',
                info: '#3B82F6',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
                'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
                'strong': '0 8px 24px rgba(0, 0, 0, 0.16)',
            },
            borderRadius: {
                'DEFAULT': '8px',
                'sm': '4px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
