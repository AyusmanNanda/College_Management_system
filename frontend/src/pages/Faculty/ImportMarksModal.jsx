import { useState } from "react";
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

  //  Download template
  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get(
        `/api/marks/template?course=${course}&sem=${sem}&subject=${subject}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Marks_Template.xlsx");

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setError("Failed to download template.");
    }
  };

  // Import file
  const handleImport = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("course", course);
    formData.append("sem", sem);
    formData.append("subject", subject);

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.post("/api/marks/import", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(response.data);

      if (onImportSuccess) {
        onImportSuccess(response.data);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Import failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
    <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 relative">

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
      >
        ×
      </button>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-8">
        Import Marks from Excel
      </h2>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-md text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-8">

        {/* Download template */}
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

        {/* Upload file */}
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
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setError("");
                setResult(null);
              }}
              className="hidden"
            />
          </label>

          {file && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Selected file: {file.name}
            </p>
          )}
        </div>

        {/* Import button */}
        <div className="flex justify-end">
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition ${
              !file || loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {loading ? "Importing..." : "Import Marks"}
          </button>
        </div>

        {/* Result */}
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