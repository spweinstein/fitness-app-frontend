import api from "./apiConfig.js";

export const signUp = async (credentials) => {
  const resp = await api.post("/users/register/", credentials);
  localStorage.setItem("access_token", resp.data.access);
  localStorage.setItem("refresh_token", resp.data.refresh);
  return resp.data.user;
};

export const signIn = async (credentials) => {
  const resp = await api.post("/users/login/", credentials);
  localStorage.setItem("access_token", resp.data.access);
  localStorage.setItem("refresh_token", resp.data.refresh);
  return resp.data.user;
};

export const signOut = async () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  return true;
};

/*
Check if an access token exists in storage.
Call GET /users/me/ with it (your axios interceptor already attaches it).
If it returns 200, session is valid — return the user.
If it returns 401, try a refresh (call POST /users/token/refresh/ with the stored refresh token).
If refresh succeeds, store the new access token and return the user (you may want to call /users/me/ again, or have the refresh response include the user).
If refresh fails, clear both tokens and return false.
*/

export const verifyUser = async () => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) return false;

  try {
    const resp = await api.get("/users/me/");
    return resp.data.user;
  } catch (err) {
    if (err.response?.status !== 401) return false; // unexpected error, bail

    // Access token expired — try to refresh
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return false;

    try {
      const refreshResp = await api.post("/users/token/refresh/", {
        refresh: refreshToken,
      });
      localStorage.setItem("access_token", refreshResp.data.access);
      // Fetch user with the new access token
      const meResp = await api.get("/users/me/");
      return meResp.data.user;
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return false;
    }
  }
};
