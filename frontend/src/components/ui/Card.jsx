const Card = ({
                  children,
                  className = "",
              }) => {
    return (
        <div
            className={`
                bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-800
                rounded-xl
                shadow-sm
                ${className}
            `}
        >
            {children}
        </div>
    );
};

export default Card;