const PageHeader = ({
                        icon: Icon,
                        title,
                        subtitle,
                        children,
                        className = "",
                    }) => {
    return (
        <header
            className={`
                sticky top-0 z-20
                bg-white/80 dark:bg-slate-900/80
                backdrop-blur-lg
                border-b border-slate-200 dark:border-slate-800
                shadow-sm
                ${className}
            `}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    {Icon && (
                        <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-500/20 shrink-0">
                            <Icon className="w-5 h-5" />
                        </div>
                    )}

                    <div className="min-w-0">
                        <h1 className="text-lg font-bold tracking-tight leading-tight truncate">
                            {title}
                        </h1>

                        {subtitle && (
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block truncate">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {children && (
                    <div className="flex items-center gap-2 shrink-0">
                        {children}
                    </div>
                )}
            </div>
        </header>
    );
};

export default PageHeader;