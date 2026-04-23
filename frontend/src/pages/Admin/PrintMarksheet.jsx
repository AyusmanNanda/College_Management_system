import { useEffect, useState, useMemo } from "react";
import { Capacitor } from "@capacitor/core";
import api from "../../utils/api";
import MarksheetLayout from "./MarksheetLayout";

const PrintMarksheet = () => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams(window.location.search);
    const isPrintMode = params.get("print") === "true";

    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedRoll, setSelectedRoll] = useState("");

    const [marksheet, setMarksheet] = useState(null);
    const [error, setError] = useState("");
    const [hash, setHash] = useState("");

    const isSelectionComplete = selectedCourse && selectedSem && selectedRoll;

    const getAuthHeader = () => {
        if (isPrintMode) return {};
        return { Authorization: `Bearer ${token}` };
    };

    /* ================= FETCH DATA ================= */
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

    /* ================= LOAD LOGIC ================= */
    const loadMarksheet = async () => {
        try {
            const res = await api.get(
                `/api/marks/student-marks?course=${selectedCourse}&sem=${selectedSem}&roll=${selectedRoll}`,
                { headers: getAuthHeader() }
            );
            setMarksheet(res.data);
            setError("");
        } catch { setError("Failed to load marksheet."); }
    };

    /* ================= PRINT / PDF LOGIC ================= */
    const downloadPDF = async () => {
        if (window.electronAPI) {
            window.electronAPI.printMarksheet();
            return;
        }
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
    };

    useEffect(() => {
        if (isPrintMode && marksheet) {
            setTimeout(() => { window.print(); }, 500);
        }
    }, [marksheet]);

    /* ================= MISC ================= */
    useEffect(() => {
        const generateHash = async () => {
            if (!marksheet?.marks) return;
            const dataString = JSON.stringify({
                course: selectedCourse,
                semester: selectedSem,
                roll: selectedRoll,
                marks: marksheet.marks
            });
            const encoder = new TextEncoder();
            const data = encoder.encode(dataString);
            const hashBuffer = await crypto.subtle.digest("SHA-256", data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
            setHash(hashHex);
        };
        generateHash();
    }, [marksheet]);

    const marksheetCode = `MS-${selectedCourse}-${selectedSem}-${selectedRoll}`;
    const verificationUrl = `${window.location.origin}/verify/marksheet/${marksheetCode}`;

    return (
        <div className="space-y-8 sm:space-y-10 pb-10">
            {/* HEADER - Centered for Mobile */}
            {!isPrintMode && (
                <div className="text-center sm:text-left px-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                        Student Marksheet
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto sm:mx-0">
                        Generate and download official digital grade sheets.
                    </p>
                </div>
            )}

            {/* FILTER PANEL */}
            {!isPrintMode && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm mx-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <select value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); setSelectedRoll(""); }}
                                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-400">
                            <option value="">Select Course</option>
                            {courses.map(c => <option key={c.id} value={c.course_code}>{c.course_name}</option>)}
                        </select>

                        <select value={selectedSem} onChange={(e) => { setSelectedSem(e.target.value); setSelectedRoll(""); }}
                                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-400">
                            <option value="">Select {semLabel}</option>
                            {semesterOptions.map(num => <option key={num} value={num}>{semLabel} {num}</option>)}
                        </select>

                        <select value={selectedRoll} onChange={(e) => setSelectedRoll(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-400">
                            <option value="">Select Student</option>
                            {students.map(s => <option key={s.rollnumber} value={s.rollnumber}>{s.rollnumber} - {s.firstname}</option>)}
                        </select>
                    </div>

                    {/* Show Load button ONLY if fields are complete */}
                    {isSelectionComplete && (
                        <div className="flex justify-center sm:justify-end border-t border-gray-100 dark:border-gray-700 pt-4">
                            <button onClick={loadMarksheet}
                                    className="w-full sm:w-auto px-8 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-black transition font-bold shadow-sm">
                                Load Marksheet
                            </button>
                        </div>
                    )}
                </div>
            )}

            {!isPrintMode && error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md mx-2 text-center">{error}</div>
            )}

            {/* MARKSHEET DISPLAY */}
            {marksheet ? (
                <div className="px-2">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">

                        {!isPrintMode && (
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-transparent">
                                <button onClick={downloadPDF}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition font-bold">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Download Marksheet PDF
                                </button>
                            </div>
                        )}

                        <div className="w-full overflow-x-auto p-2 sm:p-8 bg-gray-50 dark:bg-gray-900/50">
                            <div className="min-w-[850px] mx-auto bg-white shadow-2xl">
                                <MarksheetLayout
                                    marksheet={marksheet}
                                    semLabel={semLabel}
                                    selectedSem={selectedSem}
                                    marksheetCode={marksheetCode}
                                    verificationUrl={verificationUrl}
                                    summary={marksheet.summary}
                                    hash={hash}
                                    courseDisplay={marksheet.marks[0]?.courcecode}
                                    getGrade={(p) => {
                                        if (p >= 90) return "O";
                                        if (p >= 80) return "A+";
                                        if (p >= 70) return "A";
                                        if (p >= 60) return "B+";
                                        if (p >= 50) return "B";
                                        if (p >= 40) return "C";
                                        return "F";
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* PROFESSIONAL EMPTY STATE */
                !isPrintMode && (
                    <div className="mx-2 flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/20">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-sm">Marksheet Viewer</h3>
                        <p className="text-gray-400 text-xs mt-1 text-center max-w-[200px]">
                            Please select course and student details to generate a grade sheet.
                        </p>
                    </div>
                )
            )}
        </div>
    );
};

export default PrintMarksheet;