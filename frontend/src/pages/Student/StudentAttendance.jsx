import { useEffect, useState } from "react";
import api from "../../utils/api";

const StudentAttendance = () => {

    const token = localStorage.getItem("token");

    const [attendance, setAttendance] = useState([]);

    const [selectedSubject, setSelectedSubject] = useState("");

    const getStatus = (p) => {
      const value = Number(p);
      if (value >= 75) return "text-green-600";
      if (value >= 50) return "text-yellow-500";
      return "text-red-600";
    };

    useEffect(() => {

        const fetchAttendance = async () => {

            try {

                const res = await api.get(
                    "/api/student/attendance",
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                setAttendance(res.data);

            } catch (error) {
                console.error(error);
            }

        };

        fetchAttendance();

    }, []);

    const subjects = [
      ...new Map(
        attendance.map(a => [
          a.subjectcode,
          { code: a.subjectcode, name: a.subject }
        ])
      ).values()
    ];

    const filteredAttendance = selectedSubject
      ? attendance.filter(a => String(a.subjectcode) === String(selectedSubject))
      : attendance;


    return (

        <div className="space-y-8">

            <h2 className="text-2xl font-semibold">
                My Attendance
            </h2>

            <div className="flex gap-4">

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="border p-2 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
              >
                <option value="">All Subjects</option>

                {subjects.map((sub) => (
                  <option key={sub.code} value={sub.code}>
                    {sub.name}
                  </option>
                ))}

              </select>

            </div>

            <table className="w-full border text-gray-900 dark:text-gray-100">

                <thead>
                    <tr className="bg-gray-200 dark:bg-gray-800">
                        <th className="p-2 border border-gray-300 dark:border-gray-700">Subject</th>
                        <th className="p-2 border border-gray-300 dark:border-gray-700">Total Classes</th>
                        <th className="p-2 border border-gray-300 dark:border-gray-700">Attended</th>
                        <th className="p-2 border border-gray-300 dark:border-gray-700">Percentage</th>
                    </tr>
                </thead>

                <tbody>

                    {filteredAttendance.map((item, index) => {

                        const percentage = item.total_classes
                          ? (item.attended_classes / item.total_classes) * 100
                          : 0;

                        return (

                            <tr key={index}>

                                <td className="border p-2 border-gray-300 dark:border-gray-700">
                                    {item.subject}
                                </td>

                                <td className="border p-2 border-gray-300 dark:border-gray-700">
                                    {item.total_classes}
                                </td>

                                <td className="border p-2 border-gray-300 dark:border-gray-700">
                                    {item.attended_classes}
                                </td>

                                <td
                                  className={`border p-2 border-gray-300 dark:border-gray-700 ${getStatus(percentage)}`}
                                >
                                  {percentage.toFixed(1)}%
                                </td>

                            </tr>

                        );

                    })}

                </tbody>

            </table>

        </div>

    );

};

export default StudentAttendance;


    
