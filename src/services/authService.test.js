import { describe, it, expect, vi, beforeEach } from "vitest";
import { signIn, signUp, signOut, verifyUser } from "./authService.js";

// Mock HTTP on the shared client; keep real helpers (clearStoredAuth, notifyUnauthorized).
vi.mock(import("./apiConfig.js"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      ...actual.default,
      post: vi.fn(),
      get: vi.fn(),
    },
  };
});

// Import after mock so we get the stubbed api.
const { default: api } = await import("./apiConfig.js");

describe("authService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("signIn", () => {
    it("stores access_token and refresh_token and returns the user", async () => {
      const fakeUser = { id: 1, username: "alice" };
      api.post.mockResolvedValue({
        data: { access: "tok-123", refresh: "ref-123", user: fakeUser },
      });

      const result = await signIn({ username: "alice", password: "pass" });

      expect(api.post).toHaveBeenCalledWith("/users/login/", {
        username: "alice",
        password: "pass",
      });
      expect(localStorage.getItem("access_token")).toBe("tok-123");
      expect(localStorage.getItem("refresh_token")).toBe("ref-123");
      expect(result).toEqual(fakeUser);
    });
  });

  describe("signUp", () => {
    it("stores access_token and refresh_token and returns the new user", async () => {
      const fakeUser = { id: 2, username: "bob" };
      api.post.mockResolvedValue({
        data: { access: "tok-456", refresh: "ref-456", user: fakeUser },
      });

      const result = await signUp({ username: "bob", password: "password1" });

      expect(api.post).toHaveBeenCalledWith("/users/register/", {
        username: "bob",
        password: "password1",
      });
      expect(localStorage.getItem("access_token")).toBe("tok-456");
      expect(localStorage.getItem("refresh_token")).toBe("ref-456");
      expect(result).toEqual(fakeUser);
    });
  });

  describe("signOut", () => {
    it("removes both tokens from localStorage and returns true", async () => {
      localStorage.setItem("access_token", "existing-access");
      localStorage.setItem("refresh_token", "existing-refresh");

      const result = await signOut();

      expect(localStorage.getItem("access_token")).toBeNull();
      expect(localStorage.getItem("refresh_token")).toBeNull();
      expect(result).toBe(true);
    });
  });

  describe("verifyUser", () => {
    it("returns false immediately when no access_token is stored", async () => {
      const result = await verifyUser();

      expect(result).toBe(false);
      expect(api.get).not.toHaveBeenCalled();
    });

    it("returns the user when the access token is valid", async () => {
      localStorage.setItem("access_token", "valid-access");
      const fakeUser = { id: 1, username: "alice" };
      api.get.mockResolvedValue({ data: { user: fakeUser } });

      const result = await verifyUser();

      expect(api.get).toHaveBeenCalledWith("/users/me/");
      expect(result).toEqual(fakeUser);
    });

    it("refreshes the access token and returns the user when the first /users/me/ call returns 401", async () => {
      localStorage.setItem("access_token", "expired-access");
      localStorage.setItem("refresh_token", "valid-refresh");
      const fakeUser = { id: 1, username: "alice" };

      // First GET /users/me/ fails with 401; second succeeds after refresh.
      api.get
        .mockRejectedValueOnce({ response: { status: 401 } })
        .mockResolvedValueOnce({ data: { user: fakeUser } });

      // POST /users/token/refresh/ returns a new access token.
      api.post.mockResolvedValue({ data: { access: "new-access" } });

      const result = await verifyUser();

      expect(api.post).toHaveBeenCalledWith("/users/token/refresh/", {
        refresh: "valid-refresh",
      });
      expect(localStorage.getItem("access_token")).toBe("new-access");
      expect(result).toEqual(fakeUser);
    });

    it("returns false and clears both tokens when the refresh request fails", async () => {
      localStorage.setItem("access_token", "expired-access");
      localStorage.setItem("refresh_token", "expired-refresh");

      api.get.mockRejectedValueOnce({ response: { status: 401 } });
      api.post.mockRejectedValue(new Error("refresh failed"));

      const result = await verifyUser();

      expect(result).toBe(false);
      expect(localStorage.getItem("access_token")).toBeNull();
      expect(localStorage.getItem("refresh_token")).toBeNull();
    });
  });
});
