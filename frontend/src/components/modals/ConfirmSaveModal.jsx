import { Save } from "lucide-react";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";

const ConfirmSaveModal = ({
                              show,
                              title = "Confirm Save",
                              message = "Are you sure you want to save these changes? This will synchronize the data with the central server.",
                              confirmText = "Save Changes",
                              onCancel,
                              onConfirm,
                              loading = false,
                          }) => {
    if (!show) return null;

    const handleBackdropClick = () => {
        if (!loading) {
            onCancel?.();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div
                className="w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 dark:border-slate-800 dark:bg-slate-900"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="p-8">
                    <div className="mb-8 flex flex-col items-center text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-500/20 dark:bg-indigo-500/10">
                            <Save size={32} />
                        </div>

                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-100">
                            {title}
                        </h3>

                        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                            {message}
                        </p>
                    </div>

                    <div className="flex flex-col justify-center gap-3 sm:flex-row">
                        <Button
                            variant="secondary"
                            size="lg"
                            className="flex-1 text-[10px] uppercase tracking-widest"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="primary"
                            size="lg"
                            className="min-h-[44px] flex-1 text-[10px] uppercase tracking-widest"
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner size="sm" />
                                    <span>Processing</span>
                                </>
                            ) : (
                                confirmText
                            )}
                        </Button>
                    </div>
                </div>

                {loading && (
                    <div className="h-1 w-full overflow-hidden bg-blue-500/10">
                        <div className="h-full bg-blue-600 animate-progress-loading" />
                    </div>
                )}
            </div>

            <style>{`
                @keyframes progress-loading {
                    0% {
                        width: 0;
                        transform: translateX(-100%);
                    }

                    50% {
                        width: 30%;
                    }

                    100% {
                        width: 100%;
                        transform: translateX(100%);
                    }
                }

                .animate-progress-loading {
                    animation: progress-loading 1.5s infinite linear;
                }
            `}</style>
        </div>
    );
};

export default ConfirmSaveModal;