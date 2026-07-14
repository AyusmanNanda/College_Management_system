import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { FileSpreadsheet, Download, Upload, X, AlertCircle, CheckCircle2 } from "lucide-react";
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
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div
                className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] shadow-2xl z-10 overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                >
                    <X size={20} />
                </button>

                <div className="p-8 sm:p-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <FileSpreadsheet size={24} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-100">
                                Faculty Data Import
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Bulk Upload Utility
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">

                        {/* Step 1: Download */}
                        <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px]">1</span>
                                Download Structure
                            </p>

                            <button
                                onClick={handleDownloadTemplate}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 text-indigo-600 border border-indigo-100 dark:border-indigo-900/50 text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-indigo-500/10 transition-all active:scale-95"
                            >
                                <Download size={16} />
                                {loading ? "Preparing..." : "Download Template"}
                            </button>
                        </div>

                        {/* Step 2: Upload */}
                        <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px]">2</span>
                                Upload Data
                            </p>

                            <label className="block">
                                <span
                                    className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 transition-all cursor-pointer dark:text-slate-300">
                                    <Upload size={18} />
                                    {file ? "Change Excel File" : "Select Completed File"}
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
                                    className="mt-4 flex items-center gap-3 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 rounded-xl px-4 py-3 animate-in slide-in-from-left-2">
                                    <CheckCircle2 size={14} />
                                    <span className="truncate">File Ready: {file.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Final Actions */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                            <button
                                onClick={handleImport}
                                disabled={!file || loading}
                                className={`w-full sm:w-auto px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                                    !file || loading
                                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                        : "bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700"
                                }`}
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : <Upload size={16} />}
                                {loading ? "Processing..." : "Execute Import"}
                            </button>
                        </div>

                        {/* Status Messaging */}
                        <div className="space-y-4">
                            {error && (
                                <div className="w-full flex items-start gap-3 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-xl px-4 py-3 animate-in slide-in-from-top-2">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {result && (
                                <div
                                    className="w-full bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-6 text-[11px] font-bold text-slate-700 dark:text-slate-300 grid grid-cols-2 gap-4 animate-in zoom-in-95">
                                    <div className="space-y-1">
                                        <p className="text-slate-400 uppercase text-[9px] tracking-widest">Total Rows</p>
                                        <p className="text-lg text-slate-900 dark:text-white">{result.totalRows}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-emerald-500 uppercase text-[9px] tracking-widest">Inserted</p>
                                        <p className="text-lg text-emerald-600">{result.inserted}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-amber-500 uppercase text-[9px] tracking-widest">Duplicates</p>
                                        <p className="text-lg text-amber-600">{result.duplicates}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-rose-500 uppercase text-[9px] tracking-widest">Invalid</p>
                                        <p className="text-lg text-rose-600">{result.invalidRows}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            <ConfirmSaveModal
                show={showConfirm}
                title="Conflict Detected"
                message="An existing template was found in your storage. Would you like to overwrite it with a fresh copy?"
                confirmText="Overwrite File"
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