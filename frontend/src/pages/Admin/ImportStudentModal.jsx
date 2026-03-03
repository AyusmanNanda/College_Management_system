import { useState } from "react";
import api from "../../utils/api";

const ImportStudentModal = ({ token, onClose, onImportSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get(
                "/api/student/template",
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: "blob"
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Student_Import_Template.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            setError("Failed to download template.");
        }
    };

    const handleImport = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            setError("");
            setResult(null);

            const response = await api.post(
                "/api/student/import",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            setResult(response.data);
            onImportSuccess();
        } catch (err) {
            setError(err.response?.data?.message || "Import failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl z-10 overflow-hidden p-6 sm:p-8 transition-colors">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-5 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm transition"
                >
                    ✕
                </button>

                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
                    Import Students from Excel
                </h2>

                <div className="space-y-6">

                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Download template:
                        </p>

                        <button
                            onClick={handleDownloadTemplate}
                            className="w-full sm:w-auto px-5 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition"
                        >
                            Download Template
                        </button>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Upload completed file:
                        </p>

                        <label className="block sm:inline-block">
                            <span className="block sm:inline-block text-center w-full sm:w-auto px-5 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer dark:text-gray-200">
                                Choose Excel File
                            </span>

                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="hidden"
                            />
                        </label>

                        {file && (
                            <div className="mt-3 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 break-all">
                                Selected file: <span className="font-medium">{file.name}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleImport}
                            disabled={!file || loading}
                            className={`px-5 py-2 text-sm rounded-md transition ${
                                !file || loading
                                    ? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-900 text-white hover:bg-black"
                            }`}
                        >
                            {loading ? "Importing..." : "Import Students"}
                        </button>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    )}

                    {result && (
                        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-200">
                            <p><strong>Total Rows:</strong> {result.totalRows}</p>
                            <p><strong>Inserted:</strong> {result.inserted}</p>
                            <p><strong>Duplicates:</strong> {result.duplicates}</p>
                            <p><strong>Invalid Rows:</strong> {result.invalidRows}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportStudentModal;