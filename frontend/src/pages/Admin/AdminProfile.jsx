import { useEffect, useState } from "react";
import axios from "axios";

const AdminProfile = () => {
    const token = localStorage.getItem("token");
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:5000/api/admin/profile",
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                setAdmin(res.data);

            } catch (error) {
                console.error(error);
            }
        };

        if (token) {
            fetchProfile();
        }
    }, [token]);

    const openLink = (url) => {
        if (!url) return;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    if (!admin) {
        return (
            <p className="text-sm text-gray-500">
                Loading profile...
            </p>
        );
    }

    return (
        <div className="space-y-6 text-sm text-gray-700">

            {/* Basic Info */}
            <div className="space-y-2">
                <p><strong>College Name:</strong> {admin.collagename}</p>
                <p><strong>Email ID:</strong> {admin.emailid}</p>
                <p><strong>Contact Number:</strong> {admin.contactnumber}</p>

                <p>
                    <strong>Website:</strong>{" "}
                    <span
                        onClick={() => openLink(admin.website)}
                        className="text-blue-600 cursor-pointer hover:underline"
                    >
                        {admin.website}
                    </span>
                </p>

                <p><strong>Address:</strong> {admin.address}</p>
            </div>

            <hr />

            {/* Social Links */}
            <div className="space-y-2">
                <p>
                    <strong>Facebook:</strong>{" "}
                    <span
                        onClick={() => openLink(admin.facebook)}
                        className="text-blue-600 cursor-pointer hover:underline"
                    >
                        {admin.facebook}
                    </span>
                </p>

                <p>
                    <strong>Instagram:</strong>{" "}
                    <span
                        onClick={() => openLink(admin.instagram)}
                        className="text-blue-600 cursor-pointer hover:underline"
                    >
                        {admin.instagram}
                    </span>
                </p>

                <p>
                    <strong>Twitter:</strong>{" "}
                    <span
                        onClick={() => openLink(admin.twitter)}
                        className="text-blue-600 cursor-pointer hover:underline"
                    >
                        {admin.twitter}
                    </span>
                </p>

                <p>
                    <strong>LinkedIn:</strong>{" "}
                    <span
                        onClick={() => openLink(admin.linkedin)}
                        className="text-blue-600 cursor-pointer hover:underline"
                    >
                        {admin.linkedin}
                    </span>
                </p>
            </div>

        </div>
    );
};

export default AdminProfile;