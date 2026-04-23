import { useEffect, useState } from "react";
import {
  User,
  Mail,
  GraduationCap,
  Hash,
  Calendar
} from "lucide-react";
import api from "../../utils/api";

const StudentProfile = () => {

  const token = localStorage.getItem("token");
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/student/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudent(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, []);

  /* LOADING STATE */
  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Student Profile</h1>
            <p className="text-xs text-slate-500 uppercase">Personal Information</p>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 space-y-6">

        {/* HERO CARD */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">

            <img
              src={`http://localhost:5000/uploads/students/${student.profilepic || "default.png"}`}
              className="w-24 h-24 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
            />

            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                {student.firstname} {student.lastname}
              </h2>
              <p className="text-slate-500 text-sm mt-1">Student Account</p>
            </div>

          </div>
        </section>

        {/* INFO SECTION */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Academic Information
            </h3>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">

            <InfoField label="Roll Number" value={student.rollnumber} icon={<Hash className="w-3.5 h-3.5" />} />

            <InfoField label="Email Address" value={student.emailid} icon={<Mail className="w-3.5 h-3.5" />} />

            <InfoField label="Course" value={student.courcecode} icon={<GraduationCap className="w-3.5 h-3.5" />} />

            <InfoField label="Semester" value={student.semoryear} icon={<Calendar className="w-3.5 h-3.5" />} />

            <InfoField label="Date of Birth" value={student.dateofbirth} icon={<Calendar className="w-3.5 h-3.5" />} />

          </div>

        </section>

      </main>
    </div>
  );
};

/* REUSABLE FIELD */
const InfoField = ({ label, value, icon }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1.5 text-slate-400">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </div>
    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
      {value || "-"}
    </p>
  </div>
);

export default StudentProfile;