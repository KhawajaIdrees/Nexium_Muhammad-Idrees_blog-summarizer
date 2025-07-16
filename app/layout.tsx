import "./globals.css";
import Sidebar from "../components/Sidebar";
import DarkModeProvider from "../components/DarkModeProvider";
import DarkModeToggleButton from "../components/DarkModeToggleButton";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`antialiased min-h-screen relative`}>
                <DarkModeProvider>
                    {/* Animated background */}
                    <div className="fixed inset-0 -z-10 animate-gradient bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 opacity-80" />
                    <div className="flex h-screen">
                        <Sidebar />
                        <main className="flex-1 overflow-auto relative">
                            <DarkModeToggleButton />
                            {children}
                        </main>
                    </div>
                </DarkModeProvider>
            </body>
        </html>
    );
}
