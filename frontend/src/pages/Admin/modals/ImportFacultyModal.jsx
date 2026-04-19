import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import api from "../../../utils/api.js";
import ConfirmSaveModal from "./ConfirmSaveModal.jsx";

const ImportFacultyModal = ({ token, onClose, onImportSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    const handleDownloadTemplate = async () => {
        try {
            setError("");
            const url = `${api.defaults.baseURL}/api/faculty/template`;

            if (Capacitor.isNativePlatform()) {
                setLoading(true);

                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    setLoading(false);
                    throw new Error("Download failed");
                }

                const blob = await response.blob();

                const reader = new FileReader();
                reader.onload = async () => {
                    const filePath = "Faculty_Import_Template.xlsx";
                    const fileData = reader.result;

                    try {
                        let fileExists = false;

                        try {
                            await Filesystem.stat({
                                path: filePath,
                                directory: Directory.Documents,
                            });
                            fileExists = true;
                        } catch (_) {
                            fileExists = false;
                        }

                        if (fileExists) {
                            setLoading(false);
                            setShowConfirm(true);

                            setConfirmAction(() => async () => {
                                try {
                                    await Filesystem.deleteFile({
                                        path: filePath,
                                        directory: Directory.Documents,
                                    });
                                } catch (err) {
                                    console.warn("Delete failed, falling back to overwrite");
                                }

                                try {
                                    await Filesystem.writeFile({
                                        path: filePath,
                                        data: fileData,
                                        directory: Directory.Documents,
                                        recursive: true,
                                    });

                                    setError("");
                                    alert("Download complete");

                                } catch (err) {
                                    console.error(err);
                                    setError("Failed to save file");
                                } finally {
                                    setLoading(false);
                                }
                            });

                            return;
                        }

                        await Filesystem.writeFile({
                            path: filePath,
                            data: fileData,
                            directory: Directory.Documents,
                            recursive: true,
                        });

                        setError("");
                        alert("Download complete");

                    } catch (err) {
                        console.error(err);
                        setError("Failed to save file");
                    } finally {
                        setLoading(false);
                    }
                };

                reader.onerror = () => {
                    setError("Failed to process file");
                    setLoading(false);
                };

                reader.readAsDataURL(blob);
                return;
            }

            const response = await api.get("/api/faculty/template", {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob"
            });

            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = blobUrl;
            link.setAttribute("download", "Faculty_Import_Template.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);

        } catch (err) {
            console.error(err);
            setLoading(false);
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
                "/api/faculty/import",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setResult(response.data);
            setFile(null);
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

            <div
                className="relative bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl z-10 overflow-hidden p-6 sm:p-8 transition-colors">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-5 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm transition"
                >
                    ✕
                </button>

                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
                    Import Faculty from Excel
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
                            {loading ? "Downloading..." : "Download Template"}
                        </button>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Upload completed file:
                        </p>

                        <label className="block sm:inline-block">
                            <span
                                className="block sm:inline-block text-center w-full sm:w-auto px-5 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer dark:text-gray-200">
                                Choose Excel File
                            </span>

                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={(e) => {
                                    const selectedFile = e.target.files?.[0];
                                    if (!selectedFile) return;

                                    setFile(selectedFile);
                                    setError("");
                                    setResult(null);

                                    e.target.value = null;
                                }}
                                className="hidden"
                            />
                        </label>

                        {file && (
                            <div
                                className="mt-3 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 break-all">
                                Selected file: <span className="font-medium">{file.name}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3">

                        <button
                            onClick={handleImport}
                            disabled={!file || loading}
                            className={`w-full sm:w-auto px-5 py-2 text-sm rounded-md transition ${
                                !file || loading
                                    ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                    : "bg-gray-900 text-white hover:bg-black"
                            }`}
                        >
                            {loading ? "Importing..." : "Import Faculties"}
                        </button>
                    </div>

                    <div className="space-y-3">
                        {error && (
                            <div className="w-full text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
                                {error}
                            </div>
                        )}

                        {result && (
                            <div
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-200">
                                <p><strong>Total Rows:</strong> {result.totalRows}</p>
                                <p><strong>Inserted:</strong> {result.inserted}</p>
                                <p><strong>Duplicates:</strong> {result.duplicates}</p>
                                <p><strong>Invalid Rows:</strong> {result.invalidRows}</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <ConfirmSaveModal
                show={showConfirm}
                title="File Already Exists"
                message="A file with the same name already exists. Do you want to replace it?"
                confirmText="Replace"
                onCancel={() => {
                    setShowConfirm(false);
                    setLoading(false);
                }}
                onConfirm={async () => {
                    setLoading(true);
                    if (confirmAction) await confirmAction();
                    setConfirmAction(null);
                    setShowConfirm(false);
                }}
                loading={loading}
            />
        </div>
    );
};

export default ImportFacultyModal;