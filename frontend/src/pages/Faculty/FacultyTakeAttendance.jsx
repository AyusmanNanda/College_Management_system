import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import ImportAttendanceModal from "./ImportAttendanceModal";
import ConfirmSaveModal from "../Admin/ConfirmSaveModal";

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

export default function FacultyTakeAttendance() {
  const token = localStorage.getItem("token");

  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [existingDates, setExistingDates] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [markMode, setMarkMode] = useState("present");
  const [checkedStudents, setCheckedStudents] = useState({});

  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  useEffect(() => {
    if (!selectedCourse || !selectedSem) {
      setStudents([]);
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
        setCheckedStudents({});
      } catch (err) {
        console.error("Students fetch error:", err);
        setStudents([]);
        setError("Failed to load students.");
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedCourse, selectedSem, token]);

  useEffect(() => {
    if (!selectedSubject || !selectedCourse || !selectedSem) {
      setExistingDates([]);
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

        setExistingDates((res.data || []).map((item) => item.date));
      } catch (err) {
        console.error("Existing dates fetch error:", err);
        setExistingDates([]);
      }
    };

    fetchDates();
  }, [selectedSubject, selectedCourse, selectedSem, token]);

  const toggleStudent = (id) => {
    setCheckedStudents((prev) => ({
  ...prev,
  [id]: !prev[id],
}));
  };

  const saveAttendance = async () => {
  if (!selectedSubject || !selectedCourse || !selectedSem) {
    setError("Please select a subject.");
    return;
  }

  if (existingDates.includes(todayDate)) {
    setError("Today's attendance has already been taken for this subject.");

    setTimeout(() => {
      setSelectedSubject("");
      setMarkMode("present");
      setCheckedStudents({});
      setStudents([]);
      setExistingDates([]);
      setError("");
    }, 1200);

    return;
  }

  try {
    setSavingAttendance(true);
    setShowConfirmModal(false);

    const records = students.map((student) => {
      const isChecked = !!checkedStudents[student.student_id];

      return {
        student_id: student.student_id,
        present:
          markMode === "present"
            ? isChecked
              ? 1
              : 0
            : isChecked
            ? 0
            : 1,
      };
    });

    await api.post(
      "/api/attendance",
      {
        subjectcode: selectedSubject,
        date: todayDate,
        courcecode: selectedCourse,
        semoryear: Number(selectedSem),
        records,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setSuccess("Attendance saved successfully for today.");
    setError("");

    setTimeout(() => {
      setSelectedSubject("");
      setMarkMode("present");
      setCheckedStudents({});
      setStudents([]);
      setExistingDates([]);
      setSuccess("");
    }, 1200);
  } catch (err) {
    console.error("Save attendance error:", err);
    setError(err?.response?.data?.message || "Failed to save attendance.");
  } finally {
    setSavingAttendance(false);
  }
};

  const isReady = selectedSubject && selectedCourse && selectedSem;

  return (
    <div className="w-[94vw] sm:w-full min-h-[90vh] sm:min-h-[600px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 transition-colors mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Take Attendance
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Mark today&apos;s attendance for your subject.
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

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

  {/* LEFT SIDE → DROPDOWNS */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
    
    <select
      value={selectedSubject}
      onChange={(e) => {
        setSelectedSubject(e.target.value);
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
      value={markMode}
      onChange={(e) => setMarkMode(e.target.value)}
      disabled={!selectedSubject}
      className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
    >
      <option value="present">Mark Present</option>
      <option value="absent">Mark Absent</option>
    </select>

  </div>

  {/* RIGHT SIDE → IMPORT BUTTON */}
  <div className="flex justify-end">
    <button
      onClick={() => {
        setError("");
        setSuccess("");
        setShowImportModal(true);
      }}
      disabled={!selectedSubject || !selectedCourse || !selectedSem}
      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
        selectedSubject && selectedCourse && selectedSem
          ? "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100"
          : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
      }`}
    >
      Import From File
    </button>
  </div>

</div>

      {selectedSubjectObj && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard label="Course" value={selectedCourse} />
          <InfoCard label="Semester / Year" value={selectedSem} />
          <InfoCard label="Date" value={todayDate} />
        </div>
      )}

      {isReady && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-[10px] sm:text-xs tracking-wide">
  <tr>
    <th className="px-2 py-2 sm:hidden">Student</th>

    <th className="hidden sm:table-cell px-4 py-3">Roll No</th>
    <th className="hidden sm:table-cell px-4 py-3">Name</th>

    <th className="px-2 py-2 sm:px-4 sm:py-3 text-center">
      {markMode === "present" ? "Present" : "Absent"}
    </th>
  </tr>
</thead>
              <tbody>
                {loadingStudents ? (
                  <tr>
                    <td
  colSpan="3"
  className="px-2 py-6 text-center text-gray-500 dark:text-gray-400"
>
                      Loading students...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td
  colSpan="3"
  className="px-2 py-6 text-center text-gray-500 dark:text-gray-400"
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

  {/* Desktop roll column */}
  <td className="hidden sm:table-cell px-4 py-3 dark:text-gray-200">
    {student.rollnumber}
  </td>

  {/* Desktop name column */}
  <td className="hidden sm:table-cell px-4 py-3 dark:text-gray-200 font-medium">
    {student.firstname} {student.lastname}
  </td>

  {/* Common checkbox column */}
  <td className="px-2 py-2 sm:px-4 sm:py-3 text-center">
    <input
      type="checkbox"
      checked={!!checkedStudents[student.student_id]}
      onChange={() => toggleStudent(student.student_id)}
      className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500"
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
  onClick={() => setShowConfirmModal(true)}
  disabled={!isReady || students.length === 0 || savingAttendance}
  className={`w-full sm:w-auto px-4 py-3 sm:py-2 text-sm rounded-md transition ${
    isReady && students.length > 0
      ? "bg-gray-900 text-white hover:bg-black"
      : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
  }`}
>
  {savingAttendance ? "Saving..." : "Save Attendance"}
</button>
          </div>
        </div>
      )}
{/* IMPORT MODAL */}
      {showImportModal && (
        <ImportAttendanceModal
          onClose={() => setShowImportModal(false)}
          token={token}
          subjectcode={selectedSubject}
          courcecode={selectedCourse}
          semoryear={selectedSem}
          date={todayDate}
          onImportSuccess={() => {
            setSuccess("Attendance imported successfully.");
            setError("");

            setTimeout(() => {
              setSelectedSubject("");
              setMarkMode("present");
              setCheckedStudents({});
              setStudents([]);
              setExistingDates([]);
              setSuccess("");
              setShowImportModal(false);
            }, 2000);
          }}
        />
      )}


      <ConfirmSaveModal
  show={showConfirmModal}
  title="Confirm Attendance Save"
  message="Are you sure you want to save today's attendance for this subject?"
  confirmText="Save Attendance"
  loading={savingAttendance}
  onCancel={() => setShowConfirmModal(false)}
  onConfirm={saveAttendance}
/>

    </div>


  );
}