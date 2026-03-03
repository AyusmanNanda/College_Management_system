import { useEffect, useState } from "react";
import api from "../../utils/api";
import ConfirmSaveModal from "./ConfirmSaveModal";

const EditAttendance = () => {
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
                setCheckedStudents({});
                setSelectedDate("");
            } catch {
                setError("Failed to load data.");
            }
        };

        loadData();
    }, [selectedCourse, selectedSem]);

    /* ================= LOAD EXISTING DATES ================= */

    useEffect(() => {
        if (!selectedSubject) return;

        const fetchDates = async () => {
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

        fetchDates();
    }, [selectedSubject]);

    /* ================= LOAD ATTENDANCE AFTER STUDENTS READY ================= */

    useEffect(() => {
        if (!selectedDate || students.length === 0) return;

        const loadAttendance = async () => {
            try {
                const res = await api.get(
                    `/api/attendance?subjectcode=${selectedSubject}&date=${selectedDate}&courcecode=${selectedCourse}&semoryear=${selectedSem}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const map = {};

                // Initialize all as absent
                students.forEach(s => {
                    map[s.student_id] = false;
                });

                // Override present ones
                res.data.forEach(r => {
                    map[r.student_id] = r.present === 1;
                });

                setCheckedStudents(map);
                setError("");
            } catch {
                setError("Failed to load attendance.");
            }
        };

        loadAttendance();
    }, [selectedDate, students]);

    /* ================= TOGGLE ================= */

    const toggleStudent = (id) => {
        setCheckedStudents(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    /* ================= UPDATE ================= */

    const updateAttendance = async () => {
        try {
            setLoading(true);

            const records = students.map(s => ({
                student_id: s.student_id,
                present: checkedStudents[s.student_id] ? 1 : 0
            }));

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

            setSuccess("Attendance updated successfully.");
        } catch {
            setError("Failed to update attendance.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">

            <h3 className="text-xl font-semibold dark:text-gray-100">
                Edit Recorded Attendance
            </h3>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 grid grid-cols-1 md:grid-cols-4 gap-4">

                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="input-style">
                    <option value="">Select Course</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.course_code}>{c.course_name}</option>
                    ))}
                </select>

                <select value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)} className="input-style">
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                    ))}
                </select>

                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="input-style">
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                        <option key={s.subjectcode} value={s.subjectcode}>{s.subjectname}</option>
                    ))}
                </select>

                <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-style">
                    <option value="">Select Class Date</option>
                    {attendanceDates.map(d => (
                        <option key={d.date} value={d.date}>{d.date}</option>
                    ))}
                </select>

            </div>

            {/* Students Table */}
            {selectedDate && (
                <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3">Student</th>
                            <th className="px-4 py-3 text-center">Present</th>
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

                    <div className="border-t dark:border-gray-700 p-4 flex justify-end">
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-2 bg-gray-900 text-white rounded-md"
                        >
                            Update Attendance
                        </button>
                    </div>
                </div>
            )}

            <ConfirmSaveModal
                show={showModal}
                title="Confirm Update"
                message="Are you sure you want to update this attendance?"
                loading={loading}
                onCancel={() => setShowModal(false)}
                onConfirm={async () => {
                    await updateAttendance();
                    setShowModal(false);
                }}
            />

        </div>
    );
};

export default EditAttendance;