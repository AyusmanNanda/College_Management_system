import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

/* ===================== Theme Bootstrap ===================== */

const applyTheme = () => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
        if (savedTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    } else {
        // Fallback to system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (prefersDark) {
            document.documentElement.classList.add("dark");
        }
    }
};

applyTheme();

/* ===================== Render ===================== */

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);