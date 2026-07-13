import { useEffect, useState } from "react";
import {
    User,
    Mail,
    Settings,
    ShieldCheck,
    Eye,
    EyeOff,
    X,
    GraduationCap,
    Calendar,
    Phone,
    MapPin,
    Camera,
    Save
} from "lucide-react";
import api from "../../utils/api";
import ConfirmSaveModal from "./modals/ConfirmSaveModal";
import Toast from "./Toast";

const StudentProfile = () => {
    const token = localStorage.getItem("token");
    const BASE_URL = api.defaults.baseURL;

    const [student, setStudent] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [toast, setToast] = useState(null);

    /* ================= DATA FETCHING ================= */
    useEffect(() => {
        if (!token) return;
        const fetchProfile = async () => {
            try {
                const res = await api.get("/api/student/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStudent(res.data);
            } catch (error) {
                setToast({ type: "error", message: "Failed to load profile data." });
            }
        };
        fetchProfile();
    }, [token]);

    if (!student) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">

            {/* PLATFORM HEADER */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-500/20">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-tight">My Profile</h1>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">Student Portal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowEditModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-all active:scale-95">
                            <Settings className="w-3.5 h-3.5" /> Edit Account
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* HERO CARD */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative">
                            <img
                                src={student?.profilepic ? `${BASE_URL}/uploads/students/${student.profilepic}` : `${BASE_URL}/uploads/students/default.png`}
                                alt="Student"
                                className="h-28 w-28 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                            />
                        </div>
                        <div className="text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                {student.firstname} {student.lastname}
                            </h2>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-2">
                                <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase rounded tracking-wider border border-indigo-100 dark:border-indigo-800">
                                    Roll: {student.rollnumber}
                                </span>
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase rounded tracking-wider">
                                    {student.Courcecode}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ACADEMIC INFO */}
                    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-indigo-500" />
                            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Academic Details</h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-6">
                            <InfoField label="Semester / Year" value={student.semoryear} icon={<Calendar className="w-3.5 h-3.5" />} />
                            <InfoField label="Optional Subject" value={student.optionalsubject || "None"} icon={<Settings className="w-3.5 h-3.5" />} />
                            <InfoField label="Admission Date" value={student.admissiondate} icon={<Calendar className="w-3.5 h-3.5" />} />
                            <InfoField label="Status" value={student.activestatus === 1 ? "Active" : "Inactive"} icon={<ShieldCheck className="w-3.5 h-3.5" />} />
                        </div>
                    </section>

                    {/* CONTACT & PERSONAL */}
                    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-indigo-500" />
                            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Contact Information</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <InfoField label="Email Address" value={student.emailid} icon={<Mail className="w-3.5 h-3.5" />} />
                            <InfoField label="Contact Number" value={student.contactnumber} icon={<Phone className="w-3.5 h-3.5" />} />
                            <InfoField label="Date of Birth" value={student.dateofbirth} icon={<Calendar className="w-3.5 h-3.5" />} />
                            <InfoField label="Location" value={`${student.city}, ${student.state}`} icon={<MapPin className="w-3.5 h-3.5" />} />
                        </div>
                    </section>
                </div>
            </main>

            {/* MODALS */}
            {showEditModal && (
                <EditStudentModal
                    student={student}
                    token={token}
                    onClose={(upd) => {
                        setShowEditModal(false);
                        if(upd) {
                            setStudent(upd);
                            setToast({type:"success", message:"Profile updated successfully."});
                        }
                    }}
                />
            )}

            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

/* ---------------- Internal Components ---------------- */

const InfoField = ({ label, value, icon }) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-slate-400">
            {icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value || "-"}</p>
    </div>
);

const ModalWrapper = ({ children, onClose, title }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => onClose(null)} />
        <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-bold uppercase text-slate-800 dark:text-slate-200">{title}</h2>
                <button onClick={() => onClose(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 overflow-y-auto">{children}</div>
        </div>
    </div>
);

const StyledInput = ({ label, value, onChange, type = "text", placeholder }) => (
    <div className="space-y-1">
        <label className="block text-[10px] font-bold uppercase text-slate-500">{label}</label>
        <input
            type={type} value={value} onChange={onChange} placeholder={placeholder}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-1 focus:ring-indigo-500"
        />
    </div>
);

/* ---------------- Edit Modal ---------------- */

const EditStudentModal = ({ student, token, onClose }) => {
    const [form, setForm] = useState({
        emailid: student.emailid,
        password: "",
        rollnumber: student.rollnumber
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(student.profilepic ? `${api.defaults.baseURL}/uploads/students/${student.profilepic}` : null);
    const [showPassword, setShowPassword] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("emailid", form.emailid);
        formData.append("rollnumber", form.rollnumber); // Critical for backend naming

        if (form.password) formData.append("password", form.password);
        if (file) formData.append("profilepic", file);

        try {
            await api.put("/api/student/profile", formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            const res = await api.get("/api/student/profile", { headers: { Authorization: `Bearer ${token}` } });
            onClose(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <ModalWrapper onClose={onClose} title="Edit Account Details">
            <div className="mb-6 flex flex-col items-center gap-3">
                <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                <label className="cursor-pointer px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase rounded-md hover:bg-slate-200 transition-colors">
                    Change Photo
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const selected = e.target.files[0];
                        if(selected){ setFile(selected); setPreview(URL.createObjectURL(selected)); }
                    }} />
                </label>
            </div>

            <div className="space-y-4">
                <StyledInput
                    label="Email Address"
                    value={form.emailid}
                    onChange={(e) => setForm({...form, emailid: e.target.value})}
                />

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">New Password (Optional)</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            placeholder="Leave blank to keep current"
                            onChange={(e) => setForm({...form, password: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 pr-10 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                        </button>
                    </div>
                </div>
            </div>

            <button
                onClick={() => setShowSaveModal(true)}
                className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors uppercase tracking-wider"
            >
                Update Account
            </button>

            <ConfirmSaveModal
                show={showSaveModal}
                title="Update Profile"
                message="Are you sure you want to update your account?"
                confirmText="Confirm"
                onCancel={() => setShowSaveModal(false)}
                onConfirm={() => { handleSubmit(); setShowSaveModal(false); }}
            />
        </ModalWrapper>
    );
};

export default StudentProfile;