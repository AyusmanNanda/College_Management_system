import { useEffect, useState } from "react";
import api from "../../utils/api";

const isCapacitor = typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.();

const useOfflineDetection = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const checkConnectivity = async (retries = 3, delay = 1000) => {
            for (let i = 0; i < retries; i++) {
                try {
                    await fetch(`${api.defaults.baseURL}/health`, {
                        method: "GET",
                        cache: "no-store",
                    });
                    setIsOffline(false);
                    return;
                } catch {
                    if (i < retries - 1) {
                        await new Promise((res) => setTimeout(res, delay));
                    }
                }
            }
            setIsOffline(true);
        };

        let capacitorListener = null;
        let cleanupWeb = null;

        if (isCapacitor) {
            import("@capacitor/network").then(({ Network }) => {
                Network.getStatus().then((status) => {
                    setIsOffline(!status.connected);
                });

                Network.addListener("networkStatusChange", (status) => {
                    if (!status.connected) {
                        setIsOffline(true);
                    } else {
                        checkConnectivity();
                    }
                }).then((handle) => {
                    capacitorListener = handle;
                });
            });
        } else {
            const handleOffline = () => setIsOffline(true);
            const handleOnline = () => checkConnectivity();

            window.addEventListener("offline", handleOffline);
            window.addEventListener("online", handleOnline);

            checkConnectivity();

            cleanupWeb = () => {
                window.removeEventListener("offline", handleOffline);
                window.removeEventListener("online", handleOnline);
            };
        }

        // Single top-level cleanup
        return () => {
            if (cleanupWeb) cleanupWeb();
            if (capacitorListener) capacitorListener.remove();
        };
    }, []);

    return isOffline;
};

export default useOfflineDetection;