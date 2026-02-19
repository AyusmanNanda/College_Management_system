const DashboardLayout = ({ sidebar, headerTitle, children }) => {
    return (
        <div className="min-h-screen flex bg-gray-100">

            {sidebar}

            <div className="flex-1 flex flex-col">

                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <h1 className="text-lg font-semibold text-gray-800">
                        {headerTitle}
                    </h1>
                </header>

                <main className="flex-1 p-8">
                    <div className="bg-white rounded-lg shadow-sm p-8 min-h-[80vh]">
                        {children}
                    </div>
                </main>

            </div>

        </div>
    );
};

export default DashboardLayout;
