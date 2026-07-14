const Select = ({
                    children,
                    className = "",
                    ...props
                }) => {
    return (
        <select
            className={`
                w-full
                px-3 py-2.5
                bg-white dark:bg-slate-950
                border border-slate-200 dark:border-slate-800
                rounded-lg
                text-sm text-slate-900 dark:text-slate-100
                outline-none
                transition-colors
                focus:border-blue-500
                focus:ring-2 focus:ring-blue-500/20
                disabled:opacity-50
                disabled:cursor-not-allowed
                ${className}
            `}
            {...props}
        >
            {children}
        </select>
    );
};

export default Select;