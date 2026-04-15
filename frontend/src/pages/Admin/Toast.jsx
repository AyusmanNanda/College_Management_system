import { useEffect, useState } from "react";

const Toast = ({ type = "success", message, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onClose?.(), 300);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
        >
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-sm border text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 whitespace-nowrap">

                {/* Indicator dot */}
                <span
                    className={`h-2 w-2 rounded-full flex-shrink-0 ${
                        type === "success" ? "bg-green-500" : "bg-red-500"
                    }`}
                />

                {/* Message */}
                <span>{message}</span>

                {/* Close button */}
                <button
                    onClick={() => {
                        setVisible(false);
                        setTimeout(() => onClose?.(), 300);
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-xs"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default Toast;