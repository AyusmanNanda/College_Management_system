import axios from "axios";

const api = axios.create({
    //baseURL: `http://${window.location.hostname}:5000`,
    baseURL: ``,
    withCredentials: true,
});

export default api;