import axios from "axios";

const rawConfiguredBaseUrl =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";

const normalizeBaseUrl = (url) => {
  if (!url) return "";

  const trimmed = String(url).trim().replace(/\/$/, "");
  if (!trimmed) return "";

  // Accept either full API base URL or host-only URL.
  if (/\/api\/v1$/i.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed}/api/v1`;
};

const normalizedConfiguredBaseUrl = normalizeBaseUrl(rawConfiguredBaseUrl);

const fallbackBaseUrl = import.meta.env.DEV
  ? "http://localhost:8000/api/v1"
  : "";

if (import.meta.env.PROD && !normalizedConfiguredBaseUrl) {
  // This makes deployment misconfiguration visible immediately in browser logs.
  console.error(
    "Missing VITE_API_BASE_URL/VITE_API_URL in production. API calls will fail.",
  );
}

const api = axios.create({
  baseURL: normalizedConfiguredBaseUrl || fallbackBaseUrl || "/api/v1",
  withCredentials: true,
  timeout: 15000,
});

export const getApiErrorMessage = (error, fallbackMessage) => {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return "The request took too long. Please try again.";
    }

    const responseMessage =
      error.response?.data?.message || error.response?.data?.error;
    if (responseMessage) {
      return responseMessage;
    }

    if (!error.response) {
      return "Network error. Check your internet connection and try again.";
    }

    return (
      fallbackMessage || `Request failed with status ${error.response.status}`
    );
  }

  return fallbackMessage || "Something went wrong. Please try again.";
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("accessToken");
    }
    return Promise.reject(error);
  },
);

export default api;
