import { describe, it, expect, vi, beforeEach } from "vitest";
import api, {
  AUTH_UNAUTHORIZED_EVENT,
  clearStoredAuth,
  notifyUnauthorized,
} from "./apiConfig.js";

// First registered request interceptor (see apiConfig.js).
const requestFulfilled = api.interceptors.request.handlers[0].fulfilled;

describe("apiConfig", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("request interceptor", () => {
    it("adds Authorization header when access_token exists and the path is not auth-free", () => {
      localStorage.setItem("access_token", "my-jwt");
      const config = { url: "/exercises/", headers: {} };

      const result = requestFulfilled(config);

      expect(result.headers.Authorization).toBe("Bearer my-jwt");
    });

    it.each([
      ["/users/login/"],
      ["/users/register/"],
      ["/users/token/refresh/"],
    ])("skips Authorization for auth-free path %s", (url) => {
      localStorage.setItem("access_token", "my-jwt");
      const config = { url, headers: {} };

      const result = requestFulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it("does not add Authorization header when localStorage has no token", () => {
      const config = { url: "/exercises/", headers: {} };

      const result = requestFulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe("clearStoredAuth", () => {
    it("removes access_token and refresh_token from localStorage", () => {
      localStorage.setItem("access_token", "a");
      localStorage.setItem("refresh_token", "r");
      clearStoredAuth();
      expect(localStorage.getItem("access_token")).toBeNull();
      expect(localStorage.getItem("refresh_token")).toBeNull();
    });
  });

  describe("notifyUnauthorized", () => {
    it("dispatches AUTH_UNAUTHORIZED_EVENT on window", () => {
      const dispatchSpy = vi.spyOn(window, "dispatchEvent");
      notifyUnauthorized();
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: AUTH_UNAUTHORIZED_EVENT }),
      );
      dispatchSpy.mockRestore();
    });
  });
});
