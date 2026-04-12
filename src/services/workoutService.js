import api from "./apiConfig.js";

export const getWorkouts = async (start, end) => {
  const resp = await api.get("/api/workouts/", {
    params: {
      start,
      end,
    },
  });
  return resp.data;
};

export const getWorkout = async (workoutId) => {
  const resp = await api.get(`/api/workouts/${workoutId}/`);
  return resp.data;
};

export const createWorkout = async (workoutData) => {
  const resp = await api.post("/api/workouts/", workoutData);
  return resp.data;
};

export const updateWorkout = async (workoutId, workoutData) => {
  const resp = await api.patch(`/api/workouts/${workoutId}/`, workoutData);
  return resp.data;
};

export const deleteWorkout = async (workoutId) => {
  const resp = await api.delete(`/api/workouts/${workoutId}/`);
  return resp.data;
};
