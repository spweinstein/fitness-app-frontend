import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  generateWorkoutsFromPlan,
} from "./planService.js";

vi.mock("./apiConfig.js", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const { default: api } = await import("./apiConfig.js");

describe("planService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("getPlans", () => {
    it("uses scope=all when called with no options", async () => {
      const data = { results: [] };
      api.get.mockResolvedValue({ data });

      const result = await getPlans();

      expect(api.get).toHaveBeenCalledWith("/api/workout-plans/", {
        params: { scope: "all" },
      });
      expect(result).toEqual(data);
    });

    it("forwards page, pageSize, and search when provided", async () => {
      api.get.mockResolvedValue({ data: { results: [] } });

      await getPlans({ scope: "mine", page: 2, pageSize: 10, search: "push" });

      expect(api.get).toHaveBeenCalledWith("/api/workout-plans/", {
        params: { scope: "mine", page: 2, page_size: 10, search: "push" },
      });
    });

    it("accepts a plain string as the scope shorthand", async () => {
      api.get.mockResolvedValue({ data: { results: [] } });

      await getPlans("mine");

      expect(api.get).toHaveBeenCalledWith("/api/workout-plans/", {
        params: { scope: "mine" },
      });
    });
  });

  it("getPlan — GET /api/workout-plans/:id/ and returns data", async () => {
    const data = { id: 3, name: "5x5" };
    api.get.mockResolvedValue({ data });

    const result = await getPlan(3);

    expect(api.get).toHaveBeenCalledWith("/api/workout-plans/3/");
    expect(result).toEqual(data);
  });

  it("createPlan — POST /api/workout-plans/ with body and returns data", async () => {
    const body = { name: "New Plan" };
    const data = { id: 4, ...body };
    api.post.mockResolvedValue({ data });

    const result = await createPlan(body);

    expect(api.post).toHaveBeenCalledWith("/api/workout-plans/", body);
    expect(result).toEqual(data);
  });

  it("updatePlan — PUT /api/workout-plans/:id/ with body and returns data", async () => {
    const body = { name: "Updated Plan" };
    const data = { id: 3, ...body };
    api.put.mockResolvedValue({ data });

    const result = await updatePlan(3, body);

    expect(api.put).toHaveBeenCalledWith("/api/workout-plans/3/", body);
    expect(result).toEqual(data);
  });

  it("deletePlan — DELETE /api/workout-plans/:id/ and returns data", async () => {
    api.delete.mockResolvedValue({ data: null });

    const result = await deletePlan(3);

    expect(api.delete).toHaveBeenCalledWith("/api/workout-plans/3/");
    expect(result).toBeNull();
  });

  it("generateWorkoutsFromPlan — POST /api/workout-plans/:id/generate/ with body and returns data", async () => {
    const body = { start_dt: "2026-04-14", end_dt: "2026-05-14" };
    const data = { created: 4 };
    api.post.mockResolvedValue({ data });

    const result = await generateWorkoutsFromPlan(3, body);

    expect(api.post).toHaveBeenCalledWith("/api/workout-plans/3/generate/", body);
    expect(result).toEqual(data);
  });
});
