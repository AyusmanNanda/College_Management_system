import { useEffect, useState } from "react";
import axios from "axios";

const Faculties = () => {
    const token = localStorage.getItem("token");

    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFaculty, setSelectedFaculty] = useState(null);

    const [form, setForm] = useState({
        facultyid: "",
        facultyname: "",
        state: "",
        city: "",
        emailid: "",
        contactnumber: "",
        qualification: "",
        experience: "",
        birthdate: "",
        gender: ""
    });

    const fetchFaculties = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                "http://localhost:5000/api/faculty",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFaculties(res.data);
        } catch {
            setError("Failed to load faculties.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchFaculties();
    }, [token]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(form).forEach((key) => {
            formData.append(key, form[key]);
        });

        if (selectedFile) {
            formData.append("profilepic", selectedFile);
        }

        try {
            setLoading(true);

            await axios.post(
                "http://localhost:5000/api/faculty",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            setForm({
                facultyid: "",
                facultyname: "",
                state: "",
                city: "",
                emailid: "",
                contactnumber: "",
                qualification: "",
                experience: "",
                birthdate: "",
                gender: ""
            });

            setSelectedFile(null);
            fetchFaculties();

        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this faculty?")) return;

        try {
            await axios.delete(
                `http://localhost:5000/api/faculty/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchFaculties();
            setSelectedFaculty(null);
        } catch {
            setError("Failed to delete faculty.");
        }
    };

    return (
        <div className="w-full space-y-8">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                    Faculty Management
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Add and manage faculty members.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
                    {error}
                </div>
            )}

            {/* Form Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >

                    <Input name="facultyid" placeholder="Faculty ID" value={form.facultyid} onChange={handleChange} />
                    <Input name="facultyname" placeholder="Faculty Name" value={form.facultyname} onChange={handleChange} />
                    <Input name="state" placeholder="State" value={form.state} onChange={handleChange} />
                    <Input name="city" placeholder="City" value={form.city} onChange={handleChange} />
                    <Input name="emailid" placeholder="Email ID" value={form.emailid} onChange={handleChange} />
                    <Input name="contactnumber" placeholder="Contact Number" value={form.contactnumber} onChange={handleChange} />
                    <Input name="qualification" placeholder="Qualification" value={form.qualification} onChange={handleChange} />
                    <Input name="experience" placeholder="Experience" value={form.experience} onChange={handleChange} />
                    <Input type="date" name="birthdate" value={form.birthdate} onChange={handleChange} />

                    <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>

                    {/* Profile Upload Section */}
                    <div className="md:col-span-3">
                        <div className="flex items-center gap-6">

                            <div className="h-24 w-24 rounded-full border border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
                                {selectedFile ? (
                                    <img
                                        src={URL.createObjectURL(selectedFile)}
                                        alt="preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs text-gray-400">
                                        No Image
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">

                                <label
                                    htmlFor="profileUpload"
                                    className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md cursor-pointer hover:bg-black transition w-fit"
                                >
                                    Upload Profile Photo
                                </label>

                                <span className="text-xs text-gray-500">
                                    JPG or PNG supported
                                </span>

                                <input
                                    id="profileUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition"
                        >
                            Add Faculty
                        </button>
                    </div>

                </form>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Qualification</th>
                        <th className="p-4">Image</th>
                    </tr>
                    </thead>
                    <tbody>
                    {faculties.map((f) => (
                        <tr
                            key={f.sr_no}
                            className="border-t hover:bg-gray-50 cursor-pointer transition"
                            onClick={() => setSelectedFaculty(f)}
                        >
                            <td className="p-4">{f.facultyid}</td>
                            <td className="p-4">{f.facultyname}</td>
                            <td className="p-4">{f.emailid}</td>
                            <td className="p-4">{f.qualification}</td>
                            <td className="p-4">
                                {f.profilepic && (
                                    <img
                                        src={`http://localhost:5000/uploads/faculties/${f.profilepic}`}
                                        alt="profile"
                                        className="h-10 w-10 object-cover rounded-full"
                                    />
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedFaculty && (
                <FacultyDetailModal
                    faculty={selectedFaculty}
                    onClose={() => setSelectedFaculty(null)}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

const Input = ({ type = "text", name, value, onChange, placeholder }) => (
    <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
    />
);

const FacultyDetailModal = ({ faculty, onClose, onDelete }) => {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative">

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-black"
                >
                    ✕
                </button>

                <div className="flex items-center gap-6 mb-6">

                    {faculty.profilepic ? (
                        <img
                            src={`http://localhost:5000/uploads/faculties/${faculty.profilepic}`}
                            alt="profile"
                            className="h-24 w-24 rounded-full object-cover border"
                        />
                    ) : (
                        <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}

                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                            {faculty.facultyname}
                        </h3>
                        <p className="text-sm text-gray-500">
                            Faculty ID: {faculty.facultyid}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <Detail label="Email" value={faculty.emailid} />
                    <Detail label="Qualification" value={faculty.qualification} />
                    <Detail label="Experience" value={faculty.experience} />
                    <Detail label="Status" value={faculty.activestatus ? "Active" : "Inactive"} />
                </div>

                <div className="mt-6">
                    <button
                        onClick={() => onDelete(faculty.sr_no)}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                    >
                        Delete Faculty
                    </button>
                </div>

            </div>
        </div>
    );
};

const Detail = ({ label, value }) => (
    <div>
        <p className="text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value || "N/A"}</p>
    </div>
);

export default Faculties;