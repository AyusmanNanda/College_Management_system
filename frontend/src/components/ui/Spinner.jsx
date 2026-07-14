const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-4",
};

const Spinner = ({
                     size = "md",
                     className = "",
                 }) => {
    return (
        <span
            role="status"
            aria-label="Loading"
            className={`
                inline-block
                rounded-full
                border-current
                border-t-transparent
                animate-spin
                ${sizes[size] || sizes.md}
                ${className}
            `}
        />
    );
};

export default Spinner;