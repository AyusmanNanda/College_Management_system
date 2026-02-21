import { useEffect, useState } from "react";
import axios from "axios";

const AdminProfile = () => {
    const token = localStorage.getItem("token");

    const [admin, setAdmin] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showLinksModal, setShowLinksModal] = useState(false);

    useEffect(() => {
        if (!token) return;

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

        fetchProfile();
    }, [token]);

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

            {/* Basic Info */}
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

            {/* Social */}
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
                        setAdmin(null);
                        setTimeout(() => window.location.reload(), 100);
                    }}
                />
            )}

            {showLinksModal && (
                <EditLinksModal
                    admin={admin}
                    token={token}
                    onClose={() => {
                        setShowLinksModal(false);
                        setAdmin(null);
                        setTimeout(() => window.location.reload(), 100);
                    }}
                />
            )}
        </div>
    );
};

/* ---------------- Reusable Field ---------------- */

const InfoField = ({ label, value }) => (
    <div>
        <p className="text-gray-500 text-xs capitalize mb-1">{label}</p>
        <p className="text-gray-800">{value}</p>
    </div>
);

/* ---------------- Styled Input ---------------- */

const StyledInput = ({
                         label,
                         name,
                         value,
                         onChange,
                         type = "text",
                         placeholder
                     }) => (
    <div>
        <label className="block text-xs text-gray-500 mb-1">
            {label}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
    </div>
);

/* ---------------- Edit Details ---------------- */

const EditDetailsModal = ({ admin, token, onClose }) => {
    const [form, setForm] = useState({ ...admin, password: "" });
    const [logoFile, setLogoFile] = useState(null);
    const [preview, setPreview] = useState(
        admin.logo ? `http://localhost:5000${admin.logo}` : null
    );

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 1024 * 1024) {
            alert("Image size must be less than 1MB");
            return;
        }

        setLogoFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();

            Object.keys(form).forEach((key) => {
                if (form[key]) {
                    formData.append(key, form[key]);
                }
            });

            if (logoFile) {
                formData.append("logo", logoFile);
            }

            await axios.put(
                "http://localhost:5000/api/admin/profile",
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onClose();

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Edit Basic Details
            </h2>

            {preview && (
                <div className="flex justify-center mb-6">
                    <img
                        src={preview}
                        alt="Preview"
                        className="h-24 w-24 object-cover rounded-md border border-gray-200"
                    />
                </div>
            )}

            <div className="space-y-4">
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <StyledInput label="College Name" name="collagename" value={form.collagename} onChange={handleChange} />
                <StyledInput label="Email" name="emailid" value={form.emailid} onChange={handleChange} />
                <StyledInput label="Contact Number" name="contactnumber" value={form.contactnumber} onChange={handleChange} />
                <StyledInput label="Website" name="website" value={form.website} onChange={handleChange} />
                <StyledInput type="password" label="New Password" name="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current" />
            </div>

            <div className="flex justify-end mt-6">
                <button
                    onClick={handleSubmit}
                    className="px-5 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition"
                >
                    Update Details
                </button>
            </div>
        </ModalWrapper>
    );
};

/* ---------------- Edit Links (FIXED) ---------------- */

const EditLinksModal = ({ admin, token, onClose }) => {
    const [form, setForm] = useState({
        facebook: admin.facebook || "",
        instagram: admin.instagram || "",
        twitter: admin.twitter || "",
        linkedin: admin.linkedin || ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const updatedData = { ...admin, ...form };

            await axios.put(
                "http://localhost:5000/api/admin/profile",
                updatedData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onClose();

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Edit Social Links
            </h2>

            <div className="space-y-4">
                <StyledInput label="Facebook" name="facebook" value={form.facebook} onChange={handleChange} />
                <StyledInput label="Instagram" name="instagram" value={form.instagram} onChange={handleChange} />
                <StyledInput label="Twitter" name="twitter" value={form.twitter} onChange={handleChange} />
                <StyledInput label="LinkedIn" name="linkedin" value={form.linkedin} onChange={handleChange} />
            </div>

            <div className="flex justify-end mt-6">
                <button
                    onClick={handleSubmit}
                    className="px-5 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition"
                >
                    Update Links
                </button>
            </div>
        </ModalWrapper>
    );
};

/* ---------------- Modal Wrapper ---------------- */

const ModalWrapper = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div className="bg-white p-6 rounded-md w-[500px] relative shadow-lg">
            <button
                onClick={onClose}
                className="absolute top-2 right-3 text-gray-500 hover:text-black"
            >
                ✕
            </button>
            {children}
        </div>
    </div>
);

export default AdminProfile;