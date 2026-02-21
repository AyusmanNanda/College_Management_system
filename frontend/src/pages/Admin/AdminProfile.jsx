import { useEffect, useState } from "react";
import axios from "axios";

const AdminProfile = () => {
    const token = localStorage.getItem("token");

    const [admin, setAdmin] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showLinksModal, setShowLinksModal] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

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

    const openLink = (url) => {
        if (!url) return;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    if (!admin) {
        return <p className="text-sm text-gray-500">Loading profile...</p>;
    }

    return (
        <div className="space-y-10">

            {/* Header */}
            <div className="flex items-center justify-between border-b pb-6">

                <div className="flex items-center gap-6">
                    {admin.logo && (
                        <img
                            src={`http://localhost:5000${admin.logo}`}
                            alt="Logo"
                            className="h-20 w-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                        />
                    )}

                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">
                            {admin.collagename}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            College Administration Profile
                        </p>
                    </div>
                </div>

                <div className="flex gap-6">
                    <button
                        onClick={() => setShowLinksModal(true)}
                        className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline transition"
                    >
                        Edit Links
                    </button>

                    <button
                        onClick={() => setShowDetailsModal(true)}
                        className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline transition"
                    >
                        Edit Details
                    </button>
                </div>
            </div>

            {/* Basic Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">
                    Basic Information
                </h3>

                <div className="grid grid-cols-2 gap-8 text-sm">
                    <InfoField label="Email" value={admin.emailid} />
                    <InfoField label="Contact Number" value={admin.contactnumber} />

                    <InfoField
                        label="Website"
                        value={
                            <span
                                onClick={() => openLink(admin.website)}
                                className="text-blue-600 cursor-pointer hover:underline"
                            >
                                {admin.website}
                            </span>
                        }
                    />

                    <InfoField label="Address" value={admin.address} />
                </div>
            </div>

            {/* Social Media */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">
                    Social Media
                </h3>

                <div className="grid grid-cols-2 gap-8 text-sm">
                    {["facebook", "instagram", "twitter", "linkedin"].map((key) => (
                        <InfoField
                            key={key}
                            label={key}
                            value={
                                admin[key] ? (
                                    <span
                                        onClick={() => openLink(admin[key])}
                                        className="text-blue-600 cursor-pointer hover:underline"
                                    >
                                        {admin[key]}
                                    </span>
                                ) : "-"
                            }
                        />
                    ))}
                </div>
            </div>

            {showDetailsModal && (
                <EditDetailsModal
                    admin={admin}
                    token={token}
                    onClose={() => {
                        setShowDetailsModal(false);
                        fetchProfile();
                    }}
                />
            )}

            {showLinksModal && (
                <EditLinksModal
                    admin={admin}
                    token={token}
                    onClose={() => {
                        setShowLinksModal(false);
                        fetchProfile();
                    }}
                />
            )}
        </div>
    );
};

const InfoField = ({ label, value }) => (
    <div>
        <p className="text-gray-500 text-xs capitalize mb-1">{label}</p>
        <p className="text-gray-800">{value}</p>
    </div>
);



export default AdminProfile;