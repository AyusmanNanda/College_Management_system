const Input = ({
                   className = "",
                   type = "text",
                   ...props
               }) => {
    return (
        <input
            type={type}
            className={`
                w-full
                px-3 py-2.5
                bg-white dark:bg-slate-950
                border border-slate-200 dark:border-slate-800
                rounded-lg
                text-sm text-slate-900 dark:text-slate-100
                placeholder:text-slate-400 dark:placeholder:text-slate-500
                outline-none
                transition-colors
                focus:border-blue-500
                focus:ring-2 focus:ring-blue-500/20
                disabled:opacity-50
                disabled:cursor-not-allowed
                ${className}
            `}
            {...props}
        />
    );
};

export default Input;