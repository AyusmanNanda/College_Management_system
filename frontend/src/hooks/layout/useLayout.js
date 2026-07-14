import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import useOfflineDetection from "./useOfflineDetection";

const useLayout = ({
                       role,
                       profileEndpoint,
                       updateEvent,
                   }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const isOffline = useOfflineDetection();

    const [user, setUser] = useState(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        const saved = localStorage.getItem(`${role}SidebarOpen`);

        return saved !== null
            ? JSON.parse(saved)
            : window.innerWidth >= 1024;
    });

    const [openSections, setOpenSections] = useState({});
    const [checking, setChecking] = useState(false);
    const [retryError, setRetryError] = useState("");
    const [imgBust, setImgBust] = useState(0);

    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("theme");

        if (savedTheme) {
            return savedTheme;
        }

        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    });

    useEffect(() => {
        document.documentElement.classList.toggle(
            "dark",
            theme === "dark"
        );

        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        if (window.innerWidth >= 1024) {
            localStorage.setItem(
                `${role}SidebarOpen`,
                JSON.stringify(isSidebarOpen)
            );
        }
    }, [isSidebarOpen, role]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
                return;
            }

            const saved = localStorage.getItem(
                `${role}SidebarOpen`
            );

            setIsSidebarOpen(
                saved !== null
                    ? JSON.parse(saved)
                    : true
            );
        };

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener(
                "resize",
                handleResize
            );
        };
    }, [role]);

    const fetchUser = useCallback(async () => {
        if (!token) {
            navigate("/", { replace: true });
            return;
        }

        try {
            const response = await api.get(profileEndpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(response.data || {});

            if (role === "faculty") {
                setImgBust(Date.now());
            }
        } catch (error) {
            console.error(
                `Failed to fetch ${role} profile:`,
                error
            );
        }
    }, [
        token,
        navigate,
        profileEndpoint,
        role,
    ]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (!updateEvent) {
            return;
        }

        window.addEventListener(
            updateEvent,
            fetchUser
        );

        return () => {
            window.removeEventListener(
                updateEvent,
                fetchUser
            );
        };
    }, [updateEvent, fetchUser]);

    useEffect(() => {
        document.body.style.overflow = isOffline
            ? "hidden"
            : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOffline]);

    useEffect(() => {
        if (!isOffline) {
            setRetryError("");
        }
    }, [isOffline]);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const toggleSection = (name) => {
        setOpenSections((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    const closeSections = () => {
        setOpenSections({});
    };

    const toggleTheme = () => {
        setTheme((prev) =>
            prev === "dark" ? "light" : "dark"
        );
    };

    const handleLogout = async () => {
        try {
            await api.post(
                "/api/auth/logout",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            localStorage.clear();
            navigate("/", { replace: true });
        }
    };

    const retryConnection = async () => {
        if (checking) {
            return;
        }

        setChecking(true);
        setRetryError("");

        try {
            await api.get(profileEndpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setRetryError("");
        } catch (error) {
            setRetryError(
                "Server is still unreachable."
            );
        } finally {
            setChecking(false);
        }
    };

    return {
        user,
        theme,
        isOffline,
        isSidebarOpen,
        openSections,
        checking,
        retryError,
        imgBust,
        toggleSidebar,
        closeSidebar,
        toggleSection,
        closeSections,
        toggleTheme,
        handleLogout,
        retryConnection,
        refreshUser: fetchUser,
    };
};

export default useLayout;