import axios from "axios";

/** Dispatched when the API returns 401 and the stored token is cleared. */
export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACK_END_SERVER_URL}`,
});

const AUTH_FREE_PATHS = ["/users/login/", "/users/register/"];

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
      }
    }
    return Promise.reject(error);
  },
);

export default api;
