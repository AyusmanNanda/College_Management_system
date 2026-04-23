import { useState, useRef } from "react";
import { 
    X, FileDown, Upload, AlertCircle, FileSpreadsheet, 
    ArrowRight, Loader2, UploadCloud, CheckCircle2 
} from "lucide-react";
import api from "../../utils/api";

export default function ImportMarksModal({
  token,
  course,
  sem,
  subject,
  onClose,
  onImportSuccess,
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  /* ================= DOWNLOAD LOGIC (CROSS-PLATFORM) ================= */
  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get(
        `/api/marks/template?course=${course}&sem=${sem}&subject=${subject}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Marks_Template_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 200);
    } catch (err) {
      setError("Template fetch failed. Ensure you have a stable connection.");
    }
  };

  /* ================= FILE SELECTION ================= */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const isValidType = selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
                        selectedFile.type === "application/vnd.ms-excel";
    const isValidExt = /\.(xlsx|xls)$/i.test(selectedFile.name);

    if (!isValidType && !isValidExt) {
      setError("Invalid file format. Please upload an Excel (.xlsx or .xls) file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFile(selectedFile);
    setError("");
    setResult(null);
  };

  /* ================= IMPORT LOGIC ================= */
  const handleImport = async () => {
    if (!file || loading) return;

    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("course", course);
    formData.append("sem", sem);
    formData.append("subject", subject);

    try {
      setLoading(true);
      setError("");
      
      const response = await api.post("/api/marks/import", formData, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 60000, 
      });

      setResult(response.data);
      if (onImportSuccess) onImportSuccess(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Sync failed. Check template alignment.");
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

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
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
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
              <UploadCloud size={24} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-100">
                Marks Sync
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Batch Module • {subject}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl text-rose-600 text-[11px] font-bold animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* STEP 1: DOWNLOAD */}
            <div className="bg-slate-50 dark:bg-slate-950/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[9px]">01</span>
                    Get Template
                </p>
                <button 
                    onClick={handleDownloadTemplate} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 hover:shadow-md transition-all active:scale-95"
                >
                    <FileDown size={16} /> Download structure
                </button>
            </div>

            {/* STEP 2: UPLOAD */}
            <div className="bg-slate-50 dark:bg-slate-950/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[9px]">02</span>
                    Upload Data
                </p>
                <label className="block cursor-pointer">
                    <div className={`flex flex-col items-center justify-center gap-3 w-full p-8 bg-white dark:bg-slate-800 border-2 border-dashed rounded-2xl transition-all ${file ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'}`}>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept=".xlsx, .xls" 
                            onChange={handleFileChange} 
                            className="hidden" 
                        />
                        {!file ? (
                            <>
                                <Upload className="w-6 h-6 text-slate-300" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Excel File</span>
                            </>
                        ) : (
                            <div className="flex items-center gap-3 text-blue-600">
                                <FileSpreadsheet size={24} />
                                <div className="text-left">
                                    <p className="text-xs font-black truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter flex items-center gap-1">
                                        <CheckCircle2 size={10} /> Ready to sync
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </label>
            </div>

            {/* RESULTS GRID */}
            {result && (
                <div className="grid grid-cols-3 gap-2 animate-in zoom-in-95">
                    {[
                        { label: 'Total', val: result.totalRows, color: 'text-slate-600' },
                        { label: 'Imported', val: result.inserted, color: 'text-emerald-600' },
                        { label: 'Faults', val: result.invalidRows, color: 'text-rose-500' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3 rounded-xl text-center shadow-sm">
                            <p className={`text-lg font-black ${stat.color}`}>{stat.val}</p>
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{stat.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                    onClick={onClose} 
                    className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleImport}
                    disabled={!file || loading}
                    className={`flex items-center gap-3 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 ${
                        !file || loading 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
                    }`}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight size={16} /> Execute Sync</>}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}