import { useState, useRef } from "react";
import { 
    X, FileDown, Upload, AlertCircle, FileSpreadsheet, 
    ArrowRight, Loader2, UploadCloud, CheckCircle2 
} from "lucide-react";
import api from "../../utils/api";

export default function ImportAttendanceModal({
    onClose,
    token,
    subjectcode,
    courcecode, 
    semoryear,
    date,
    onImportSuccess,
}) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    /* ================= UNIVERSAL DOWNLOAD LOGIC ================= */
    const handleDownloadTemplate = async () => {
        try {
            setError("");
            const res = await api.get("/api/attendance/template", {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob",
            });

            const blob = new Blob([res.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `attendance_template_${Date.now()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(url), 200);
        } catch (err) {
            setError("Template download failed. Check network permissions.");
        }
    };

    /* ================= ROBUST FILE PICKER ================= */
    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const fileName = selectedFile.name;
        const isExcel = /\.(xlsx|xls)$/i.test(fileName);
        
        if (!isExcel) {
            setError("Invalid format. Only Excel (.xlsx, .xls) files are supported.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        
        setFile(selectedFile);
        setError("");
        setResult(null);
    };

    /* ================= MULTIPART API TRANSMISSION ================= */
    const handleImportAttendance = async () => {
        if (!file || loading) return;

        try {
            setLoading(true);
            setError("");
            
            const formData = new FormData();
            formData.append("file", file, file.name);
            formData.append("subjectcode", subjectcode);
            formData.append("courcecode", courcecode);
            formData.append("semoryear", semoryear);
            formData.append("date", date);

            const res = await api.post("/api/attendance/import", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                timeout: 30000, 
            });

            setResult(res.data);
            if (onImportSuccess) onImportSuccess(res.data);
        } catch (err) {
            const msg = err?.response?.data?.message || "Sync failed. Ensure template format matches.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose} 
            />

            <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] shadow-2xl z-10 overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                >
                    <X size={20} />
                </button>

                <div className="p-8 sm:p-10">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <UploadCloud size={24} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-100">
                                Attendance Cloud Sync
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Bulk Processing Utility
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        
                        {/* Step 1: Download Template */}
                        <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px]">1</span>
                                Requirement
                            </p>
                            <button
                                onClick={handleDownloadTemplate}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 text-indigo-600 border border-indigo-100 dark:border-indigo-900/50 text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-indigo-500/10 transition-all active:scale-95"
                            >
                                <FileDown size={16} />
                                Get Official Template
                            </button>
                        </div>

                        {/* Step 2: Upload Data */}
                        <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px]">2</span>
                                Upload File
                            </p>

                            <label className="block">
                                <span className={`flex items-center justify-center gap-3 w-full px-6 py-4 bg-white dark:bg-slate-800 border-2 border-dashed rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${file ? 'border-indigo-500 text-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-300 hover:border-indigo-400'}`}>
                                    {file ? <FileSpreadsheet size={18} /> : <Upload size={18} />}
                                    {file ? "Change Selected File" : "Drop Excel File or Tap"}
                                </span>
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept=".xlsx, .xls" 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                />
                            </label>

                            {file && (
                                <div className="mt-4 flex items-center gap-3 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-xl px-4 py-3 animate-in slide-in-from-left-2">
                                    <CheckCircle2 size={14} />
                                    <span className="truncate">Ready for Sync: {file.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                            <button
                                onClick={handleImportAttendance}
                                disabled={!file || loading}
                                className={`w-full sm:w-auto px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                                    !file || loading 
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" 
                                    : "bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700"
                                }`}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight size={16} />}
                                {loading ? "Transmitting..." : "Start Transmission"}
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
                                <div className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 grid grid-cols-3 gap-4 animate-in zoom-in-95">
                                    <div className="text-center space-y-1">
                                        <p className="text-slate-400 uppercase text-[9px] tracking-widest font-black">Analyzed</p>
                                        <p className="text-lg font-black dark:text-white">{result.totalRows || 0}</p>
                                    </div>
                                    <div className="text-center space-y-1 border-x border-slate-200 dark:border-slate-800">
                                        <p className="text-emerald-500 uppercase text-[9px] tracking-widest font-black">Success</p>
                                        <p className="text-lg font-black text-emerald-600">{result.inserted || 0}</p>
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-rose-500 uppercase text-[9px] tracking-widest font-black">Errors</p>
                                        <p className="text-lg font-black text-rose-500">{result.invalidRows || 0}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}