import { useState } from "react";
import axios from "axios";

const FacultyProfile = ({ faculty, onClose, onUpdated }) => {
    const token = localStorage.getItem("token");
    const isNew = !faculty?.sr_no;

    const [form, setForm] = useState({
        facultyid: faculty?.facultyid || "",
        facultyname: faculty?.facultyname || "",
        state: faculty?.state || "",
        city: faculty?.city || "",
        emailid: faculty?.emailid || "",
        contactnumber: faculty?.contactnumber || "",
        qualification: faculty?.qualification || "",
        experience: faculty?.experience || "",
        birthdate: faculty?.birthdate || "",
        gender: faculty?.gender || "",
        courcecode: faculty?.courcecode || "NOT ASSIGNED",
        semoryear: faculty?.semoryear || 0,
        subject: faculty?.subject || "NOT ASSIGNED",
        position: faculty?.position || "NOT ASSIGNED",
        joineddate: faculty?.joineddate || "",
        lastlogin: faculty?.lastlogin || "",
        password: "",
        activestatus: faculty?.activestatus ?? 0
    });

    const [selectedFile, setSelectedFile] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value
        });
    };

    const handleSave = async () => {
        const formData = new FormData();

        // Append all fields except password (handled separately)
        Object.keys(form).forEach((key) => {
            if (key !== "password") {
                formData.append(key, form[key]);
            }
        });

        // Only send password if filled
        if (form.password) {
            formData.append("password", form.password);
        }

        if (selectedFile) {
            formData.append("profilepic", selectedFile);
        }

        if (isNew) {
            await axios.post(
                "http://localhost:5000/api/faculty",
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } else {
            await axios.put(
                `http://localhost:5000/api/faculty/${faculty.sr_no}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
        }

        onUpdated();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Card */}
            <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl z-10 overflow-hidden">

                {/* Header */}
                <div className="px-8 py-6 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {isNew ? "Add Faculty" : "Edit Faculty"}
                    </h3>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-black text-sm"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">

                    {/* Profile Section */}
                    <div className="flex items-center gap-6">
                        <div className="h-24 w-24 rounded-full border border-gray-200 overflow-hidden bg-gray-100 shadow-sm">
                            {selectedFile ? (
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="preview"
                                    className="h-full w-full object-cover"
                                />
                            ) : faculty?.profilepic ? (
                                <img
                                    src={`http://localhost:5000/uploads/faculties/${faculty.profilepic}`}
                                    alt="profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : null}
                        </div>

                        <label className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300 transition cursor-pointer">
                            Change Profile Picture
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Grid Fields */}
                    <div className="grid grid-cols-2 gap-6">

                        <Input label="Faculty ID" name="facultyid" value={form.facultyid} onChange={handleChange} />
                        <Input label="Full Name" name="facultyname" value={form.facultyname} onChange={handleChange} />
                        <Input label="Email" name="emailid" value={form.emailid} onChange={handleChange} />
                        <Input label="Contact Number" name="contactnumber" value={form.contactnumber} onChange={handleChange} />
                        <Input label="State" name="state" value={form.state} onChange={handleChange} />
                        <Input label="City" name="city" value={form.city} onChange={handleChange} />
                        <Input label="Qualification" name="qualification" value={form.qualification} onChange={handleChange} />
                        <Input label="Experience" name="experience" value={form.experience} onChange={handleChange} />
                        <Input type="date" label="Birth Date" name="birthdate" value={form.birthdate} onChange={handleChange} />
                        <Input label="Gender" name="gender" value={form.gender} onChange={handleChange} />
                        <Input label="Course Code" name="courcecode" value={form.courcecode} onChange={handleChange} />
                        <Input type="number" label="Semester / Year" name="semoryear" value={form.semoryear} onChange={handleChange} />
                        <Input label="Subject" name="subject" value={form.subject} onChange={handleChange} />
                        <Input label="Position" name="position" value={form.position} onChange={handleChange} />
                        <Input type="date" label="Joined Date" name="joineddate" value={form.joineddate} onChange={handleChange} />
                        <Input label="Last Login (Read Only)" name="lastlogin" value={form.lastlogin} readOnly />

                        {/* Password */}
                        <Input
                            type="password"
                            label="Change Password (Leave blank to keep current)"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="activestatus"
                            checked={form.activestatus === 1}
                            onChange={handleChange}
                        />
                        <span className="text-sm text-gray-600">
                            Active Status
                        </span>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t bg-gray-50 flex justify-end gap-3">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition text-sm"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-black transition text-sm"
                    >
                        {isNew ? "Create Faculty" : "Save Changes"}
                    </button>

                </div>

            </div>
        </div>
    );
};

/* Reusable Input */
const Input = ({ label, ...props }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">{label}</label>
        <input
            {...props}
            className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
    </div>
);

export default FacultyProfile;