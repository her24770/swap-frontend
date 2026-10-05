import { describe, expect, it, vi } from "vitest";
import CarouselButton from "../../../../src/components/ui/CarouselButton/CarouselButton";
import { render, screen, userEvent } from "../../../utils/render";

describe("CarouselButton", () => {
  it("renders default labels by direction", () => {
    const { rerender } = render(
      <CarouselButton direction="left" onClick={vi.fn()} disabled={false} />
    );

    expect(screen.getByRole("button", { name: "Anterior" })).toHaveClass(
      "h-carousel__btn--left"
    );

    rerender(<CarouselButton direction="right" onClick={vi.fn()} disabled={false} />);

    expect(screen.getByRole("button", { name: "Siguiente" })).toHaveClass(
      "h-carousel__btn--right"
    );
  });

  it("supports custom labels and disabled state", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <CarouselButton
        direction="right"
        onClick={onClick}
        disabled
        ariaLabel="Ver mas"
      />
    );

    const button = screen.getByRole("button", { name: "Ver mas" });

    expect(button).toBeDisabled();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });
});
