import { useEffect, useState } from "react";
import axios from "axios";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";

/*
  College Info Page
  -----------------
  Clean aligned version
*/

const CollegeInfo = () => {
    const token = localStorage.getItem("token");

    const [form, setForm] = useState({
        college_name: "",
        address: "",
        email: "",
        contact_number: "",
        website: "",
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
        logo: null
    });

    const [existingLogo, setExistingLogo] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchCollegeInfo = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:5000/api/admin/college",
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (res.data) {
                    setForm((prev) => ({
                        ...prev,
                        ...res.data,
                        logo: null
                    }));

                    if (res.data.logo) {
                        setExistingLogo(`http://localhost:5000${res.data.logo}`);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchCollegeInfo();
    }, [token]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 1024 * 1024) {
            alert("Logo must be less than 1MB");
            return;
        }

        setForm({ ...form, logo: file });
        setExistingLogo(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const formData = new FormData();

            Object.keys(form).forEach((key) => {
                if (form[key] !== null && form[key] !== "") {
                    formData.append(key, form[key]);
                }
            });

            await axios.put(
                "http://localhost:5000/api/admin/college",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            setMessage("College information updated successfully");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <PageHeader
                title="College Information"
                subtitle="Manage your institution details and branding"
            />

            {message && (
                <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">
                    {message}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >

                {[
                    "college_name",
                    "address",
                    "email",
                    "contact_number",
                    "website",
                    "facebook",
                    "instagram",
                    "twitter",
                    "linkedin"
                ].map((field) => (
                    <div key={field}>
                        <label className="block mb-2 text-sm font-medium text-gray-700 capitalize">
                            {field.replace("_", " ")}
                        </label>
                        <input
                            type="text"
                            name={field}
                            value={form[field] || ""}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>
                ))}

                {/* Logo */}
                <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        College Logo
                    </label>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="mb-4"
                    />

                    {existingLogo && (
                        <img
                            src={existingLogo}
                            alt="Logo Preview"
                            className="h-20 rounded-md border"
                        />
                    )}
                </div>

                <div className="md:col-span-2 flex justify-end">
                    <Button type="submit">
                        Save Changes
                    </Button>
                </div>

            </form>
        </>
    );
};

export default CollegeInfo;
