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
        <div className="fixed inset-0 bg-gray-100/70 backdrop-blur-[2px] flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-lg shadow-sm border border-gray-200 p-6">

                <h3 className="text-lg font-semibold text-gray-800">
                    {title}
                </h3>

                <p className="text-sm text-gray-500 mt-2">
                    {message}
                </p>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition"
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;