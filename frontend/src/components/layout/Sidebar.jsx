import SidebarProfile from "./SidebarProfile";
import SidebarNavigation from "./SidebarNavigation";

const Sidebar = ({
                     isOpen,
                     profile,
                     navigation,
                     openSections,
                     toggleSection,
                     closeSidebar,
                     closeSections,
                 }) => {
    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={closeSidebar}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-[100dvh] w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }`}
            >
                <SidebarProfile
                    image={profile.image}
                    fallbackImage={profile.fallbackImage}
                    imageAlt={profile.imageAlt}
                    title={profile.title}
                    subtitle={profile.subtitle}
                    details={profile.details}
                />

                <SidebarNavigation
                    navigation={navigation}
                    openSections={openSections}
                    toggleSection={toggleSection}
                    closeSidebar={closeSidebar}
                    closeSections={closeSections}
                />
            </aside>
        </>
    );
};

export default Sidebar;