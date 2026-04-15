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

let isRefreshing = false;
let refreshQueue = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const is401 = error.response?.status === 401;
    const isAuthPath = AUTH_FREE_PATHS.some((p) => original.url?.includes(p));

    if (!is401 || isAuthPath || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    isRefreshing = true;
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      clearStoredAuth();
      notifyUnauthorized();
      return Promise.reject(error);
    }

    try {
      const resp = await api.post("/users/token/refresh/", {
        refresh: refreshToken,
      });
      const newToken = resp.data.access;
      localStorage.setItem("access_token", newToken);
      refreshQueue.forEach(({ resolve }) => resolve(newToken));
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      clearStoredAuth();
      notifyUnauthorized();
      refreshQueue.forEach(({ reject }) => reject(error));
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
      refreshQueue = [];
    }
  },
);

export default api;
