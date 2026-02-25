import { useState } from "react";
import axios from "axios";

const ImportFacultyModal = ({ token, onClose, onImportSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/faculty/template",
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: "blob"
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Faculty_Import_Template.xlsx");
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

            const response = await axios.post(
                "http://localhost:5000/api/faculty/import",
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">

            {/* Exact same overlay as AdminProfile */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Exact same card style */}
            <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl z-10 overflow-hidden p-6">

                {/* Close Button (same style) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-5 text-gray-500 hover:text-black text-sm"
                >
                    ✕
                </button>

                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                    Import Faculty from Excel
                </h2>

                <div className="space-y-6">

                    {/* Download Template */}
                    <div>
                        <p className="text-sm text-gray-600 mb-2">
                            Download template:
                        </p>
                        <button
                            onClick={handleDownloadTemplate}
                            className="px-5 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition"
                        >
                            Download Template
                        </button>
                    </div>

                    {/* Upload File */}
                    <div>
                        <p className="text-sm text-gray-600 mb-3">
                            Upload completed file:
                        </p>

                        <label className="inline-block">
                        <span className="px-5 py-2 bg-gray-100 border border-gray-300 text-sm rounded-md hover:bg-gray-200 transition cursor-pointer">
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
                            <div className="mt-3 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                                Selected file: <span className="font-medium">{file.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Import Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleImport}
                            disabled={!file || loading}
                            className={`px-5 py-2 text-sm rounded-md transition ${
                                !file || loading
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-900 text-white hover:bg-black"
                            }`}
                        >
                            {loading ? "Importing..." : "Import Faculties"}
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    {/* Result Summary */}
                    {result && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
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

export default ImportFacultyModal;