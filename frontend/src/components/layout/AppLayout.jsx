import { createPortal } from "react-dom";
import { Outlet } from "react-router-dom";
import { WifiOff } from "lucide-react";
import api from "../../utils/api";
import useLayout from "../../hooks/layout/useLayout";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";

const AppLayout = ({
                       role,
                       title,
                       profileEndpoint,
                       navigation,
                       updateEvent,
                       getProfile,
                   }) => {
    const {
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
    } = useLayout({
        role,
        profileEndpoint,
        updateEvent,
    });

    const BASE_URL = api.defaults.baseURL;

    const profile = getProfile({
        user,
        baseUrl: BASE_URL,
        imgBust,
    });

    return (
        <>
            {isOffline &&
                createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-md px-4 transition-all">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full animate-in zoom-in-95 duration-300">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <WifiOff className="w-8 h-8" />
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                Connection Lost
                            </h2>

                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                We cannot reach the academic server. Please
                                verify your network connection to resume.
                            </p>

                            {retryError && (
                                <p className="text-xs font-semibold text-red-500 mt-3">
                                    {retryError}
                                </p>
                            )}

                            <button
                                type="button"
                                disabled={checking}
                                onClick={retryConnection}
                                className="mt-8 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/30 active:scale-95 disabled:opacity-50"
                            >
                                {checking
                                    ? "Verifying Connection..."
                                    : "Retry Connection"}
                            </button>
                        </div>
                    </div>,
                    document.body
                )}

            <div className="h-[100dvh] flex bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
                <Sidebar
                    isOpen={isSidebarOpen}
                    profile={profile}
                    navigation={navigation}
                    openSections={openSections}
                    toggleSection={toggleSection}
                    closeSidebar={closeSidebar}
                    closeSections={closeSections}
                />

                <div
                    className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out ${
                        isSidebarOpen
                            ? "lg:ml-[280px]"
                            : "ml-0"
                    }`}
                >
                    <AppHeader
                        title={title}
                        theme={theme}
                        toggleSidebar={toggleSidebar}
                        toggleTheme={toggleTheme}
                        handleLogout={handleLogout}
                    />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-950 relative scroll-smooth">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
};

export default AppLayout;