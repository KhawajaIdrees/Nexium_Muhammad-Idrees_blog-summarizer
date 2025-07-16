"use client";
import { useDarkMode } from "./DarkModeProvider";

export default function DarkModeToggleButton() {
    const { dark, toggle } = useDarkMode();
    return (
        <button
            onClick={toggle}
            className="fixed top-4 right-4 z-40 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle dark mode"
        >
            {dark ? (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z" /></svg>
            ) : (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 6.95-1.41-1.41M6.34 6.34 4.93 4.93m12.02 0-1.41 1.41M6.34 17.66l-1.41 1.41" /></svg>
            )}
        </button>
    );
} 