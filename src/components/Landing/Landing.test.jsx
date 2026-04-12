import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"
import Landing from "./Landing.jsx"
import { UserContext } from "../../contexts/UserContext.jsx"

function renderLanding(user) {
  return render(
    <MemoryRouter>
      <UserContext.Provider value={{ user, setUser: () => {}, loading: false }}>
        <Landing />
      </UserContext.Provider>
    </MemoryRouter>,
  )
}

describe("Landing", () => {
  it("shows sign-in and sign-up calls to action for logged-out visitors", () => {
    renderLanding(null)

    expect(
      screen.getByRole("link", { name: "Get Started" }),
    ).toHaveAttribute("href", "/sign-up")
    expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute(
      "href",
      "/sign-in",
    )
  })

  it("shows training navigation for signed-in users", () => {
    renderLanding({ id: 1, username: "swein" })

    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile",
    )
    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute(
      "href",
      "/explore",
    )
    expect(screen.getByRole("link", { name: "Training" })).toHaveAttribute(
      "href",
      "/training",
    )
    expect(screen.queryByRole("link", { name: "Sign In" })).toBeNull()
  })
})
