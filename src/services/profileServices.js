import api from "./apiConfig";

export const getProfile = async (userId) => {
  const resp = await api.get(`/api/profiles/${userId}/`);
  return resp.data;
};

export const updateHeight = async (userId, height) => {
  const resp = await api.patch(`/api/profiles/${userId}/`, { height });
  return resp.data;
};

export const getWeightLogs = async (userId) => {
  const resp = await api.get(`/api/weight-logs/?user=${userId}`);
  return resp.data;
};

export const createWeightLog = async (weightData) => {
  const resp = await api.post(`/api/weight-logs/`, weightData);
  return resp.data;
};
