import api from "./apiConfig.js";

function normalizeCatalogOptions(options = {}) {
  if (typeof options === "string") {
    return { scope: options };
  }
  return options ?? {};
}

export const getTemplates = async (options = {}) => {
  const { scope = "all", page, pageSize, search } =
    normalizeCatalogOptions(options);
  const params = { scope };
  if (page != null) params.page = page;
  if (pageSize != null) params.page_size = pageSize;
  if (search && search.trim()) params.search = search.trim();
  const resp = await api.get("/api/workout-templates/", {
    params,
  });
  return resp.data;
};

export const getTemplate = async (templateId) => {
  const resp = await api.get(`/api/workout-templates/${templateId}/`);
  return resp.data;
};

export const createTemplate = async (templateData) => {
  const resp = await api.post("/api/workout-templates/", templateData);
  return resp.data;
};

export const updateTemplate = async (templateId, templateData) => {
  const resp = await api.put(
    `/api/workout-templates/${templateId}/`,
    templateData,
  );
  return resp.data;
};

export const deleteTemplate = async (templateId) => {
  const resp = await api.delete(`/api/workout-templates/${templateId}/`);
  return resp.data;
};

export const scheduleWorkoutFromTemplate = async (templateId, body) => {
  const resp = await api.post(
    `/api/workout-templates/${templateId}/schedule/`,
    body,
  );
  return resp.data;
};

export const getTemplateItem = async (itemId) => {
  const resp = await api.get(`/api/workout-template-items/${itemId}/`);
  return resp.data;
};

export const addTemplateItem = async (itemData) => {
  const resp = await api.post("/api/workout-template-items/", itemData);
  return resp.data;
};

export const updateTemplateItem = async (itemId, itemData) => {
  const resp = await api.put(
    `/api/workout-template-items/${itemId}/`,
    itemData,
  );
  return resp.data;
};

export const deleteTemplateItem = async (itemId) => {
  const resp = await api.delete(`/api/workout-template-items/${itemId}/`);
  return resp.data;
};
