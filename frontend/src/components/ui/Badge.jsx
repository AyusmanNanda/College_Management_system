const variants = {
    default:
        "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",

    primary:
        "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",

    success:
        "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",

    warning:
        "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",

    danger:
        "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400",
};

const Badge = ({
                   children,
                   variant = "default",
                   className = "",
               }) => {
    return (
        <span
            className={`
                inline-flex items-center justify-center
                px-2 py-1
                rounded-md
                text-xs font-bold
                whitespace-nowrap
                ${variants[variant] || variants.default}
                ${className}
            `}
        >
            {children}
        </span>
    );
};

export default Badge;