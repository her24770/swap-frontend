import { describe, expect, it, vi } from "vitest";
import { render, screen } from "../../../utils/render";
import Page from "../../../../src/app/[locale]/login/page";

vi.mock("../../../../src/components/auth/LoginForm/LoginForm", () => ({
  default: () => <form aria-label="login-form">Login form</form>,
}));

describe("login page", () => {
  it("renders the login form inside the auth page layout", () => {
    render(<Page />);

    expect(screen.getByRole("form", { name: "login-form" })).toBeInTheDocument();
    expect(screen.getByText("Login form").closest(".login-page")).toBeInTheDocument();
  });
});
