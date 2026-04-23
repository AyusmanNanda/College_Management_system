import { useEffect, useState } from "react";
import api from "../../utils/api";

const StudentMarksheet = () => {

    const token = localStorage.getItem("token");

    const [marks, setMarks] = useState([]);
    const [allMarks, setAllMarks] = useState([]);

    // ✅ NEW STATES (added)
    const [selectedSem, setSelectedSem] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");


    // ✅ UPDATED FETCH FUNCTION
    const fetchMarks = async () => {

        try {

            const res = await api.get(
                "/api/student/marks",
                {
                    headers: { Authorization: `Bearer ${token}` },

                }
            );

            setAllMarks(res.data.marks || []);
            setMarks(res.data.marks || []);

        } catch (error) {
            console.error(error);
        }

    };

    // ✅ UPDATED useEffect
    useEffect(() => {
        fetchMarks();
    }, []);

    useEffect(() => {

      let filtered = allMarks;

      if (selectedSem) {
        filtered = filtered.filter(
          m => String(m.semoryear) === String(selectedSem)
        );
      }

      if (selectedSubject) {
        filtered = filtered.filter(
          m => String(m.subjectcode) === String(selectedSubject)
        );
      }

      setMarks(filtered);

    }, [selectedSem, selectedSubject, allMarks]);


    // ✅ DROPDOWN DATA
    const semesters = [...new Set(allMarks.map(m => m.semoryear))];

    const subjects = [
      ...new Map(
        allMarks
          .filter(m => !selectedSem || String(m.semoryear) === String(selectedSem))
          .map(m => [m.subjectcode, { name: m.subjectname, code: m.subjectcode }])
      ).values()
    ];

    return (

        <div className="space-y-8">

            <h2 className="text-2xl font-semibold">
                My Marksheet
            </h2>

            {/* ✅ DROPDOWNS (ADDED HERE) */}
            <div className="flex gap-4">

                <select
                    value={selectedSem}
                    onChange={(e) => {
                      setSelectedSem(e.target.value);
                      setSelectedSubject(""); // reset subject when semester changes
                    }}
                    className="border p-2 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
                >
                    <option value="">All Semesters</option>
                    {semesters.map((sem, i) => (
                        <option key={i} value={sem}>
                            Semester {sem}
                        </option>
                    ))}
                </select>

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
                        <th className="p-2 border border-gray-300 dark:border-gray-700">Theory</th>
                        <th className="p-2 border border-gray-300 dark:border-gray-700">Practical</th>
                        <th className="p-2 border border-gray-300 dark:border-gray-700">Total</th>
                    </tr>
                </thead>

                <tbody>

                    {marks.map((item, index) => (

                        <tr key={index}>

                            <td className="border p-2 border-gray-300 dark:border-gray-700">
                                {item.subjectname}
                            </td>

                            <td className="border p-2 border-gray-300 dark:border-gray-700">
                                {item.theorymarks}
                            </td>

                            <td className="border p-2 border-gray-300 dark:border-gray-700">
                                {item.practicalmarks}
                            </td>

                            <td className="border p-2 border-gray-300 dark:border-gray-700">
                                {item.theorymarks + item.practicalmarks}
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

};

export default StudentMarksheet;
