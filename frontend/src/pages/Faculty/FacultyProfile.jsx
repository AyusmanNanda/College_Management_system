import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";

const hideScrollbarStyle = `
.hide-scrollbar::-webkit-scrollbar { width: 0px; height: 0px; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const FacultyProfile = () => {
  const token = localStorage.getItem("token");

  const [faculty, setFaculty] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);

  //  ADDED (cache bust for image refresh)
  const [imgBust, setImgBust] = useState(0);

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/faculty/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFaculty(res.data);
      } catch (error) {
        console.error("Fetch profile error:", error);
      }
    };

    fetchProfile();
  }, [token]);

  const openLink = (url) => {
    if (!url) return;
    let finalUrl = String(url).trim();
    if (!finalUrl) return;
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = `https://${finalUrl}`;
    window.open(finalUrl, "_blank", "noopener,noreferrer");
  };

  //  REPLACED (cache-busting image url)
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
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Loading profile...
      </p>
    );
  }

  return (
    <>
      <style>{hideScrollbarStyle}</style>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/5 dark:bg-gray-800/40 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <img
              src={profileImg}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `${api.defaults.baseURL}/uploads/faculties/default.png`;
              }}
              alt="Profile"
              className="h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
            />

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {faculty.facultyname || "Faculty"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Faculty Profile
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

        {/* Body */}
        <div className="p-8 space-y-8">
          {/* Basic */}
          <div className="bg-white/10 dark:bg-gray-800 border border-gray-200/40 dark:border-gray-700 rounded-lg p-6 shadow-sm transition-colors">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-6">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <InfoField label="Faculty ID" value={faculty.facultyid ?? "-"} />
              <InfoField label="Email" value={faculty.emailid || "-"} />
              <InfoField
                label="Contact Number"
                value={faculty.contactnumber || "-"}
              />
              <InfoField label="Gender" value={faculty.gender || "-"} />
              <InfoField label="Birthdate" value={faculty.birthdate || "-"} />
              <InfoField label="State" value={faculty.state || "-"} />
              <InfoField label="City" value={faculty.city || "-"} />
              <InfoField label="Joined Date" value={faculty.joineddate || "-"} />
            </div>
          </div>

          {/* Professional */}
          <div className="bg-white/10 dark:bg-gray-800 border border-gray-200/40 dark:border-gray-700 rounded-lg p-6 shadow-sm transition-colors">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-6">
              Professional Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <InfoField
                label="Qualification"
                value={faculty.qualification || "-"}
              />
              <InfoField label="Experience" value={faculty.experience || "-"} />
              <InfoField
                label="Position"
                value={faculty.position || "NOT ASSIGNED"}
              />
              <InfoField label="Department" value={faculty.department || "-"} />
              <InfoField label="Specialization" value={faculty.specialization || "-"} />
              
              
              
            </div>
          </div>

          {/* Links (Always Show) */}
          <div className="bg-white/10 dark:bg-gray-800 border border-gray-200/40 dark:border-gray-700 rounded-lg p-6 shadow-sm transition-colors">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-6">
              Links
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <LinkField label="Website" value={faculty.website} onOpen={openLink} />
              <LinkField label="Facebook" value={faculty.facebook} onOpen={openLink} />
              <LinkField label="Instagram" value={faculty.instagram} onOpen={openLink} />
              <LinkField label="Twitter" value={faculty.twitter} onOpen={openLink} />
              <LinkField label="LinkedIn" value={faculty.linkedin} onOpen={openLink} />
            </div>

            {!faculty.website &&
              !faculty.facebook &&
              !faculty.instagram &&
              !faculty.twitter &&
              !faculty.linkedin && (
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  No links added yet. Click <b>Edit Links</b> to add.
                </p>
              )}
          </div>
        </div>

        {/* Modals */}
        {showDetailsModal && (
          <EditDetailsModalAll
            faculty={faculty}
            token={token}
            onClose={(updatedFaculty) => {
              setShowDetailsModal(false);

              if (updatedFaculty) {
                setFaculty(updatedFaculty);

                
                setImgBust((prev) => prev + 1);
              }
            }}
          />
        )}

        {showLinksModal && (
          <EditLinksModal
            faculty={faculty}
            token={token}
            onClose={(updatedFaculty) => {
              setShowLinksModal(false);

              if (updatedFaculty) {
                setFaculty(updatedFaculty);

                
                setImgBust((prev) => prev + 1);
              }
            }}
          />
        )}
      </div>
    </>
  );
};

const InfoField = ({ label, value }) => (
  <div>
    <p className="text-gray-500 dark:text-gray-400 text-xs capitalize mb-1">
      {label}
    </p>
    <p className="text-gray-900 dark:text-gray-100 break-words">{value}</p>
  </div>
);

