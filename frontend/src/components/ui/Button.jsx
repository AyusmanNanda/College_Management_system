const variants = {
    primary:
        "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20",

    secondary:
        "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",

    danger:
        "bg-red-600 text-white hover:bg-red-700",

    ghost:
        "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
};

const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-sm",
};

const Button = ({
                    children,
                    variant = "primary",
                    size = "md",
                    className = "",
                    type = "button",
                    ...props
                }) => {
    return (
        <button
            type={type}
            className={`
                inline-flex items-center justify-center gap-1.5
                rounded-lg font-bold
                transition-all
                active:scale-95
                disabled:opacity-50
                disabled:cursor-not-allowed
                disabled:active:scale-100
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;