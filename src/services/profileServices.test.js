import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getProfile,
  updateHeight,
  getWeightLogs,
  createWeightLog,
} from "./profileServices.js";

vi.mock("./apiConfig", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

const { default: api } = await import("./apiConfig");

describe("profileServices", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getProfile — GET /api/profiles/:userId/ and returns data", async () => {
    const data = { id: 1, user: 5, height: 180 };
    api.get.mockResolvedValue({ data });

    const result = await getProfile(5);

    expect(api.get).toHaveBeenCalledWith("/api/profiles/5/");
    expect(result).toEqual(data);
  });

  it("updateHeight — PATCH /api/profiles/:userId/ with height and returns data", async () => {
    const data = { id: 1, user: 5, height: 175 };
    api.patch.mockResolvedValue({ data });

    const result = await updateHeight(5, 175);

    expect(api.patch).toHaveBeenCalledWith("/api/profiles/5/", { height: 175 });
    expect(result).toEqual(data);
  });

  it("getWeightLogs — GET /api/weight-logs/?user=:userId and returns data", async () => {
    const data = [{ id: 1, weight: 80 }];
    api.get.mockResolvedValue({ data });

    const result = await getWeightLogs(5);

    expect(api.get).toHaveBeenCalledWith("/api/weight-logs/?user=5");
    expect(result).toEqual(data);
  });

  it("createWeightLog — POST /api/weight-logs/ with body and returns data", async () => {
    const body = { weight: 79.5, logged_at: "2026-04-13" };
    const data = { id: 2, ...body };
    api.post.mockResolvedValue({ data });

    const result = await createWeightLog(body);

    expect(api.post).toHaveBeenCalledWith("/api/weight-logs/", body);
    expect(result).toEqual(data);
  });
});
