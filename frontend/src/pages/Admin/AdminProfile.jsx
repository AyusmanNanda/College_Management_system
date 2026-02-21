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
        <div className="space-y-6 text-sm text-gray-700">

            <div className="flex justify-end gap-4">
                <button
                    onClick={() => setShowLinksModal(true)}
                    className="text-teal-600 font-medium hover:underline"
                >
                    Edit Links
                </button>

                <button
                    onClick={() => setShowDetailsModal(true)}
                    className="text-teal-600 font-medium hover:underline"
                >
                    Edit Details
                </button>
            </div>

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

            <div className="space-y-2">
                <p><strong>Facebook:</strong> {admin.facebook}</p>
                <p><strong>Instagram:</strong> {admin.instagram}</p>
                <p><strong>Twitter:</strong> {admin.twitter}</p>
                <p><strong>LinkedIn:</strong> {admin.linkedin}</p>
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

/* ---------------- Edit Details Modal ---------------- */

const EditDetailsModal = ({ admin, token, onClose }) => {
    const [form, setForm] = useState({ ...admin });
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
                formData.append(key, form[key]);
            });

            if (logoFile) {
                formData.append("logo", logoFile);
            }

            await axios.put(
                "http://localhost:5000/api/admin/profile",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-lg font-semibold mb-4">Edit Details</h2>

            {preview && (
                <div className="flex justify-center mb-4">
                    <img
                        src={preview}
                        alt="Preview"
                        className="h-24 w-24 object-cover rounded-md"
                    />
                </div>
            )}

            <input type="file" accept="image/*" onChange={handleFileChange} />

            <div className="space-y-3 mt-3">
                <input name="collagename" value={form.collagename} onChange={handleChange} className="input" />
                <input name="emailid" value={form.emailid} onChange={handleChange} className="input" />
                <input name="contactnumber" value={form.contactnumber} onChange={handleChange} className="input" />
                <input name="website" value={form.website} onChange={handleChange} className="input" />
                <textarea name="address" value={form.address} onChange={handleChange} className="input" />
            </div>

            <button onClick={handleSubmit} className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md">
                Update Details
            </button>
        </ModalWrapper>
    );
};

/* ---------------- Edit Links Modal ---------------- */

const EditLinksModal = ({ admin, token, onClose }) => {
    const [form, setForm] = useState({ ...admin });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await axios.put(
                "http://localhost:5000/api/admin/profile",
                form,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <h2 className="text-lg font-semibold mb-4">Edit Links</h2>

            <div className="space-y-3">
                <input name="facebook" value={form.facebook} onChange={handleChange} className="input" />
                <input name="instagram" value={form.instagram} onChange={handleChange} className="input" />
                <input name="twitter" value={form.twitter} onChange={handleChange} className="input" />
                <input name="linkedin" value={form.linkedin} onChange={handleChange} className="input" />
            </div>

            <button onClick={handleSubmit} className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md">
                Update Links
            </button>
        </ModalWrapper>
    );
};

/* ---------------- Modal Wrapper ---------------- */

const ModalWrapper = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div className="bg-white p-6 rounded-md w-[500px] relative">
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