import { describe, expect, it, vi } from "vitest";
import { render, screen } from "../../../utils/render";
import Page from "../../../../src/app/[locale]/registro/page";

vi.mock("../../../../src/components/auth/RegistroForm/RegistroForm", () => ({
  default: () => <form aria-label="registro-form">Registro form</form>,
}));

describe("registro page", () => {
  it("renders translated copy, back link and registration form", () => {
    render(<Page />);

    expect(screen.getByRole("heading", { name: "title" })).toBeInTheDocument();
    expect(screen.getByText("description1")).toBeInTheDocument();
    expect(screen.getByText("description2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir a login" })).toHaveAttribute(
      "href",
      "/login"
    );
    expect(screen.getByRole("form", { name: "registro-form" })).toBeInTheDocument();
  });
});
