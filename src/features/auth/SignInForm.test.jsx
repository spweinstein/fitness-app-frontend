import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserContext } from "@/src/app/UserContext.jsx";
import SignInForm from "./SignInForm.jsx";

// Intercept signIn without real HTTP calls.
vi.mock("@/src/services/authService.js", () => ({
  signIn: vi.fn(),
}));

// Replace useNavigate with a spy; spread the real module so MemoryRouter etc. still work.
const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

const { signIn } = await import("@/src/services/authService.js");

/** Wraps SignInForm with the minimal context it needs. */
const renderForm = (setUser = vi.fn()) =>
  render(
    <UserContext.Provider value={{ user: null, setUser, loading: false }}>
      <SignInForm />
    </UserContext.Provider>
  );

/** Fills the sign-in form fields and submits. */
const fillAndSubmit = (username = "alice", password = "secret") => {
  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: username },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: password },
  });
  fireEvent.submit(document.getElementById("signin-form"));
};

describe("SignInForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the username and password fields", () => {
    renderForm();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("calls signIn with credentials, updates user, and navigates on success", async () => {
    const fakeUser = { id: 1, username: "alice" };
    signIn.mockResolvedValue(fakeUser);
    const mockSetUser = vi.fn();

    renderForm(mockSetUser);
    fillAndSubmit("alice", "secret");

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith({
        username: "alice",
        password: "secret",
      });
      expect(mockSetUser).toHaveBeenCalledWith(fakeUser);
      expect(mockNavigate).toHaveBeenCalledWith("/explore/exercises");
    });
  });

  it("displays a server error message when signIn rejects", async () => {
    signIn.mockRejectedValue(new Error("Invalid credentials"));

    renderForm();
    fillAndSubmit("alice", "wrong");

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials");
    });
  });
});
