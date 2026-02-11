import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navigation/Navbar";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { NotificationProvider } from "@/components/ui/NotificationSystem";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "HubTC - Travel Counsellors Intranet",
    description: "Centraal platform voor communicatie, informatie en tools",
};

import { SettingsProvider } from "@/components/providers/SettingsProvider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="nl">
            <body className={inter.className}>
                <AuthProvider>
                    <SettingsProvider>
                        <NotificationProvider>
                            <Navbar />
                            <main>{children}</main>
                        </NotificationProvider>
                    </SettingsProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
