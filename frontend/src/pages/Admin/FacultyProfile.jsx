import { useEffect, useState } from "react";
import api from "../../utils/api";

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
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-white dark:bg-gray-800 w-full max-w-5xl rounded-2xl shadow-2xl z-10 overflow-hidden transition-colors">

                <div className="px-6 sm:px-8 py-6 border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600 flex justify-between items-center transition-colors">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {isNew ? "Add Faculty" : "Edit Faculty"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm transition"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 sm:p-8 space-y-8 max-h-[75vh] overflow-y-auto">

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-4 border-b dark:border-gray-600 pb-6">

                        <div className="h-32 w-32 rounded-full border dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-md">
                            {selectedFile ? (
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="preview"
                                    className="h-full w-full object-cover"
                                />
                            ) : faculty?.profilepic ? (
                                <img
                                    src={`${BASE_URL}/uploads/faculties/${faculty.profilepic}`}
                                    alt="profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <img
                                    src={`${BASE_URL}/uploads/faculties/default.png`}
                                    alt="default"
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>

                        <label className="w-full sm:w-auto text-center px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition cursor-pointer">
                            Choose Profile Picture
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

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
                                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 px-3 py-2 rounded-md text-sm transition"
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
                                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 px-3 py-2 rounded-md text-sm disabled:bg-gray-100 dark:disabled:bg-gray-600 transition"
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
                        <Input type="password" label="Password (Leave blank = DOB)" name="password" value={form.password} onChange={handleChange} />
                    </div>
                </div>

                <div className="px-6 sm:px-8 py-6 border-t bg-gray-50 dark:bg-gray-700 dark:border-gray-600 flex flex-col sm:flex-row justify-end gap-3 transition-colors">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-100 rounded-md text-sm"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        className="w-full sm:w-auto px-6 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-black transition"
                    >
                        {isNew ? "Create Faculty" : "Save Changes"}
                    </button>
                </div>
            </div>
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
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 transition"
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
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 px-3 py-2 rounded-md text-sm transition"
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