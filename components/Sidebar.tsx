"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        {
            name: "Blog Summarizer",
            href: "/",
        },
        {
            name: "Saved Blogs",
            href: "/saved",
        },
    ];

    return (
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-6">
            <div className="mb-8">
                <h1 className="text-xl font-bold text-gray-800">
                    Blog Summarizer
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                    AI-powered blog analysis
                </p>
            </div>

            <nav className="space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive
                                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                    <p>Powered by Gemini AI</p>
                    <p className="mt-1">Translate to Urdu</p>
                </div>
            </div>
        </div>
    );
}
