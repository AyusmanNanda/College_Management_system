import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import MarksheetLayout from "./Admin/MarksheetLayout";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const VerifyMarksheet = () => {
    const { marksheetId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const verifyDocument = async () => {
            try {
                const BACKEND_URL = import.meta.env.VITE_BACKEND || window.location.origin;
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

    const getGrade = (percentage) => {
        if (percentage >= 90) return "O";
        if (percentage >= 80) return "A+";
        if (percentage >= 70) return "A";
        if (percentage >= 60) return "B+";
        if (percentage >= 50) return "B";
        if (percentage >= 40) return "C";
        return "F";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">Verifying Record...</h2>
                <p className="text-sm text-slate-500">Querying secure database</p>
            </div>
        );
    }

    if (error || !data?.isValid) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-center">
                <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                    <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Verification Failed</h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-md">{error}</p>
            </div>
        );
    }

    const adaptedMarksheet = {
        collegeName: data.collegeName,
        collegeLogo: "/uploads/admin/admin.jpg",
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
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-12 px-4">
            <div className="max-w-4xl mx-auto">

                <div className="bg-emerald-600 text-white p-5 rounded-t-3xl shadow-lg flex items-center justify-center gap-4">
                    <CheckCircle2 className="w-8 h-8" />
                    <div className="text-center sm:text-left">
                        <h1 className="font-black text-xl tracking-tight leading-none uppercase">Document Authenticated</h1>
                        <p className="text-[10px] opacity-90 uppercase mt-1 font-bold tracking-widest">Official Academic Verification System</p>
                    </div>
                </div>

                <div className="bg-white p-2 sm:p-10 rounded-b-3xl shadow-2xl overflow-x-auto border-x border-b border-slate-200">
                    <div style={{ width: '794px' }} className="mx-auto">
                        <MarksheetLayout
                            marksheet={adaptedMarksheet}
                            semLabel="Semester"
                            selectedSem={data.academic.semester}
                            marksheetCode={data.verificationId}
                            verificationUrl={window.location.href}
                            summary={data.performance.summary}
                            hash="DIGITALLY-SIGNED-SECURE-RECORD"
                            courseDisplay={data.academic.courseCode}
                            getGrade={getGrade}
                        />
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-500 text-xs uppercase font-bold tracking-widest opacity-50">
                    Authentication Record Complete
                </p>
            </div>
        </div>
    );
};

export default VerifyMarksheet;