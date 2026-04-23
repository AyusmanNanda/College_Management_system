import { useEffect, useState } from "react";
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

  if (!student) return <p>Loading...</p>;

  return (

    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-lg">

        <img
          src={`http://localhost:5000/uploads/students/${student.profilepic || "default.png"}`}
          className="w-20 h-20 rounded-full object-cover"
        />

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {student.firstname} {student.lastname}
          </h2>
          <p className="text-gray-400">Student Profile</p>
        </div>

      </div>

      {/* BASIC INFO */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Basic Information
        </h3>

        <div className="grid grid-cols-2 gap-4 text-gray-900 dark:text-gray-300">

          <div>
            <p className="text-gray-400">Roll Number</p>
            <p>{student.rollnumber}</p>
          </div>

          <div>
            <p className="text-gray-400">Email</p>
            <p>{student.emailid}</p>
          </div>

          <div>
            <p className="text-gray-400">Course</p>
            <p>{student.courcecode}</p>
          </div>

          <div>
            <p className="text-gray-400">Semester</p>
            <p>{student.semoryear}</p>
          </div>

          <div>
            <p className="text-gray-400">Date of Birth</p>
            <p>{student.dateofbirth}</p>
          </div>

        </div>

      </div>

    </div>

  );

};

export default StudentProfile;
