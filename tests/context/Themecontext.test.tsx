import { describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "../../src/context/Themecontext";
import { render, screen, userEvent, waitFor } from "../utils/render";

function ThemeProbe() {
  const { theme, toggle } = useTheme();

  return (
    <button type="button" onClick={toggle}>
      {theme}
    </button>
  );
}

describe("ThemeProvider", () => {
  it("starts with light theme and persists changes after toggle", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByRole("button", { name: "light" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "light" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "dark" })).toBeInTheDocument();
      expect(window.localStorage.getItem("theme")).toBe("dark");
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    });
  });

  it("uses a saved theme from localStorage", async () => {
    window.localStorage.setItem("theme", "dark");

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "dark" })).toBeInTheDocument();
    });
  });
});
