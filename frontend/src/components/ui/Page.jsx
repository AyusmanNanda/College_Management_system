const Page = ({
                  children,
                  className = "",
              }) => {
    return (
        <div
            className={`
                min-h-screen
                bg-slate-50 dark:bg-slate-950
                text-slate-900 dark:text-slate-100
                transition-colors duration-300
                font-sans
                pb-12
                ${className}
            `}
        >
            {children}
        </div>
    );
};

export default Page;