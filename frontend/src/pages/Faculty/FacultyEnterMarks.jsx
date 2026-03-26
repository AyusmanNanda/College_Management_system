import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import ConfirmSaveModal from "../Admin/ConfirmSaveModal";
import ImportMarksModal from "./ImportMarksModal";

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

export default function FacultyEnterMarks() {
  const token = localStorage.getItem("token");

  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});

  const [selectedSubject, setSelectedSubject] = useState("");

  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);


  useEffect(() => {
  if (!error) return;

  const timer = setTimeout(() => {
    setError("");
  }, 1200);

  return () => clearTimeout(timer);
}, [error]);



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
      setMarks({});
      return;
    }

    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        setError("");
        setSuccess("");

        const res = await api.get(
          `/api/marks/students?course=${selectedCourse}&sem=${selectedSem}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStudents(res.data || []);

        const initialMarks = {};
        (res.data || []).forEach((student) => {
          initialMarks[student.rollnumber] = {
            theory: "",
            practical: "",
          };
        });
        setMarks(initialMarks);
      } catch (err) {
        console.error("Students fetch error:", err);
        setStudents([]);
        setMarks({});
        setError("Failed to load students.");
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedCourse, selectedSem, token]);

  const handleMarkChange = (rollnumber, field, value) => {
    setMarks((prev) => ({
      ...prev,
      [rollnumber]: {
        ...prev[rollnumber],
        [field]: value,
      },
    }));
  };

  const saveMarks = async () => {
    if (!selectedSubject || !selectedCourse || !selectedSem) {
      setError("Please select a subject.");
      return;
    }

    try {
      const maxTheory = Number(selectedSubjectObj?.theorymarks || 0);
      const maxPractical = Number(selectedSubjectObj?.practicalmarks || 0);
      const hasAnyMarks = students.some((student) => {
      const theoryValue = marks[student.rollnumber]?.theory;
      const practicalValue = marks[student.rollnumber]?.practical;

      return theoryValue !== "" || practicalValue !== "";
      });

      if (!hasAnyMarks) {
  setError("Please enter marks before saving.");
  setSuccess("");
  return;
}

      for (const student of students) {
        const theory = Number(marks[student.rollnumber]?.theory || 0);
        const practical = Number(marks[student.rollnumber]?.practical || 0);

        if (maxTheory > 0 && theory > maxTheory) {
          setError(`Theory marks cannot exceed ${maxTheory}.`);
          return;
        }

        if (maxPractical > 0 && practical > maxPractical) {
          setError(`Practical marks cannot exceed ${maxPractical}.`);
          return;
        }
      }

      const records = students.map((student) => ({
        rollnumber: student.rollnumber,
        theorymarks: Number(marks[student.rollnumber]?.theory || 0),
        practicalmarks: Number(marks[student.rollnumber]?.practical || 0),
      }));

      await api.post(
        "/api/marks/save",
        {
          course: selectedCourse,
          sem: Number(selectedSem),
          subject: selectedSubject,
          subjectname: selectedSubjectObj?.subjectname || "",
          marks: records,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Marks saved successfully.");
      setError("");

      setTimeout(() => {
        setSelectedSubject("");
        setStudents([]);
        setMarks({});
        setSuccess("");
      }, 1200);
    } catch (err) {
      console.error("Save marks error:", err);
      setError(err?.response?.data?.message || "Failed to save marks.");
    }
  };

  const isReady = selectedSubject && selectedCourse && selectedSem;

  return (
    <div className="w-[94vw] sm:w-full min-h-[90vh] sm:min-h-[600px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 transition-colors mx-auto">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Enter Marks
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Enter theory and practical marks.
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
  <div className="flex-1">
    <select
      value={selectedSubject}
      onChange={(e) => {
        setSelectedSubject(e.target.value);
        setError("");
        setSuccess("");
      }}
      disabled={loadingSubjects}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
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
  </div>

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
    ? "bg-gray-300 hover:bg-gray-400 border border-gray-400 text-black dark:text-white dark:bg-gray-600 dark:border-gray-500 dark:hover:bg-gray-500"
    : "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300 dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600"
}`}
    >
      Import From File
    </button>
  </div>
</div>

