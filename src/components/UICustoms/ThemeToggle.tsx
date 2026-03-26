import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { cn } from "../../lib/utils";

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="group relative inline-flex h-9 w-[68px] cursor-pointer items-center rounded-full bg-zinc-200/50 p-1 transition-all duration-300 hover:bg-zinc-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
            aria-label="Thay đổi giao diện"
        >
            {/* Sliding high-contrast indicator */}
            <div
                className={cn(
                    "absolute h-7 w-7 rounded-full bg-white shadow-sm transition-all duration-300 ease-in-out dark:bg-zinc-950 dark:shadow-zinc-950/50",
                    theme === "dark" ? "translate-x-8" : "translate-x-0"
                )}
            />

            <div className="relative z-10 flex w-full items-center justify-between">
                <div className="flex h-7 w-7 items-center justify-center">
                    <Sun
                        className={cn(
                            "h-4 w-4 transition-all duration-300",
                            theme === "light"
                                ? "text-amber-500 scale-110"
                                : "text-zinc-500 group-hover:text-zinc-400"
                        )}
                    />
                </div>
                <div className="flex h-7 w-7 items-center justify-center">
                    <Moon
                        className={cn(
                            "h-4 w-4 transition-all duration-300",
                            theme === "dark"
                                ? "text-indigo-400 scale-110"
                                : "text-zinc-500 group-hover:text-zinc-400"
                        )}
                    />
                </div>
            </div>
        </button>
    );
};

export default ThemeToggle;