const LinkField = ({ label, value, onOpen }) => (
  <div>
    <p className="text-gray-500 dark:text-gray-400 text-xs capitalize mb-1">
      {label}
    </p>
    {value ? (
      <button
        type="button"
        onClick={() => onOpen(value)}
        className="text-blue-600 dark:text-blue-400 hover:underline break-words text-left"
      >
        {value}
      </button>
    ) : (
      <p className="text-gray-900 dark:text-gray-100">-</p>
    )}
  </div>
);

const ModalWrapper = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={() => onClose(null)}
    />
    <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto hide-scrollbar rounded-2xl shadow-2xl z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <button
          onClick={() => onClose(null)}
          className="text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white text-xl leading-none"
        >
          ×
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const StyledInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
}) => (
  <div>
    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 transition dark:[color-scheme:dark]"
    />
  </div>
);

/**
 *  ONE FORM: Basic + Professional 
 */
const EditDetailsModalAll = ({ faculty, token, onClose }) => {
  const [form, setForm] = useState({
    // basic
    facultyname: faculty.facultyname || "",
    contactnumber: faculty.contactnumber || "",
    gender: faculty.gender || "",
    birthdate: faculty.birthdate || "",
    state: faculty.state || "",
    city: faculty.city || "",

    // professional
    qualification: faculty.qualification || "",
    experience: faculty.experience || "",
    position: faculty.position || "",
    department: faculty.department || "",
    specialization: faculty.specialization || "",
    
    

    // ✅ Change Email (2 inputs like password)
    currentEmailForEmail: "",
    newEmail: "",

    // ✅ Change Password (2 inputs like you already have)
    currentPasswordForPassword: "",
    newPassword: "",
  });

  const [profileFile, setProfileFile] = useState(null);

  const [preview, setPreview] = useState(() => {
    const bust = localStorage.getItem("imgBust") || "0";

    if (!faculty.profilepic)
      return `${api.defaults.baseURL}/uploads/faculties/default.png?v=${bust}`;

    if (String(faculty.profilepic).startsWith("/uploads/")) {
      return `${api.defaults.baseURL}${faculty.profilepic}?v=${bust}`;
    }

    return `${api.defaults.baseURL}/uploads/faculties/${faculty.profilepic}?v=${bust}`;
  });

  useEffect(() => {
    const bust = localStorage.getItem("imgBust") || "0";

    let next = `${api.defaults.baseURL}/uploads/faculties/default.png?v=${bust}`;

    if (faculty?.profilepic) {
      if (String(faculty.profilepic).startsWith("/uploads/")) {
        next = `${api.defaults.baseURL}${faculty.profilepic}?v=${bust}`;
      } else {
        next = `${api.defaults.baseURL}/uploads/faculties/${faculty.profilepic}?v=${bust}`;
      }
    }

    setPreview(next);
    setProfileFile(null);
  }, [faculty?.profilepic]);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setErrorMsg("Image must be less than 1MB");
      return;
    }
    setErrorMsg("");
    setProfileFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setErrorMsg("");

    try {
      let authToken = localStorage.getItem("token");

      // ✅ 1) Update normal profile fields ONLY
      const fd = new FormData();

      // ❗Do NOT send email/password fields to /profile
      const blockedKeys = new Set([
        "currentEmailForEmail",
        "newEmail",
        "currentPasswordForPassword",
        "newPassword",
      ]);

      Object.keys(form).forEach((key) => {
        if (blockedKeys.has(key)) return;

        const val = form[key];
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          fd.append(key, val);
        }
      });

      if (profileFile) fd.append("profilepic", profileFile);

      // ✅ IMPORTANT: paste extra code ONLY AFTER THIS WHOLE STATEMENT FINISHES (after }); )
      await api.put("/api/faculty/profile", fd, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // ✅ 2) Change Email (current email check + new email replace)
      const oldEmail = (faculty.emailid || "").trim();
      const newEmail = (form.newEmail || "").trim();

      if (newEmail && newEmail !== oldEmail) {
        if (!form.currentEmailForEmail.trim()) {
          throw new Error("Please enter current email.");
        }

        if (form.currentEmailForEmail.trim() !== oldEmail) {
          throw new Error("Current email is incorrect.");
        }

        const emailRes = await api.put(
          "/api/faculty/change-email",
          {
            currentEmail: form.currentEmailForEmail.trim(),
            newEmail,
          },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        // ✅ store NEW token after email change
        localStorage.setItem("token", emailRes.data.token);
        authToken = emailRes.data.token;
      }

      // ✅ 3) Change Password
      const wantsPasswordChange =
        (form.currentPasswordForPassword || "").trim() !== "" ||
        (form.newPassword || "").trim() !== "";

      if (wantsPasswordChange) {
        if (!form.currentPasswordForPassword || !form.newPassword) {
          throw new Error("To change password, fill both current and new password.");
        }

        await api.put(
          "/api/faculty/change-password",
          {
            currentPassword: form.currentPasswordForPassword,
            newPassword: form.newPassword,
          },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      }

      // ✅ 4) Fetch updated profile using latest token
      const res = await api.get("/api/faculty/profile", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      localStorage.setItem("user", JSON.stringify(res.data));
      localStorage.setItem("imgBust", String(Date.now()));
      window.dispatchEvent(new Event("facultyUserUpdated"));
      setSuccessMsg("Details saved successfully");

// Close modal after 1.5 seconds
setSuccessMsg("Details saved successfully");

// Close modal after 1.5 seconds
setTimeout(() => {
  onClose(res.data);
}, 600);
    } catch (err) {
      console.error(err);

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        (err?.response?.status === 501
          ? "Backend not implemented yet."
          : "Failed to update profile.");

      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper title="Edit Details" onClose={onClose}>
      {/* Picture */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <img
          src={preview}
          alt="Preview"
          className="h-24 w-24 object-cover rounded-md border border-gray-200 dark:border-gray-700 shadow-sm"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `${api.defaults.baseURL}/uploads/faculties/default.png`;
          }}
        />

        <label className="cursor-pointer">
          <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-900 dark:text-gray-100">
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

      {errorMsg && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {errorMsg}
        </div>
      )}

      {successMsg && (
  <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
    {successMsg}
  </div>
)}

      {/* Basic Section */}
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
        Basic Information
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StyledInput
          label="Full Name"
          name="facultyname"
          value={form.facultyname}
          onChange={handleChange}
        />

        <StyledInput
          label="Contact Number"
          name="contactnumber"
          value={form.contactnumber}
          onChange={handleChange}
        />

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Gender
          </label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <StyledInput
          type="date"
          label="Birthdate"
          name="birthdate"
          value={form.birthdate}
          onChange={handleChange}
        />

        <StyledInput label="State" name="state" value={form.state} onChange={handleChange} />
        <StyledInput label="City" name="city" value={form.city} onChange={handleChange} />
      </div>

      {/* Professional Section */}
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
        Professional Details
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StyledInput
          label="Qualification"
          name="qualification"
          value={form.qualification}
          onChange={handleChange}
        />
        <StyledInput
          label="Experience"
          name="experience"
          value={form.experience}
          onChange={handleChange}
          placeholder="e.g. 3 years"
        />
        <StyledInput label="Position" name="position" value={form.position} onChange={handleChange} />
        <StyledInput
  label="Department"
  name="department"
  value={form.department}
  onChange={handleChange}
/>

<StyledInput
  label="Specialization"
  name="specialization"
  value={form.specialization}
  onChange={handleChange}
/>


        
      </div>

      {/* ✅ Change Email Section (2 inputs like password) */}
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mt-8 mb-3">
        Change Email
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StyledInput
          label="Current Email"
          name="currentEmailForEmail"
          value={form.currentEmailForEmail}
          onChange={handleChange}
        />
        <StyledInput
          label="New Email"
          name="newEmail"
          value={form.newEmail}
          onChange={handleChange}
        />
      </div>

      {/* ✅ Change Password Section */}
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mt-6 mb-3">
        Change Password
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StyledInput
          type="password"
          label="Current Password"
          name="currentPasswordForPassword"
          value={form.currentPasswordForPassword}
          onChange={handleChange}
        />
        <StyledInput
          type="password"
          label="New Password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Update Details"}
        </button>
      </div>
    </ModalWrapper>
  );
};

