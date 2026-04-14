import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import { UserProvider, UserContext } from "./UserContext.jsx";
import { AUTH_UNAUTHORIZED_EVENT } from "@/src/services/apiConfig.js";

// Replace verifyUser so the provider never makes real API calls.
vi.mock("@/src/services/authService.js", () => ({
  verifyUser: vi.fn(),
}));

const { verifyUser } = await import("@/src/services/authService.js");

/** Renders context values into the DOM so assertions can inspect them. */
const Consumer = () => {
  const { user, loading } = useContext(UserContext);
  return (
    <div>
      <span data-testid="loading">{loading ? "loading" : "ready"}</span>
      <span data-testid="user">{user ? user.username : "none"}</span>
    </div>
  );
};

describe("UserProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading initially and sets user after verifyUser resolves", async () => {
    verifyUser.mockResolvedValue({ id: 1, username: "alice" });

    render(
      <UserProvider>
        <Consumer />
      </UserProvider>
    );

    // Provider starts in loading state.
    expect(screen.getByTestId("loading").textContent).toBe("loading");

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("ready");
      expect(screen.getByTestId("user").textContent).toBe("alice");
    });
  });

  it("leaves user null when verifyUser returns false (no stored token)", async () => {
    verifyUser.mockResolvedValue(false);

    render(
      <UserProvider>
        <Consumer />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("ready");
      expect(screen.getByTestId("user").textContent).toBe("none");
    });
  });

  it("clears the user when AUTH_UNAUTHORIZED_EVENT is dispatched", async () => {
    verifyUser.mockResolvedValue({ id: 1, username: "alice" });

    render(
      <UserProvider>
        <Consumer />
      </UserProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("user").textContent).toBe("alice")
    );

    window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));

    await waitFor(() =>
      expect(screen.getByTestId("user").textContent).toBe("none")
    );
  });
});
