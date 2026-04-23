import { useEffect, useMemo, useState } from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Settings,
    ShieldCheck,
    Briefcase,
    Calendar,
    Award,
    BookOpen,
    Eye,
    EyeOff,
    X,
} from "lucide-react";
import api from "../../utils/api";
import ConfirmSaveModal from "../Admin/modals/ConfirmSaveModal";

const FacultyProfile = () => {
    const token = localStorage.getItem("token");

    const [faculty, setFaculty] = useState(null);
    const [assignedSubjects, setAssignedSubjects] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [imgBust, setImgBust] = useState(0);

    /* ================= DATA FETCHING ================= */
    useEffect(() => {
        if (!token) return;

        const fetchProfile = async () => {
            try {
                const [profileRes, subjectsRes] = await Promise.all([
                    api.get("/api/faculty/profile", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    api.get("/api/faculty/assigned-subjects", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setFaculty(profileRes.data);
                setAssignedSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
            } catch (error) {
                console.error("Fetch profile error:", error);
            }
        };

        fetchProfile();
    }, [token]);

    const profileImg = useMemo(() => {
        let url = "";
        if (!faculty?.profilepic) {
            url = `${api.defaults.baseURL}/uploads/faculties/default.png`;
        } else if (String(faculty.profilepic).startsWith("/uploads/")) {
            url = `${api.defaults.baseURL}${faculty.profilepic}`;
        } else {
            url = `${api.defaults.baseURL}/uploads/faculties/${faculty.profilepic}`;
        }
        return `${url}?v=${imgBust}`;
    }, [faculty, imgBust]);

    if (!faculty) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">

            {/* PLATFORM HEADER */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-500/20">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-tight">Faculty Profile</h1>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">Academic Personnel</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowDetailsModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-all active:scale-95">
                            <Settings className="w-3.5 h-3.5" /> Edit Profile
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
                            <img src={profileImg} alt="Profile" className="h-24 w-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm" />
                        </div>
                        <div className="text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                {faculty.facultyname || "Faculty Member"}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{faculty.position || "Member of Faculty"}</p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* BASIC INFO */}
                    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <User className="w-4 h-4 text-indigo-500" />
                            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Identity & Contact</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4">
                            <InfoField label="Faculty ID" value={faculty.facultyid} icon={<ShieldCheck className="w-3.5 h-3.5" />} />
                            <InfoField label="Gender" value={faculty.gender} icon={<User className="w-3.5 h-3.5" />} />
                            <InfoField label="Email Address" value={faculty.emailid} icon={<Mail className="w-3.5 h-3.5" />} />
                            <InfoField label="Contact Number" value={faculty.contactnumber} icon={<Phone className="w-3.5 h-3.5" />} />
                            <InfoField label="Location" value={`${faculty.city || ""}, ${faculty.state || ""}`} icon={<MapPin className="w-3.5 h-3.5" />} />
                            <InfoField label="Birthdate" value={faculty.birthdate} icon={<Calendar className="w-3.5 h-3.5" />} />
                        </div>
                    </section>

                    {/* PROFESSIONAL INFO */}
                    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-indigo-500" />
                            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Professional Profile</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <InfoField label="Highest Qualification" value={faculty.qualification} icon={<Award className="w-3.5 h-3.5" />} />
                            <InfoField label="Teaching Experience" value={faculty.experience} icon={<Briefcase className="w-3.5 h-3.5" />} />
                            
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Assigned Subjects</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    {assignedSubjects.length > 0 
                                        ? assignedSubjects.map(s => s.subjectname || s.subjectcode).join(", ") 
                                        : "No subjects assigned"}
                                </p>
                            </div>

                            <InfoField label="Joining Date" value={faculty.joineddate} icon={<Calendar className="w-3.5 h-3.5" />} />
                        </div>
                    </section>
                </div>
            </main>

            {/* MODAL */}
            {showDetailsModal && (
                <EditDetailsModal 
                    faculty={faculty} 
                    token={token} 
                    onClose={(upd) => { 
                        setShowDetailsModal(false); 
                        if(upd) { 
                            setFaculty(upd); 
                            setImgBust(prev => prev + 1);
                        } 
                    }} 
                />
            )}
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
        <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-bold uppercase text-slate-800 dark:text-slate-200">{title}</h2>
                <button onClick={() => onClose(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 overflow-y-auto">{children}</div>
        </div>
    </div>
);

const StyledInput = ({ label, name, value, onChange, type = "text", ...props }) => (
    <div className="space-y-1">
        <label className="block text-[10px] font-bold uppercase text-slate-500">{label}</label>
        <input
            type={type} name={name} value={value} onChange={onChange} {...props}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-1 focus:ring-indigo-500"
        />
    </div>
);

/* ---------------- Edit Modal ---------------- */

const EditDetailsModal = ({ faculty, token, onClose }) => {
    const [form, setForm] = useState({
        facultyname: faculty.facultyname || "",
        contactnumber: faculty.contactnumber || "",
        gender: faculty.gender || "",
        birthdate: faculty.birthdate || "",
        state: faculty.state || "",
        city: faculty.city || "",
        qualification: faculty.qualification || "",
        experience: faculty.experience || "",
        currentEmailForEmail: "",
        newEmail: "",
        currentPasswordForPassword: "",
        newPassword: "",
    });

    const [profileFile, setProfileFile] = useState(null);
    const [preview, setPreview] = useState(`${api.defaults.baseURL}/uploads/faculties/${faculty.profilepic || 'default.png'}`);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            let authToken = token;
            const fd = new FormData();
            const blockedKeys = new Set(["currentEmailForEmail", "newEmail", "currentPasswordForPassword", "newPassword"]);
            
            Object.keys(form).forEach(key => {
                if (!blockedKeys.has(key) && form[key]) fd.append(key, form[key]);
            });
            if (profileFile) fd.append("profilepic", profileFile);

            await api.put("/api/faculty/profile", fd, { 
                headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "multipart/form-data" } 
            });

            if (form.newEmail && form.newEmail !== faculty.emailid) {
                const emailRes = await api.put("/api/faculty/change-email", 
                    { currentEmail: form.currentEmailForEmail, newEmail: form.newEmail },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
                localStorage.setItem("token", emailRes.data.token);
                authToken = emailRes.data.token;
            }

            if (form.newPassword) {
                await api.put("/api/faculty/change-password",
                    { currentPassword: form.currentPasswordForPassword, newPassword: form.newPassword },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
            }

            const res = await api.get("/api/faculty/profile", { headers: { Authorization: `Bearer ${authToken}` } });
            window.dispatchEvent(new Event("facultyUserUpdated"));
            onClose(res.data);
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose} title="Edit Faculty Profile">
            <div className="mb-6 flex flex-col items-center gap-3">
                <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm" />
                
                {/* IMPROVED UPDATE PHOTO BUTTON */}
                <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 active:opacity-80 whitespace-nowrap border border-transparent hover:border-slate-300 dark:hover:border-slate-600 shadow-sm">
                    Update Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
            </div>

            <div className="space-y-6">
                <div>
                    <h4 className="text-[10px] font-black uppercase text-indigo-500 mb-3 tracking-widest">Personal Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StyledInput label="Full Name" name="facultyname" value={form.facultyname} onChange={handleChange} />
                        <StyledInput label="Contact Number" name="contactnumber" value={form.contactnumber} onChange={handleChange} />
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase text-slate-500">Gender</label>
                            <select name="gender" value={form.gender} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500">
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <StyledInput label="Birth Date" type="date" name="birthdate" value={form.birthdate} onChange={handleChange} />
                        <StyledInput label="State" name="state" value={form.state} onChange={handleChange} />
                        <StyledInput label="City" name="city" value={form.city} onChange={handleChange} />
                    </div>
                </div>

                <div>
                    <h4 className="text-[10px] font-black uppercase text-indigo-500 mb-3 tracking-widest">Professional & Account</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StyledInput label="Qualification" name="qualification" value={form.qualification} onChange={handleChange} />
                        <StyledInput label="Experience" name="experience" value={form.experience} onChange={handleChange} />
                        <StyledInput label="Current Email" name="currentEmailForEmail" value={form.currentEmailForEmail} onChange={handleChange} />
                        <StyledInput label="New Email" name="newEmail" value={form.newEmail} onChange={handleChange} />
                        
                        <div className="relative">
                            <StyledInput label="Current Password" type={showPass ? "text" : "password"} name="currentPasswordForPassword" value={form.currentPasswordForPassword} onChange={handleChange} />
                        </div>
                        <div className="relative">
                            <StyledInput label="New Password" type={showPass ? "text" : "password"} name="newPassword" value={form.newPassword} onChange={handleChange} />
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-7 text-slate-400">
                                {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={() => setShowConfirmModal(true)} disabled={saving} className="w-full mt-8 bg-indigo-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors uppercase tracking-wider disabled:opacity-50">
                {saving ? "Processing..." : "Save All Changes"}
            </button>

            <ConfirmSaveModal 
                show={showConfirmModal} 
                title="Confirm Update" 
                message="Apply these changes to your profile?" 
                onCancel={() => setShowConfirmModal(false)} 
                onConfirm={() => { setShowConfirmModal(false); handleSubmit(); }} 
            />
        </ModalWrapper>
    );
};

export default FacultyProfile;