import { describe, expect, it, vi } from "vitest";
import ThemeToggle from "../../../../../src/components/ui/Button/ThemeToggle/ThemeToggle";
import { render, screen, userEvent } from "../../../../utils/render";

describe("ThemeToggle", () => {
  it("renders the light mode control state", () => {
    render(<ThemeToggle theme="light" onToggle={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Cambiar a modo oscuro" });

    expect(button).toHaveAttribute("title", "Modo oscuro");
    expect(button).not.toHaveClass("theme-toggle--dark");
  });

  it("renders the dark mode control state and calls onToggle", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<ThemeToggle theme="dark" onToggle={onToggle} />);

    const button = screen.getByRole("button", { name: "Cambiar a modo claro" });

    expect(button).toHaveAttribute("title", "Modo claro");
    expect(button).toHaveClass("theme-toggle--dark");

    await user.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
