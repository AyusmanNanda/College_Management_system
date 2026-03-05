import { useState } from "react";
import api from "../../utils/api";

const ImportMarksModal = ({ token, course, sem, subject, onClose, onImportSuccess }) => {

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const handleDownloadTemplate = async () => {
        try {

            const response = await api.get(
                `/api/marks/template?course=${course}&sem=${sem}&subject=${subject}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: "blob"
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");

            link.href = url;
            link.setAttribute("download", "Marks_Template.xlsx");

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
        formData.append("course", course);
        formData.append("sem", sem);
        formData.append("subject", subject);

        try {

            setLoading(true);
            setError("");
            setResult(null);

            const response = await api.post(
                "/api/marks/import",
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
        <div>

            <h2>Import Marks</h2>

            <button onClick={handleDownloadTemplate}>
                Download Template
            </button>

            <div>
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setFile(e.target.files[0])}
                />
            </div>

            <div>
                <button onClick={handleImport} disabled={!file || loading}>
                    {loading ? "Importing..." : "Import Marks"}
                </button>
            </div>

            {error && (
                <p>{error}</p>
            )}

            {result && (
                <div>
                    <p>Total Rows: {result.totalRows}</p>
                    <p>Inserted: {result.inserted}</p>
                    <p>Duplicates: {result.duplicates}</p>
                    <p>Invalid Rows: {result.invalidRows}</p>
                </div>
            )}

            <button onClick={onClose}>
                Close
            </button>

        </div>
    );
};

export default ImportMarksModal;