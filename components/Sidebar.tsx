"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

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
        <>
            {/* Hamburger for mobile */}
            <button
                className="md:hidden fixed top-4 left-4 z-30 p-2 rounded bg-white border shadow"
                onClick={() => setOpen(true)}
                aria-label="Open sidebar"
            >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>

            {/* Overlay for mobile drawer */}
            {open && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar drawer for mobile, static for desktop */}
            <aside
                className={`
                    fixed top-0 left-0 h-full w-64 bg-gray-50 border-r border-gray-200 p-6 z-30 transform transition-transform duration-200
                    ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block
                `}
                style={{ maxWidth: 256 }}
            >
                {/* Close button for mobile */}
                <div className="flex items-center justify-between mb-8 md:hidden">
                    <h1 className="text-xl font-bold text-gray-800">Blog Summarizer</h1>
                    <button
                        className="p-2 rounded bg-white border shadow"
                        onClick={() => setOpen(false)}
                        aria-label="Close sidebar"
                    >
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>
                {/* Title for desktop */}
                <div className="mb-8 hidden md:block">
                    <h1 className="text-xl font-bold text-gray-800">Blog Summarizer</h1>
                    <p className="text-sm text-gray-600 mt-1">AI-powered blog analysis</p>
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
                                onClick={() => setOpen(false)}
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
            </aside>
        </>
    );
}
