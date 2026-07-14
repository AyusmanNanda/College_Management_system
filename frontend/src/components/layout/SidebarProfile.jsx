const SidebarProfile = ({
                            image,
                            fallbackImage,
                            imageAlt = "Profile",
                            title,
                            subtitle,
                            details = [],
                        }) => {
    const handleImageError = (event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = fallbackImage;
    };

    return (
        <div className="border-b border-slate-100 dark:border-slate-800/60">
            <div className="px-6 py-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex-shrink-0">
                        <img
                            src={image}
                            onError={handleImageError}
                            alt={imageAlt}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <div className="flex flex-col min-w-0">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {title}
                        </h2>

                        <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold truncate">
                            {subtitle}
                        </p>
                    </div>
                </div>

                {details.length > 0 && (
                    <div className="mt-5 bg-slate-50 dark:bg-slate-950/50 rounded-lg p-3 text-[11px] font-medium border border-slate-100 dark:border-slate-800/60 space-y-2">
                        {details.map((detail) => (
                            <div
                                key={detail.label}
                                className="flex items-center justify-between"
                            >
                                <span className="text-slate-500 dark:text-slate-400">
                                    {detail.label}
                                </span>

                                {detail.status ? (
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                detail.active
                                                    ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                                                    : "bg-red-500"
                                            }`}
                                        />

                                        <span className="text-slate-700 dark:text-slate-300 font-bold">
                                            {detail.value}
                                        </span>
                                    </div>
                                ) : (
                                    <span
                                        className={`text-slate-700 dark:text-slate-300 truncate pl-2 ${
                                            detail.monospace
                                                ? "font-mono"
                                                : ""
                                        } ${
                                            detail.bold
                                                ? "font-bold"
                                                : ""
                                        }`}
                                    >
                                        {detail.value}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SidebarProfile;