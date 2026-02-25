import { useState } from "react";
import axios from "axios";

const ImportFacultyModal = ({ token, onClose, onImportSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    // ============================
    // Download Template
    // ============================
    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/faculty/template",
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: "blob"
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                "Faculty_Import_Template.xlsx"
            );

            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (err) {
            console.error(err);
            setError("Failed to download template.");
        }
    };

    // ============================
    // Import File
    // ============================
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

            // Refresh faculty list
            onImportSuccess();

        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message || "Import failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-6 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>

                <h3 className="text-lg font-semibold mb-4">
                    Import Faculty from Excel
                </h3>

                {/* Step 1 */}
                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                        Step 1: Download the template.
                    </p>
                    <button
                        onClick={handleDownloadTemplate}
                        className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-black"
                    >
                        Download Template
                    </button>
                </div>

                {/* Step 2 */}
                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                        Step 2: Upload the completed file.
                    </p>

                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="text-sm"
                    />

                    {file && (
                        <p className="text-xs text-gray-500 mt-2">
                            Selected: {file.name}
                        </p>
                    )}
                </div>

                {/* Import Button */}
                <button
                    onClick={handleImport}
                    disabled={!file || loading}
                    className={`px-4 py-2 text-sm rounded ${
                        !file || loading
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                >
                    {loading ? "Importing..." : "Import Faculties"}
                </button>

                {/* Error */}
                {error && (
                    <div className="mt-4 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Result Summary */}
                {result && (
                    <div className="mt-4 bg-gray-50 p-4 rounded text-sm border">
                        <p><strong>Total Rows:</strong> {result.totalRows}</p>
                        <p><strong>Inserted:</strong> {result.inserted}</p>
                        <p><strong>Duplicates:</strong> {result.duplicates}</p>
                        <p><strong>Invalid Rows:</strong> {result.invalidRows}</p>

                        {result.errors?.length > 0 && (
                            <div className="mt-2 max-h-40 overflow-y-auto text-xs text-red-600">
                                {result.errors.map((err, index) => (
                                    <p key={index}>
                                        Row {err.row}: {err.reason}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ImportFacultyModal;