import {
    Menu,
    Moon,
    Sun,
    LogOut,
} from "lucide-react";

const AppHeader = ({
                       title,
                       theme,
                       toggleSidebar,
                       toggleTheme,
                       handleLogout,
                   }) => {
    return (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 sm:px-8 h-16">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <h1 className="text-sm font-bold text-slate-800 dark:text-slate-200 hidden sm:block">
                        {title}
                    </h1>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg transition-colors focus:outline-none"
                        title="Toggle Theme"
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? (
                            <Sun className="w-5 h-5" />
                        ) : (
                            <Moon className="w-5 h-5" />
                        )}
                    </button>

                    <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1" />

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors focus:outline-none group"
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />

                        <span className="hidden sm:inline">
                            Sign Out
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;