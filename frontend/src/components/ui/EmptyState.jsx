const EmptyState = ({
                        icon: Icon,
                        title,
                        description,
                        children,
                        className = "",
                    }) => {
    return (
        <div
            className={`
                flex flex-col items-center justify-center
                px-4 py-12
                text-center
                ${className}
            `}
        >
            {Icon && (
                <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <Icon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                </div>
            )}

            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {title}
            </h3>

            {description && (
                <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                    {description}
                </p>
            )}

            {children && (
                <div className="mt-4">
                    {children}
                </div>
            )}
        </div>
    );
};

export default EmptyState;