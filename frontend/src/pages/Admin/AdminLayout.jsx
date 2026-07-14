import AppLayout from "../../components/layout/AppLayout";
import { adminNavigation } from "../../config/navigation";

const getAdminProfile = ({
                             user,
                             baseUrl,
                         }) => {
    const lastLogin = user?.lastlogin
        ? new Date(user.lastlogin).toLocaleDateString()
        : "N/A";

    return {
        image: user?.logo
            ? `${baseUrl}${user.logo}`
            : `${baseUrl}/uploads/admin/default.png`,
        fallbackImage: `${baseUrl}/uploads/admin/default.png`,
        imageAlt: "Logo",
        title: "Administrator",
        subtitle: "Academic Portal",
        details: user
            ? [
                {
                    label: "System Node",
                    value: user.activestatus
                        ? "Online"
                        : "Offline",
                    status: true,
                    active: Boolean(user.activestatus),
                },
                {
                    label: "Last Auth",
                    value: lastLogin,
                    monospace: true,
                },
            ]
            : [],
    };
};

const AdminLayout = () => {
    return (
        <AppLayout
            role="admin"
            title="Academic Management ERP"
            profileEndpoint="/api/admin/profile"
            navigation={adminNavigation}
            getProfile={getAdminProfile}
        />
    );
};

export default AdminLayout;