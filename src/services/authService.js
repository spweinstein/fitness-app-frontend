import api, { clearStoredAuth, notifyUnauthorized } from "./apiConfig.js";

function storeTokens({ access, refresh }) {
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
}

function clearSession() {
  clearStoredAuth();
  notifyUnauthorized();
}

export const signUp = async (credentials) => {
  const resp = await api.post("/users/register/", credentials);
  storeTokens(resp.data);
  return resp.data.user;
};

export const signIn = async (credentials) => {
  const resp = await api.post("/users/login/", credentials);
  storeTokens(resp.data);
  return resp.data.user;
};

export const signOut = async () => {
  clearSession();
  return true;
};

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const resp = await api.post("/users/token/refresh/", {
    refresh: refreshToken,
  });

  localStorage.setItem("access_token", resp.data.access);
  return resp.data.access;
}

export const verifyUser = async () => {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  if (!accessToken && !refreshToken) {
    return false;
  }

  try {
    const meResp = await api.get("/users/me/");
    return meResp.data.user;
  } catch (err) {
    if (err.response?.status !== 401) {
      return false;
    }
  }

  // Access token is missing/expired/invalid: try refresh
  if (!refreshToken) {
    clearSession();
    return false;
  }

  try {
    await refreshAccessToken();
    const meResp = await api.get("/users/me/");
    return meResp.data.user;
  } catch {
    clearSession();
    return false;
  }
};
