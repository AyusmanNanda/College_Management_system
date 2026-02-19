import { useEffect, useState } from "react";
import axios from "axios";

/*
  Admin Profile Page
  ------------------
  Allows admin to:
  - View profile
  - Update email
  - Update password
  - Toggle active status
*/

const AdminProfile = () => {
    const [profile, setProfile] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [activeStatus, setActiveStatus] = useState(1);
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/admin/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProfile(res.data);
            setEmail(res.data.email);
            setActiveStatus(res.data.active_status);

        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            await axios.put(
                "http://localhost:5000/api/admin/profile",
                {
                    email,
                    password: password || undefined,
                    active_status: activeStatus
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setMessage("Profile updated successfully");
            setPassword("");

        } catch (error) {
            console.error(error);
        }
    };

    if (!profile) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-8 max-w-2xl mx-auto">

            <h1 className="text-2xl font-semibold mb-6">Admin Profile</h1>

            {message && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                    {message}
                </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-5">

                <div>
                    <label className="block mb-2 text-sm text-gray-600">
                        Username
                    </label>
                    <input
                        type="text"
                        value={profile.username}
                        disabled
                        className="w-full px-4 py-2 border rounded bg-gray-100"
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm text-gray-600">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm text-gray-600">
                        New Password (Optional)
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        checked={activeStatus === 1}
                        onChange={() => setActiveStatus(activeStatus === 1 ? 0 : 1)}
                    />
                    <span className="text-sm">Active Account</span>
                </div>

                <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                    Update Profile
                </button>

            </form>
        </div>
    );
};

export default AdminProfile;
