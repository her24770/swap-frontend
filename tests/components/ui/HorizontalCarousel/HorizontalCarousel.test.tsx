import { describe, expect, it, vi } from "vitest";
import HorizontalCarousel from "../../../../src/components/ui/HorizontalCarousel/HorizontalCarousel";
import { fireEvent, render, screen } from "../../../utils/render";

describe("HorizontalCarousel", () => {
  it("renders children and carousel controls", () => {
    render(
      <HorizontalCarousel previousLabel="Volver" moreLabel="Avanzar">
        <article>Item 1</article>
        <article>Item 2</article>
      </HorizontalCarousel>
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Volver" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Avanzar" })).toBeInTheDocument();
  });

  it("scrolls the track when the next button is clicked", () => {
    const scrollBy = vi.spyOn(HTMLElement.prototype, "scrollBy");

    render(
      <HorizontalCarousel previousLabel="Volver" moreLabel="Avanzar">
        <article>Item 1</article>
        <article>Item 2</article>
      </HorizontalCarousel>
    );

    fireEvent.click(screen.getByRole("button", { name: "Avanzar" }));

    expect(scrollBy).toHaveBeenCalledWith({ left: 240, behavior: "smooth" });
  });
});
