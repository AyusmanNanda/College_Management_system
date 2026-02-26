import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const FacultyLayout = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const [faculty, setFaculty] = useState(null);


    useEffect(() => {

        if (!token) return;

        const fetchFaculty = async () => {

            try {

                const res = await axios.get(
                    "http://localhost:5000/api/faculty/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setFaculty(res.data);

            }
            catch (error) {

                console.error(error);

            }

        };

        fetchFaculty();

    }, [token]);



    const handleLogout = async () => {

        try {

            await axios.post(
                "http://localhost:5000/api/auth/logout",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

        }
        catch (error) {

            console.error(error);

        }

        localStorage.removeItem("token");

        navigate("/");

    };



    const menuItems = useMemo(() => [

        { name: "Dashboard", path: "/faculty/dashboard" },
        { name: "Profile", path: "/faculty/profile" },
        { name: "Subjects", path: "/faculty/subjects" }

    ], []);




    const initials = useMemo(() => {

        const name = faculty?.facultyname || "";

        const parts = name.split(" ");

        if (parts.length === 0) return "FP";

        return parts[0][0];

    }, [faculty]);




    return (

        <div className="min-h-screen flex bg-gray-100">



            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">



                <div className="px-6 py-6 border-b border-gray-200">

                    <div className="flex items-center gap-3">


                        <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">

                            <span className="text-gray-500 text-xs font-semibold">

                                {initials}

                            </span>

                        </div>


                        <div>

                            <p className="text-sm font-semibold text-gray-800">

                                Faculty Panel

                            </p>

                            <p className="text-xs text-gray-400">

                                Management System

                            </p>

                        </div>

                    </div>




                    {faculty && (

                        <div className="mt-3 text-xs space-y-1">

                            <div className="flex items-center gap-2">

                                <span className="text-gray-400">

                                    Status:

                                </span>

                                <span className="flex items-center gap-2">

                                    <span className={`h-2 w-2 rounded-full ${faculty.activestatus ? "bg-green-500" : "bg-red-500"}`} />

                                    <span className="text-gray-600">

                                        {faculty.activestatus ? "Active" : "Inactive"}

                                    </span>

                                </span>

                            </div>


                            <div>

                                <span className="text-gray-400">

                                    Last login:

                                </span>{" "}

                                <span className="text-gray-600">

                                    {faculty.lastlogin
                                        ? new Date(faculty.lastlogin).toLocaleString()
                                        : "Not available"}

                                </span>

                            </div>

                        </div>

                    )}

                </div>




                <nav className="flex-1 px-4 py-6 space-y-2">

                    {menuItems.map((item) => {

                        const isActive = location.pathname === item.path;

                        return (

                            <Link
                                key={item.path}
                                to={item.path}
                                className={`block px-4 py-2 rounded-md text-sm font-medium transition ${
                                    isActive
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >

                                {item.name}

                            </Link>

                        );

                    })}

                </nav>



            </aside>




            <div className="flex-1 flex flex-col">



                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">


                    <h1 className="text-lg font-semibold text-gray-800">

                        Faculty Panel

                    </h1>


                    <button
                        onClick={handleLogout}
                        className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition"
                    >

                        Logout

                    </button>


                </header>




                <main className="flex-1 p-8">

                    <div className="bg-white rounded-lg shadow-sm p-8 min-h-[80vh]">

                        <Outlet />

                    </div>

                </main>




            </div>



        </div>

    );

};


export default FacultyLayout;