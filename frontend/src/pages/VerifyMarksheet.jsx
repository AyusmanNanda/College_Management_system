import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import MarksheetLayout from "./Admin/MarksheetLayout"; // Correctly importing from the Admin folder
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const VerifyMarksheet = () => {
    // Grabs the ID from the URL (e.g., MS-CSE-6-23011069)
    const { marksheetId } = useParams();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const verifyDocument = async () => {
            try {
                // Determine the backend URL from your .env file
                const BACKEND_URL = import.meta.env.VITE_BACKEND || window.location.origin;

                // Hit the public API we created in verifyRoutes.js
                const res = await axios.get(`${BACKEND_URL}/api/verify/marksheet/${marksheetId}`);
                setData(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Invalid or tampered Marksheet ID.");
            } finally {
                setLoading(false);
            }
        };

        if (marksheetId) verifyDocument();
    }, [marksheetId]);

    // Standard grading logic
    const getGrade = (percentage) => {
        if (percentage >= 90) return "O";
        if (percentage >= 80) return "A+";
        if (percentage >= 70) return "A";
        if (percentage >= 60) return "B+";
        if (percentage >= 50) return "B";
        if (percentage >= 40) return "C";
        return "F";
    };

    /* ================= STATE: LOADING ================= */
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">Verifying Record...</h2>
                <p className="text-sm text-slate-500">Securely querying the college database</p>
            </div>
        );
    }

    /* ================= STATE: ERROR / INVALID ================= */
    if (error || !data?.isValid) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-center">
                <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                    <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Verification Failed</h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-md">{error}</p>
                <p className="mt-6 text-xs text-slate-400 uppercase tracking-widest">Document may be forged or altered</p>
            </div>
        );
    }

    /* ================= STATE: SUCCESS ================= */
    // Translate the public API data into the exact format your existing MarksheetLayout expects
    const adaptedMarksheet = {
        collegeName: data.collegeName,
        collegeLogo: "default.png", // The layout will fetch this via your standard URL rules
        marks: data.performance.marks.map(m => ({
            courcecode: data.academic.courseCode,
            subjectcode: m.subjectcode,
            subjectname: m.subjectname,
            subjecttype: m.type,
            theorymarks: m.theory.obtained,
            theoryfull: m.theory.max,
            practicalmarks: m.practical.obtained,
            practicalfull: m.practical.max,
            firstname: data.student.name.split(' ')[0],
            lastname: data.student.name.split(' ').slice(1).join(' ') || "",
            rollnumber: data.student.rollnumber,
            profilepic: data.student.profilepic
        }))
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4">
            <div className="max-w-4xl mx-auto">

                {/* OFFICIAL VERIFICATION BANNER */}
                <div className="bg-emerald-500 text-white p-4 rounded-t-2xl shadow-md flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="font-bold tracking-wide">OFFICIAL ACADEMIC RECORD VERIFIED</span>
                </div>

                {/* THE ACTUAL MARKSHEET */}
                <div className="bg-white p-4 sm:p-8 rounded-b-2xl shadow-xl overflow-x-auto">
                    {/* Hardcoding the width ensures it renders exactly like the printed PDF */}
                    <div style={{ minWidth: '794px' }} className="mx-auto border border-slate-200">
                        <MarksheetLayout
                            marksheet={adaptedMarksheet}
                            semLabel="Semester"
                            selectedSem={data.academic.semester}
                            marksheetCode={data.verificationId}
                            verificationUrl={window.location.href}
                            summary={data.performance.summary}
                            hash="VERIFIED-SECURE-RECORD"
                            courseDisplay={data.academic.courseCode}
                            getGrade={getGrade}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default VerifyMarksheet;