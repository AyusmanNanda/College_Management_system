import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";

const Toast = ({ type = "success", message, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleDismiss();
        }, 4000); // Slightly longer duration for readability
        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setVisible(false);
        setTimeout(() => onClose?.(), 300);
    };

    // Configuration for different toast types
    const config = {
        success: {
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
            border: "border-emerald-500/20",
            bg: "bg-emerald-50/90 dark:bg-emerald-500/10",
            textColor: "text-emerald-900 dark:text-emerald-300",
            label: "Success"
        },
        error: {
            icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
            border: "border-rose-500/20",
            bg: "bg-rose-50/90 dark:bg-rose-500/10",
            textColor: "text-rose-900 dark:text-rose-300",
            label: "Error"
        },
        info: {
            icon: <Info className="w-5 h-5 text-indigo-500" />,
            border: "border-indigo-500/20",
            bg: "bg-indigo-50/90 dark:bg-indigo-500/10",
            textColor: "text-indigo-900 dark:text-indigo-300",
            label: "System"
        }
    };

    const current = config[type] || config.info;

    return (
        <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-out pointer-events-none ${
                visible
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-4 scale-95"
            }`}
        >
            <div className={`
                flex items-center gap-4 px-4 py-3 min-w-[320px] max-w-[90vw]
                backdrop-blur-md border rounded-2xl shadow-2xl pointer-events-auto
                ${current.bg} ${current.border}
            `}>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                    {current.icon}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    <p className={`text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5 ${current.textColor}`}>
                        {current.label}
                    </p>
                    <p className={`text-sm font-semibold truncate ${current.textColor}`}>
                        {message}
                    </p>
                </div>

                {/* Dismiss Button */}
                <button
                    onClick={handleDismiss}
                    className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
                </button>
            </div>
        </div>
    );
};

export default Toast;