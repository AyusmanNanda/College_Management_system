import { useEffect, useState } from "react";
import axios from "axios";

/*
  College Info Page
  -----------------
  Manage:
  - College details
  - Social links
  - Logo path
*/

const CollegeInfo = () => {
    const [form, setForm] = useState({});
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchCollegeInfo();
    }, []);

    const fetchCollegeInfo = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/admin/college", {
                headers: { Authorization: `Bearer ${token}` }
            });

            setForm(res.data);

        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            await axios.put(
                "http://localhost:5000/api/admin/college",
                form,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage("College information updated successfully");

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">

            <h1 className="text-2xl font-semibold mb-6">College Information</h1>

            {message && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {[
                    "college_name",
                    "address",
                    "email",
                    "contact_number",
                    "website",
                    "facebook",
                    "instagram",
                    "twitter",
                    "linkedin",
                    "logo"
                ].map((field) => (
                    <div key={field} className="col-span-1">
                        <label className="block mb-2 text-sm text-gray-600 capitalize">
                            {field.replace("_", " ")}
                        </label>
                        <input
                            type="text"
                            name={field}
                            value={form[field] || ""}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                ))}

                <div className="col-span-1 md:col-span-2">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                        Save Changes
                    </button>
                </div>

            </form>
        </div>
    );
};

export default CollegeInfo;
