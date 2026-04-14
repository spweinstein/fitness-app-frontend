import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserContext } from "@/src/app/UserContext.jsx";
import SignUpForm from "./SignUpForm.jsx";

// Intercept signUp without real HTTP calls.
vi.mock("@/src/services/authService.js", () => ({
  signUp: vi.fn(),
}));

// Replace useNavigate with a spy; spread the real module so other exports still work.
const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

const { signUp } = await import("@/src/services/authService.js");

/** Wraps SignUpForm with the minimal context it needs. */
const renderForm = (setUser = vi.fn()) =>
  render(
    <UserContext.Provider value={{ user: null, setUser, loading: false }}>
      <SignUpForm />
    </UserContext.Provider>
  );

/** Fills all three sign-up fields and submits the form. */
const fillAndSubmit = (username, password, passwordConf) => {
  fireEvent.change(screen.getByLabelText(/^username/i), {
    target: { value: username },
  });
  fireEvent.change(screen.getByLabelText(/^password$/i), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText(/confirm password/i), {
    target: { value: passwordConf },
  });
  fireEvent.submit(document.getElementById("signup-form"));
};

describe("SignUpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders username, password, and confirm-password fields", () => {
    renderForm();
    expect(screen.getByLabelText(/^username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("shows a validation error when passwords do not match", async () => {
    renderForm();
    fillAndSubmit("alice", "password1", "different");

    await waitFor(() => {
      expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
    });
    expect(signUp).not.toHaveBeenCalled();
  });

  it("calls signUp, updates user, and navigates on valid submission", async () => {
    const fakeUser = { id: 1, username: "alice" };
    signUp.mockResolvedValue(fakeUser);
    const mockSetUser = vi.fn();

    renderForm(mockSetUser);
    fillAndSubmit("alice", "password1", "password1");

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith({
        username: "alice",
        password: "password1",
        passwordConf: "password1",
      });
      expect(mockSetUser).toHaveBeenCalledWith(fakeUser);
      expect(mockNavigate).toHaveBeenCalledWith("/explore/exercises");
    });
  });
});
