import axios from "axios";

/** Dispatched when the app determines the session is no longer recoverable. */
export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";

export function clearStoredAuth() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function notifyUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_BACK_END_SERVER_URL,
});

const AUTH_FREE_PATHS = [
  "/users/login/",
  "/users/register/",
  "/users/token/refresh/",
];

api.interceptors.request.use(
  (config) => {
    const isAuthFree = AUTH_FREE_PATHS.some((path) =>
      config.url?.includes(path),
    );

    if (!isAuthFree) {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
