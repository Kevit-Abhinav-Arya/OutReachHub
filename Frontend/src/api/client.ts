// API client configuration
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
const isAuthRoute =
  location.pathname === "/login" || location.pathname === "/select-workspace";

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!isAuthRoute) {
    }
    if (error.response?.status === 401) {
      if (!isAuthRoute) {
        alert("Session expired or unauthorized. Please log in again.");
      }

      // Clear token from localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("persist:root");

      if ((window as any).__store__) {
        const { clearAuth } = await import("../features/auth/slices/authSlice");
        (window as any).__store__.dispatch(clearAuth());
      }

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
