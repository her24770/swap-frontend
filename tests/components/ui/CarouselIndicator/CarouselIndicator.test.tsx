import { describe, expect, it, vi } from "vitest";
import CarouselIndicator from "../../../../src/components/ui/CarouselIndicator/CarouselIndicator";
import { render, screen, userEvent } from "../../../utils/render";

describe("CarouselIndicator", () => {
  it("does not render when there is only one dot", () => {
    const { container } = render(
      <CarouselIndicator dotsCount={1} activeItemIndex={0} onDotClick={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders dots and reports the clicked index", async () => {
    const user = userEvent.setup();
    const onDotClick = vi.fn();

    render(
      <CarouselIndicator dotsCount={3} activeItemIndex={1} onDotClick={onDotClick} />
    );

    expect(screen.getByRole("button", { name: "Ir a elemento 2" })).toHaveClass(
      "h-carousel__dot--active"
    );

    await user.click(screen.getByRole("button", { name: "Ir a elemento 3" }));

    expect(onDotClick).toHaveBeenCalledWith(2);
  });
});