const EditLinksModal = ({ faculty, token, onClose }) => {
  const [form, setForm] = useState({
    website: faculty.website || "",
    facebook: faculty.facebook || "",
    instagram: faculty.instagram || "",
    twitter: faculty.twitter || "",
    linkedin: faculty.linkedin || "",
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setErrorMsg("");

    try {
      const fd = new FormData();
      Object.keys(form).forEach((k) => {
        const v = form[k];
        if (v !== undefined && v !== null && String(v).trim() !== "")
          fd.append(k, v);
      });

      await api.put("/api/faculty/profile", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const res = await api.get("/api/faculty/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      

      localStorage.setItem("user", JSON.stringify(res.data));
localStorage.setItem("imgBust", String(Date.now()));
window.dispatchEvent(new Event("facultyUserUpdated"));
onClose(res.data);


    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 501
          ? "Backend not implemented for updating links yet."
          : "Failed to update links.");
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper title="Edit Links" onClose={onClose}>
      {errorMsg && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StyledInput
          label="Website"
          name="website"
          value={form.website}
          onChange={handleChange}
        />
        <StyledInput
          label="Facebook"
          name="facebook"
          value={form.facebook}
          onChange={handleChange}
        />
        <StyledInput
          label="Instagram"
          name="instagram"
          value={form.instagram}
          onChange={handleChange}
        />
        <StyledInput
          label="Twitter"
          name="twitter"
          value={form.twitter}
          onChange={handleChange}
        />
        <StyledInput
          label="LinkedIn"
          name="linkedin"
          value={form.linkedin}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Update Links"}
        </button>
      </div>
    </ModalWrapper>
  );
};

export default FacultyProfile;