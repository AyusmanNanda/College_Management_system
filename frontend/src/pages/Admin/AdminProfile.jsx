import { useEffect, useState } from "react";
import {
    User,
    Globe,
    Share2,
    Mail,
    Phone,
    MapPin,
    Settings,
    Camera,
    ShieldCheck,
    Eye,
    EyeOff,
    X
} from "lucide-react";
import api from "../../utils/api";
import ConfirmSaveModal from "./modals/ConfirmSaveModal.jsx";
import Toast from "./Toast.jsx";

const AdminProfile = () => {
    const token = localStorage.getItem("token");

    const [admin, setAdmin] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showLinksModal, setShowLinksModal] = useState(false);
    const [toast, setToast] = useState(null);

    /* ================= DATA FETCHING ================= */
    useEffect(() => {
        if (!token) return;
        const fetchProfile = async () => {
            try {
                const res = await api.get("/api/admin/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAdmin(res.data);
            } catch (error) {
                setToast({ type: "error", message: "Failed to load profile data." });
            }
        };
        fetchProfile();
    }, [token]);

    const openLink = (url) => {
        if (!url) return;
        const processedUrl = url.startsWith('http') ? url : `https://${url}`;
        window.open(processedUrl, "_blank", "noopener,noreferrer");
    };

    if (!admin) {
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
                            <h1 className="text-lg font-bold tracking-tight leading-tight">Admin Profile</h1>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">Institution Management</p>
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
                            <img src={admin?.logo ? `${api.defaults.baseURL}${admin.logo}` : `${api.defaults.baseURL}/uploads/admin/default.png`}
                                 alt="Logo" className="h-24 w-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm" />
                        </div>
                        <div className="text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                {admin.collagename}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">College Administration Account</p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* BASIC INFO */}
                    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <User className="w-4 h-4 text-indigo-500" />
                            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Basic Information</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <InfoField label="Email Address" value={admin.emailid} icon={<Mail className="w-3.5 h-3.5" />} />
                            <InfoField label="Contact Number" value={admin.contactnumber} icon={<Phone className="w-3.5 h-3.5" />} />
                            <InfoField label="Official Website" value={admin.website} icon={<Globe className="w-3.5 h-3.5" />} isLink onClick={() => openLink(admin.website)} />
                            <InfoField label="Address" value={admin.address} icon={<MapPin className="w-3.5 h-3.5" />} />
                        </div>
                    </section>

                    {/* SOCIAL LINKS */}
                    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Share2 className="w-4 h-4 text-indigo-500" />
                                <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Social Media</h3>
                            </div>
                            <button onClick={() => setShowLinksModal(true)} className="text-[10px] font-bold text-indigo-600 uppercase hover:underline">Edit Links</button>
                        </div>
                        <div className="p-6 space-y-4">
                            {["facebook", "instagram", "twitter", "linkedin"].map((key) => (
                                <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold uppercase text-slate-400 w-16">{key}</span>
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[150px] sm:max-w-xs">{admin[key] || "-"}</span>
                                    </div>
                                    {admin[key] && (
                                        <button onClick={() => openLink(admin[key])} className="text-indigo-600 hover:text-indigo-700 transition-colors">
                                            <Globe className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            {/* MODALS */}
            {showDetailsModal && <EditDetailsModal admin={admin} token={token} onClose={(upd) => { setShowDetailsModal(false); if(upd) { setAdmin(upd); setToast({type:"success", message:"Profile updated successfully."}); }}} />}
            {showLinksModal && <EditLinksModal admin={admin} token={token} onClose={(upd) => { setShowLinksModal(false); if(upd) { setAdmin(upd); setToast({type:"success", message:"Links updated successfully."}); }}} />}

            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

/* ---------------- Internal Components ---------------- */

const InfoField = ({ label, value, icon, isLink, onClick }) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-slate-400">
            {icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </div>
        {isLink && value ? (
            <button onClick={onClick} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline text-left">{value}</button>
        ) : (
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value || "-"}</p>
        )}
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

const StyledInput = ({ label, name, value, onChange, type = "text" }) => (
    <div className="space-y-1">
        <label className="block text-[10px] font-bold uppercase text-slate-500">{label}</label>
        <input
            type={type} name={name} value={value} onChange={onChange}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-1 focus:ring-indigo-500"
        />
    </div>
);

/* ---------------- Sub-Modals ---------------- */

const EditDetailsModal = ({ admin, token, onClose }) => {
    const [form, setForm] = useState({ ...admin, password: "" });
    const [logoFile, setLogoFile] = useState(null);
    const [preview, setPreview] = useState(admin.logo ? `${api.defaults.baseURL}${admin.logo}` : null);
    const [showPassword, setShowPassword] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);

    const handleSubmit = async () => {
        const formData = new FormData();
        Object.keys(form).forEach(key => { if (form[key] !== undefined && form[key] !== "") formData.append(key, form[key]); });
        if (logoFile) formData.append("logo", logoFile);
        try {
            await api.put("/api/admin/profile", formData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
            const res = await api.get("/api/admin/profile", { headers: { Authorization: `Bearer ${token}` } });
            onClose(res.data);
        } catch (e) { console.error(e); }
    };

    return (
        <ModalWrapper onClose={onClose} title="Edit Profile Details">
            <div className="mb-6 flex flex-col items-center gap-3">
                <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                <label className="cursor-pointer px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase rounded-md hover:bg-slate-200 transition-colors">
                    Change Logo
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files[0]; if(file){ setLogoFile(file); setPreview(URL.createObjectURL(file)); } }} />
                </label>
            </div>

            <div className="space-y-4">
                <StyledInput label="College Name" value={form.collagename} onChange={(e) => setForm({...form, collagename: e.target.value})} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StyledInput label="Email Address" value={form.emailid} onChange={(e) => setForm({...form, emailid: e.target.value})} />
                    <StyledInput label="Contact Number" value={form.contactnumber} onChange={(e) => setForm({...form, contactnumber: e.target.value})} />
                </div>
                <StyledInput label="Website" value={form.website} onChange={(e) => setForm({...form, website: e.target.value})} />
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Address</label>
                    <textarea rows="2" value={form.address || ""} onChange={(e) => setForm({...form, address: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">New Password (Optional)</label>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 pr-10 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                    </div>
                </div>
            </div>

            <button onClick={() => setShowSaveModal(true)} className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors uppercase tracking-wider">Update Details</button>
            <ConfirmSaveModal show={showSaveModal} title="Confirm Update" message="Are you sure you want to update the admin profile?" confirmText="Confirm" onCancel={() => setShowSaveModal(false)} onConfirm={() => { handleSubmit(); setShowSaveModal(false); }} />
        </ModalWrapper>
    );
};

const EditLinksModal = ({ admin, token, onClose }) => {
    const [form, setForm] = useState({ facebook: admin.facebook || "", instagram: admin.instagram || "", twitter: admin.twitter || "", linkedin: admin.linkedin || "" });
    const [showSaveModal, setShowSaveModal] = useState(false);

    const handleSubmit = async () => {
        try {
            await api.put("/api/admin/profile", { ...admin, ...form }, { headers: { Authorization: `Bearer ${token}` } });
            const res = await api.get("/api/admin/profile", { headers: { Authorization: `Bearer ${token}` } });
            onClose(res.data);
        } catch (e) { console.error(e); }
    };

    return (
        <ModalWrapper onClose={onClose} title="Edit Social Links">
            <div className="space-y-4">
                <StyledInput label="Facebook" value={form.facebook} onChange={(e) => setForm({...form, facebook: e.target.value})} />
                <StyledInput label="Instagram" value={form.instagram} onChange={(e) => setForm({...form, instagram: e.target.value})} />
                <StyledInput label="Twitter" value={form.twitter} onChange={(e) => setForm({...form, twitter: e.target.value})} />
                <StyledInput label="LinkedIn" value={form.linkedin} onChange={(e) => setForm({...form, linkedin: e.target.value})} />
            </div>
            <button onClick={() => setShowSaveModal(true)} className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors uppercase tracking-wider">Update Links</button>
            <ConfirmSaveModal show={showSaveModal} title="Confirm Links" message="Update social media links?" confirmText="Confirm" onCancel={() => setShowSaveModal(false)} onConfirm={() => { handleSubmit(); setShowSaveModal(false); }} />
        </ModalWrapper>
    );
};

export default AdminProfile;