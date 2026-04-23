import { useEffect, useState, useMemo } from "react";
import { Capacitor } from "@capacitor/core";
import api from "../../utils/api";
import MarksheetLayout from "./MarksheetLayout";
import {
    FileText,
    Filter,
    AlertCircle,
    Download,
    RotateCcw,
    Search,
    Printer,
    BookOpen
} from "lucide-react";

const PrintMarksheet = () => {
    /* ================= CORE LOGIC (PRESERVED FROM STABLE CODE) ================= */
    const token = localStorage.getItem("token");
    const params = useMemo(() => new URLSearchParams(window.location.search), [window.location.search]);
    const isPrintMode = params.get("print") === "true";

    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedRoll, setSelectedRoll] = useState("");
    const [marksheet, setMarksheet] = useState(null);
    const [error, setError] = useState("");
    const [hash, setHash] = useState("");

    const getAuthHeader = () => {
        if (isPrintMode) return {};
        return { Authorization: `Bearer ${token}` };
    };

    const handleReset = () => {
        setSelectedCourse("");
        setSelectedSem("");
        setSelectedRoll("");
        setMarksheet(null);
        setError("");
    };

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get("/api/courses", { headers: getAuthHeader() });
                setCourses(res.data || []);
            } catch { setCourses([]); }
        };
        fetchCourses();
    }, []);

    const selectedCourseObj = useMemo(() => {
        return courses.find(c => c.course_code === selectedCourse);
    }, [courses, selectedCourse]);

    const semLabel = selectedCourseObj?.sem_or_year?.toLowerCase() === "year" ? "Year" : "Semester";

    const semesterOptions = useMemo(() => {
        if (!selectedCourseObj) return [];
        const total = Number(selectedCourseObj.total_semesters);
        return Array.from({ length: total }, (_, i) => i + 1);
    }, [selectedCourseObj]);

    useEffect(() => {
        if (!selectedCourse || !selectedSem) return;
        const fetchStudents = async () => {
            try {
                const res = await api.get(
                    `/api/marks/students?course=${selectedCourse}&sem=${selectedSem}`,
                    { headers: getAuthHeader() }
                );
                setStudents(res.data || []);
            } catch { setStudents([]); }
        };
        fetchStudents();
    }, [selectedCourse, selectedSem]);

    useEffect(() => {
        const shouldPrint = params.get("print");
        if (shouldPrint === "true") {
            const course = params.get("course");
            const sem = params.get("sem");
            const roll = params.get("roll");
            if (course && sem && roll) {
                setSelectedCourse(course);
                setSelectedSem(sem);
                setSelectedRoll(roll);
                (async () => {
                    try {
                        const res = await api.get(
                            `/api/marks/student-marks?course=${course}&sem=${sem}&roll=${roll}`,
                            { headers: getAuthHeader() }
                        );
                        setMarksheet(res.data);
                    } catch (e) { console.error("Restore fetch failed:", e); }
                })();
            }
        }
    }, [params]);

    useEffect(() => {
        if (isPrintMode && marksheet) {
            setTimeout(() => window.print(), 500);
        }
    }, [marksheet, isPrintMode]);

    const loadMarksheet = async () => {
        if (!selectedCourse || !selectedSem || !selectedRoll) {
            setError("Please select course, semester and student.");
            return;
        }
        try {
            const res = await api.get(
                `/api/marks/student-marks?course=${selectedCourse}&sem=${selectedSem}&roll=${selectedRoll}`,
                { headers: getAuthHeader() }
            );
            setMarksheet(res.data);
            setError("");
        } catch { setError("Failed to load marksheet."); }
    };

    const getGrade = (percentage) => {
        if (percentage >= 90) return "O";
        if (percentage >= 80) return "A+";
        if (percentage >= 70) return "A";
        if (percentage >= 60) return "B+";
        if (percentage >= 50) return "B";
        if (percentage >= 40) return "C";
        return "F";
    };

    const downloadPDF = async () => {
        try {
            if (!marksheet) { setError("Load marksheet first."); return; }
            if (window.electronAPI) { window.electronAPI.printMarksheet(); return; }
            if (Capacitor.isNativePlatform()) {
                const FRONTEND_URL = import.meta.env.VITE_FRONTEND;
                const url = new URL(`${FRONTEND_URL}/#/print-marksheet`);
                url.searchParams.set("print", "true");
                url.searchParams.set("course", selectedCourse);
                url.searchParams.set("sem", selectedSem);
                url.searchParams.set("roll", selectedRoll);
                window.open(url.toString(), "_system");
                return;
            }
            window.print();
        } catch (e) { setError("Something went wrong while printing."); }
    };

    const marksheetCode = `MS-${selectedCourse}-${selectedSem}-${selectedRoll}`;
    const verificationUrl = `${window.location.origin}/verify/marksheet/${marksheetCode}`;
    const summary = marksheet?.summary;

    useEffect(() => {
        const generateHash = async () => {
            if (!marksheet?.marks) return;
            const dataString = JSON.stringify({
                course: selectedCourse, semester: selectedSem, roll: selectedRoll, marks: marksheet.marks
            });
            const encoder = new TextEncoder();
            const data = encoder.encode(dataString);
            const hashBuffer = await crypto.subtle.digest("SHA-256", data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            setHash(hashArray.map(b => b.toString(16).padStart(2, "0")).join(""));
        };
        generateHash();
    }, [marksheet, selectedCourse, selectedSem, selectedRoll]);

    const courseDisplay = useMemo(() => {
        if (!marksheet?.marks?.length) return "";
        const code = marksheet.marks[0].courcecode;
        const course = courses.find(c => c.course_code === code);
        return course ? `${course.course_name} (${code})` : code;
    }, [marksheet, courses]);

    const isFormReady = selectedCourse && selectedSem && selectedRoll;

    /* ================= RENDER: PRINT MODE (ISOLATED) ================= */
    if (isPrintMode) {
        return (
            <div className="bg-white p-0 m-0">
                {marksheet && (
                    <MarksheetLayout
                        marksheet={marksheet} semLabel={semLabel} selectedSem={selectedSem}
                        marksheetCode={marksheetCode} verificationUrl={verificationUrl}
                        summary={summary} hash={hash} courseDisplay={courseDisplay} getGrade={getGrade}
                    />
                )}
            </div>
        );
    }

    /* ================= RENDER: INDIGO UI ================= */
    return (
        <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">

            {/* PLATFORM HEADER */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-500/20">
                            <Printer className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-tight">Marksheet Console</h1>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">Certification Module</p>
                        </div>
                    </div>
                    <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Reset Form</span>
                    </button>
                </div>
            </header>

            {/* MAIN CONTAINER: Optimized spacing to prevent "Slide Down" */}
            <main className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pb-12 ${marksheet ? 'pt-4' : 'pt-8'}`}>

                {error && (
                    <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* FILTER CARD */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4 text-indigo-600">
                        <Filter className="w-4 h-4" />
                        <h2 className="text-xs font-bold uppercase tracking-wider">Document Filter</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <select
                            value={selectedCourse}
                            onChange={(e) => { setSelectedCourse(e.target.value); setSelectedSem(""); setMarksheet(null); setError(""); }}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                        >
                            <option value="">Course...</option>
                            {courses.map(course => <option key={course.id} value={course.course_code}>{course.course_name}</option>)}
                        </select>

                        <select
                            value={selectedSem}
                            onChange={(e) => { setSelectedSem(e.target.value); setMarksheet(null); setError(""); }}
                            disabled={!selectedCourse}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 disabled:opacity-40 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                        >
                            <option value="">{semLabel}...</option>
                            {semesterOptions.map(num => <option key={num} value={num}>{semLabel} {num}</option>)}
                        </select>

                        <select
                            value={selectedRoll}
                            onChange={(e) => { setSelectedRoll(e.target.value); setMarksheet(null); setError(""); }}
                            disabled={!selectedSem}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 disabled:opacity-40 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                        >
                            <option value="">Student...</option>
                            {students.map(s => (
                                <option key={s.rollnumber} value={s.rollnumber}>{s.rollnumber} — {s.firstname} {s.lastname}</option>
                            ))}
                        </select>

                        <button
                            onClick={loadMarksheet}
                            disabled={!isFormReady}
                            className={`w-full px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2
                                ${isFormReady ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                        >
                            <Search className="w-4 h-4" /> Load Marksheet
                        </button>
                    </div>
                </section>

                {/* MARKSHEET PREVIEW AREA */}
                {marksheet ? (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-4 py-3 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                                    <FileText className="w-4 h-4 text-indigo-600" />
                                </div>
                                <p className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-tight">System ID: {marksheetCode}</p>
                            </div>
                            <button onClick={downloadPDF}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95">
                                <Download className="w-4 h-4" /> Export / Print PDF
                            </button>
                        </div>

                        {/* Marksheet Container: Starts flush with the top of this area */}
                        <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl p-0 sm:p-2 overflow-x-auto shadow-inner border border-slate-300 dark:border-slate-700">
                            <div className="mx-auto bg-white p-0 shadow-2xl overflow-hidden" style={{ width: '794px' }}>
                                <MarksheetLayout
                                    marksheet={marksheet} semLabel={semLabel} selectedSem={selectedSem}
                                    marksheetCode={marksheetCode} verificationUrl={verificationUrl}
                                    summary={summary} hash={hash} courseDisplay={courseDisplay} getGrade={getGrade}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    /* EMPTY STATE */
                    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center px-4 shadow-sm">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800">
                            <BookOpen className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Awaiting Record</h2>
                        <p className="text-sm text-slate-500 mt-1 max-w-xs">Select student record and click Load Marksheet to preview the official semester grade sheet.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PrintMarksheet;