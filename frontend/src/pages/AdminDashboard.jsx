import { useEffect, useState } from "react";

function AdminDashboard() {
    const [faculties, setFaculties] = useState([]);

    useEffect(() => {
        const fetchFaculties = async () => {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/admin/faculties",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();
            setFaculties(data);
        };

        fetchFaculties();
    }, []);

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <h3>Faculties</h3>
            <ul>
                {faculties.map((faculty) => (
                    <li key={faculty.id}>
                        {faculty.faculty_name} - {faculty.email}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AdminDashboard;
