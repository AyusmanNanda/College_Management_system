import { useEffect, useState } from "react";
import api from "../../utils/api";
import ConfirmSaveModal from "./ConfirmSaveModal";

const TakeAttendance = () => {
    const BASE_URL = api.defaults.baseURL;
    const token = localStorage.getItem("token");

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [markMode, setMarkMode] = useState("present");
    // present → checkbox means present
    // absent  → checkbox means absent

    const [checkedStudents, setCheckedStudents] = useState({});

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showModal, setShowModal] = useState(false);

    /* ================= LOAD COURSES ================= */

    useEffect(() => {
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

        fetchCourses();
    }, []);

    /* ================= LOAD SUBJECTS + STUDENTS ================= */

    useEffect(() => {
        if (!selectedCourse || !selectedSem) return;

        const loadData = async () => {
            try {
                const [subRes, stuRes] = await Promise.all([
                    api.get(
                        `/api/subjects?course_code=${selectedCourse}&sem=${selectedSem}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    ),
                    api.get(
                        `/api/attendance/students?course=${selectedCourse}&sem=${selectedSem}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                ]);

                setSubjects(subRes.data || []);
                setStudents(stuRes.data || []);
                setSelectedSubject("");
                setSelectedDate("");
                setCheckedStudents({});
                setError("");
                setSuccess("");
            } catch {
                setError("Failed to load data.");
            }
        };

        loadData();
    }, [selectedCourse, selectedSem]);

    /* ================= TOGGLE CHECKBOX ================= */

    const toggleStudent = (id) => {
        setCheckedStudents(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    /* ================= SAVE ATTENDANCE ================= */

    const saveAttendance = async () => {
        if (!selectedSubject || !selectedDate) {
            setError("Please select subject and date.");
            return;
        }

        try {
            setLoading(true);

            const records = students.map(student => {
                let present;

                if (markMode === "present") {
                    // checkbox = present
                    present = checkedStudents[student.student_id] ? 1 : 0;
                } else {
                    // checkbox = absent
                    present = checkedStudents[student.student_id] ? 0 : 1;
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
                    semoryear: Number(selectedSem),
                    records
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess("Attendance saved successfully.");
            setError("");
            setCheckedStudents({}); // reset after save

        } catch {
            setError("Failed to save attendance.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">

            <h3 className="text-xl font-semibold dark:text-gray-100">
                Take Attendance
            </h3>

            {/* FILTER CARD */}
            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 grid grid-cols-1 md:grid-cols-5 gap-4">

                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="input-style"
                >
                    <option value="">Select Course</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.course_code}>
                            {c.course_name}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedSem}
                    onChange={(e) => setSelectedSem(e.target.value)}
                    className="input-style"
                >
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                    ))}
                </select>

                <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="input-style"
                >
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                        <option key={s.subjectcode} value={s.subjectcode}>
                            {s.subjectname}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-style"
                />

                <select
                    value={markMode}
                    onChange={(e) => setMarkMode(e.target.value)}
                    className="input-style"
                >
                    <option value="present">Mark as Present</option>
                    <option value="absent">Mark as Absent</option>
                </select>
            </div>

            {/* MESSAGES */}
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md text-sm">
                    {success}
                </div>
            )}

            {/* STUDENT TABLE */}
            {students.length > 0 && (
                <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">

                    <div className="overflow-y-auto max-h-[500px]">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Student</th>
                                <th className="px-4 py-3 text-center">
                                    {markMode === "present" ? "Present" : "Absent"}
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {students.map(student => (
                                <tr key={student.student_id} className="border-t dark:border-gray-700">
                                    <td className="px-4 py-3 dark:text-gray-200">
                                        {student.rollnumber} — {student.firstname} {student.lastname}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={!!checkedStudents[student.student_id]}
                                            onChange={() => toggleStudent(student.student_id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t dark:border-gray-700 p-4 flex justify-end">
                        <button
                            onClick={() => setShowModal(true)}
                            disabled={loading}
                            className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-black transition disabled:opacity-50"
                        >
                            Save Attendance
                        </button>
                    </div>
                </div>
            )}

            <ConfirmSaveModal
                show={showModal}
                title="Confirm Save"
                message="Are you sure you want to save this attendance?"
                loading={loading}
                onCancel={() => setShowModal(false)}
                onConfirm={async () => {
                    await saveAttendance();
                    setShowModal(false);
                }}
            />
        </div>
    );
};

export default TakeAttendance;