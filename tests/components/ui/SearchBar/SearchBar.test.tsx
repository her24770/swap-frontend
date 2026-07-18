import { describe, expect, it, vi } from "vitest";
import SearchBar from "../../../../src/components/ui/SearchBar/SearchBar";
import { fireEvent, render, screen, userEvent } from "../../../utils/render";

describe("SearchBar", () => {
  it("renders the provided value and placeholder", () => {
    render(
      <SearchBar
        value="libro"
        onChange={vi.fn()}
        placeholder="Buscar publicaciones"
      />
    );

    expect(screen.getByPlaceholderText("Buscar publicaciones")).toHaveValue("libro");
  });

  it("notifies value changes", () => {
    const onChange = vi.fn();

    render(<SearchBar value="" onChange={onChange} placeholder="Buscar" />);

    fireEvent.change(screen.getByPlaceholderText("Buscar"), {
      target: { value: "calculo" },
    });

    expect(onChange).toHaveBeenCalledWith("calculo");
  });

  it("renders and toggles the filter control when provided", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <SearchBar
        value=""
        onChange={vi.fn()}
        filter={{ isOpen: true, active: true, onToggle }}
      />
    );

    const button = screen.getByRole("button", { name: "filterAria" });

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveClass("search-bar__filter-btn--open");
    expect(button).toHaveClass("search-bar__filter-btn--active");

    await user.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
