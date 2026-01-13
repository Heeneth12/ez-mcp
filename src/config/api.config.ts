import axios from "axios";

export const API_CONFIG = {
    BASE_URL: process.env.SERVER_URL || "http://localhost:8085",
    TIMEOUT: 5000
};

// Create a shared Axios instance
export const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        "Content-Type": "application/json"
    }
});