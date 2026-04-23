import { useEffect, useState } from "react";
import { Eye, EyeOff, UserCircle, Camera, X } from "lucide-react";
import api from "../../utils/api";
import ConfirmSaveModal from "./modals/ConfirmSaveModal.jsx";

const FacultyProfile = ({ faculty, onClose, onUpdated }) => {
    const BASE_URL = api.defaults.baseURL;
    const token = localStorage.getItem("token");
    const isNew = !faculty?.sr_no;

    const today = new Date().toISOString().split("T")[0];

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [semOptions, setSemOptions] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);

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
        semoryear: faculty?.semoryear || "",
        subject: faculty?.subject || "NOT ASSIGNED",
        position: faculty?.position || "NOT ASSIGNED",
        joineddate: faculty?.joineddate || today,
        password: ""
    });

    /* ================= Logic Preservation ================= */
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get(
                    "/api/courses",
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setCourses(res.data || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        const selectedCourse = courses.find(
            (c) => c.course_code === form.courcecode
        );

        if (selectedCourse) {
            const options = [];
            for (let i = 1; i <= selectedCourse.total_semesters; i++) {
                options.push(i);
            }
            setSemOptions(options);
        } else {
            setSemOptions([]);
        }

        setForm((prev) => ({
            ...prev,
            semoryear: "",
            subject: "NOT ASSIGNED"
        }));

        setSubjects([]);
    }, [form.courcecode, courses]);

    useEffect(() => {
        if (form.courcecode !== "NOT ASSIGNED" && form.semoryear) {
            const fetchSubjects = async () => {
                try {
                    const res = await api.get(
                        `/api/subjects?course_code=${form.courcecode}&sem=${form.semoryear}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setSubjects(res.data || []);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchSubjects();
        }
    }, [form.courcecode, form.semoryear]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSave = async () => {
        setError("");

        if (
            !form.facultyid ||
            !form.facultyname ||
            !form.state ||
            !form.city ||
            !form.emailid ||
            !form.contactnumber ||
            !form.qualification ||
            !form.experience ||
            !form.birthdate ||
            !form.gender
        ) {
            setError("All required fields must be filled.");
            return;
        }

        const formData = new FormData();

        Object.keys(form).forEach((key) => {
            if (key !== "password") {
                formData.append(key, form[key]);
            }
        });

        if (isNew) {
            const finalPassword = form.password || form.birthdate;
            formData.append("password", finalPassword);
        } else if (form.password) {
            formData.append("password", form.password);
        }

        if (selectedFile) {
            formData.append("profilepic", selectedFile);
        }

        try {
            if (isNew) {
                await api.post(
                    "/api/faculty",
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await api.put(
                    `/api/faculty/${faculty.sr_no}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            onUpdated();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to save faculty.");
        }
    };

    const positionOptions = [
        "NOT ASSIGNED",
        "Full Professor",
        "Associate Professor",
        "Assistant Professor",
        "Lecturer",
        "Lab Assistant",
        "Visiting Faculty"
    ];

    const genderOptions = ["", "Male", "Female", "Other"];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[2rem] shadow-2xl z-10 overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {isNew ? "Add Faculty" : "Edit Faculty"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-100 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950 shadow-md">
                                {selectedFile ? (
                                    <img src={URL.createObjectURL(selectedFile)} alt="preview" className="h-full w-full object-cover" />
                                ) : faculty?.profilepic ? (
                                    <img src={`${BASE_URL}/uploads/faculties/${faculty.profilepic}`} alt="profile" className="h-full w-full object-cover" />
                                ) : (
                                    <img src={`${BASE_URL}/uploads/faculties/default.png`} alt="default" className="h-full w-full object-cover" />
                                )}
                            </div>
                            <label className="absolute -bottom-1 -right-1 p-2 bg-indigo-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-indigo-700 transition-all border-2 border-white dark:border-slate-900">
                                <Camera size={16} />
                                <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" />
                            </label>
                        </div>
                        <span className="text-xs font-medium text-slate-500">Choose Profile Picture</span>
                    </div>

                    {/* Form Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Input required label="Faculty ID" name="facultyid" value={form.facultyid} onChange={handleChange} />
                        <Input required label="Full Name" name="facultyname" value={form.facultyname} onChange={handleChange} />
                        <Input required label="State" name="state" value={form.state} onChange={handleChange} />
                        <Input required label="City" name="city" value={form.city} onChange={handleChange} />
                        <Input required label="Email" name="emailid" value={form.emailid} onChange={handleChange} />
                        <Input required label="Contact Number" name="contactnumber" value={form.contactnumber} onChange={handleChange} />
                        <Input required label="Qualification" name="qualification" value={form.qualification} onChange={handleChange} />
                        <Input required label="Experience" name="experience" value={form.experience} onChange={handleChange} />
                        <Input required type="date" label="Birth Date" name="birthdate" value={form.birthdate} onChange={handleChange} />

                        <Select required label="Gender" name="gender" value={form.gender} onChange={handleChange} options={genderOptions} />

                        {/* Course */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500 dark:text-gray-400">
                                Course
                            </label>
                            <select
                                name="courcecode"
                                value={form.courcecode}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-md text-sm outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                            >
                                <option value="NOT ASSIGNED">NOT ASSIGNED</option>
                                {courses.map((c) => (
                                    <option key={c.course_code} value={c.course_code}>
                                        {c.course_code} - {c.course_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Semester / Year */}
                        <Select
                            label="Semester / Year"
                            name="semoryear"
                            value={form.semoryear}
                            onChange={handleChange}
                            options={["", ...semOptions]}
                        />

                        {/* Subject */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500 dark:text-gray-400">
                                Subject
                            </label>
                            <select
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                disabled={!form.semoryear}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-md text-sm outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:bg-slate-50 dark:disabled:bg-slate-900 opacity-70 disabled:opacity-50"
                            >
                                <option value="NOT ASSIGNED">NOT ASSIGNED</option>
                                {subjects.map((s) => (
                                    <option key={s.subjectcode} value={s.subjectcode}>
                                        {s.subjectcode} - {s.subjectname}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Select label="Position" name="position" value={form.position} onChange={handleChange} options={positionOptions} />
                        <Input type="date" label="Joined Date" name="joineddate" value={form.joineddate} onChange={handleChange} />

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500 dark:text-gray-400">
                                Password (Leave blank = DOB)
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 pr-10 rounded-md text-sm outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setShowPassword(!showPassword); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-end gap-3 transition-colors">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md text-sm hover:bg-gray-300 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => setShowSaveModal(true)}
                        className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-md text-sm shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        {isNew ? "Create Faculty" : "Save Changes"}
                    </button>
                </div>
            </div>

            <ConfirmSaveModal
                show={showSaveModal}
                title={isNew ? "Confirm Faculty Creation" : "Confirm Faculty Update"}
                message={
                    isNew
                        ? "Are you sure you want to create this faculty?"
                        : "Are you sure you want to save these changes?"
                }
                confirmText={isNew ? "Create" : "Save"}
                onCancel={() => setShowSaveModal(false)}
                onConfirm={async () => {
                    await handleSave();
                    setShowSaveModal(false);
                }}
            />
        </div>
    );
};

const Input = ({ label, required, ...props }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 dark:text-gray-400">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            {...props}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-md text-sm outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
        />
    </div>
);

const Select = ({ label, options, required, ...props }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 dark:text-gray-400">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            {...props}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-md text-sm outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
        >
            {options.map((opt) => (
                <option key={opt || "empty"} value={opt}>
                    {opt === "" ? "Select" : opt}
                </option>
            ))}
        </select>
    </div>
);

export default FacultyProfile;