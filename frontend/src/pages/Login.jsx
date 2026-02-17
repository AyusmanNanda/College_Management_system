import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }

        // TEMP role simulation (replace later with backend API)
        if (email.includes("admin")) {
            navigate("/admin/dashboard");
        } else if (email.includes("faculty")) {
            navigate("/faculty/dashboard");
        } else {
            navigate("/student/dashboard");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>College Management Login</h2>

                <input
                    type="email"
                    placeholder="Enter Email"
                    style={styles.input}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Enter Password"
                    style={styles.input}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button style={styles.button} onClick={handleLogin}>
                    Login
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
    },
    card: {
        background: "white",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        width: "320px",
        textAlign: "center",
    },
    input: {
        width: "100%",
        padding: "10px",
        margin: "10px 0",
    },
    button: {
        width: "100%",
        padding: "10px",
        backgroundColor: "#2d89ef",
        color: "white",
        border: "none",
        cursor: "pointer",
    },
};

export default Login;
