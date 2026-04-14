import { describe, it, expect, vi, beforeEach } from "vitest";
import { signIn, signUp, signOut, verifyUser } from "./authService.js";

// Mock the axios instance so no real HTTP calls are made.
vi.mock("./apiConfig.js", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Import after mock so we get the stub.
const { default: api } = await import("./apiConfig.js");

describe("authService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("signIn", () => {
    it("stores the access token and returns the user", async () => {
      const fakeUser = { id: 1, username: "alice" };
      api.post.mockResolvedValue({ data: { access: "tok-123", user: fakeUser } });

      const result = await signIn({ username: "alice", password: "pass" });

      expect(api.post).toHaveBeenCalledWith("/users/login/", {
        username: "alice",
        password: "pass",
      });
      expect(localStorage.getItem("token")).toBe("tok-123");
      expect(result).toEqual(fakeUser);
    });
  });

  describe("signUp", () => {
    it("stores the access token and returns the new user", async () => {
      const fakeUser = { id: 2, username: "bob" };
      api.post.mockResolvedValue({ data: { access: "tok-456", user: fakeUser } });

      const result = await signUp({ username: "bob", password: "password1" });

      expect(api.post).toHaveBeenCalledWith("/users/register/", {
        username: "bob",
        password: "password1",
      });
      expect(localStorage.getItem("token")).toBe("tok-456");
      expect(result).toEqual(fakeUser);
    });
  });

  describe("signOut", () => {
    it("removes the token from localStorage and returns true", async () => {
      localStorage.setItem("token", "existing-token");

      const result = await signOut();

      expect(localStorage.getItem("token")).toBeNull();
      expect(result).toBe(true);
    });
  });

  describe("verifyUser", () => {
    it("returns false immediately when no token is stored", async () => {
      const result = await verifyUser();

      expect(result).toBe(false);
      expect(api.get).not.toHaveBeenCalled();
    });

    it("refreshes the token and returns the user when a token is stored", async () => {
      localStorage.setItem("token", "old-token");
      const fakeUser = { id: 1, username: "alice" };
      api.get.mockResolvedValue({ data: { access: "new-token", user: fakeUser } });

      const result = await verifyUser();

      expect(api.get).toHaveBeenCalledWith("/users/token/refresh/");
      expect(localStorage.getItem("token")).toBe("new-token");
      expect(result).toEqual(fakeUser);
    });
  });
});
