import axios from "axios";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Configure axios defaults and interceptors so all requests include the
// admin token from localStorage and 401 responses force a logout.
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || "https://api.almadina.site";
axios.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (token)
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
        };
    } catch (e) {
      // noop
    }
    return config;
  },
  (err) => Promise.reject(err),
);

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
      } catch (e) {}
      // Redirect to login to re-authenticate
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
