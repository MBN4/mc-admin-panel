import axios from "axios";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { useAdminStore } from "./store/useAdminStore";

// Decode JWT payload (no lib) and check exp. Malformed / no-exp tokens are
// treated as expired so a broken token never authenticates.
const isJwtExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return true;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(b64));
    if (!payload?.exp) return true;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Run before render — an expired token in localStorage would otherwise be
// used for the first request, then get bounced by the 401 interceptor.
const storedToken = localStorage.getItem("adminToken");
if (storedToken && isJwtExpired(storedToken)) {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

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
        useAdminStore.getState().clearAuth();
      } catch (e) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
      }
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
