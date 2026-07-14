import {
    AlertCircle,
    CheckCircle2,
    Info,
    TriangleAlert,
} from "lucide-react";

const variants = {
    error: {
        icon: AlertCircle,
        classes:
            "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400",
    },

    success: {
        icon: CheckCircle2,
        classes:
            "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
    },

    warning: {
        icon: TriangleAlert,
        classes:
            "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400",
    },

    info: {
        icon: Info,
        classes:
            "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400",
    },
};

const Alert = ({
                   children,
                   variant = "error",
                   className = "",
               }) => {
    const selectedVariant = variants[variant] || variants.error;
    const Icon = selectedVariant.icon;

    return (
        <div
            role="alert"
            className={`
                flex items-start gap-2
                p-3
                border
                rounded-lg
                text-sm font-medium
                ${selectedVariant.classes}
                ${className}
            `}
        >
            <Icon className="w-4 h-4 mt-0.5 shrink-0" />

            <div className="min-w-0">
                {children}
            </div>
        </div>
    );
};

export default Alert;