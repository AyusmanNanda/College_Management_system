import { useEffect, useState } from "react";
import api from "../../utils/api";

const AdminProfile = () => {
    const token = localStorage.getItem("token");

    const [admin, setAdmin] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showLinksModal, setShowLinksModal] = useState(false);

    useEffect(() => {
        if (!token) return;

        const fetchProfile = async () => {
            try {
                const res = await api.get("/api/admin/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
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
        return (
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading profile...
            </p>
        );
    }

    return (
        <div className="space-y-10">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 dark:border-gray-700">

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">

                    <img
                        src={
                            admin?.logo
                                ? `${api.defaults.baseURL}${admin.logo}?v=${imageVersion}`
                                : `${api.defaults.baseURL}/uploads/admin/default.png`
                        }
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `${api.defaults.baseURL}/uploads/admin/default.png`;
                        }}
                        alt="Logo"
                        className="h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                    />
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                            {admin.collagename}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            College Administration Profile
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setShowDetailsModal(true)}
                        className="w-full sm:w-auto px-5 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition"
                    >
                        Edit Details
                    </button>

                    <button
                        onClick={() => setShowLinksModal(true)}
                        className="w-full sm:w-auto px-5 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-100 text-gray-800 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                    >
                        Edit Links
                    </button>
                </div>
            </div>

            {/* BASIC INFO */}
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm transition-colors">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-6">
                    Basic Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <InfoField label="Email" value={admin.emailid} />
                    <InfoField label="Contact Number" value={admin.contactnumber} />
                    <InfoField
                        label="Website"
                        value={
                            <span
                                onClick={() => openLink(admin.website)}
                                className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline break-words"
                            >
                                {admin.website}
                            </span>
                        }
                    />
                    <InfoField label="Address" value={admin.address} />
                </div>
            </div>

            {/* SOCIAL */}
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm transition-colors">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-6">
                    Social Media
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    {["facebook", "instagram", "twitter", "linkedin"].map((key) => (
                        <InfoField
                            key={key}
                            label={key}
                            value={
                                admin[key] ? (
                                    <span
                                        onClick={() => openLink(admin[key])}
                                        className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline break-words"
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
                    onClose={(updatedAdmin) => {
                        setShowDetailsModal(false);
                        if (updatedAdmin) setAdmin(updatedAdmin);
                    }}
                />
            )}

            {showLinksModal && (
                <EditLinksModal
                    admin={admin}
                    token={token}
                    onClose={(updatedAdmin) => {
                        setShowLinksModal(false);
                        if (updatedAdmin) setAdmin(updatedAdmin);
                    }}
                />
            )}
        </div>
    );
};

/* ---------------- Info Field ---------------- */

const InfoField = ({ label, value }) => (
    <div>
        <p className="text-gray-500 dark:text-gray-400 text-xs capitalize mb-1">
            {label}
        </p>
        <p className="text-gray-800 dark:text-gray-100 break-words">
            {value}
        </p>
    </div>
);

/* ---------------- Modal Wrapper ---------------- */

const ModalWrapper = ({ children, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

        <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => onClose(null)}
        />

        <div className="relative bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl z-10 overflow-hidden p-6 transition-colors">
            <button
                onClick={() => onClose(null)}
                className="absolute top-4 right-5 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm"
            >
                ✕
            </button>

            {children}
        </div>
    </div>
);

/* ---------------- Styled Input ---------------- */

const StyledInput = ({ label, name, value, onChange, type = "text" }) => (
    <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            {label}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 transition"
        />
    </div>
);

/* ---------------- Edit Details Modal ---------------- */

const EditDetailsModal = ({ admin, token, onClose }) => {
    const [form, setForm] = useState({ ...admin, password: "" });
    const [logoFile, setLogoFile] = useState(null);
    const [preview, setPreview] = useState(
        admin.logo ? `${api.defaults.baseURL}${admin.logo}` : null
    );

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1024 * 1024) {
            alert("Image must be less than 1MB");
            return;
        }
        setLogoFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();

            Object.keys(form).forEach((key) => {
                if (form[key] !== undefined && form[key] !== "") {
                    formData.append(key, form[key]);
                }
            });

            if (logoFile) {
                formData.append("logo", logoFile);
            }

            await api.put("/api/admin/profile", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            const res = await api.get("/api/admin/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });

            onClose(res.data);

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
                Edit Basic Details
            </h2>

            <div className="mb-6 flex flex-col items-center gap-3">
                {preview && (
                    <img
                        src={preview}
                        alt="Preview"
                        className="h-24 w-24 object-cover rounded-md border border-gray-200 dark:border-gray-600 shadow-sm"
                    />
                )}

                <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                        Change Profile Picture
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>
            </div>

            <div className="space-y-4">
                <StyledInput label="College Name" name="collagename" value={form.collagename} onChange={handleChange} />
                <StyledInput label="Email" name="emailid" value={form.emailid} onChange={handleChange} />
                <StyledInput label="Contact Number" name="contactnumber" value={form.contactnumber} onChange={handleChange} />
                <StyledInput label="Website" name="website" value={form.website} onChange={handleChange} />

                <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Address
                    </label>
                    <textarea
                        name="address"
                        value={form.address || ""}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 transition"
                    />
                </div>

                <StyledInput type="password" label="New Password" name="password" value={form.password} onChange={handleChange} />
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

/* ---------------- Edit Links Modal ---------------- */

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

            await api.put("/api/admin/profile", updatedData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const res = await api.get("/api/admin/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });

            onClose(res.data);

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
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

export default AdminProfile;