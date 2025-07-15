import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// app/layout.tsx

export const metadata = {
  title: "My Blog App",
  description: "AI-powered blog summarizer",
 
};



export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <div className="flex h-screen">
                    <Sidebar />
                    <main className="flex-1 overflow-auto">{children}</main>
                </div>
            </body>
        </html>
    );
}
