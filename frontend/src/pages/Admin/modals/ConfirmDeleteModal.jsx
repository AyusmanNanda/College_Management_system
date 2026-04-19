const ConfirmDeleteModal = ({
                                show,
                                title = "Confirm Deletion",
                                message = "Are you sure you want to delete this item? This action cannot be undone.",
                                onCancel,
                                onConfirm,
                                loading = false
                            }) => {
    if (!show) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={() => {
                if (!loading) onCancel();
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 w-full max-w-md rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200"
            >
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                    <span className="h-2 w-2 bg-red-500 rounded-full mr-2" />
                    {title}
                </h3>

                {/* Message */}
                <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="min-w-[90px] px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="min-w-[90px] px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition disabled:opacity-60 ring-1 ring-red-500/20"
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;