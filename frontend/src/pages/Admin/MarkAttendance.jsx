import { useEffect, useState } from "react";
import api from "../../utils/api";
import ConfirmSaveModal from "./ConfirmSaveModal";

const MarkAttendance = () => {
    const BASE_URL = api.defaults.baseURL;
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceDates, setAttendanceDates] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [markMode, setMarkMode] = useState("absent");
    const [checkedStudents, setCheckedStudents] = useState({});
    const [attendanceLocked, setAttendanceLocked] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showSaveModal, setShowSaveModal] = useState(false);

    /* ================= FETCH COURSES ================= */

    const fetchCourses = async () => {
        try {
            const res = await api.get("/api/courses", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(res.data || []);
        } catch {
            setCourses([]);
        }
    };

    /* ================= FETCH SUBJECTS ================= */

    const fetchSubjects = async () => {
        if (!selectedCourse || !selectedSem) return;

        try {
            const res = await api.get(
                `/api/subjects?course_code=${selectedCourse}&sem=${selectedSem}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubjects(res.data || []);
        } catch {
            setSubjects([]);
        }
    };

    /* ================= FETCH STUDENTS ================= */

    const fetchStudents = async () => {
        if (!selectedCourse || !selectedSem) return;

        try {
            const res = await api.get(
                `/api/attendance/students?course=${selectedCourse}&sem=${selectedSem}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setStudents(res.data || []);
            setCheckedStudents({});
            setAttendanceLocked(false);
        } catch {
            setError("Failed to load students.");
        }
    };

    /* ================= FETCH EXISTING DATES ================= */

    const fetchAttendanceDates = async () => {
        if (!selectedSubject) return;

        try {
            const res = await api.get(
                `/api/attendance/dates?subjectcode=${selectedSubject}&courcecode=${selectedCourse}&semoryear=${selectedSem}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAttendanceDates(res.data || []);
        } catch {
            setAttendanceDates([]);
        }
    };

    /* ================= LOAD ATTENDANCE ================= */

    const loadAttendance = async (date) => {
        if (!date) return;

        try {
            const res = await api.get(
                `/api/attendance?subjectcode=${selectedSubject}&date=${date}&courcecode=${selectedCourse}&semoryear=${selectedSem}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const map = {};

            res.data.forEach(r => {
                if (markMode === "absent") {
                    map[r.student_id] = r.present === 0;
                } else {
                    map[r.student_id] = r.present === 1;
                }
            });

            setCheckedStudents(map);
            setSelectedDate(date);
            setAttendanceLocked(false);
            setSuccess(`Editing attendance for ${date}`);
            setError("");

        } catch {
            setError("Failed to load attendance.");
        }
    };

    useEffect(() => { fetchCourses(); }, []);
    useEffect(() => { fetchSubjects(); fetchStudents(); }, [selectedCourse, selectedSem]);
    useEffect(() => { fetchAttendanceDates(); }, [selectedSubject]);

    /* Reload attendance if mode changes while editing */
    useEffect(() => {
        if (selectedDate) {
            loadAttendance(selectedDate);
        }
    }, [markMode]);

    /* ================= TOGGLE ================= */

    const toggleStudent = (id) => {
        if (attendanceLocked) return;

        setCheckedStudents(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    /* ================= SAVE ================= */

    const submitAttendance = async () => {
        if (!selectedSubject || !selectedDate) {
            setError("Please select subject and date.");
            return;
        }

        try {
            setLoading(true);

            const records = students.map(student => {
                let present;

                if (markMode === "absent") {
                    present = checkedStudents[student.student_id] ? 0 : 1;
                } else {
                    present = checkedStudents[student.student_id] ? 1 : 0;
                }

                return {
                    student_id: student.student_id,
                    present
                };
            });

            await api.post(
                "/api/attendance",
                {
                    subjectcode: selectedSubject,
                    date: selectedDate,
                    courcecode: selectedCourse,
                    semoryear: selectedSem,
                    records
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess("Attendance saved successfully.");
            setError("");
            fetchAttendanceDates();

        } catch {
            setError("Failed to save attendance.");
        } finally {
            setLoading(false);
        }
    };

    /* ================= DELETE ================= */

    const deleteAttendance = async () => {
        try {
            await api.delete("/api/attendance", {
                headers: { Authorization: `Bearer ${token}` },
                data: {
                    subjectcode: selectedSubject,
                    date: selectedDate,
                    courcecode: selectedCourse,
                    semoryear: selectedSem
                }
            });

            setCheckedStudents({});
            setSelectedDate("");
            setAttendanceLocked(false);
            setSuccess("Attendance deleted successfully.");
            fetchAttendanceDates();
        } catch {
            setError("Failed to delete attendance.");
        }
    };

    return (
        <div className="space-y-10">

            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Mark Attendance
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Manage subject-wise attendance.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm rounded-md">
                    {success}
                </div>
            )}

            {/* FILTERS */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4">

                <select
                    value={selectedCourse}
                    onChange={(e) => {
                        setSelectedCourse(e.target.value);
                        setSelectedSem("");
                        setSelectedSubject("");
                        setSelectedDate("");
                    }}
                    className="px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.course_code}>
                            {course.course_name}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedSem}
                    onChange={(e) => setSelectedSem(e.target.value)}
                    className="px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                </select>

                <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="">Select Subject</option>
                    {subjects.map(sub => (
                        <option key={sub.subjectcode} value={sub.subjectcode}>
                            {sub.subjectname}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                />

                <select
                    value={markMode}
                    onChange={(e) => setMarkMode(e.target.value)}
                    disabled={attendanceLocked}
                    className="px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="absent">Mark Absent</option>
                    <option value="present">Mark Present</option>
                </select>
            </div>

            {/* EXISTING CLASSES */}
            {selectedSubject && (
                <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 shadow-sm space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Existing Classes
                    </h3>

                    {attendanceDates.map(d => (
                        <button
                            key={d.date}
                            onClick={() => loadAttendance(d.date)}
                            className={`w-full text-left px-3 py-2 rounded-md border text-sm transition
                                ${selectedDate === d.date
                                ? "bg-gray-200 dark:bg-gray-600 border-gray-400"
                                : "hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                            }`}
                        >
                            📅 {d.date}
                        </button>
                    ))}
                </div>
            )}

            {/* TABLE */}
            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">

                <div className="overflow-y-auto max-h-[500px]">
                    <table className="w-full text-xs sm:text-sm text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">Profile</th>
                            <th className="px-4 py-3">Roll No & Name</th>
                            <th className="px-4 py-3 text-center">
                                {markMode === "absent" ? "Absent" : "Present"}
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {students.map(student => (
                            <tr key={student.student_id} className="border-t dark:border-gray-700">
                                <td className="px-4 py-3">
                                    <img
                                        src={
                                            student.profilepic
                                                ? `${BASE_URL}/uploads/students/${student.profilepic}`
                                                : `${BASE_URL}/uploads/students/default.png`
                                        }
                                        className="h-9 w-9 rounded-full object-cover"
                                        alt=""
                                    />
                                </td>

                                <td className="px-4 py-3">
                                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                                        {student.rollnumber}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {student.firstname} {student.lastname}
                                    </div>
                                </td>

                                <td className="px-4 py-3 text-center">
                                    <input
                                        type="checkbox"
                                        disabled={attendanceLocked}
                                        checked={!!checkedStudents[student.student_id]}
                                        onChange={() => toggleStudent(student.student_id)}
                                        className="h-4 w-4"
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="border-t dark:border-gray-700 px-4 py-4 flex justify-end gap-3">

                    {selectedDate && (
                        <button
                            onClick={deleteAttendance}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition"
                        >
                            Delete
                        </button>
                    )}

                    <button
                        onClick={() => setShowSaveModal(true)}
                        disabled={loading}
                        className="px-6 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition disabled:opacity-50"
                    >
                        Save Attendance
                    </button>
                </div>

            </div>

            <ConfirmSaveModal
                show={showSaveModal}
                title="Confirm Attendance Save"
                message="Are you sure you want to save attendance for this date?"
                loading={loading}
                onCancel={() => setShowSaveModal(false)}
                onConfirm={async () => {
                    await submitAttendance();
                    setShowSaveModal(false);
                }}
            />

        </div>
    );
};

export default MarkAttendance;