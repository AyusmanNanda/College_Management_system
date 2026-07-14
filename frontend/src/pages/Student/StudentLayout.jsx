import AppLayout from "../../components/layout/AppLayout";
import { studentNavigation } from "../../config/navigation";

const StudentLayout = () => {
  const getProfile = ({
                        user,
                        baseUrl,
                      }) => {
    let profilePath = "/uploads/students/default.png";

    if (user?.profilepic) {
      profilePath = String(user.profilepic).startsWith("/uploads/")
          ? user.profilepic
          : `/uploads/students/${user.profilepic}`;
    }

    return {
      image: `${baseUrl}${profilePath}`,
      fallbackImage: `${baseUrl}/uploads/students/default.png`,
      imageAlt: "Profile",
      title: user
          ? `${user.firstname || ""} ${user.lastname || ""}`.trim()
          : "Student",
      subtitle: "Student Portal",
      details: user
          ? [
            {
              label: "Roll Number",
              value: user.rollnumber || "N/A",
              monospace: true,
              bold: true,
            },
            {
              label: "Status",
              value: "Active",
              status: true,
              active: true,
            },
          ]
          : [],
    };
  };

  return (
      <AppLayout
          role="student"
          title="Student Panel"
          profileEndpoint="/api/student/profile"
          navigation={studentNavigation}
          getProfile={getProfile}
      />
  );
};

export default StudentLayout;