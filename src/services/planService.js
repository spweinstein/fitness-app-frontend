import api from "./apiConfig.js";

function normalizeCatalogOptions(options = {}) {
  if (typeof options === "string") {
    return { scope: options };
  }
  return options ?? {};
}

export const getPlans = async (options = {}) => {
  const { scope = "all", page, pageSize, search } = normalizeCatalogOptions(
    options,
  );
  const params = { scope };
  if (page != null) params.page = page;
  if (pageSize != null) params.page_size = pageSize;
  if (search && search.trim()) params.search = search.trim();
  const resp = await api.get("api/workout-plans/", {
    params,
  });
  return resp.data;
};

export const getPlan = async (planId) => {
  const resp = await api.get(`api/workout-plans/${planId}/`);
  return resp.data;
};

export const createPlan = async (planData) => {
  const resp = await api.post("api/workout-plans/", planData);
  return resp.data;
};

export const updatePlan = async (planId, planData) => {
  const resp = await api.put(`api/workout-plans/${planId}/`, planData);
  return resp.data;
};

export const deletePlan = async (planId) => {
  const resp = await api.delete(`api/workout-plans/${planId}/`);
  return resp.data;
};

/**
 * POST /api/workout-plans/:id/generate/ — materializes plan onto calendar.
 * @param {string|number} planId
 * @param {{ start_dt: string, end_dt: string }} body — ISO start_dt, end_dt inclusive date (YYYY-MM-DD or ISO)
 */
export const generateWorkoutsFromPlan = async (planId, body) => {
  const resp = await api.post(`api/workout-plans/${planId}/generate/`, body);
  return resp.data;
};