{selectedSubjectObj && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <InfoCard label="Subject Code" value={selectedSubjectObj?.subjectcode} />
            <InfoCard label="Course" value={selectedCourse} />
            <InfoCard label="Subject" value={selectedSubjectObj?.subjectname} />
            <InfoCard label="Semester / Year" value={selectedSem} />
           <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-md p-2 space-y-1">
          <div>
           <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase leading-tight">
            Theory
           </p>
           <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-tight">
           {selectedSubjectObj?.theorymarks ?? 0}
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
        <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase leading-tight">
         Practical
        </p>
        <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-tight">
        {selectedSubjectObj?.practicalmarks ?? 0}
       </p>
      </div>
     </div>
    </div>
       )}

      {isReady && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-[11px] sm:text-xs text-left">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-[10px] sm:text-xs tracking-wide">
  <tr>
    <th className="sm:hidden px-2 py-2">Student</th>

    <th className="hidden sm:table-cell px-4 py-3">Roll No</th>
    <th className="hidden sm:table-cell px-4 py-3">Name</th>

    <th className="px-2 py-2 sm:px-4 sm:py-3 text-center">Theory</th>

    {Number(selectedSubjectObj?.practicalmarks || 0) > 0 && (
      <th className="px-2 py-2 sm:px-4 sm:py-3 text-center">Practical</th>
    )}
  </tr>
</thead>

              <tbody>
                {loadingStudents ? (
                  <tr>
                    <td
                      colSpan={Number(selectedSubjectObj?.practicalmarks || 0) > 0 ? 4 : 3}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      Loading students...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td
                      colSpan={Number(selectedSubjectObj?.practicalmarks || 0) > 0 ? 4 : 3}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No students found.
                    </td>
                  </tr>
                ):(
                  students.map((student) => (
  <tr
    key={student.rollnumber}
    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
  >
    {/* Mobile student column */}
    <td className="sm:hidden px-2 py-2 dark:text-gray-200">
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

    {/* Theory */}
    <td className="px-2 py-2 sm:px-4 sm:py-3 text-center">
      <input
        type="number"
        min="0"
        max={selectedSubjectObj?.theorymarks}
        value={marks[student.rollnumber]?.theory || ""}
        onChange={(e) =>
          handleMarkChange(
            student.rollnumber,
            "theory",
            e.target.value
          )
        }
        className="w-14 sm:w-20 px-1.5 py-1 sm:px-2 sm:py-1 text-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-gray-500 outline-none"
      />
    </td>

    {/* Practical */}
    {Number(selectedSubjectObj?.practicalmarks || 0) > 0 && (
      <td className="px-2 py-2 sm:px-4 sm:py-3 text-center">
        <input
          type="number"
          min="0"
          max={selectedSubjectObj?.practicalmarks}
          value={marks[student.rollnumber]?.practical || ""}
          onChange={(e) =>
            handleMarkChange(
              student.rollnumber,
              "practical",
              e.target.value
            )
          }
          className="w-14 sm:w-20 px-1.5 py-1 sm:px-2 sm:py-1 text-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-gray-500 outline-none"
        />
      </td>
    )}
  </tr>
))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={!isReady || students.length === 0}
              className={`w-full sm:w-auto px-4 py-3 sm:py-2 text-sm rounded-md transition ${
                isReady && students.length > 0
                  ? "bg-gray-900 text-white hover:bg-black"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              Save Marks
            </button>
          </div>
        </div>
      )}
      <ConfirmSaveModal
  show={showSaveModal}
  title="Confirm Marks Save"
  message="Are you sure you want to save marks for this subject?"
  onCancel={() => setShowSaveModal(false)}
  onConfirm={() => {
    setShowSaveModal(false);
    saveMarks();
  }}
/>

{/* 🔥 IMPORT MODAL */}
{showImportModal && (
  <ImportMarksModal
    token={token}
    course={selectedCourse}
    sem={selectedSem}
    subject={selectedSubject}
    onClose={() => setShowImportModal(false)}
    onImportSuccess={(data) => {
      setSuccess(data?.message || "Marks imported successfully.");
      setError("");

      setTimeout(() => {
        setSelectedSubject("");
        setStudents([]);
        setMarks({});
        setSuccess("");
        setShowImportModal(false);
      }, 1500);
    }}
  />
)}

</div>
  );
}