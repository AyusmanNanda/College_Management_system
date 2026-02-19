import { useEffect, useState } from "react";
import axios from "axios";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";

/*
  Admin Profile (Strict Migration)
  ---------------------------------
  Combines:
  - College details
  - Social links
  - Logo
  - Password update
*/

const AdminProfile = () => {
    const token = localStorage.getItem("token");

    const [form, setForm] = useState({});
    const [logoPreview, setLogoPreview] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchAdmin();
    }, []);

    const fetchAdmin = async () => {
        try {
            const res = await axios.get(
                "http://localhost:5000/api/admin/profile",
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setForm(res.data);

            if (res.data.logo) {
                setLogoPreview(`http://localhost:5000${res.data.logo}`);
            }

        } catch (error) {
            console.error(error);
        }
    };

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
        setLogoPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const formData = new FormData();

            Object.keys(form).forEach((key) => {
                if (form[key]) {
                    formData.append(key, form[key]);
                }
            });

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

            setMessage("Admin details updated successfully");
            fetchAdmin();

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <PageHeader
                title="Admin Profile"
                subtitle="Manage college details and social links"
            />

            {message && (
                <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                    {message}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >

                {[
                    "collagename",
                    "address",
                    "emailid",
                    "contactnumber",
                    "website",
                    "facebook",
                    "instagram",
                    "twitter",
                    "linkedin"
                ].map((field) => (
                    <div key={field}>
                        <label className="block mb-2 text-sm font-medium text-gray-700 capitalize">
                            {field}
                        </label>
                        <input
                            type="text"
                            name={field}
                            value={form[field] || ""}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-900"
                        />
                    </div>
                ))}

                {/* Password */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        New Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-900"
                    />
                </div>

                {/* Logo */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        College Logo
                    </label>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="mb-4"
                    />

                    {logoPreview && (
                        <img
                            src={logoPreview}
                            alt="Logo"
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

export default AdminProfile;
