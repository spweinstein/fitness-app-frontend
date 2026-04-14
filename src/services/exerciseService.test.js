import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getMuscleGroups,
  getExercises,
  getExerciseById,
} from "./exerciseService.js";

vi.mock("./apiConfig.js", () => ({
  default: { get: vi.fn() },
}));

const { default: api } = await import("./apiConfig.js");

describe("exerciseService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getMuscleGroups — GET /api/muscle-groups/ and returns data", async () => {
    const data = [{ id: 1, name: "Chest" }];
    api.get.mockResolvedValue({ data });

    const result = await getMuscleGroups();

    expect(api.get).toHaveBeenCalledWith("/api/muscle-groups/");
    expect(result).toEqual(data);
  });

  it("getExercises — GET /api/exercises/ and returns data", async () => {
    const data = [{ id: 1, name: "Bench Press" }];
    api.get.mockResolvedValue({ data });

    const result = await getExercises();

    expect(api.get).toHaveBeenCalledWith("/api/exercises/");
    expect(result).toEqual(data);
  });

  it("getExerciseById — GET /api/exercises/:id/ and returns data", async () => {
    const data = { id: 42, name: "Squat" };
    api.get.mockResolvedValue({ data });

    const result = await getExerciseById(42);

    expect(api.get).toHaveBeenCalledWith("/api/exercises/42/");
    expect(result).toEqual(data);
  });
});
