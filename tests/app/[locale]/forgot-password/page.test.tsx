import { describe, expect, it, vi } from "vitest";
import { render, screen } from "../../../utils/render";
import Page from "../../../../src/app/[locale]/forgot-password/page";

vi.mock("../../../../src/components/auth/ForgotPasswordForm/ForgotPasswordForm", () => ({
  default: () => <form aria-label="forgot-password-form">Forgot password form</form>,
}));

describe("forgot password page", () => {
  it("renders the forgot password form in the auth layout", () => {
    render(<Page />);

    expect(screen.getByRole("form", { name: "forgot-password-form" })).toBeInTheDocument();
    expect(screen.getByText("Forgot password form").closest(".login-page")).toBeInTheDocument();
  });
});
