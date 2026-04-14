import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  scheduleWorkoutFromTemplate,
  getTemplateItem,
  addTemplateItem,
  updateTemplateItem,
  deleteTemplateItem,
} from "./templateService.js";

vi.mock("./apiConfig.js", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const { default: api } = await import("./apiConfig.js");

describe("templateService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("getTemplates", () => {
    it("uses scope=all when called with no options", async () => {
      const data = { results: [] };
      api.get.mockResolvedValue({ data });

      const result = await getTemplates();

      expect(api.get).toHaveBeenCalledWith("/api/workout-templates/", {
        params: { scope: "all" },
      });
      expect(result).toEqual(data);
    });

    it("forwards page, pageSize, and search when provided", async () => {
      api.get.mockResolvedValue({ data: { results: [] } });

      await getTemplates({ scope: "mine", page: 1, pageSize: 5, search: "pull" });

      expect(api.get).toHaveBeenCalledWith("/api/workout-templates/", {
        params: { scope: "mine", page: 1, page_size: 5, search: "pull" },
      });
    });

    it("accepts a plain string as the scope shorthand", async () => {
      api.get.mockResolvedValue({ data: { results: [] } });

      await getTemplates("community");

      expect(api.get).toHaveBeenCalledWith("/api/workout-templates/", {
        params: { scope: "community" },
      });
    });
  });

  it("getTemplate — GET /api/workout-templates/:id/ and returns data", async () => {
    const data = { id: 10, name: "Push Day" };
    api.get.mockResolvedValue({ data });

    const result = await getTemplate(10);

    expect(api.get).toHaveBeenCalledWith("/api/workout-templates/10/");
    expect(result).toEqual(data);
  });

  it("createTemplate — POST /api/workout-templates/ with body and returns data", async () => {
    const body = { name: "New Template" };
    const data = { id: 11, ...body };
    api.post.mockResolvedValue({ data });

    const result = await createTemplate(body);

    expect(api.post).toHaveBeenCalledWith("/api/workout-templates/", body);
    expect(result).toEqual(data);
  });

  it("updateTemplate — PUT /api/workout-templates/:id/ with body and returns data", async () => {
    const body = { name: "Updated Template" };
    const data = { id: 10, ...body };
    api.put.mockResolvedValue({ data });

    const result = await updateTemplate(10, body);

    expect(api.put).toHaveBeenCalledWith("/api/workout-templates/10/", body);
    expect(result).toEqual(data);
  });

  it("deleteTemplate — DELETE /api/workout-templates/:id/ and returns data", async () => {
    api.delete.mockResolvedValue({ data: null });

    const result = await deleteTemplate(10);

    expect(api.delete).toHaveBeenCalledWith("/api/workout-templates/10/");
    expect(result).toBeNull();
  });

  it("scheduleWorkoutFromTemplate — POST /api/workout-templates/:id/schedule/ with body and returns data", async () => {
    const body = { date: "2026-04-15" };
    const data = { id: 20 };
    api.post.mockResolvedValue({ data });

    const result = await scheduleWorkoutFromTemplate(10, body);

    expect(api.post).toHaveBeenCalledWith(
      "/api/workout-templates/10/schedule/",
      body,
    );
    expect(result).toEqual(data);
  });

  it("getTemplateItem — GET /api/workout-template-items/:id/ and returns data", async () => {
    const data = { id: 5, exercise: 3 };
    api.get.mockResolvedValue({ data });

    const result = await getTemplateItem(5);

    expect(api.get).toHaveBeenCalledWith("/api/workout-template-items/5/");
    expect(result).toEqual(data);
  });

  it("addTemplateItem — POST /api/workout-template-items/ with body and returns data", async () => {
    const body = { template: 10, exercise: 3, sets: 3, reps: 10 };
    const data = { id: 6, ...body };
    api.post.mockResolvedValue({ data });

    const result = await addTemplateItem(body);

    expect(api.post).toHaveBeenCalledWith("/api/workout-template-items/", body);
    expect(result).toEqual(data);
  });

  it("updateTemplateItem — PUT /api/workout-template-items/:id/ with body and returns data", async () => {
    const body = { sets: 4, reps: 8 };
    const data = { id: 5, ...body };
    api.put.mockResolvedValue({ data });

    const result = await updateTemplateItem(5, body);

    expect(api.put).toHaveBeenCalledWith("/api/workout-template-items/5/", body);
    expect(result).toEqual(data);
  });

  it("deleteTemplateItem — DELETE /api/workout-template-items/:id/ and returns data", async () => {
    api.delete.mockResolvedValue({ data: null });

    const result = await deleteTemplateItem(5);

    expect(api.delete).toHaveBeenCalledWith("/api/workout-template-items/5/");
    expect(result).toBeNull();
  });
});
