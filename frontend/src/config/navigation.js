import {
    LayoutDashboard,
    BookOpen,
    Users,
    ClipboardCheck,
    GraduationCap,
    BarChart3,
    User,
} from "lucide-react";

export const adminNavigation = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/admin/dashboard",
    },
    {
        name: "Academic",
        icon: BookOpen,
        children: [
            { name: "Courses", path: "/admin/courses" },
            { name: "Subjects", path: "/admin/subjects" },
            { name: "Assign Subjects", path: "/admin/assign-subjects" },
        ],
    },
    {
        name: "Users",
        icon: Users,
        children: [
            { name: "Students", path: "/admin/students" },
            { name: "Faculties", path: "/admin/faculties" },
        ],
    },
    {
        name: "Attendance",
        icon: ClipboardCheck,
        children: [
            { name: "Take Attendance", path: "/admin/take-attendance" },
            { name: "Edit Attendance", path: "/admin/edit-attendance" },
        ],
    },
    {
        name: "Marks",
        icon: GraduationCap,
        children: [
            { name: "Enter Marks", path: "/admin/enter-marks" },
            { name: "Edit Marks", path: "/admin/edit-marks" },
        ],
    },
    {
        name: "Reports",
        icon: BarChart3,
        children: [
            { name: "Attendance Report", path: "/admin/attendance-report" },
            { name: "Marks Report", path: "/admin/marks-report" },
            { name: "Print Marksheet", path: "/admin/print-marksheet" },
        ],
    },
    {
        name: "Account",
        icon: User,
        children: [
            { name: "Profile", path: "/admin/profile" },
        ],
    },
];

export const facultyNavigation = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/faculty/dashboard",
    },
    {
        name: "Attendance",
        icon: ClipboardCheck,
        children: [
            { name: "Take Attendance", path: "/faculty/take-attendance" },
            { name: "Edit Attendance", path: "/faculty/edit-attendance" },
        ],
    },
    {
        name: "Marks",
        icon: GraduationCap,
        children: [
            { name: "Enter Marks", path: "/faculty/enter-marks" },
        ],
    },
    {
        name: "Reports",
        icon: BarChart3,
        children: [
            { name: "Attendance Report", path: "/faculty/attendance-report" },
            { name: "Marks Report", path: "/faculty/marks-report" },
        ],
    },
    {
        name: "Account",
        icon: User,
        children: [
            { name: "Profile", path: "/faculty/profile" },
        ],
    },
];

export const studentNavigation = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/student/dashboard",
    },
    {
        name: "Attendance",
        icon: ClipboardCheck,
        path: "/student/attendance",
    },
    {
        name: "Marksheet",
        icon: GraduationCap,
        path: "/student/marksheet",
    },
    {
        name: "Account",
        icon: User,
        children: [
            { name: "My Profile", path: "/student/profile" },
        ],
    },
];

export const navigationByRole = {
    admin: adminNavigation,
    faculty: facultyNavigation,
    student: studentNavigation,
};