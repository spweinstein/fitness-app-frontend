import api from "./apiConfig.js";

export const getMuscleGroups = async () => {
  const resp = await api.get("/api/muscle-groups/");
  return resp.data;
};

export const getExercises = async () => {
  const resp = await api.get("/api/exercises/");
  return resp.data;
};

export const getExerciseById = async (exerciseId) => {
  const resp = await api.get(`/api/exercises/${exerciseId}/`);
  return resp.data;
};
