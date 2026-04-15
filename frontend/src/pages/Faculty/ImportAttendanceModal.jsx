import { useState } from "react";
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

  const handleDownloadTemplate = async () => {
    try {
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
      link.download = "attendance_template.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Template download error:", err);
      setError("Failed to download template.");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError("");
    setResult(null);
  };

  const handleImportAttendance = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("subjectcode", subjectcode);
      formData.append("courcecode", courcecode);
      formData.append("semoryear", semoryear);
      formData.append("date", date);

      const res = await api.post("/api/attendance/import", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(res.data);

      if (onImportSuccess) {
        onImportSuccess(res.data);
      }
    } catch (err) {
      console.error("Import attendance error:", err);
      setError(err?.response?.data?.message || "Failed to import attendance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-8">
          Import Attendance from Excel
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-md text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-8">
          <div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-3">
              Download template:
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="px-6 py-3 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              Download Template
            </button>
          </div>

          <div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-3">
              Upload completed file:
            </p>
            <label className="inline-block cursor-pointer">
  <span className="px-6 py-3 rounded-lg bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
    Choose Excel File
  </span>

  <input
    type="file"
    accept=".xlsx,.xls"
    onChange={handleFileChange}
    className="hidden"
  />
</label>
            {file && (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Selected file: {file.name}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleImportAttendance}
              disabled={!file || loading}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition ${
                !file || loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {loading ? "Importing..." : "Import Attendance"}
            </button>
          </div>

          {result && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gray-50 dark:bg-gray-900/30">
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                Total Rows: {result.totalRows}
              </p>
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                Inserted: {result.inserted}
              </p>
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                Invalid Rows: {result.invalidRows}
              </p>

              {result.errors?.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-red-600 dark:text-red-400 mb-2">
                    Errors:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-red-600 dark:text-red-400 space-y-1">
                    {result.errors.map((item, index) => (
                      <li key={index}>
                        Row {item.row}: {item.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}