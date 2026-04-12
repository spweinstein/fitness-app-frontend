import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACK_END_SERVER_URL}`,
});

const AUTH_FREE_PATHS = ["/users/login/", "/users/register/"];

api.interceptors.request.use(
  (config) => {
    const isAuthFree = AUTH_FREE_PATHS.some((path) =>
      config.url?.includes(path)
    );

    if (!isAuthFree) {
      const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;
