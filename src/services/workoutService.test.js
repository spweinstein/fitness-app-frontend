import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from "./workoutService.js";

vi.mock("./apiConfig.js", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const { default: api } = await import("./apiConfig.js");

describe("workoutService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getWorkouts — GET /api/workouts/ with start/end params and returns data", async () => {
    const data = [{ id: 1 }];
    api.get.mockResolvedValue({ data });

    const result = await getWorkouts("2026-04-01", "2026-04-30");

    expect(api.get).toHaveBeenCalledWith("/api/workouts/", {
      params: { start: "2026-04-01", end: "2026-04-30" },
    });
    expect(result).toEqual(data);
  });

  it("getWorkout — GET /api/workouts/:id/ and returns data", async () => {
    const data = { id: 7 };
    api.get.mockResolvedValue({ data });

    const result = await getWorkout(7);

    expect(api.get).toHaveBeenCalledWith("/api/workouts/7/");
    expect(result).toEqual(data);
  });

  it("createWorkout — POST /api/workouts/ with body and returns data", async () => {
    const body = { date: "2026-04-13", notes: "leg day" };
    const data = { id: 8, ...body };
    api.post.mockResolvedValue({ data });

    const result = await createWorkout(body);

    expect(api.post).toHaveBeenCalledWith("/api/workouts/", body);
    expect(result).toEqual(data);
  });

  it("updateWorkout — PATCH /api/workouts/:id/ with body and returns data", async () => {
    const body = { notes: "updated" };
    const data = { id: 7, ...body };
    api.patch.mockResolvedValue({ data });

    const result = await updateWorkout(7, body);

    expect(api.patch).toHaveBeenCalledWith("/api/workouts/7/", body);
    expect(result).toEqual(data);
  });

  it("deleteWorkout — DELETE /api/workouts/:id/ and returns data", async () => {
    api.delete.mockResolvedValue({ data: null });

    const result = await deleteWorkout(7);

    expect(api.delete).toHaveBeenCalledWith("/api/workouts/7/");
    expect(result).toBeNull();
  });
});
