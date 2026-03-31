import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";

function InfoCard({ label, value }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-base font-semibold text-gray-800 dark:text-gray-100 mt-1">
        {value || "-"}
      </p>
    </div>
  );
}

export default function FacultyEditAttendance() {
  const token = localStorage.getItem("token");

  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceDates, setAttendanceDates] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [checkedStudents, setCheckedStudents] = useState({});

  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warning, setWarning] = useState("");
  

  const todayDate = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  useEffect(() => {
    const fetchAssignedSubjects = async () => {
      try {
        setLoadingSubjects(true);
        setError("");

        const res = await api.get("/api/faculty/assigned-subjects", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAssignedSubjects(res.data || []);
      } catch (err) {
        console.error("Assigned subjects fetch error:", err);
        setAssignedSubjects([]);
        setError("Failed to load assigned subjects.");
      } finally {
        setLoadingSubjects(false);
      }
    };

    if (token) fetchAssignedSubjects();
  }, [token]);

  const selectedSubjectObj = useMemo(() => {
    return assignedSubjects.find(
      (item) => String(item.subjectcode) === String(selectedSubject)
    );
  }, [assignedSubjects, selectedSubject]);

  const selectedCourse = selectedSubjectObj?.courcecode || "";
  const selectedSem = selectedSubjectObj?.semoryear || "";

  const canEdit = selectedDate === todayDate;

  useEffect(() => {
    if (!selectedSubject || !selectedCourse || !selectedSem) {
      setStudents([]);
      setAttendanceDates([]);
      setSelectedDate("");
      setCheckedStudents({});
      return;
    }

    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        setError("");
        setSuccess("");

        const res = await api.get(
          `/api/attendance/students?course=${selectedCourse}&sem=${selectedSem}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStudents(res.data || []);
      } catch (err) {
        console.error("Students fetch error:", err);
        setStudents([]);
        setError("Failed to load students.");
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedCourse, selectedSem, selectedSubject, token]);

  useEffect(() => {
    if (!selectedSubject || !selectedCourse || !selectedSem) {
      setAttendanceDates([]);
      return;
    }

    const fetchDates = async () => {
      try {
        const res = await api.get(
          `/api/attendance/dates?subjectcode=${selectedSubject}&courcecode=${selectedCourse}&semoryear=${selectedSem}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setAttendanceDates((res.data || []).map((item) => item.date));
        setSelectedDate("");
        setCheckedStudents({});
      } catch (err) {
        console.error("Attendance dates fetch error:", err);
        setAttendanceDates([]);
      }
    };

    fetchDates();
  }, [selectedSubject, selectedCourse, selectedSem, token]);

  useEffect(() => {
    if (
      !selectedCourse ||
      !selectedSem ||
      !selectedSubject ||
      !selectedDate ||
      students.length === 0
    ) {
      return;
    }

    const loadAttendance = async () => {
      try {
        setLoadingAttendance(true);
        setError("");
        setSuccess("");

        const res = await api.get(
          `/api/attendance?subjectcode=${selectedSubject}&date=${selectedDate}&courcecode=${selectedCourse}&semoryear=${selectedSem}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const map = {};

        students.forEach((student) => {
          map[Number(student.student_id)] = false;
        });

        (res.data || []).forEach((record) => {
          const id = Number(record.student_id);
          const present = Number(record.present);
          map[id] = present === 1;
        });

        setCheckedStudents(map);
      } catch (err) {
        console.error("Load attendance error:", err);
        setError("Failed to load attendance.");
      } finally {
        setLoadingAttendance(false);
      }
    };

    loadAttendance();
  }, [
    selectedCourse,
    selectedSem,
    selectedSubject,
    selectedDate,
    students,
    token,
    
  ]);


useEffect(() => {
  if (!selectedDate) {
    setWarning("");
    return;
  }

  if (selectedDate !== todayDate) {
    setWarning("Attendance can only be edited on today's date.");

    const timer = setTimeout(() => {
      setWarning("");
    }, 1500);

    return () => clearTimeout(timer);
  }

  setWarning("");
}, [selectedDate, todayDate]);



  const toggleStudent = (id) => {
    if (!canEdit) return;

    setCheckedStudents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

 

  const updateAttendance = async () => {
    if (!selectedSubject || !selectedCourse || !selectedSem || !selectedDate) {
      setError("Please select subject and date.");
      return;
    }

    if (!canEdit) {
      setError("Attendance can only be edited on today's date.");
      return;
    }

    try {
      const records = students.map((student) => ({
        student_id: student.student_id,
        present: checkedStudents[student.student_id] ? 1 : 0,
      }));

      await api.post(
        "/api/attendance",
        {
          subjectcode: selectedSubject,
          date: selectedDate,
          courcecode: selectedCourse,
          semoryear: Number(selectedSem),
          records,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Attendance updated successfully.");
      setError("");

      setTimeout(() => {
      setSelectedSubject("");
      setSelectedDate("");
      setStudents([]);
      setAttendanceDates([]);
      setCheckedStudents({});
      setSuccess("");
      }, 1500);
    } catch (err) {
      console.error("Update attendance error:", err);
      setError(err?.response?.data?.message || "Failed to update attendance.");
    }
  };

  const isReady = selectedSubject && selectedCourse && selectedSem && selectedDate;

  return (
    <div className="w-[94vw] sm:w-full min-h-[90vh] sm:min-h-[600px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 transition-colors mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Edit Attendance
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Modify today&apos;s attendance for your subject.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-md text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-md text-sm bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
          {success}
        </div>
      )}

      {warning && (
  <div className="p-3 rounded-md text-sm bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
    {warning}
  </div>
)}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          value={selectedSubject}
          onChange={(e) => {
            setSelectedSubject(e.target.value);
            setSelectedDate("");
            setCheckedStudents({});
            setError("");
            setSuccess("");
          }}
          disabled={loadingSubjects}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
        >
          <option value="">
            {loadingSubjects ? "Loading Subjects..." : "Select Subject"}
          </option>

          {assignedSubjects.map((sub, index) => (
            <option key={`${sub.subjectcode}-${index}`} value={sub.subjectcode}>
              {sub.subjectname}
            </option>
          ))}
        </select>

        <select
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setError("");
            setSuccess("");
          }}
          disabled={!selectedSubject}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
        >
          <option value="">Select Date</option>

          {attendanceDates.map((date, index) => (
            <option key={`${date}-${index}`} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      {selectedSubjectObj && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard label="Course" value={selectedCourse} />
          <InfoCard label="Semester / Year" value={selectedSem} />
          <InfoCard label="Selected Date" value={selectedDate || "-"} />
        </div>
      )}

      {isReady && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-[10px] sm:text-xs tracking-wide">
  <tr>
    <th className="sm:hidden px-2 py-2">Student</th>

    <th className="hidden sm:table-cell px-4 py-3">Roll No</th>
    <th className="hidden sm:table-cell px-4 py-3">Name</th>

    <th className="px-2 py-2 sm:px-4 sm:py-3 text-center">Present</th>
  </tr>
</thead>

              <tbody>
                {loadingStudents || loadingAttendance ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      Loading attendance...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No students found.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
  <tr
    key={student.student_id}
    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
  >
    {/* Mobile student column */}
    <td className="px-2 py-2 dark:text-gray-200 sm:hidden">
      <div className="flex flex-col leading-tight">
        <span className="font-medium text-xs truncate">
          {student.rollnumber}
        </span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
          {student.firstname} {student.lastname}
        </span>
      </div>
    </td>

    {/* Desktop roll number */}
    <td className="hidden sm:table-cell px-4 py-3 dark:text-gray-200">
      {student.rollnumber}
    </td>

    {/* Desktop name */}
    <td className="hidden sm:table-cell px-4 py-3 dark:text-gray-200 font-medium">
      {student.firstname} {student.lastname}
    </td>

    {/* Common checkbox column */}
    <td className="px-2 py-2 sm:px-4 sm:py-3 text-center">
      <input
        type="checkbox"
        checked={!!checkedStudents[student.student_id]}
        onChange={() => toggleStudent(student.student_id)}
        disabled={!canEdit}
        className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </td>
  </tr>
))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
            <button
              onClick={updateAttendance}
              disabled={!isReady || students.length === 0 || !canEdit}
              className={`w-full sm:w-auto px-4 py-3 sm:py-2 text-sm rounded-md transition ${
                isReady && students.length > 0 && canEdit
                  ? "bg-gray-900 text-white hover:bg-black"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              Update Attendance
            </button>
          </div>
        </div>
      )}
    </div>
  );
}