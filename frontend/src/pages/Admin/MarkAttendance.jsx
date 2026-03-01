import { useEffect, useState } from "react";
import api from "../../utils/api";
import ConfirmSaveModal from "./ConfirmSaveModal";

const MarkAttendance = () => {
    const BASE_URL = api.defaults.baseURL;
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);

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
            setSuccess("");
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to load students.");
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        fetchSubjects();
        fetchStudents();
    }, [selectedCourse, selectedSem]);

    /* ================= TOGGLE ================= */

    const toggleStudent = (roll) => {
        if (attendanceLocked) return;

        setCheckedStudents((prev) => ({
            ...prev,
            [roll]: !prev[roll]
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

            const records = students.map((student) => {
                let present;

                if (markMode === "absent") {
                    present = checkedStudents[student.rollnumber] ? 0 : 1;
                } else {
                    present = checkedStudents[student.rollnumber] ? 1 : 0;
                }

                return {
                    rollnumber: student.rollnumber,
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
            setAttendanceLocked(true);
            setError("");

        } catch (err) {
            console.error(err);
            setError("Failed to save attendance.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">

            {/* HEADER */}
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Mark Attendance
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Manage subject-wise attendance.
                </p>
            </div>

            {/* ALERTS */}
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
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                        <option key={course.id} value={course.course_code}>
                            {course.course_name}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedSem}
                    onChange={(e) => setSelectedSem(e.target.value)}
                    disabled={!selectedCourse}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="">Select Semester</option>
                    {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                        <option key={sem} value={sem}>
                            Semester {sem}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    disabled={!selectedSem}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                        <option key={sub.subjectcode} value={sub.subjectcode}>
                            {sub.subjectname}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                />

                {/* MODE SELECTOR */}
                <select
                    value={markMode}
                    onChange={(e) => setMarkMode(e.target.value)}
                    disabled={attendanceLocked}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
                >
                    <option value="absent">Mark Absent</option>
                    <option value="present">Mark Present</option>
                </select>

            </div>

            {/* TABLE */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden flex flex-col">

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
                        {students.map((student) => (
                            <tr
                                key={student.rollnumber}
                                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                            >
                                <td className="px-4 py-3">
                                    <img
                                        src={
                                            student.profilepic
                                                ? `${BASE_URL}/uploads/students/${student.profilepic}`
                                                : `${BASE_URL}/uploads/students/default.png`
                                        }
                                        alt="profile"
                                        className="h-9 w-9 rounded-full object-cover border dark:border-gray-600"
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
                                        checked={!!checkedStudents[student.rollnumber]}
                                        onChange={() => toggleStudent(student.rollnumber)}
                                        className="h-4 w-4"
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* BOTTOM BAR */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {students.length} students loaded
                    </div>

                    {attendanceLocked ? (
                        <button
                            onClick={() => {
                                setAttendanceLocked(false);
                                setSuccess("");
                            }}
                            className="px-6 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-100 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                        >
                            Edit Attendance
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowSaveModal(true)}
                            disabled={loading}
                            className="px-6 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition disabled:opacity-50"
                        >
                            Save Attendance
                        </button>
                    )}

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