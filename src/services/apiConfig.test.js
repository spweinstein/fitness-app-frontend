import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import api, { AUTH_UNAUTHORIZED_EVENT } from "./apiConfig.js";

// Access the interceptor handlers registered by apiConfig at module load time.
// axios InterceptorManager stores handlers at interceptors.{request,response}.handlers[].
const requestFulfilled = api.interceptors.request.handlers[0].fulfilled;
const responseFulfilled = api.interceptors.response.handlers[0].fulfilled;
const responseRejected = api.interceptors.response.handlers[0].rejected;

describe("apiConfig interceptors", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("request interceptor", () => {
    it("adds Authorization header when a token is stored and the path is not auth-free", () => {
      localStorage.setItem("token", "my-jwt");
      const config = { url: "/exercises/", headers: {} };

      const result = requestFulfilled(config);

      expect(result.headers.Authorization).toBe("Bearer my-jwt");
    });

    it("skips Authorization header for /users/login/", () => {
      localStorage.setItem("token", "my-jwt");
      const config = { url: "/users/login/", headers: {} };

      const result = requestFulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it("skips Authorization header for /users/register/", () => {
      localStorage.setItem("token", "my-jwt");
      const config = { url: "/users/register/", headers: {} };

      const result = requestFulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it("does not add Authorization header when localStorage has no token", () => {
      const config = { url: "/exercises/", headers: {} };

      const result = requestFulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe("response interceptor", () => {
    it("passes successful responses through unchanged", async () => {
      const response = { status: 200, data: { ok: true } };
      const result = await responseFulfilled(response);
      expect(result).toBe(response);
    });

    it("removes the token and dispatches AUTH_UNAUTHORIZED_EVENT on 401", async () => {
      localStorage.setItem("token", "my-jwt");
      const dispatchSpy = vi.spyOn(window, "dispatchEvent");
      const error = { response: { status: 401 } };

      // The rejected handler returns a rejected Promise; capture it before awaiting.
      const promise = responseRejected(error);

      expect(localStorage.getItem("token")).toBeNull();
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: AUTH_UNAUTHORIZED_EVENT })
      );
      await expect(promise).rejects.toBe(error);

      dispatchSpy.mockRestore();
    });

    it("does not remove the token for non-401 errors", async () => {
      localStorage.setItem("token", "my-jwt");
      const error = { response: { status: 500 } };

      await expect(responseRejected(error)).rejects.toBe(error);
      expect(localStorage.getItem("token")).toBe("my-jwt");
    });
  });
});
